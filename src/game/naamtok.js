// เกม "น้ำตกไม่ผัก": ชามก๋วยเตี๋ยวไหลมาบนสายพาน แตะเขี่ยผักออกก่อนถึงน้องการ์ตูน
// แยก logic (createState / update / tap) ออกจากการวาด (render) เพื่อให้เทสต์ได้โดยไม่ต้องมี canvas

import { cartoonRows, drawSprite } from './pixel';

// ฉากเล็กแล้วขยายเต็มความกว้างจอ ผักบนมือถือจะใหญ่พอให้ใช้นิ้วแตะได้
export const W = 120;
export const H = 120;
export const MAX_MISSES = 3;

const BELT_Y = 88;
const BOWL_W = 34;
const BOWL_H = 16;
export const RIM_Y = BELT_Y - BOWL_H;
const CARTOON_X = 88;
// ขอบขวาของชามถึงตรงกลางตัวน้อง = ส่งถึงมือ
const ARRIVE_X = CARTOON_X + 14;
const ITEM_W = 6;
const ITEM_H = 5;
const HIT_RADIUS = 8;

const VEG = ['cilantro', 'scallion', 'morningGlory', 'beanSprout', 'basil'];
const KEEP = ['meatball', 'pork'];
const SLOT_X = [3, 10, 17, 24];
const SLOT_Y = [-8, -5];

export const isVeg = (kind) => VEG.includes(kind);

export const BOWL_POINTS = 20;
export const GOLDEN_POINTS = 50;

export function createState() {
  return {
    phase: 'ready',
    bowls: [],
    particles: [],
    score: 0,
    misses: 0,
    time: 0,
    spawnIn: 0,
    beltOffset: 0,
    face: 'normal',
    faceTimer: 0,
    nextId: 1,
  };
}

// ความยากเพิ่มทุก 12 วินาที สูงสุด 10 ระดับ
export const levelOf = (state) => Math.min(10, Math.floor(state.time / 12));
export const speedOf = (state) => 14 + levelOf(state) * 3;
const spacingOf = (state) => 54 - levelOf(state);

function setFace(state, face, seconds) {
  state.face = face;
  state.faceTimer = seconds;
}

export function makeBowl(state, rng = Math.random) {
  const level = levelOf(state);
  const slots = [];
  SLOT_Y.forEach((dy) => SLOT_X.forEach((dx) => slots.push({ dx, dy })));
  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  // ช่วงแรกมีผัก 1–2 ชิ้น ระดับสูงสุดมีได้ถึง 6 ชิ้น
  const vegCount = 1 + Math.floor(rng() * Math.min(6, 1 + level * 0.6));
  const keepCount = rng() < 0.7 ? 1 + (rng() < 0.3 ? 1 : 0) : 0;
  const pick = (list) => list[Math.floor(rng() * list.length)];

  const items = slots.slice(0, vegCount + keepCount).map((slot, index) => ({
    ...slot,
    kind: index < vegCount ? pick(VEG) : pick(KEEP),
  }));
  // วาดแถวบนก่อน แถวล่างทับทีหลัง ให้ตรงกับการเลือกตอนแตะ
  items.sort((a, b) => a.dy - b.dy);

  const bowl = { id: state.nextId, x: -BOWL_W, items, flash: 0, golden: rng() < 0.08, regrowAt: null };
  // ตั้งแต่ระดับ 1 บางชามจะมีผักงอกขึ้นมาใหม่ระหว่างทาง (ก่อนถึงน้องพอให้แตะทัน)
  if (level >= 1 && rng() < Math.min(0.6, 0.15 + level * 0.06)) {
    bowl.regrowAt = 10 + rng() * (ARRIVE_X - BOWL_W - 40);
  }
  state.nextId += 1;
  return bowl;
}

// เติมผัก 1 ชิ้นลงช่องว่างในชาม พร้อมเด้งขึ้นให้เห็นว่าเพิ่งงอก
function regrow(bowl, rng) {
  const used = new Set(bowl.items.map((item) => `${item.dx},${item.dy}`));
  const free = [];
  SLOT_Y.forEach((dy) => SLOT_X.forEach((dx) => { if (!used.has(`${dx},${dy}`)) free.push({ dx, dy }); }));
  if (!free.length) return;
  const slot = free[Math.floor(rng() * free.length)];
  bowl.items.push({ ...slot, kind: VEG[Math.floor(rng() * VEG.length)], pop: 0.35 });
  bowl.items.sort((a, b) => a.dy - b.dy);
}

export function start(state) {
  Object.assign(state, createState(), { phase: 'playing' });
}

export function update(state, dt, rng = Math.random) {
  if (state.phase !== 'playing') return;

  state.time += dt;
  const speed = speedOf(state);
  state.beltOffset = (state.beltOffset + speed * dt) % 8;

  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    state.bowls.push(makeBowl(state, rng));
    state.spawnIn = spacingOf(state) / speed;
  }

  state.bowls.forEach((bowl) => {
    bowl.x += speed * dt;
    bowl.flash = Math.max(0, bowl.flash - dt);
    bowl.items.forEach((item) => { item.pop = Math.max(0, (item.pop || 0) - dt); });
    if (bowl.regrowAt !== null && bowl.x >= bowl.regrowAt) {
      regrow(bowl, rng);
      bowl.regrowAt = null;
    }
  });

  const arrived = state.bowls.filter((bowl) => bowl.x + BOWL_W >= ARRIVE_X);
  arrived.forEach((bowl) => {
    if (bowl.items.some((item) => isVeg(item.kind))) {
      state.misses += 1;
      setFace(state, 'pout', 0.9);
    } else {
      state.score += bowl.golden ? GOLDEN_POINTS : BOWL_POINTS;
      setFace(state, 'happy', 0.6);
    }
  });
  state.bowls = state.bowls.filter((bowl) => !arrived.includes(bowl));

  state.particles.forEach((p) => {
    p.vy += 220 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  });
  state.particles = state.particles.filter((p) => p.life > 0);

  if (state.faceTimer > 0) {
    state.faceTimer -= dt;
    if (state.faceTimer <= 0) state.face = 'normal';
  }

  if (state.misses >= MAX_MISSES) {
    state.phase = 'over';
    setFace(state, 'pout', Infinity);
  }
}

// แตะที่ตำแหน่ง (x, y) บนพิกัดของเกม คืนค่า 'veg' / 'keep' / null
export function tap(state, x, y, rng = Math.random) {
  if (state.phase !== 'playing') return null;

  let best = null;
  state.bowls.forEach((bowl) => {
    bowl.items.forEach((item) => {
      const cx = bowl.x + item.dx + ITEM_W / 2;
      const cy = RIM_Y + item.dy + ITEM_H / 2;
      const dist = (cx - x) ** 2 + (cy - y) ** 2;
      if (dist <= HIT_RADIUS ** 2 && (!best || dist < best.dist)) {
        best = { bowl, item, dist, cx, cy };
      }
    });
  });
  if (!best) return null;

  const { bowl, item } = best;
  bowl.items = bowl.items.filter((i) => i !== item);
  state.particles.push({
    kind: item.kind,
    x: best.cx - ITEM_W / 2,
    y: best.cy - ITEM_H / 2,
    vx: (rng() - 0.5) * 60,
    vy: -90,
    life: 0.8,
  });

  if (isVeg(item.kind)) {
    state.score += 5;
    return 'veg';
  }
  state.score = Math.max(0, state.score - 10);
  bowl.flash = 0.3;
  setFace(state, 'pout', 0.6);
  return 'keep';
}

// ================== การวาด (pixel art) ==================

const ITEMS = {
  cilantro: ['.g..g.', 'gGggGg', '.gGGg.', '..G...', '..G...'],
  scallion: ['.GGGG.', 'Gg..gG', 'Gg..gG', '.GGGG.', '......'],
  morningGlory: ['G.....', '.G....', '..GG..', '...gG.', '....gG'],
  beanSprout: ['y...y.', '.w..w.', '.w.w..', '..ww..', '..w...'],
  basil: ['..gg..', '.gGGg.', 'gGggGg', '.gGGg.', '..G...'],
  meatball: ['.kkkk.', 'kllkkk', 'kkkkkK', 'kkkkKK', '.KKKK.'],
  pork: ['pppppP', 'pPPPpP', 'ppppPP', '.pppP.', '......'],
};

// ชามตราไก่: ขอบเส้นเข้ม ลายขอบเขียว ไก่แดงกลางชาม ชามทองเปลี่ยนเป็นสีทองทั้งใบ
function drawBowl(ctx, bowl) {
  const x = Math.round(bowl.x);
  const body = bowl.golden ? '#f4c542' : '#ffffff';
  const band = bowl.golden ? '#c99a1e' : '#3f8a3a';

  ctx.fillStyle = '#2a2420';
  ctx.fillRect(x - 1, RIM_Y - 1, BOWL_W + 2, 2);
  for (let i = 1; i < 14; i += 1) {
    const inset = Math.floor(i / 3);
    ctx.fillRect(x + inset - 1, RIM_Y + i, BOWL_W - inset * 2 + 2, 1);
  }
  ctx.fillRect(x + 9, RIM_Y + 14, BOWL_W - 18, 2);

  for (let i = 0; i < 14; i += 1) {
    const inset = Math.floor(i / 3);
    ctx.fillStyle = i === 2 || i === 11 ? band : body;
    ctx.fillRect(x + inset, RIM_Y + i, BOWL_W - inset * 2, 1);
  }
  ctx.fillStyle = bowl.golden ? '#c99a1e' : '#e6ddd1';
  ctx.fillRect(x + 10, RIM_Y + 14, BOWL_W - 20, 1);

  if (bowl.golden) {
    ctx.fillStyle = '#fff2b0';
    ctx.fillRect(x + 5, RIM_Y + 4, 2, 1);
    ctx.fillRect(x + 5, RIM_Y + 5, 1, 2);
  } else {
    ctx.fillStyle = '#c8475f';
    ctx.fillRect(x + 8, RIM_Y + 6, 3, 3);
    ctx.fillRect(x + 11, RIM_Y + 5, 1, 2);
    ctx.fillStyle = '#3f8a3a';
    ctx.fillRect(x + 20, RIM_Y + 6, 4, 2);
    ctx.fillRect(x + 22, RIM_Y + 5, 1, 1);
  }

  // น้ำซุปและเส้น
  ctx.fillStyle = '#8a4a26';
  ctx.fillRect(x + 2, RIM_Y - 1, BOWL_W - 4, 1);
  ctx.fillStyle = '#f3e2b8';
  [5, 12, 19, 26].forEach((dx) => ctx.fillRect(x + dx, RIM_Y - 1, 3, 1));

  if (bowl.flash > 0) {
    ctx.fillStyle = 'rgba(200, 71, 95, 0.45)';
    ctx.fillRect(x, RIM_Y - 9, BOWL_W, BOWL_H + 9);
  }

  // ผักที่เพิ่งงอกจะเด้งขึ้นจากชามก่อน แล้วค่อยลงที่
  bowl.items.forEach((item) => {
    const lift = item.pop > 0 ? Math.round(item.pop * 10) : 0;
    drawSprite(ctx, ITEMS[item.kind], x + item.dx, RIM_Y + item.dy - lift);
  });
}

export function render(ctx, state) {
  ctx.imageSmoothingEnabled = false;

  // ผนังไม้โทนอุ่น ให้ชามสีขาวเด่นขึ้น
  ctx.fillStyle = '#d9b98f';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c9a57a';
  for (let y = 12; y < BELT_Y; y += 12) ctx.fillRect(0, y, W, 1);

  // ป้ายร้าน
  ctx.fillStyle = '#6e4a2e';
  ctx.fillRect(16, 4, 1, 6);
  ctx.fillRect(43, 4, 1, 6);
  ctx.fillStyle = '#c8475f';
  ctx.fillRect(10, 10, 40, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 15, 20, 2);
  ctx.fillRect(22, 17, 16, 2);
  ctx.fillRect(25, 19, 10, 2);
  ctx.fillRect(25, 12, 1, 2);
  ctx.fillRect(30, 11, 1, 3);
  ctx.fillRect(35, 12, 1, 2);

  // น้องการ์ตูน (วาดก่อนสายพาน ให้สายพานบังช่วงล่าง)
  drawSprite(ctx, cartoonRows(state.face), CARTOON_X, BELT_Y - 36, 2);

  // เคาน์เตอร์และสายพาน
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(0, BELT_Y + 8, W, H - BELT_Y - 8);
  ctx.fillStyle = '#74492a';
  for (let y = BELT_Y + 14; y < H; y += 10) ctx.fillRect(0, y, W, 1);
  ctx.fillStyle = '#4a4440';
  ctx.fillRect(0, BELT_Y, W, 8);
  ctx.fillStyle = '#5f5852';
  for (let x = -8 + state.beltOffset; x < W; x += 8) ctx.fillRect(Math.round(x), BELT_Y + 1, 3, 6);

  state.bowls.forEach((bowl) => drawBowl(ctx, bowl));
  state.particles.forEach((p) => drawSprite(ctx, ITEMS[p.kind], p.x, p.y));
}
