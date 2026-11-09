// เทสต์ Vercel Function ใน api/scores.js โดยจำลอง Upstash Redis REST ด้วย fetch ปลอม
const handler = require('../api/scores');

const { cleanName, cleanScore } = handler;

function fakeRes() {
  const res = { statusCode: 200, headers: {}, body: null };
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

// Redis จำลองแบบง่าย: รองรับเฉพาะคำสั่งที่ api ใช้
function fakeRedis() {
  const boards = {};
  const counters = {};
  const sorted = (key) => Object.entries(boards[key] || {}).sort((a, b) => b[1] - a[1]);
  const run = ([cmd, key, ...args]) => {
    switch (cmd) {
      case 'INCR': counters[key] = (counters[key] || 0) + 1; return counters[key];
      case 'EXPIRE': return 1;
      case 'ZADD': {
        const [, score, member] = args; // ['GT', score, member]
        boards[key] = boards[key] || {};
        if (!(member in boards[key]) || score > boards[key][member]) boards[key][member] = score;
        return 1;
      }
      case 'ZREVRANK': return sorted(key).findIndex(([member]) => member === args[0]);
      case 'ZRANGE': {
        const [start, stop] = args;
        return sorted(key).slice(start, stop + 1).flatMap(([member, score]) => [member, String(score)]);
      }
      case 'ZREMRANGEBYRANK': return 0;
      default: throw new Error(`ไม่รองรับ ${cmd}`);
    }
  };
  return jest.fn(async (url, options) => ({
    ok: true,
    json: async () => JSON.parse(options.body).map((command) => ({ result: run(command) })),
  }));
}

const call = async (req) => {
  const res = fakeRes();
  await handler({ headers: { 'x-forwarded-for': '1.2.3.4' }, ...req }, res);
  return res;
};

beforeEach(() => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'test-token';
  global.fetch = fakeRedis();
});

afterEach(() => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete global.fetch;
});

test('ชื่อเล่นถูกตัดช่องว่างและอักขระแปลก ๆ และห้ามลิงก์', () => {
  expect(cleanName('  น้อง   การ์ตูน ')).toBe('น้อง การ์ตูน');
  expect(cleanName('<b>Toon</b>')).toBe('bToon/b');
  expect(cleanName('www.spam.com')).toBeNull();
  expect(cleanName('   ')).toBeNull();
  expect(cleanName('ก'.repeat(17))).toBeNull();
  expect(cleanName(42)).toBeNull();
});

test('คะแนนต้องเป็นจำนวนเต็มบวกไม่เกินเพดานของเกม', () => {
  expect(cleanScore('naamtok', '120')).toBe(120);
  expect(cleanScore('naamtok', 0)).toBeNull();
  expect(cleanScore('naamtok', 1.5)).toBeNull();
  expect(cleanScore('naamtok', 10 ** 9)).toBeNull();
});

test('ลงชื่อแล้วได้อันดับ และคนที่เข้ามาทีหลังเห็นตารางเดียวกัน', async () => {
  await call({ method: 'POST', body: { game: 'naamtok', name: 'มิว', score: 80 } });
  const posted = await call({ method: 'POST', body: { game: 'naamtok', name: 'ตูนตูน', score: 120 } });
  expect(posted.statusCode).toBe(200);
  expect(posted.body.rank).toBe(1);

  const viewed = await call({ method: 'GET', query: { game: 'naamtok' } });
  expect(viewed.body.scores).toEqual([{ name: 'ตูนตูน', score: 120 }, { name: 'มิว', score: 80 }]);
  expect(viewed.headers['Cache-Control']).toBe('no-store');
});

test('ชื่อเดิมเก็บเฉพาะคะแนนที่ดีที่สุด', async () => {
  await call({ method: 'POST', body: { game: 'next-girls', name: 'มิว', score: 90 } });
  await call({ method: 'POST', body: { game: 'next-girls', name: 'มิว', score: 40 } });
  const viewed = await call({ method: 'GET', query: { game: 'next-girls' } });
  expect(viewed.body.scores).toEqual([{ name: 'มิว', score: 90 }]);
});

test('ตารางของแต่ละเกมแยกกัน', async () => {
  await call({ method: 'POST', body: { game: 'naamtok', name: 'มิว', score: 50 } });
  const other = await call({ method: 'GET', query: { game: 'next-girls' } });
  expect(other.body.scores).toEqual([]);
});

test('ข้อมูลไม่ถูกต้องได้ 400 พร้อมเหตุผล', async () => {
  expect((await call({ method: 'GET', query: { game: 'tetris' } })).statusCode).toBe(400);
  const noName = await call({ method: 'POST', body: { game: 'naamtok', name: '', score: 10 } });
  expect(noName.statusCode).toBe(400);
  expect(noName.body.error).toMatch(/ชื่อเล่น/);
});

test('ส่งเกิน 5 ครั้งต่อนาทีจาก IP เดียวกันได้ 429', async () => {
  for (let i = 0; i < 5; i += 1) {
    expect((await call({ method: 'POST', body: { game: 'naamtok', name: `p${i}`, score: 10 } })).statusCode).toBe(200);
  }
  expect((await call({ method: 'POST', body: { game: 'naamtok', name: 'p6', score: 10 } })).statusCode).toBe(429);
});

test('ยังไม่ได้เชื่อม Redis ได้ 503 แทนที่จะพัง', async () => {
  delete process.env.KV_REST_API_URL;
  const res = await call({ method: 'GET', query: { game: 'naamtok' } });
  expect(res.statusCode).toBe(503);
});
