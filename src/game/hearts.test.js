import {
  DEFAULT_DRAFT, normalizeHeart, readToken, readDraft, saveDraft, wrapMessage, tiltOf, fetchTotal, sendHeart, SUGGESTIONS, pickSuggestion, MESSAGE_MAX,
  describeDesign, thaiTime, fetchAllHearts, heartsToCsv,
} from './hearts';

const measure = (text) => [...text].length * 10;

beforeEach(() => window.localStorage.clear());
afterEach(() => { delete global.fetch; });

test('ค่าการ์ดที่ไม่รู้จักกลับเป็นค่าเริ่มต้น', () => {
  expect(normalizeHeart({ name: 'มิว', message: 'สู้ ๆ', kind: 'spam', color: 99, sticker: '2', pattern: 'x', font: 'hand' }))
    .toEqual({ ...DEFAULT_DRAFT, name: 'มิว', message: 'สู้ ๆ', font: 'hand' });
  expect(normalizeHeart(null)).toEqual(DEFAULT_DRAFT);
});

test('token ประจำเครื่องสุ่มครั้งเดียวแล้วใช้ตัวเดิม', () => {
  const token = readToken();
  expect(token).toMatch(/^[A-Za-z0-9-]{16,64}$/);
  expect(readToken()).toBe(token);
  window.localStorage.setItem('heart-token', 'bad token!');
  expect(readToken()).not.toBe('bad token!');
});

test('จำการ์ดที่ส่งล่าสุดไว้ในเครื่อง ข้อมูลเสียถือว่ายังไม่เคยส่ง', () => {
  expect(readDraft()).toBeNull();
  saveDraft({ ...DEFAULT_DRAFT, id: 'abc', name: 'มิว', message: 'สู้ ๆ', color: 3 });
  expect(readDraft()).toMatchObject({ id: 'abc', name: 'มิว', color: 3 });
  window.localStorage.setItem('heart-draft', '{oops');
  expect(readDraft()).toBeNull();
});

test('สรุปการแต่งการ์ดและเวลาไทยเป็นข้อความที่อ่านง่าย', () => {
  expect(describeDesign({ color: 0, sticker: 0, pattern: 'stripe', font: 'hand' })).toBe('สีชมพู · 💖 · พื้นลายทาง · ตัวอักษรลายมือ');
  expect(thaiTime(Date.UTC(2026, 10, 14, 3, 30))).toBe('2026-11-14 10:30');
  expect(thaiTime(undefined)).toBe('');
});

test('แอดมิน: โหลดการ์ดทั้งหมดด้วยรหัสใน header ไม่ใส่ใน URL', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ total: 1, hearts: [{ id: 'a', name: 'มิว', message: 'สู้ ๆ', color: 99 }] }) }));
  const hearts = await fetchAllHearts('secret-key');
  expect(hearts).toEqual([expect.objectContaining({ id: 'a', name: 'มิว', color: 0, kind: 'wish' })]);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe('/api/hearts');
  expect(options.headers['x-admin-key']).toBe('secret-key');

  global.fetch = jest.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: 'รหัสแอดมินไม่ถูกต้อง' }) }));
  await expect(fetchAllHearts('wrong')).rejects.toThrow('รหัสแอดมินไม่ถูกต้อง');
});

test('ตาราง CSV: มีหัวตาราง ครอบเครื่องหมายคำพูด และกันสูตรของโปรแกรมตาราง', () => {
  const csv = heartsToCsv([
    { id: 'a', name: 'มิว', message: 'สู้ ๆ "นะ"\nรักน้อง', kind: 'cheer', color: 2, sticker: 1, pattern: 'dots', font: 'sans', createdAt: Date.UTC(2026, 10, 14, 3, 30) },
    { id: 'b', name: '=HYPERLINK("x")', message: 'ดี', createdAt: Date.UTC(2026, 10, 14, 4) },
  ]);
  const rows = csv.split('\r\n');
  expect(rows).toHaveLength(3); // ขึ้นบรรทัดใหม่ในข้อความใช้ \n จึงไม่ถูกนับเป็นแถว
  expect(rows[0]).toBe('"ลำดับ","ส่งเมื่อ (เวลาไทย)","ชื่อ","ประเภท","ข้อความ","การ์ด","แก้ล่าสุด (เวลาไทย)","id"');
  expect(rows[1]).toBe('"1","2026-11-14 10:30","มิว","ให้กำลังใจ","สู้ ๆ ""นะ""\nรักน้อง","สีฟ้า · 🌷 · พื้นจุด · ตัวอักษรปกติ","","a"');
  expect(rows[2]).toContain('"\'=HYPERLINK(""x"")"');
});

test('ข้อความหลายบรรทัด: เก็บการขึ้นบรรทัดของผู้เขียน และตัดเมื่อเกินจำนวนบรรทัด', () => {
  expect(wrapMessage('aaa\nbbb', measure, 100, 6)).toEqual(['aaa', 'bbb']);
  const lines = wrapMessage('a\nb\nc\nd', measure, 100, 3);
  expect(lines).toHaveLength(3);
  expect(lines[2].endsWith('…')).toBe(true);
});

test('มุมเอียงของการ์ดคงที่ตาม id และไม่เกิน 1.2 องศา', () => {
  expect(tiltOf('abc')).toBe(tiltOf('abc'));
  expect(Math.abs(tiltOf('abc'))).toBeLessThanOrEqual(1.2);
});

test('โหลดจำนวนคนที่ส่ง: server ที่ไม่ตอบ JSON ถือว่าออฟไลน์', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ total: 7 }) }));
  expect(await fetchTotal()).toBe(7);
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ total: 'เยอะ' }) }));
  expect(await fetchTotal()).toBe(0);

  global.fetch = jest.fn(async () => ({ ok: true, json: async () => { throw new Error('not json'); } }));
  await expect(fetchTotal()).rejects.toThrow('offline');
});

test('ส่งใจ: ส่ง token ไปกับการ์ด และข้อความผิดพลาดจาก server ส่งต่อให้หน้าเว็บ', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ heart: { id: 'a', name: 'มิว', message: 'สู้ ๆ' }, total: 1 }) }));
  const result = await sendHeart('token-1234567890abcdef', { ...DEFAULT_DRAFT, name: 'มิว', message: 'สู้ ๆ' });
  expect(result.heart.id).toBe('a');
  expect(result.total).toBe(1);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({ token: 'token-1234567890abcdef', name: 'มิว' });

  global.fetch = jest.fn(async () => ({ ok: false, status: 429, json: async () => ({ error: 'ส่งถี่เกินไป' }) }));
  await expect(sendHeart('t', DEFAULT_DRAFT)).rejects.toThrow('ส่งถี่เกินไป');
});

test('ข้อความสุ่ม: มีทั้งสองประเภท ไม่ยาวเกิน ไม่ซ้ำกัน และไม่มีลิงก์', () => {
  Object.values(SUGGESTIONS).forEach((list) => {
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(new Set(list).size).toBe(list.length);
    list.forEach((text) => {
      expect([...text].length).toBeLessThanOrEqual(MESSAGE_MAX);
      expect(text).not.toMatch(/https?:|www\.|[<>]/);
    });
  });
});

test('สุ่มข้อความตามประเภท และไม่ซ้ำกับข้อที่อยู่ในช่องตอนนี้', () => {
  expect(pickSuggestion('wish', () => 0)).toBe(SUGGESTIONS.wish[0]);
  expect(pickSuggestion('cheer', () => 0)).toBe(SUGGESTIONS.cheer[0]);
  expect(pickSuggestion('wish', () => 0, SUGGESTIONS.wish[0])).toBe(SUGGESTIONS.wish[1]);
  expect(SUGGESTIONS.cheer).toContain(pickSuggestion('cheer', () => 0.999));
  expect(pickSuggestion('อื่น ๆ', () => 0)).toBe(SUGGESTIONS.wish[0]);
});
