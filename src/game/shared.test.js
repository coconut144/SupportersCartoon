import { HISTORY_LIMIT, readHistory, addRun, summarize } from './shared';

beforeEach(() => {
  window.localStorage.clear();
});

test('ยังไม่เคยเล่น ได้ประวัติว่าง', () => {
  expect(readHistory('naamtok')).toEqual({ plays: 0, runs: [] });
  expect(summarize(readHistory('naamtok'))).toEqual({ plays: 0, average: 0 });
});

test('บันทึกรอบใหม่ไว้หน้าสุด พร้อมเวลาและข้อมูลเสริมของเกม', () => {
  addRun('next-girls', { score: 50, meters: 30, hearts: 2 }, new Date('2026-11-10T10:00:00Z'));
  addRun('next-girls', { score: 80, meters: 40, hearts: 4 }, new Date('2026-11-10T10:05:00Z'));

  const { plays, runs } = readHistory('next-girls');
  expect(plays).toBe(2);
  expect(runs.map((run) => run.score)).toEqual([80, 50]);
  expect(runs[0]).toEqual({ score: 80, meters: 40, hearts: 4, at: '2026-11-10T10:05:00.000Z' });
});

test('ประวัติแต่ละเกมแยกกัน', () => {
  addRun('naamtok', { score: 10 });
  expect(readHistory('next-girls').runs).toHaveLength(0);
});

test('อันดับของรอบนี้เทียบกับรอบที่เก็บไว้ เสมอกันได้อันดับเดียวกัน', () => {
  expect(addRun('naamtok', { score: 100 }).rank).toBe(1);
  expect(addRun('naamtok', { score: 40 }).rank).toBe(2);
  expect(addRun('naamtok', { score: 100 }).rank).toBe(1);
  expect(addRun('naamtok', { score: 70 }).rank).toBe(3);
});

test(`เก็บแค่ ${HISTORY_LIMIT} รอบล่าสุด แต่ยังนับจำนวนรอบที่เล่นทั้งหมด`, () => {
  for (let i = 1; i <= HISTORY_LIMIT + 5; i += 1) addRun('naamtok', { score: i });

  const history = readHistory('naamtok');
  expect(history.plays).toBe(HISTORY_LIMIT + 5);
  expect(history.runs).toHaveLength(HISTORY_LIMIT);
  expect(history.runs[0].score).toBe(HISTORY_LIMIT + 5);
});

test('คะแนนเฉลี่ยปัดเป็นจำนวนเต็ม', () => {
  [10, 20, 25].forEach((score) => addRun('naamtok', { score }));
  expect(summarize(readHistory('naamtok'))).toEqual({ plays: 3, average: 18 });
});

test('ข้อมูลเสียหรืออ่านไม่ได้ ถือว่ายังไม่มีประวัติ', () => {
  window.localStorage.setItem('naamtok-history', '{not json');
  expect(readHistory('naamtok')).toEqual({ plays: 0, runs: [] });

  window.localStorage.setItem('naamtok-history', JSON.stringify({ plays: 2, runs: [{ score: 'x' }, { score: 5, at: '2026-11-10T00:00:00Z' }] }));
  expect(readHistory('naamtok').runs).toEqual([{ score: 5, at: '2026-11-10T00:00:00Z' }]);
});
