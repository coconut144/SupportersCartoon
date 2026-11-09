import {
  cleanName, readMember, saveMember, NAME_MAX, DEFAULT_LOOK, LOOK_OPTIONS, normalizeLook, lookRows, lookPalette, lookBackground,
} from './fanCard';
import { PALETTE } from './pixel';

beforeEach(() => window.localStorage.clear());

test('ชื่อเล่นถูกตัดช่องว่างและความยาว', () => {
  expect(cleanName('  มิว   ตูน ')).toBe('มิว ตูน');
  expect([...cleanName('ก'.repeat(30))]).toHaveLength(NAME_MAX);
  expect(cleanName('')).toBe('');
});

test('ทำบัตรครั้งแรกได้เลขสมาชิก 4 หลักและวันที่สมัคร', () => {
  const member = saveMember('มิว', new Date('2026-11-10T03:00:00Z'), () => 0.1234);
  expect(member).toEqual({ name: 'มิว', no: '1234', joined: '2026-11-10', look: DEFAULT_LOOK });
  expect(readMember()).toEqual(member);
});

test('เปลี่ยนชื่อได้ แต่เลขสมาชิกและวันที่สมัครเดิมคงไว้', () => {
  saveMember('มิว', new Date('2026-11-10T03:00:00Z'), () => 0.5);
  const renamed = saveMember('มิวมิว', new Date('2027-01-01T03:00:00Z'), () => 0.9);
  expect(renamed.name).toBe('มิวมิว');
  expect(renamed.no).toBe(readMember().no);
  expect(renamed.joined).toBe('2026-11-10');
});

test('ข้อมูลเสียถือว่ายังไม่มีบัตร', () => {
  window.localStorage.setItem('fan-card', '{oops');
  expect(readMember()).toBeNull();
  window.localStorage.setItem('fan-card', JSON.stringify({ name: 'x', no: 'abc', joined: '2026-11-10' }));
  expect(readMember()).toBeNull();
});

test('ชุดเริ่มต้นคือตัวเลือกแรกของทุกหมวด', () => {
  expect(DEFAULT_LOOK).toEqual({ accent: 'pink', shirt: 'white', skirt: 'navy', mood: 'happy', item: 'none', bg: 'pink' });
});

test('ค่าชุดที่ไม่รู้จักกลับเป็นค่าเริ่มต้นของหมวดนั้น', () => {
  expect(normalizeLook({ accent: 'sky', shirt: 'rainbow', mood: 42 })).toEqual({ ...DEFAULT_LOOK, accent: 'sky' });
  expect(normalizeLook(null)).toEqual(DEFAULT_LOOK);
});

test('แต่งตัวแล้วบันทึกไว้กับบัตร เปลี่ยนชื่อทีหลังชุดเดิมยังอยู่', () => {
  const look = { ...DEFAULT_LOOK, accent: 'purple', item: 'lightstick' };
  saveMember('มิว', new Date('2026-11-10T03:00:00Z'), () => 0.5, look);
  expect(readMember().look).toEqual(look);
  const renamed = saveMember('มิวมิว');
  expect(renamed.look).toEqual(look);
});

test('บัตรเก่าที่ยังไม่มีชุด อ่านได้และได้ชุดเริ่มต้น', () => {
  window.localStorage.setItem('fan-card', JSON.stringify({ name: 'มิว', no: '0042', joined: '2026-11-10' }));
  expect(readMember().look).toEqual(DEFAULT_LOOK);
});

test('เปลี่ยนสีโบว์ เสื้อ กระโปรง ทับจานสีเดิม แต่สีอื่น (ผม ผิว ประกายตา) ไม่เปลี่ยน', () => {
  const palette = lookPalette({ accent: 'sky', shirt: 'pink', skirt: 'mint' });
  expect(palette.c).toBe('#6fc0ff');
  expect(palette.w).toBe('#ffd3e2');
  expect(palette.n).toBe('#5cbfa5');
  ['h', 's', 'z', 'e'].forEach((key) => expect(palette[key]).toBe(PALETTE[key]));
  expect(lookBackground({ bg: 'mint' })).toBe('#dcf5ec');
});

test('ภาพรวมกว้าง 38 จุด ทุกตัวเลือกใช้แต่สีที่มีในจานสี', () => {
  const palette = lookPalette(DEFAULT_LOOK);
  LOOK_OPTIONS.mood.choices.forEach(({ id: mood }) => {
    LOOK_OPTIONS.item.choices.forEach(({ id: item }) => {
      const rows = lookRows({ mood, item });
      rows.forEach((row) => {
        expect(row).toHaveLength(38);
        [...row].forEach((ch) => { if (ch !== '.') expect(palette[ch]).toBeDefined(); });
      });
    });
  });
});

test('ถือแท่งไฟแล้วแขนขวายื่นไปแตะด้าม', () => {
  const rows = lookRows({ item: 'lightstick' });
  expect(rows[29].slice(29, 35)).toBe('ssssss'); // มือเดิม + แขนยื่น 2 จุด + มือที่จับด้าม 3 จุด
  expect(lookRows({ item: 'none' })[29].slice(30, 32)).toBe('..');
});
