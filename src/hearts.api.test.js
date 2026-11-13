// เทสต์ Vercel Function ใน api/hearts.js โดยจำลอง Upstash Redis REST ด้วย fetch ปลอม
const handler = require('../api/hearts');

const { cleanText, heartId, NAME_MAX, MESSAGE_MAX, LABELS } = handler;
const client = require('./game/hearts');

const TOKEN_A = 'aaaaaaaa-1111-2222-3333-444444444444';
const TOKEN_B = 'bbbbbbbb-1111-2222-3333-444444444444';

function fakeRes() {
  const res = { statusCode: 200, headers: {}, body: null };
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

// Redis จำลองแบบง่าย: รองรับเฉพาะคำสั่งที่ api ใช้
function fakeRedis() {
  const order = {};
  const data = {};
  const counters = {};
  const run = ([cmd, key, ...args]) => {
    switch (cmd) {
      case 'INCR': counters[key] = (counters[key] || 0) + 1; return counters[key];
      case 'EXPIRE': return 1;
      case 'HGET': return data[args[0]] || null;
      case 'HSET': data[args[0]] = args[1]; return 1;
      case 'HMGET': return args.map((id) => data[id] || null);
      case 'ZCARD': return Object.keys(order).length;
      case 'ZADD': { // ['NX', score, member]
        const [, score, member] = args;
        if (!(member in order)) order[member] = score;
        return 1;
      }
      case 'ZRANGE': return Object.entries(order).sort((a, b) => a[1] - b[1]).map(([member]) => member); // [0, -1]
      case 'HGETALL': return Object.entries(data).flat(); // Upstash REST คืนเป็น [field, value, field, value, …]
      default: throw new Error(`ไม่รองรับ ${cmd}`);
    }
  };
  return jest.fn(async (url, options) => ({
    ok: true,
    json: async () => JSON.parse(options.body).map((command) => ({ result: run(command) })),
  }));
}

const call = async (req, ip = '1.2.3.4') => {
  const res = fakeRes();
  await handler({ headers: { 'x-forwarded-for': ip }, ...req }, res);
  return res;
};

const post = (body, ip) => call({ method: 'POST', body }, ip);

let clock;
beforeEach(() => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'test-token';
  global.fetch = fakeRedis();
  clock = 1000;
  jest.spyOn(Date, 'now').mockImplementation(() => { clock += 1000; return clock; });
});

afterEach(() => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.HEARTS_ADMIN_KEY;
  delete global.fetch;
  jest.restoreAllMocks();
});

test('ข้อความถูกทำความสะอาด เก็บการขึ้นบรรทัดไว้ได้ และห้ามลิงก์', () => {
  expect(cleanText('  น้อง   การ์ตูน ', NAME_MAX)).toBe('น้อง การ์ตูน');
  expect(cleanText('<b>Toon</b>', NAME_MAX)).toBe('bToon/b');
  expect(cleanText('สู้ ๆ นะ \n\n\n\n รักน้อง', MESSAGE_MAX, true)).toBe('สู้ ๆ นะ\n\nรักน้อง');
  expect(cleanText('ดูที่ www.spam.com', MESSAGE_MAX, true)).toBeNull();
  expect(cleanText('   ', NAME_MAX)).toBeNull();
  expect(cleanText('ก'.repeat(MESSAGE_MAX + 1), MESSAGE_MAX, true)).toBeNull();
  expect(cleanText(42, NAME_MAX)).toBeNull();
});

test('id ของการ์ดมาจาก token: token เดิมได้ id เดิม token แปลก ๆ ไม่รับ', () => {
  expect(heartId(TOKEN_A)).toMatch(/^[0-9a-f]{16}$/);
  expect(heartId(TOKEN_A)).toBe(heartId(TOKEN_A));
  expect(heartId(TOKEN_A)).not.toBe(heartId(TOKEN_B));
  expect(heartId('short')).toBeNull();
  expect(heartId(undefined)).toBeNull();
});

test('ส่งใจแล้วจำนวนคนเพิ่ม และคนอื่นเห็นแค่จำนวน ไม่เห็นข้อความหรือ token', async () => {
  const first = await post({ token: TOKEN_A, name: 'มิว', message: 'สุขสันต์วันเกิดนะ', kind: 'wish', color: 2, sticker: 3, pattern: 'dots', font: 'hand' });
  expect(first.body.total).toBe(1);
  expect(first.body.heart).toMatchObject({ name: 'มิว', color: 2, sticker: 3, pattern: 'dots', font: 'hand' });
  const second = await post({ token: TOKEN_B, name: 'ตูนตูน', message: 'สู้ ๆ', kind: 'cheer' }, '5.6.7.8');
  expect(second.statusCode).toBe(200);
  expect(second.body.total).toBe(2);
  expect(second.body.heart).toMatchObject({ name: 'ตูนตูน', kind: 'cheer', color: 0, sticker: 0, pattern: 'none', font: 'sans' });
  expect(JSON.stringify(second.body)).not.toContain('สุขสันต์วันเกิดนะ');

  const viewed = await call({ method: 'GET' });
  expect(viewed.body).toEqual({ total: 2 });
  expect(viewed.headers['Cache-Control']).toBe('no-store');
});

test('ส่งซ้ำด้วย token เดิม = แก้การ์ดเดิม ไม่นับเพิ่ม และเวลาที่ส่งครั้งแรกคงเดิม', async () => {
  const first = await post({ token: TOKEN_A, name: 'มิว', message: 'ข้อความแรก' });
  await post({ token: TOKEN_B, name: 'ตูนตูน', message: 'สู้ ๆ' });
  const edited = await post({ token: TOKEN_A, name: 'มิว', message: 'แก้แล้ว' });
  expect(edited.body.total).toBe(2);
  expect(edited.body.heart.message).toBe('แก้แล้ว');
  expect(edited.body.heart.createdAt).toBe(first.body.heart.createdAt);
  expect(edited.body.heart.updatedAt).toBeGreaterThan(first.body.heart.createdAt);
});

test('ตัวเลือกการ์ดที่ไม่รู้จักกลับเป็นค่าเริ่มต้น', async () => {
  const res = await post({ token: TOKEN_A, name: 'มิว', message: 'สู้ ๆ', kind: 'spam', color: 99, sticker: -1, pattern: 'url(x)', font: 'comic' });
  expect(res.body.heart).toMatchObject({ kind: 'wish', color: 0, sticker: 0, pattern: 'none', font: 'sans' });
});

test('ข้อมูลไม่ถูกต้องได้ 400 พร้อมเหตุผล', async () => {
  expect((await post({ name: 'มิว', message: 'สู้ ๆ' })).statusCode).toBe(400);
  const noName = await post({ token: TOKEN_A, name: '', message: 'สู้ ๆ' });
  expect(noName.statusCode).toBe(400);
  expect(noName.body.error).toMatch(/ชื่อ/);
  const noMessage = await post({ token: TOKEN_A, name: 'มิว', message: '  ' });
  expect(noMessage.statusCode).toBe(400);
  expect(noMessage.body.error).toMatch(/ข้อความ/);
});

test('ส่งเกิน 5 ครั้งต่อนาทีจาก IP เดียวกันได้ 429', async () => {
  for (let i = 0; i < 5; i += 1) {
    expect((await post({ token: TOKEN_A, name: 'มิว', message: `รอบ ${i}` })).statusCode).toBe(200);
  }
  expect((await post({ token: TOKEN_A, name: 'มิว', message: 'อีกรอบ' })).statusCode).toBe(429);
});

test('ยังไม่ได้เชื่อม Redis ได้ 503 แทนที่จะพัง', async () => {
  delete process.env.KV_REST_API_URL;
  expect((await call({ method: 'GET' })).statusCode).toBe(503);
});

test('การ์ดที่เก็บอ่านง่าย: ขึ้นต้นด้วยเวลาไทย ชื่อ ประเภท ข้อความ และสรุปการแต่งการ์ด', async () => {
  Date.now.mockImplementation(() => Date.UTC(2026, 10, 14, 3, 30));
  await post({ token: TOKEN_A, name: 'มิว', message: 'สู้ ๆ นะ', kind: 'cheer', color: 0, sticker: 0, pattern: 'stripe', font: 'hand' });
  const stored = JSON.parse(JSON.parse(global.fetch.mock.calls[1][1].body)[0][3]);
  expect(Object.keys(stored).slice(0, 5)).toEqual(['sentAt', 'name', 'type', 'message', 'design']);
  expect(stored).toMatchObject({
    sentAt: '2026-11-14 10:30',
    name: 'มิว',
    type: 'ให้กำลังใจ',
    message: 'สู้ ๆ นะ',
    design: 'สีชมพู · 💖 · พื้นลายทาง · ตัวอักษรลายมือ',
    kind: 'cheer', color: 0, sticker: 0, pattern: 'stripe', font: 'hand',
  });
  expect(stored.editedAt).toBeUndefined();

  Date.now.mockImplementation(() => Date.UTC(2026, 10, 14, 5));
  const edited = await post({ token: TOKEN_A, name: 'มิว', message: 'แก้แล้ว' });
  expect(edited.body.heart).toMatchObject({ sentAt: '2026-11-14 10:30', editedAt: '2026-11-14 12:00' });
});

test('ตัวเลือกและคำสรุปการ์ดฝั่ง api ตรงกับฝั่งหน้าเว็บ', () => {
  expect(LABELS.KIND_LABELS).toEqual(Object.fromEntries(client.KINDS.map((kind) => [kind.id, kind.label])));
  expect(LABELS.COLOR_LABELS).toEqual(client.COLORS.map((color) => color.label));
  expect(LABELS.STICKERS).toEqual(client.STICKERS);
  expect(LABELS.PATTERN_LABELS).toEqual(Object.fromEntries(client.PATTERNS.map((pattern) => [pattern.id, pattern.label])));
  expect(LABELS.FONT_LABELS).toEqual(Object.fromEntries(client.FONTS.map((font) => [font.id, font.label])));
  const design = { color: 3, sticker: 5, pattern: 'grid', font: 'display' };
  expect(handler.describeDesign(design)).toBe(client.describeDesign(design));
  expect(handler.thaiTime(123456789)).toBe(client.thaiTime(123456789));
});

test('แอดมิน: ใส่รหัสถูกได้การ์ดทั้งหมดเรียงตามเวลาที่ส่ง รหัสผิดหรือยังไม่ตั้งรหัสไม่ได้อะไร', async () => {
  await post({ token: TOKEN_A, name: 'มิว', message: 'ใบแรก' });
  await post({ token: TOKEN_B, name: 'ตูนตูน', message: 'ใบสอง', kind: 'cheer' }, '5.6.7.8');
  const admin = (key) => call({ method: 'GET', headers: { 'x-forwarded-for': '9.9.9.9', 'x-admin-key': key } });

  expect((await admin('anything')).statusCode).toBe(503);

  process.env.HEARTS_ADMIN_KEY = 'open-sesame-123';
  const wrong = await admin('guess');
  expect(wrong.statusCode).toBe(401);
  expect(JSON.stringify(wrong.body)).not.toContain('ใบแรก');
  expect((await admin('')).statusCode).toBe(401);

  const ok = await admin('open-sesame-123');
  expect(ok.statusCode).toBe(200);
  expect(ok.body.total).toBe(2);
  expect(ok.body.hearts.map((heart) => heart.message)).toEqual(['ใบแรก', 'ใบสอง']);
  expect(ok.body.hearts[1]).toMatchObject({ name: 'ตูนตูน', type: 'ให้กำลังใจ', design: 'สีชมพู · 💖 · พื้นเรียบ · ตัวอักษรปกติ' });
  expect(JSON.stringify(ok.body)).not.toContain(TOKEN_A);
});

test('แอดมิน: ลองรหัสเกิน 10 ครั้งต่อนาทีจาก IP เดียวกันได้ 429', async () => {
  process.env.HEARTS_ADMIN_KEY = 'open-sesame-123';
  const admin = (key) => call({ method: 'GET', headers: { 'x-forwarded-for': '9.9.9.9', 'x-admin-key': key } });
  for (let i = 0; i < 10; i += 1) expect((await admin(`guess-${i}`)).statusCode).toBe(401);
  expect((await admin('open-sesame-123')).statusCode).toBe(429);
});
