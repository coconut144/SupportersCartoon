import { createState, start, update, tap, makeBowl, isVeg, MAX_MISSES, RIM_Y, GOLDEN_POINTS } from './naamtok';

// ค่าสุ่มคงที่ ให้เทสต์ได้ผลเหมือนเดิมทุกครั้ง
const fixedRng = () => 0.5;

function bowlWith(state, kinds) {
  const bowl = makeBowl(state, fixedRng);
  bowl.items = kinds.map((kind, i) => ({ kind, dx: 3 + i * 7, dy: -5 }));
  bowl.x = 20;
  state.bowls = [bowl];
  state.spawnIn = 999;
  return bowl;
}

// จุดกึ่งกลางของของชิ้นแรกในชาม (ชามอยู่ที่ x = 20)
const firstItemCenter = { x: 20 + 3 + 3, y: RIM_Y - 5 + 2.5 };

test('ชามใหม่มีผักอย่างน้อย 1 อย่างเสมอ', () => {
  const state = createState();
  for (let i = 0; i < 20; i += 1) {
    expect(makeBowl(state).items.some((item) => isVeg(item.kind))).toBe(true);
  }
});

test('แตะผักได้ 5 คะแนน และผักหายจากชาม', () => {
  const state = createState();
  start(state);
  const bowl = bowlWith(state, ['cilantro']);
  expect(tap(state, firstItemCenter.x, firstItemCenter.y)).toBe('veg');
  expect(state.score).toBe(5);
  expect(bowl.items).toHaveLength(0);
});

test('แตะลูกชิ้นโดนหัก 10 คะแนน แต่ไม่ติดลบ', () => {
  const state = createState();
  start(state);
  state.score = 4;
  bowlWith(state, ['meatball']);
  expect(tap(state, firstItemCenter.x, firstItemCenter.y)).toBe('keep');
  expect(state.score).toBe(0);
});

test('แตะที่ว่างไม่เกิดอะไร', () => {
  const state = createState();
  start(state);
  bowlWith(state, ['cilantro']);
  expect(tap(state, 110, 10)).toBeNull();
  expect(state.score).toBe(0);
});

test('ชามที่ไม่มีผักถึงมือน้องได้ 20 คะแนน ชามที่มีผักนับเป็นพลาด', () => {
  const state = createState();
  start(state);
  bowlWith(state, ['meatball']).x = 200;
  update(state, 0.01);
  expect(state.score).toBe(20);
  expect(state.misses).toBe(0);

  bowlWith(state, ['scallion']).x = 200;
  update(state, 0.01);
  expect(state.misses).toBe(1);
});

test(`พลาดครบ ${MAX_MISSES} ชามจบเกม และแตะต่อไม่ได้`, () => {
  const state = createState();
  start(state);
  state.misses = MAX_MISSES - 1;
  bowlWith(state, ['cilantro']).x = 200;
  update(state, 0.01);
  expect(state.phase).toBe('over');
  expect(tap(state, firstItemCenter.x, firstItemCenter.y)).toBeNull();
});

test('ถั่วงอกกับโหระพานับเป็นผัก', () => {
  expect(isVeg('beanSprout')).toBe(true);
  expect(isVeg('basil')).toBe(true);
  expect(isVeg('meatball')).toBe(false);
});

test('ชามทองที่ไม่มีผักได้คะแนนมากกว่าชามปกติ', () => {
  const state = createState();
  start(state);
  const bowl = bowlWith(state, ['pork']);
  bowl.golden = true;
  bowl.x = 200;
  update(state, 0.01);
  expect(state.score).toBe(GOLDEN_POINTS);
});

test('ผักงอกขึ้นมาใหม่เมื่อชามเลื่อนถึงจุดที่กำหนด', () => {
  const state = createState();
  start(state);
  const bowl = bowlWith(state, []);
  bowl.regrowAt = 21;
  update(state, 0.1, fixedRng);
  expect(bowl.items.filter((item) => isVeg(item.kind))).toHaveLength(1);
  expect(bowl.regrowAt).toBeNull();
});

test('ระดับสูงมีผักในชามได้มากกว่าช่วงแรก', () => {
  const early = createState();
  const late = createState();
  late.time = 12 * 10;
  const maxVeg = (state) => Math.max(...Array.from({ length: 200 }, () => makeBowl(state).items.filter((i) => isVeg(i.kind)).length));
  expect(maxVeg(early)).toBeLessThanOrEqual(2);
  expect(maxVeg(late)).toBeGreaterThanOrEqual(5);
});
