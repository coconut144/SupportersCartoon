// Vercel Function: ตารางอันดับรวมของเกม (ทุกคนเห็นเหมือนกัน)
//   GET  /api/scores?game=naamtok            → { scores: [{ name, score }] } 10 อันดับแรก
//   POST /api/scores { game, name, score }   → { rank, scores } บันทึกแล้วคืนอันดับของชื่อนี้
//
// เก็บใน Upstash Redis (เปิดได้จาก Vercel → Storage → Upstash for Redis แล้วเชื่อมกับโปรเจกต์นี้)
// ชื่อเดียวกันเก็บเฉพาะคะแนนที่ดีที่สุด ตารางเป็นแบบเล่นสนุก ไม่ได้กันโกงจริงจัง
// แอดมินลบชื่อได้จาก Upstash Console: ZREM leaderboard:<game> <ชื่อ>

const GAMES = {
  naamtok: { max: 100000 },
  'next-girls': { max: 100000 },
};
const TOP = 10;
const KEEP = 500;          // เก็บไว้ไม่เกินกี่ชื่อต่อเกม
const NAME_MAX = 16;       // ความยาวชื่อสูงสุด (นับตัวอักษร)
const RATE_LIMIT = 5;      // ส่งคะแนนได้กี่ครั้งต่อนาทีต่อ IP

const boardKey = (game) => `leaderboard:${game}`;

// ชื่อเล่น: ตัดช่องว่างซ้ำ ตัดอักขระควบคุมและ < > ห้ามลิงก์ ยาวไม่เกิน NAME_MAX
function cleanName(raw) {
  if (typeof raw !== 'string') return null;
  const name = raw
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!name || [...name].length > NAME_MAX) return null;
  if (/https?:|www\.|\.(com|net|org|co|me|ly|gg)\b/i.test(name)) return null;
  return name;
}

function cleanScore(game, raw) {
  const score = Number(raw);
  if (!Number.isInteger(score) || score < 1 || score > GAMES[game].max) return null;
  return score;
}

// ผล ZRANGE ... WITHSCORES เป็นอาร์เรย์แบน [ชื่อ, คะแนน, ชื่อ, คะแนน, ...]
function toScores(flat) {
  const scores = [];
  for (let i = 0; i < flat.length; i += 2) scores.push({ name: flat[i], score: Number(flat[i + 1]) });
  return scores;
}

async function redis(commands) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw Object.assign(new Error('ยังไม่ได้เชื่อม Upstash Redis'), { status: 503 });

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw Object.assign(new Error(`Redis ตอบกลับ ${response.status}`), { status: 502 });
  const results = await response.json();
  return results.map((item) => {
    if (item.error) throw Object.assign(new Error(item.error), { status: 502 });
    return item.result;
  });
}

const topCommand = (game) => ['ZRANGE', boardKey(game), 0, TOP - 1, 'REV', 'WITHSCORES'];

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch (e) {
    return {};
  }
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const game = req.query && req.query.game;
      if (!GAMES[game]) return res.status(400).json({ error: 'ไม่รู้จักเกมนี้' });
      const [top] = await redis([topCommand(game)]);
      return res.status(200).json({ scores: toScores(top) });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const { game } = body;
      if (!GAMES[game]) return res.status(400).json({ error: 'ไม่รู้จักเกมนี้' });
      const name = cleanName(body.name);
      if (!name) return res.status(400).json({ error: `ใส่ชื่อเล่น 1-${NAME_MAX} ตัวอักษร` });
      const score = cleanScore(game, body.score);
      if (!score) return res.status(400).json({ error: 'คะแนนไม่ถูกต้อง' });

      const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
      const rateKey = `rate:scores:${ip}`;
      const [count] = await redis([['INCR', rateKey], ['EXPIRE', rateKey, 60, 'NX']]);
      if (count > RATE_LIMIT) return res.status(429).json({ error: 'ส่งถี่เกินไป รอสักครู่แล้วลองใหม่' });

      const key = boardKey(game);
      const [, rank, top] = await redis([
        ['ZADD', key, 'GT', score, name],          // ชื่อเดิมอัปเดตเฉพาะตอนได้คะแนนมากกว่าเดิม
        ['ZREVRANK', key, name],
        topCommand(game),
        ['ZREMRANGEBYRANK', key, 0, -(KEEP + 1)],  // ตัดชื่อท้ายตารางเกิน KEEP ออก
      ]);
      return res.status(200).json({ rank: rank + 1, scores: toScores(top) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = handler;
module.exports.cleanName = cleanName;
module.exports.cleanScore = cleanScore;
module.exports.NAME_MAX = NAME_MAX;
