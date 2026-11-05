// เกม "Journey to Next Girls": น้องการ์ตูนวิ่งไปข้างหน้า แตะเพื่อกระโดดหลบกล่องอุปกรณ์ และเก็บหัวใจจากแฟนคลับ
// แยก logic (createState / update / jump) ออกจากการวาด (render) เพื่อให้เทสต์ได้โดยไม่ต้องมี canvas

import { CARTOON_W, cartoonRows, drawSprite } from './pixel';

export const W = 160;
export const H = 96;
export const GROUND_Y = 80;

const PLAYER_X = 18;
const PLAYER_H = 22;
// ลอยได้ราว 0.9 วินาที สูงราว 34px ให้มีจังหวะกดที่ข้ามกล่องได้กว้างพอตั้งแต่ช่วงวิ่งช้า
const GRAVITY = 330;
const JUMP_V = -150;
const HEART_W = 7;
const HEART_H = 6;
export const HEART_POINTS = 10;
const METERS_PER_PX = 1 / 8;

const HEART = ['.rr.rr.', 'rRrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];

export function createState() {
  return {
    phase: 'ready',
    distance: 0,
    hearts: 0,
    time: 0,
    y: GROUND_Y - PLAYER_H,
    vy: 0,
    onGround: true,
    obstacles: [],
    pickups: [],
    nextObstacleAt: 120,
    nextHeartAt: 60,
    runFrame: 0,
  };
}

export const speedOf = (state) => Math.min(120, 55 + state.time * 2.5);
export const metersOf = (state) => Math.floor(state.distance * METERS_PER_PX);
export const scoreOf = (state) => metersOf(state) + state.hearts * HEART_POINTS;

export function start(state) {
  Object.assign(state, createState(), { phase: 'playing' });
}

export function jump(state) {
  if (state.phase !== 'playing' || !state.onGround) return false;
  state.vy = JUMP_V;
  state.onGround = false;
  return true;
}

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// กรอบชนของน้อง หดเข้ามานิดหน่อยให้รู้สึกยุติธรรม
const playerBox = (state) => ({ x: PLAYER_X + 3, y: state.y + 2, w: CARTOON_W - 6, h: PLAYER_H - 2 });

function spawnObstacle(state, rng) {
  const tall = rng() < 0.4;
  const w = tall ? 9 : 11 + Math.floor(rng() * 4);
  const h = tall ? 14 : 8 + Math.floor(rng() * 3);
  state.obstacles.push({ x: W, y: GROUND_Y - h, w, h, kind: tall ? 'speaker' : 'case' });
  // บางครั้งวางหัวใจลอยเหนือกล่อง ให้กระโดดเก็บ
  if (rng() < 0.5) {
    state.pickups.push({ x: W + w / 2 - HEART_W / 2, y: GROUND_Y - h - 18, w: HEART_W, h: HEART_H });
  }
  const speed = speedOf(state);
  // ระยะห่างโตตามความเร็ว เพื่อให้มีเวลาตอบสนองอย่างน้อยราว 0.8 วินาที
  state.nextObstacleAt = state.distance + speed * (0.8 + rng() * 0.9) + 30;
}

function spawnHeart(state, rng) {
  const high = rng() < 0.35;
  const y = high ? GROUND_Y - 34 : GROUND_Y - 12;
  const blocked = state.obstacles.some((o) => o.x > W - 24);
  if (!blocked) state.pickups.push({ x: W, y, w: HEART_W, h: HEART_H });
  state.nextHeartAt = state.distance + 40 + rng() * 70;
}

export function update(state, dt, rng = Math.random) {
  if (state.phase !== 'playing') return;

  state.time += dt;
  const speed = speedOf(state);
  const dx = speed * dt;
  state.distance += dx;
  state.runFrame = (state.runFrame + dt * 10) % 2;

  // ฟิสิกส์การกระโดด
  if (!state.onGround) {
    state.vy += GRAVITY * dt;
    state.y += state.vy * dt;
    if (state.y >= GROUND_Y - PLAYER_H) {
      state.y = GROUND_Y - PLAYER_H;
      state.vy = 0;
      state.onGround = true;
    }
  }

  if (state.distance >= state.nextObstacleAt) spawnObstacle(state, rng);
  if (state.distance >= state.nextHeartAt) spawnHeart(state, rng);

  state.obstacles.forEach((o) => { o.x -= dx; });
  state.pickups.forEach((p) => { p.x -= dx; });
  state.obstacles = state.obstacles.filter((o) => o.x + o.w > 0);
  state.pickups = state.pickups.filter((p) => p.x + p.w > 0);

  const box = playerBox(state);
  const collected = state.pickups.filter((p) => overlaps(box, p));
  if (collected.length) {
    state.hearts += collected.length;
    state.pickups = state.pickups.filter((p) => !collected.includes(p));
  }

  if (state.obstacles.some((o) => overlaps(box, o))) {
    state.phase = 'over';
  }
}

// ================== การวาด (pixel art) ==================

// ดาวพื้นหลังวางตำแหน่งตายตัว ไม่สุ่มทุกเฟรม
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37) % W,
  y: 4 + ((i * 53) % 44),
  bright: i % 3 === 0,
}));

const SKYLINE = [10, 16, 8, 20, 12, 18, 6, 14, 22, 10, 16, 12];

function drawObstacle(ctx, o) {
  const x = Math.round(o.x);
  if (o.kind === 'speaker') {
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(x, o.y, o.w, o.h);
    ctx.fillStyle = '#5f5852';
    ctx.fillRect(x + 2, o.y + 2, o.w - 4, 4);
    ctx.fillRect(x + 2, o.y + 8, o.w - 4, o.h - 10);
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(x + 4, o.y + 3, 1, 2);
    ctx.fillRect(x + 4, o.y + 10, 1, 2);
  } else {
    ctx.fillStyle = '#7a5434';
    ctx.fillRect(x, o.y, o.w, o.h);
    ctx.fillStyle = '#5a3c24';
    ctx.fillRect(x, o.y, o.w, 1);
    ctx.fillRect(x, o.y + o.h - 1, o.w, 1);
    ctx.fillStyle = '#c9a472';
    ctx.fillRect(x + 2, o.y + 2, 2, o.h - 4);
    ctx.fillRect(x + o.w - 4, o.y + 2, 2, o.h - 4);
  }
}

export function render(ctx, state) {
  ctx.imageSmoothingEnabled = false;

  // ท้องฟ้ากลางคืน
  ctx.fillStyle = '#1f2140';
  ctx.fillRect(0, 0, W, GROUND_Y);
  ctx.fillStyle = '#2b2d55';
  ctx.fillRect(0, 34, W, GROUND_Y - 34);

  // ดาวเลื่อนช้ากว่าพื้น ให้รู้สึกมีระยะ
  const starShift = (state.distance * 0.05) % W;
  STARS.forEach((s) => {
    const x = Math.round((s.x - starShift + W) % W);
    ctx.fillStyle = s.bright ? '#fff2b0' : '#8b8fc4';
    ctx.fillRect(x, s.y, 1, 1);
  });

  // ดาวดวงใหญ่ "Next Girls" ที่ปลายทาง
  ctx.fillStyle = '#f4c542';
  ctx.fillRect(136, 10, 3, 9);
  ctx.fillRect(133, 13, 9, 3);
  ctx.fillStyle = '#fff2b0';
  ctx.fillRect(137, 13, 1, 3);

  // ตึกไกล ๆ
  const cityShift = (state.distance * 0.3) % 16;
  ctx.fillStyle = '#3a3c6b';
  for (let i = -1; i < SKYLINE.length + 1; i += 1) {
    const h = SKYLINE[(i + SKYLINE.length) % SKYLINE.length];
    ctx.fillRect(Math.round(i * 16 - cityShift), GROUND_Y - h, 14, h);
  }

  // พื้นเวที
  ctx.fillStyle = '#4a4440';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = '#c8475f';
  ctx.fillRect(0, GROUND_Y, W, 1);
  ctx.fillStyle = '#5f5852';
  const groundShift = state.distance % 12;
  for (let x = -groundShift; x < W; x += 12) ctx.fillRect(Math.round(x), GROUND_Y + 6, 6, 1);

  state.pickups.forEach((p) => drawSprite(ctx, HEART, p.x, p.y));
  state.obstacles.forEach((o) => drawObstacle(ctx, o));

  const face = state.phase === 'over' ? 'pout' : 'happy';
  const legs = !state.onGround || state.phase !== 'playing' ? 'a' : (state.runFrame < 1 ? 'a' : 'b');
  drawSprite(ctx, cartoonRows(face, legs), PLAYER_X, state.y);
}
