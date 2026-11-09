import { QUESTION_COUNT, buildQuiz, rankOf } from './quiz';
import artist from '../data/artist.json';

// rng แบบกำหนดผลได้ จะได้เทสต์ซ้ำได้
const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

test(`ได้ ${QUESTION_COUNT} ข้อ แต่ละข้อมี 4 ตัวเลือกไม่ซ้ำกันและมีคำตอบอยู่ด้วย`, () => {
  const quiz = buildQuiz(seeded(7));
  expect(quiz).toHaveLength(QUESTION_COUNT);
  expect(new Set(quiz.map((q) => q.id)).size).toBe(QUESTION_COUNT);
  quiz.forEach((q) => {
    expect(q.choices).toHaveLength(4);
    expect(new Set(q.choices).size).toBe(4);
    expect(q.choices).toContain(q.answer);
  });
});

test('คำตอบมาจากไฟล์ข้อมูลของน้อง', () => {
  const byId = Object.fromEntries(buildQuiz(seeded(3)).map((q) => [q.id, q.answer]));
  expect(byId.height).toBe(`${artist.heightCm} ซม.`);
  expect(byId.blood).toBe(artist.bloodGroup);
  expect(byId.province).toBe(`จังหวัด${artist.province}`);
  expect(byId.birthday).toBe('26 สิงหาคม 2552');
  expect(byId.noodle).toBe('ก๋วยเตี๋ยวน้ำตกไม่ผัก');
  expect(byId.mv).toBe('จะยังไงก็รักเธอ');
  expect(byId.variety).toBe('ดูออกนะคะ');
  expect(artist.hobbies).toContain(byId.hobby);
});

test('สุ่มคนละรอบ ลำดับคำถามเปลี่ยน', () => {
  const a = buildQuiz(seeded(1)).map((q) => q.id).join();
  const b = buildQuiz(seeded(99)).map((q) => q.id).join();
  expect(a).not.toBe(b);
});

test('ระดับแฟนตามคะแนน', () => {
  expect(rankOf(10).title).toBe('โอชิตัวจริง 100%!');
  expect(rankOf(8).title).toBe('โอตะตัวจริง');
  expect(rankOf(5).title).toBe('แฟนตัวยง');
  expect(rankOf(2).title).toBe('แฟนมือใหม่');
});
