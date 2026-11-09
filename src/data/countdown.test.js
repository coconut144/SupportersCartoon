import { startTimeOf, countdownOf } from './countdown';

const concert = { date: '2026-11-14', schedule: ['12:00 Door Open', '13:00 Start'] };
const roadshow = { date: '2026-11-08', schedule: ['12:00–13:00 Mini Concert'] };
const noTime = { date: '2026-11-20' };

// เวลาไทย = UTC+7
const bkk = (iso) => new Date(`${iso}+07:00`);

test('อ่านเวลาเริ่มจากบรรทัดแรกของตาราง คิดเป็นเวลาไทย', () => {
  expect(startTimeOf(concert).start.toISOString()).toBe('2026-11-14T05:00:00.000Z');
  expect(startTimeOf(roadshow).clock).toBe('12:00');
  expect(startTimeOf(noTime)).toEqual({ start: new Date('2026-11-20T00:00:00+07:00'), clock: null });
});

test('ก่อนวันงานบอกเป็นวันกับชั่วโมง', () => {
  expect(countdownOf(concert, bkk('2026-11-11T07:00:00'))).toEqual({ text: 'อีก 3 วัน 5 ชั่วโมง', isToday: false });
  expect(countdownOf(concert, bkk('2026-11-11T12:00:00'))).toEqual({ text: 'อีก 3 วัน', isToday: false });
});

test('เหลือไม่ถึงวันแต่ยังไม่ใช่วันงาน บอกเป็นชั่วโมงกับนาที', () => {
  expect(countdownOf(concert, bkk('2026-11-13T22:30:00')).text).toBe('อีก 13 ชั่วโมง 30 นาที');
});

test('วันงานขึ้น "วันนี้" พร้อมเวลาเริ่ม และบอกเมื่องานเริ่มแล้ว', () => {
  expect(countdownOf(concert, bkk('2026-11-14T09:15:00'))).toEqual({ text: 'เริ่ม 12:00 · อีก 2 ชั่วโมง 45 นาที', isToday: true });
  expect(countdownOf(concert, bkk('2026-11-14T11:58:00')).text).toBe('เริ่ม 12:00 · อีก 2 นาที');
  expect(countdownOf(concert, bkk('2026-11-14T15:00:00'))).toEqual({ text: 'กำลังจัดอยู่ตอนนี้!', isToday: true });
  expect(countdownOf(noTime, bkk('2026-11-20T08:00:00'))).toEqual({ text: 'วันนี้!', isToday: true });
});

test('"วันนี้" ยึดเวลาไทย แม้เครื่องจะอยู่โซนเวลาอื่น', () => {
  // 23:30 ของวันที่ 13 ตามเวลา UTC = 06:30 ของวันที่ 14 ตามเวลาไทย
  expect(countdownOf(concert, new Date('2026-11-13T23:30:00Z')).isToday).toBe(true);
});

test('งานที่ผ่านไปแล้วไม่ต้องนับถอยหลัง', () => {
  expect(countdownOf(roadshow, bkk('2026-11-09T10:00:00'))).toBeNull();
});
