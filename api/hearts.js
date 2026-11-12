// Vercel Function: Heart to Heart (ข้อความถึงน้องการ์ตูน)
//   GET  /api/hearts                                  → { total } จำนวนคนที่ส่งใจมาแล้ว
//   POST /api/hearts { token, name, message, kind, color, sticker, pattern, font }
//                                                     → { heart, total } บันทึกแล้วคืนการ์ดของคนส่งกับจำนวนล่าสุด
// หน้าเว็บแสดงแค่จำนวนคนที่ส่ง ข้อความของแต่ละคนไม่ถูกส่งกลับไปให้คนอื่นเห็น
// แอดมินอ่านข้อความทั้งหมดได้จาก Upstash Console: HGETALL hearts:data
//
// เก็บใน Upstash Redis ตัวเดียวกับตารางอันดับ (ดู api/scores.js)
//   hearts:order  sorted set  สมาชิก = id ของการ์ด, คะแนน = เวลาที่ส่งครั้งแรก
//   hearts:data   hash        id → JSON ของการ์ด
// 1 เครื่อง 1 การ์ด: หน้าเว็บสุ่ม token เก็บไว้ในเครื่อง id ของการ์ดคือแฮชของ token
// ส่งซ้ำด้วย token เดิม = แก้การ์ดเดิม (ไม่นับเพิ่ม) คนอื่นแก้แทนไม่ได้เพราะไม่รู้ token
// แอดมินลบการ์ดได้จาก Upstash Console: HDEL hearts:data <id> แล้ว ZREM hearts:order <id>

const crypto = require('crypto');

const ORDER_KEY = 'hearts:order';
const DATA_KEY = 'hearts:data';
const KEEP = 5000;         // รับการ์ดได้สูงสุดกี่ใบ (เต็มแล้วไม่ลบของเก่า แต่ไม่รับใบใหม่)
const NAME_MAX = 30;
const MESSAGE_MAX = 300;
const RATE_LIMIT = 5;      // ส่งได้กี่ครั้งต่อนาทีต่อ IP

// ต้องตรงกับตัวเลือกใน src/game/hearts.js
const KINDS = ['wish', 'cheer'];
const COLOR_COUNT = 5;
const STICKER_COUNT = 8;
const PATTERNS = ['none', 'dots', 'stripe', 'hearts', 'grid'];
const FONTS = ['sans', 'hand', 'display'];

const hasLink = (text) => /https?:|www\.|\.(com|net|org|co|me|ly|gg)\b/i.test(text);

// ข้อความ: ตัดอักขระควบคุมและ < > ห้ามลิงก์ ยาวไม่เกิน max (นับตัวอักษร)
// keepLines = เก็บการขึ้นบรรทัดใหม่ไว้ (ไม่เกิน 2 บรรทัดว่างติดกัน)
function cleanText(raw, max, keepLines = false) {
  if (typeof raw !== 'string') return null;
  let text = raw.normalize('NFC').replace(/\r\n?/g, '\n');
  text = keepLines
    ? text.replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g, '').replace(/[^\S\n]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n')
    : text.replace(/[<>]/g, '').replace(/[\u0000-\u001f\u007f\s]+/g, ' ');
  text = text.trim();
  if (!text || [...text].length > max || hasLink(text)) return null;
  return text;
}

const pickIndex = (raw, count) => (Number.isInteger(raw) && raw >= 0 && raw < count ? raw : 0);
const pickFrom = (raw, list) => (list.includes(raw) ? raw : list[0]);

// token ที่หน้าเว็บสุ่มให้: ตัวอักษร ตัวเลข ขีด ยาว 16-64 ตัว
function heartId(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9-]{16,64}$/.test(token)) return null;
  return crypto.createHash('sha256').update(token).digest('hex').slice(0, 16);
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

function parseHeart(raw) {
  try {
    const heart = JSON.parse(raw);
    return heart && typeof heart.message === 'string' ? heart : null;
  } catch (e) {
    return null;
  }
}

// จำนวนคนที่ส่งใจมาแล้ว
async function readTotal() {
  const [total] = await redis([['ZCARD', ORDER_KEY]]);
  return total;
}

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
      return res.status(200).json({ total: await readTotal() });
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const id = heartId(body.token);
      if (!id) return res.status(400).json({ error: 'ส่งไม่สำเร็จ ลองโหลดหน้าใหม่แล้วส่งอีกครั้ง' });
      const name = cleanText(body.name, NAME_MAX);
      if (!name) return res.status(400).json({ error: `ใส่ชื่อ 1-${NAME_MAX} ตัวอักษร (ห้ามใส่ลิงก์)` });
      const message = cleanText(body.message, MESSAGE_MAX, true);
      if (!message) return res.status(400).json({ error: `เขียนข้อความ 1-${MESSAGE_MAX} ตัวอักษร (ห้ามใส่ลิงก์)` });

      const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
      const rateKey = `rate:hearts:${ip}`;
      const [count, , previousRaw, total] = await redis([
        ['INCR', rateKey],
        ['EXPIRE', rateKey, 60, 'NX'],
        ['HGET', DATA_KEY, id],
        ['ZCARD', ORDER_KEY],
      ]);
      if (count > RATE_LIMIT) return res.status(429).json({ error: 'ส่งถี่เกินไป รอสักครู่แล้วลองใหม่' });

      const previous = previousRaw ? parseHeart(previousRaw) : null;
      if (!previous && total >= KEEP) return res.status(507).json({ error: 'ตอนนี้รับข้อความเต็มแล้ว ขอบคุณที่อยากส่งใจนะ' });

      const now = Date.now();
      const heart = {
        id,
        name,
        message,
        kind: pickFrom(body.kind, KINDS),
        color: pickIndex(body.color, COLOR_COUNT),
        sticker: pickIndex(body.sticker, STICKER_COUNT),
        pattern: pickFrom(body.pattern, PATTERNS),
        font: pickFrom(body.font, FONTS),
        createdAt: previous && Number.isFinite(previous.createdAt) ? previous.createdAt : now,
      };
      if (previous) heart.updatedAt = now;

      const [, , newTotal] = await redis([
        ['HSET', DATA_KEY, id, JSON.stringify(heart)],
        ['ZADD', ORDER_KEY, 'NX', heart.createdAt, id], // แก้การ์ดเดิมไม่นับเพิ่ม
        ['ZCARD', ORDER_KEY],
      ]);
      return res.status(200).json({ heart, total: newTotal });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = handler;
module.exports.cleanText = cleanText;
module.exports.heartId = heartId;
module.exports.NAME_MAX = NAME_MAX;
module.exports.MESSAGE_MAX = MESSAGE_MAX;
module.exports.KEEP = KEEP;
