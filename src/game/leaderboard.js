// คุยกับ /api/scores (ดู api/scores.js) และจำชื่อเล่นล่าสุดไว้ในเครื่อง
const ENDPOINT = '/api/scores';
const NAME_KEY = 'leaderboard-name';

async function request(url, options) {
  if (typeof fetch !== 'function') throw new Error('offline');
  const response = await fetch(url, options);
  // ตอบกลับมาไม่ใช่ JSON (เช่น npm start ที่ไม่มี /api ให้หน้าเว็บกลับมาแทน) ถือว่าต่อ server ไม่ได้
  const data = await response.json().catch(() => null);
  if (!data) throw new Error('offline');
  if (!response.ok) throw Object.assign(new Error(data.error || 'ส่งไม่สำเร็จ'), { status: response.status });
  return data;
}

// คืน [{ name, score }] 10 อันดับแรก
export async function fetchTop(game) {
  const data = await request(`${ENDPOINT}?game=${encodeURIComponent(game)}`);
  return Array.isArray(data.scores) ? data.scores : [];
}

// คืน { rank, scores }
export async function submitScore(game, name, score) {
  return request(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game, name, score }),
  });
}

export function readName() {
  try {
    return window.localStorage.getItem(NAME_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function saveName(name) {
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch (e) {
    // จำชื่อไม่ได้ก็พิมพ์ใหม่รอบหน้า
  }
}
