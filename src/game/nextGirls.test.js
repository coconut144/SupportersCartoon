import { createState, start, update, jump, releaseJump, scoreOf, metersOf, GROUND_Y, HEART_POINTS, JUMP_BUFFER } from './nextGirls';

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

// กระโดด 1 ครั้งจนลงพื้น คืนจุดสูงสุด (y น้อยสุด) และเวลาที่ลอย
function airborne(state, { holdFor = 0 } = {}) {
  const dt = 0.01;
  let top = state.y;
  let t = 0;
  jump(state);
  if (holdFor === 0) releaseJump(state);
  while (!state.onGround && t < 3) {
    if (holdFor > 0 && t >= holdFor) releaseJump(state);
    update(state, dt, fixedRng);
    top = Math.min(top, state.y);
    t += dt;
  }
  return { height: GROUND_Y - 22 - top, time: t };
}

test('แตะครั้งเดียวกระโดดสูงเท่าเดิม กดค้างกระโดดได้สูงและนานกว่า', () => {
  const tap = airborne(playing());
  const hold = airborne(playing(), { holdFor: 1 });
  expect(tap.height).toBeGreaterThan(30);
  expect(tap.height).toBeLessThan(36);
  expect(hold.height).toBeGreaterThan(tap.height + 10);
  expect(hold.time).toBeGreaterThan(tap.time);
  // กดค้างนานแค่ไหนก็ไม่หลุดขอบบนของฉาก
  expect(GROUND_Y - 22 - hold.height).toBeGreaterThanOrEqual(0);
});

test('ปล่อยกลางทางได้ความสูงระหว่างแตะกับกดค้างสุด', () => {
  const tap = airborne(playing());
  const half = airborne(playing(), { holdFor: 0.1 });
  const full = airborne(playing(), { holdFor: 1 });
  expect(half.height).toBeGreaterThan(tap.height);
  expect(half.height).toBeLessThan(full.height);
});

test('กดก่อนลงพื้นเล็กน้อย กระโดดต่อทันทีที่ลงถึงพื้น', () => {
  const state = playing();
  jump(state);
  releaseJump(state);
  // ตกลงมาจนเกือบถึงพื้น
  while (state.vy <= 0 || state.y < GROUND_Y - 22 - 3) update(state, 0.01, fixedRng);
  expect(jump(state)).toBe(false); // ยังอยู่กลางอากาศ จึงจำไว้ก่อน
  releaseJump(state);
  for (let i = 0; i < 10 && state.onGround === false && state.vy >= 0; i += 1) update(state, 0.01, fixedRng);
  expect(state.vy).toBeLessThan(0); // เด้งขึ้นใหม่แล้วโดยไม่ต้องกดซ้ำ
});

test('กดตอนยังลอยสูงอยู่ ไม่นับเป็นการกดล่วงหน้า', () => {
  const state = playing();
  jump(state);
  releaseJump(state);
  update(state, 0.05, fixedRng);
  jump(state); // กดตอนเพิ่งลอยขึ้น ห่างจากพื้นนานกว่า JUMP_BUFFER มาก
  releaseJump(state);
  for (let i = 0; i < 200 && !state.onGround; i += 1) update(state, 0.01, fixedRng);
  expect(state.onGround).toBe(true);
  update(state, JUMP_BUFFER, fixedRng);
  expect(state.onGround).toBe(true);
});

test('มีฝุ่นตอนกระโดดและตอนลงพื้น แล้วหายไปเอง', () => {
  const state = playing();
  jump(state);
  expect(state.dust.length).toBeGreaterThan(0);
  releaseJump(state);
  for (let i = 0; i < 300 && state.dust.length; i += 1) update(state, 0.01, fixedRng);
  expect(state.dust).toHaveLength(0);
});
