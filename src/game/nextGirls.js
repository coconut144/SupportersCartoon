// เกม "Stage Runner" (เดิมชื่อ Journey to Next Girls จึงยังใช้ชื่อไฟล์และ key ว่า next-girls): น้องการ์ตูนวิ่งไปข้างหน้า แตะเพื่อกระโดดหลบกล่องอุปกรณ์ และเก็บหัวใจจากแฟนคลับ
// แยก logic (createState / update / jump) ออกจากการวาด (render) เพื่อให้เทสต์ได้โดยไม่ต้องมี canvas

import { beginFrame, cartoonRows, drawSprite } from './pixel';

export const W = 160;
export const H = 96;
export const GROUND_Y = 80;

const PLAYER_X = 18;
const PLAYER_W = 16;
const PLAYER_H = 22;
// แตะครั้งเดียว: ลอยได้ราว 0.9 วินาที สูงราว 34px ให้มีจังหวะกดที่ข้ามกล่องได้กว้างพอตั้งแต่ช่วงวิ่งช้า
const GRAVITY = 330;
const JUMP_V = -150;
// กดค้าง: ขณะยังลอยขึ้น แรงโน้มถ่วงเบาลงได้นานสุด MAX_HOLD วินาที กระโดดสูงสุดราว 50px (ไว้เก็บหัวใจลอยสูง)
const HOLD_GRAVITY = 0.45;
const MAX_HOLD = 0.22;
// กดก่อนแตะพื้นไม่เกินเท่านี้ จะกระโดดต่อทันทีที่ลงถึงพื้น ไม่ต้องกดใหม่
export const JUMP_BUFFER = 0.12;
const HEART_W = 7;
const HEART_H = 6;
export const HEART_POINTS = 10;
const METERS_PER_PX = 1 / 8;

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
    holding: false,   // กำลังกดค้างอยู่ไหม
    holdTime: 0,      // ลอยแบบกดค้างไปแล้วกี่วินาทีในการกระโดดครั้งนี้
    bufferTime: 0,    // เหลือเวลาอีกเท่าไรที่การกดล่วงหน้ายังนับ
    dust: [],         // ฝุ่นตอนกระโดดและลงพื้น (ใช้วาดอย่างเดียว)
    landTimer: 0,     // เวลาหลังลงพื้น ใช้ย่อตัวนิดหนึ่ง
  };
}

export const speedOf = (state) => Math.min(120, 55 + state.time * 2.5);
export const metersOf = (state) => Math.floor(state.distance * METERS_PER_PX);
export const scoreOf = (state) => metersOf(state) + state.hearts * HEART_POINTS;

export function start(state) {
  Object.assign(state, createState(), { phase: 'playing' });
}

function puff(state, count, spread) {
  for (let i = 0; i < count; i += 1) {
    const side = i % 2 ? 1 : -1;
    state.dust.push({
      x: PLAYER_X + PLAYER_W / 2 + side * (2 + i),
      y: GROUND_Y - 1,
      vx: side * spread * (0.6 + i * 0.3) - 20,
      vy: -8 - i * 3,
      life: 0.35,
    });
  }
}

function takeOff(state) {
  state.vy = JUMP_V;
  state.onGround = false;
  state.holdTime = 0;
  state.bufferTime = 0;
  puff(state, 3, 12);
}

// กดกระโดด (แตะจอ / คลิก / Space): อยู่บนพื้นกระโดดทันที อยู่กลางอากาศจะจำไว้เผื่อใกล้ลงพื้น
// คืน true เมื่อกระโดดทันที
export function jump(state) {
  if (state.phase !== 'playing') return false;
  state.holding = true;
  if (!state.onGround) {
    state.bufferTime = JUMP_BUFFER;
    return false;
  }
  takeOff(state);
  return true;
}

// ปล่อยนิ้ว / ปล่อยปุ่ม: หยุดลอยแบบกดค้าง (ความสูงที่ได้มาแล้วยังอยู่ ไม่ตกทันที)
export function releaseJump(state) {
  state.holding = false;
}

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// กรอบชนของน้อง หดเข้ามานิดหน่อยให้รู้สึกยุติธรรม
const playerBox = (state) => ({ x: PLAYER_X + 3, y: state.y + 2, w: PLAYER_W - 6, h: PLAYER_H - 2 });

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

  // ฟิสิกส์การกระโดด: กดค้างขณะลอยขึ้น แรงโน้มถ่วงจะเบาลงช่วงสั้น ๆ
  state.bufferTime = Math.max(0, state.bufferTime - dt);
  state.landTimer = Math.max(0, state.landTimer - dt);
  if (!state.onGround) {
    const floating = state.holding && state.vy < 0 && state.holdTime < MAX_HOLD;
    if (floating) state.holdTime += dt;
    state.vy += GRAVITY * (floating ? HOLD_GRAVITY : 1) * dt;
    state.y += state.vy * dt;
    if (state.y >= GROUND_Y - PLAYER_H) {
      state.y = GROUND_Y - PLAYER_H;
      state.vy = 0;
      state.onGround = true;
      state.landTimer = 0.12;
      puff(state, 4, 18);
      if (state.bufferTime > 0) takeOff(state);
    }
  }

  state.dust.forEach((d) => {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.life -= dt;
  });
  state.dust = state.dust.filter((d) => d.life > 0);

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
// sprite ละเอียดครึ่งหน่วย (scale 0.5) กินที่เท่าเดิม: หัวใจ 14 × 12 จุด = HEART_W × HEART_H

const HEART = [
  '..rrrr..rrrr..',
  '.rRRrrrrrrrrr.',
  'rRRRrrrrrrrrrr',
  'rRRrrrrrrrrrrr',
  'rrrrrrrrrrrrrD',
  '.rrrrrrrrrrrD.',
  '..rrrrrrrrrD..',
  '...rrrrrrrD...',
  '....rrrrrD....',
  '.....rrrD.....',
  '......rD......',
  '..............',
];

// ดาวดวงใหญ่ที่ปลายทาง 15 × 15 จุด
const BIG_STAR = [
  '.......Y.......',
  '.......y.......',
  '......yyy......',
  '......yYy......',
  '.....yyYyy.....',
  'yyyyyyyYyyyyyyy',
  '.yyyyyYYYyyyyo.',
  '..yyyyyYyyyyo..',
  '...yyyyyyyyo...',
  '....yyyyyyo....',
  '....yyyoyyo....',
  '...yyyo.oyyo...',
  '...yyo...oyo...',
  '..yyo.....oo...',
  '..yo.......o...',
];

// ดาวพื้นหลังวางตำแหน่งตายตัว ไม่สุ่มทุกเฟรม บางดวงกระพริบ
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 37) % W,
  y: 3 + ((i * 53) % 46),
  bright: i % 3 === 0,
  twinkle: i % 5 === 0,
}));

const SKYLINE = [10, 16, 8, 20, 12, 18, 6, 14, 22, 10, 16, 12];

const fill = (ctx, color, x, y, w, h) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

// ลำโพงตั้งพื้น: ตู้ดำ ดอกลำโพง 2 ดอกมีวงขอบและจุดกลาง
function drawSpeaker(ctx, x, o) {
  fill(ctx, '#1c1816', x, o.y, o.w, o.h);
  fill(ctx, '#3a3532', x + 0.5, o.y + 0.5, o.w - 1, o.h - 1);
  fill(ctx, '#57504a', x + 0.5, o.y + 0.5, o.w - 1, 0.5);
  const cone = (cy, r) => {
    const cx = x + o.w / 2;
    fill(ctx, '#1c1816', cx - r, cy - r, r * 2, r * 2);
    fill(ctx, '#6b635c', cx - r + 0.5, cy - r + 0.5, r * 2 - 1, r * 2 - 1);
    fill(ctx, '#2a2420', cx - r + 1, cy - r + 1, r * 2 - 2, r * 2 - 2);
    fill(ctx, '#8d8680', cx - 0.5, cy - 0.5, 1, 1);
  };
  cone(o.y + 3.5, 2);
  cone(o.y + o.h - 4.5, 3);
  fill(ctx, '#e0557a', x + o.w - 2, o.y + 1, 0.5, 0.5); // ไฟสถานะ
}

// กล่องอุปกรณ์ (flight case): ไม้ มุมโลหะ ตัวล็อก และสติกเกอร์ BNK
function drawCase(ctx, x, o) {
  fill(ctx, '#5a3c24', x, o.y, o.w, o.h);
  fill(ctx, '#7a5434', x + 0.5, o.y + 0.5, o.w - 1, o.h - 1);
  fill(ctx, '#8f6640', x + 0.5, o.y + 0.5, o.w - 1, 0.5);
  fill(ctx, '#5a3c24', x, o.y + o.h / 2 - 0.25, o.w, 0.5);
  [[x, o.y], [x + o.w - 1.5, o.y], [x, o.y + o.h - 1.5], [x + o.w - 1.5, o.y + o.h - 1.5]].forEach(([cx, cy]) => {
    fill(ctx, '#c9c2b8', cx, cy, 1.5, 1.5);
    fill(ctx, '#8d8680', cx + 0.5, cy + 0.5, 0.5, 0.5);
  });
  fill(ctx, '#c9a472', x + o.w / 2 - 1, o.y + o.h / 2 - 1, 2, 2);
  fill(ctx, '#ff7fb2', x + 2, o.y + 2, 2.5, 1.5);
}

export function render(ctx, state) {
  beginFrame(ctx);

  // ท้องฟ้ากลางคืน ไล่สีเป็นแถบ
  const bands = ['#191b36', '#1f2140', '#252850', '#2b2d55', '#33356a'];
  bands.forEach((color, i) => fill(ctx, color, 0, i * 16, W, 16));

  // ดาวเลื่อนช้ากว่าพื้น ให้รู้สึกมีระยะ
  const starShift = (state.distance * 0.05) % W;
  STARS.forEach((s, i) => {
    const x = Math.round(((s.x - starShift + W) % W) * 2) / 2;
    const dim = s.twinkle && Math.floor(state.time * 3 + i) % 3 === 0;
    fill(ctx, dim ? '#5a5e94' : (s.bright ? '#fff2b0' : '#8b8fc4'), x, s.y, 0.5, 0.5);
    if (s.bright && !dim) {
      fill(ctx, 'rgba(255, 242, 176, 0.45)', x - 0.5, s.y, 1.5, 0.5);
      fill(ctx, 'rgba(255, 242, 176, 0.45)', x, s.y - 0.5, 0.5, 1.5);
    }
  });

  // ดาวดวงใหญ่ที่ปลายทาง มีแสงเป็นรัศมีกากบาท ยืดหดช้า ๆ
  const ray = 3 + Math.round(Math.sin(state.time * 2) + 1) / 2;
  // ดาวกว้าง 7.5 หน่วย วางที่ (138, 6.5) จุดกลางจึงอยู่ที่ (141.5, 10)
  fill(ctx, 'rgba(255, 242, 176, 0.6)', 138 - ray, 10, 7.5 + ray * 2, 0.5);
  fill(ctx, 'rgba(255, 242, 176, 0.6)', 141.5, 6.5 - ray, 0.5, 7.5 + ray * 2);
  drawSprite(ctx, BIG_STAR, 138, 6.5, 0.5);

  // ตึกไกล ๆ พร้อมหน้าต่างเปิดไฟ
  const cityShift = (state.distance * 0.3) % 16;
  for (let i = -1; i < SKYLINE.length + 1; i += 1) {
    const idx = (i + SKYLINE.length) % SKYLINE.length;
    const h = SKYLINE[idx];
    const bx = Math.round((i * 16 - cityShift) * 2) / 2;
    fill(ctx, '#3a3c6b', bx, GROUND_Y - h, 14, h);
    fill(ctx, '#45487a', bx, GROUND_Y - h, 14, 0.5);
    for (let wy = GROUND_Y - h + 2; wy < GROUND_Y - 2; wy += 3) {
      for (let wx = 2; wx < 13; wx += 3) {
        const lit = (idx * 7 + wx * 3 + wy) % 5 === 0;
        fill(ctx, lit ? '#f4d77a' : '#2f3160', bx + wx, wy, 1, 1);
      }
    }
  }

  // พื้นเวที: ไม้ดำ ขอบไฟชมพู แผ่นไม้เลื่อนตามระยะทาง
  fill(ctx, '#3a3532', 0, GROUND_Y, W, H - GROUND_Y);
  fill(ctx, '#e0557a', 0, GROUND_Y, W, 1);
  fill(ctx, '#ff9fb8', 0, GROUND_Y, W, 0.5);
  const groundShift = state.distance % 12;
  for (let gx = -groundShift; gx < W; gx += 12) {
    const x = Math.round(gx * 2) / 2;
    fill(ctx, '#4a4440', x, GROUND_Y + 3, 0.5, H - GROUND_Y - 3);
    fill(ctx, '#57504a', x + 3, GROUND_Y + 7, 6, 0.5);
  }
  // ไฟหน้าเวทีกระพริบ
  for (let lx = 6 - (state.distance % 20); lx < W; lx += 20) {
    const on = Math.floor(state.time * 2 + lx) % 2 === 0;
    fill(ctx, on ? '#fff2b0' : '#8d7a3a', Math.round(lx * 2) / 2, GROUND_Y + 12, 1.5, 1);
  }

  state.pickups.forEach((p) => drawSprite(ctx, HEART, p.x, p.y, 0.5));
  state.obstacles.forEach((o) => {
    const x = Math.round(o.x * 2) / 2;
    if (o.kind === 'speaker') drawSpeaker(ctx, x, o);
    else drawCase(ctx, x, o);
  });

  // เงาใต้เท้า เล็กลงและจางลงเมื่อลอยสูง
  const rise = GROUND_Y - PLAYER_H - state.y;
  const shadowW = Math.max(4, 12 - rise * 0.18);
  fill(ctx, `rgba(10, 8, 20, ${Math.max(0.12, 0.4 - rise * 0.006).toFixed(2)})`,
    Math.round((PLAYER_X + PLAYER_W / 2 - shadowW / 2) * 2) / 2, GROUND_Y + 0.5, shadowW, 1);

  // ฝุ่นตอนกระโดดและลงพื้น
  state.dust.forEach((d) => {
    const size = d.life > 0.2 ? 1 : 0.5;
    fill(ctx, `rgba(201, 194, 184, ${(d.life / 0.35).toFixed(2)})`,
      Math.round(d.x * 2) / 2, Math.round(d.y * 2) / 2, size, size);
  });

  // น้องการ์ตูน 32 × 41 จุดที่ scale 0.5 สูง 20.5 หน่วย จึงเลื่อนลง 1.5 ให้เท้าแตะพื้นพอดี
  // กลางอากาศใช้ท่าพับขา ลงพื้นแล้วย่อตัวลงครึ่งหน่วยแวบหนึ่ง
  const mood = state.phase === 'over' ? 'pout' : 'happy';
  let legs = 'a';
  if (!state.onGround) legs = 'jump';
  else if (state.phase === 'playing') legs = state.runFrame < 1 ? 'a' : 'b';
  const squash = state.onGround && state.landTimer > 0 ? 0.5 : 0;
  drawSprite(ctx, cartoonRows(mood, legs), PLAYER_X, state.y + 1.5 + squash, 0.5);
}
