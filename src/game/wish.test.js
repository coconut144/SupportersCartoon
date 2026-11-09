import { WISHES, wishUrl, readWishParams, pickWish } from './wish';
import { qrMatrix } from './fanCard';

test('ลิงก์ใน QR ชี้ไปหน้า /wish พร้อมชื่อและเลขสมาชิก', () => {
  const url = wishUrl({ name: 'มิว ตูน', no: '0042' });
  expect(url.startsWith('https://standbycartoon.vercel.app/wish?')).toBe(true);
  expect(readWishParams(new URL(url).search)).toEqual({ name: 'มิว ตูน', no: '0042' });
});

test('อ่านลิงก์อย่างระวัง: ตัดชื่อยาวและเลขสมาชิกแปลก ๆ', () => {
  expect(readWishParams('?to=' + encodeURIComponent('ก'.repeat(40)) + '&no=12ab')).toEqual({ name: 'ก'.repeat(16), no: '' });
  expect(readWishParams('')).toEqual({ name: '', no: '' });
});

test('สุ่มคำอวยพรจากรายการ และกดสุ่มใหม่จะไม่ได้ข้อเดิม', () => {
  const first = pickWish(() => 0);
  expect(WISHES).toContain(first);
  for (let i = 0; i < 20; i += 1) expect(pickWish(Math.random, first)).not.toBe(first);
});

test('ทำ QR ได้แม้ชื่อเล่นยาวสุด ตารางเป็นสี่เหลี่ยมจัตุรัส', () => {
  const short = qrMatrix(wishUrl({ name: 'มิว', no: '0001' }));
  const long = qrMatrix(wishUrl({ name: 'ก'.repeat(16), no: '9999' }));
  [short, long].forEach((m) => {
    expect(m.length).toBeGreaterThanOrEqual(21);
    m.forEach((row) => expect(row).toHaveLength(m.length));
  });
  // QR ทุกอันมีจุดหามุม 3 มุม: มุมซ้ายบน 7 × 7 ขอบดำ
  expect(short[0].slice(0, 7).every(Boolean)).toBe(true);
  expect(long.length).toBeGreaterThan(short.length);
});
