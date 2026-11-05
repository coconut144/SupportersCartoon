import { createState, start, update, jump, scoreOf, metersOf, GROUND_Y, HEART_POINTS } from './nextGirls';

const fixedRng = () => 0.5;

function playing() {
  const state = createState();
  start(state);
  // เลื่อนจุดเกิดของออกไปไกล ไม่ให้สุ่มของมาปนในเทสต์
  state.nextObstacleAt = Infinity;
  state.nextHeartAt = Infinity;
  return state;
}

test('กระโดดได้เฉพาะตอนอยู่บนพื้น และตกกลับลงพื้นเอง', () => {
  const state = playing();
  expect(jump(state)).toBe(true);
  expect(jump(state)).toBe(false);
  update(state, 0.05, fixedRng);
  expect(state.y).toBeLessThan(GROUND_Y - 22);
  for (let i = 0; i < 40; i += 1) update(state, 0.05, fixedRng);
  expect(state.onGround).toBe(true);
  expect(jump(state)).toBe(true);
});

test('วิ่งชนกล่องแล้วจบเกม', () => {
  const state = playing();
  state.obstacles.push({ x: 18, y: GROUND_Y - 10, w: 12, h: 10, kind: 'case' });
  update(state, 0.01, fixedRng);
  expect(state.phase).toBe('over');
});

test('กระโดดข้ามกล่องได้โดยไม่ชน', () => {
  const state = playing();
  state.obstacles.push({ x: 60, y: GROUND_Y - 14, w: 9, h: 14, kind: 'speaker' });
  // กระโดดตอนกล่องอยู่ห่างพอดี แล้ววิ่งต่อจนกล่องผ่านตัวไป
  for (let i = 0; i < 200 && state.obstacles.length; i += 1) {
    if (state.onGround && state.obstacles[0].x < 46) jump(state);
    update(state, 0.02, fixedRng);
  }
  expect(state.phase).toBe('playing');
});

test('เก็บหัวใจได้คะแนนเพิ่ม และคะแนนรวมนับระยะทางด้วย', () => {
  const state = playing();
  state.pickups.push({ x: 20, y: GROUND_Y - 12, w: 7, h: 6 });
  update(state, 0.01, fixedRng);
  expect(state.hearts).toBe(1);
  expect(state.pickups).toHaveLength(0);
  state.distance = 800;
  expect(metersOf(state)).toBe(100);
  expect(scoreOf(state)).toBe(100 + HEART_POINTS);
});

test('ของใหม่โผล่มาเองเมื่อวิ่งไปเรื่อย ๆ', () => {
  const state = createState();
  start(state);
  for (let i = 0; i < 100; i += 1) {
    if (state.onGround) jump(state);
    update(state, 0.02, fixedRng);
  }
  expect(state.obstacles.length + state.pickups.length + state.hearts).toBeGreaterThan(0);
});
