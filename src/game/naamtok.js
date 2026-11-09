// เกม "น้ำตกไม่ผัก": ชามก๋วยเตี๋ยวไหลมาบนสายพาน แตะเขี่ยผักออกก่อนถึงน้องการ์ตูน
// แยก logic (createState / update / tap) ออกจากการวาด (render) เพื่อให้เทสต์ได้โดยไม่ต้องมี canvas

import { beginFrame, cartoonRows, drawSprite } from './pixel';

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
// sprite ของในชามออกแบบละเอียด 12 × 10 จุด วาดที่ scale 0.5 จึงกินที่เท่าเดิม (ITEM_W × ITEM_H)

const ITEMS = {
  cilantro: [
    '..g.....g...',
    '.gvg...gvg..',
    'gGgGg.gGgGg.',
    '.gGGgGgGGg..',
    '..gGGGGGg...',
    '....GGG.....',
    '.....G......',
    '.....G......',
    '....G.......',
    '....G.......',
  ],
  scallion: [
    '............',
    '..GGGG......',
    '.GvggGG.GGG.',
    'Gg....gGGvgG',
    'Gg....gGg..G',
    'GGg..gGGg..G',
    '.GGGGGG.GGG.',
    '............',
    '............',
    '............',
  ],
  morningGlory: [
    'G...........',
    'GG..........',
    '.Gg.........',
    '..GGgg......',
    '...GgvGg....',
    '....gGvGg...',
    '.....gGGvg..',
    '......ggGg..',
    '.......G....',
    '........G...',
  ],
  beanSprout: [
    '.yY......yY.',
    '.yy.....yy..',
    '..f.....f...',
    '..f....f....',
    '...f...f....',
    '...f..f.....',
    '....f.f.....',
    '....ff......',
    '.....f......',
    '............',
  ],
  basil: [
    '.....gg.....',
    '....gvGg....',
    '...gvgGGg...',
    '..gvggGgGg..',
    '..ggggGggG..',
    '..gGggGgGg..',
    '...gGGGGg...',
    '....gGGg....',
    '.....GG.....',
    '.....G......',
  ],
  meatball: [
    '....kkkk....',
    '..kkllkkkk..',
    '.kllllkkkkk.',
    '.klkkkkkkkK.',
    'kkkkkkkkkkKK',
    'kkkkkkkkkKKK',
    '.kkkkkkkKKK.',
    '.kkkkkkKKKK.',
    '..KKKKKKKK..',
    '....KKKK....',
  ],
  pork: [
    '............',
    '.ffppppppp..',
    'fppppppppPP.',
    'fpppPPppppPP',
    'fppppppPPpPP',
    '.ppPPpppppP.',
    '.pppppppPPP.',
    '..PPPPPPPP..',
    '............',
    '............',
  ],
};

// ไก่ลายชามตราไก่ 10 × 9 จุด
const ROOSTER = [
  '..aa......',
  '.aaaa.....',
  '.axaaA....',
  'AAaaaa..aa',
  '..aaaaaaa.',
  '..aaaaaaaa',
  '...aaaaaa.',
  '....A.A...',
  '...AA.AA..',
];

const LEAF = [
  '..GG..',
  '.GgvG.',
  'GggGgG',
  '.GGgG.',
  '...G..',
];

const half = (ctx, color, x, y, w, h) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

// ชามตราไก่: ขอบดำ ลายคาดเขียว 2 เส้น ไก่แดง ใบไม้ เงาด้านขวา ชามทองเปลี่ยนเป็นสีทองทั้งใบ
function drawBowl(ctx, bowl, time) {
  const x = Math.round(bowl.x * 2) / 2;
  const body = bowl.golden ? '#f4c542' : '#ffffff';
  const shade = bowl.golden ? '#d9a520' : '#e7e2da';
  const band = bowl.golden ? '#b8860b' : '#3f8a3a';

  // เงาใต้ชาม
  half(ctx, 'rgba(42, 36, 32, 0.25)', x + 6, RIM_Y + 15.5, BOWL_W - 12, 1);

  // ขอบนอกสีเข้ม
  ctx.fillStyle = '#2a2420';
  ctx.fillRect(x - 1, RIM_Y - 1, BOWL_W + 2, 2);
  for (let i = 1; i < 14; i += 1) {
    const inset = Math.floor(i / 3);
    ctx.fillRect(x + inset - 1, RIM_Y + i, BOWL_W - inset * 2 + 2, 1);
  }
  ctx.fillRect(x + 9, RIM_Y + 14, BOWL_W - 18, 2);

  // ตัวชาม: แต่ละแถวมีเงาด้านขวา
  for (let i = 0; i < 14; i += 1) {
    const inset = Math.floor(i / 3);
    const rowW = BOWL_W - inset * 2;
    const isBand = i === 2 || i === 11;
    half(ctx, isBand ? band : body, x + inset, RIM_Y + i, rowW, 1);
    if (!isBand) half(ctx, shade, x + inset + rowW - 4, RIM_Y + i, 4, 1);
  }
  // ลายจุดบนเส้นคาด
  ctx.fillStyle = bowl.golden ? '#fff2b0' : '#b6e39a';
  for (let dx = 3; dx < BOWL_W - 3; dx += 3) ctx.fillRect(x + dx, RIM_Y + 2.25, 0.5, 0.5);
  // ฐานชาม
  half(ctx, bowl.golden ? '#c99a1e' : '#d8d0c4', x + 10, RIM_Y + 14, BOWL_W - 20, 1);
  // แสงสะท้อนซ้าย
  half(ctx, bowl.golden ? '#fff2b0' : '#ffffff', x + 1.5, RIM_Y + 4, 0.5, 5);

  if (bowl.golden) {
    // ประกายบนชามทอง กระพริบตามเวลา
    const on = Math.floor(time * 4) % 2 === 0;
    ctx.fillStyle = '#fff8d6';
    ctx.fillRect(x + 6, RIM_Y + 4, 2, 0.5);
    ctx.fillRect(x + 6.75, RIM_Y + 3.25, 0.5, 2);
    if (on) {
      ctx.fillRect(x + 25, RIM_Y + 7, 1.5, 0.5);
      ctx.fillRect(x + 25.5, RIM_Y + 6.5, 0.5, 1.5);
    }
  } else {
    drawSprite(ctx, ROOSTER, x + 6, RIM_Y + 4, 0.5);
    drawSprite(ctx, LEAF, x + 19, RIM_Y + 5, 0.5);
    drawSprite(ctx, LEAF, x + 22, RIM_Y + 6.5, 0.5);
  }

  // น้ำซุปข้นสีเข้ม เส้นเล็กสีครีม และน้ำมันพริกจุด ๆ
  half(ctx, '#7a3b1e', x + 1, RIM_Y - 1, BOWL_W - 2, 1);
  half(ctx, '#9c5128', x + 2, RIM_Y - 1, BOWL_W - 4, 0.5);
  ctx.fillStyle = '#f3e2b8';
  [4, 9.5, 15, 21, 26.5].forEach((dx) => {
    ctx.fillRect(x + dx, RIM_Y - 1, 3, 0.5);
    ctx.fillRect(x + dx + 1, RIM_Y - 0.5, 2, 0.5);
  });
  ctx.fillStyle = '#d6453d';
  [7, 18, 29].forEach((dx) => ctx.fillRect(x + dx, RIM_Y - 1, 0.5, 0.5));

  if (bowl.flash > 0) {
    half(ctx, 'rgba(200, 71, 95, 0.45)', x, RIM_Y - 9, BOWL_W, BOWL_H + 9);
  }

  // ผักที่เพิ่งงอกจะเด้งขึ้นจากชามก่อน แล้วค่อยลงที่
  bowl.items.forEach((item) => {
    const lift = item.pop > 0 ? Math.round(item.pop * 10) : 0;
    drawSprite(ctx, ITEMS[item.kind], x + item.dx, RIM_Y + item.dy - lift, 0.5);
  });
}

// ไอน้ำลอยขึ้นจากป้ายร้าน เคลื่อนขึ้นลงตามเวลา
function drawSteam(ctx, time) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  [24, 30, 36].forEach((sx, i) => {
    const phase = time * 2 + i;
    for (let k = 0; k < 3; k += 1) {
      const wiggle = Math.round(Math.sin(phase + k) * 2) / 2;
      ctx.fillRect(sx + wiggle, 12.5 - k * 1.5, 0.5, 1);
    }
  });
}

export function render(ctx, state) {
  beginFrame(ctx);
  const { time } = state;

  // ผนังไม้: แผ่นไม้แนวนอน มีลายไม้และตะปู
  half(ctx, '#d9b98f', 0, 0, W, BELT_Y);
  for (let y = 0; y < BELT_Y; y += 12) {
    half(ctx, '#c9a57a', 0, y + 11.5, W, 0.5);
    half(ctx, '#e4c9a3', 0, y, W, 0.5);
    ctx.fillStyle = '#c4a073';
    for (let gx = (y * 7) % 23; gx < W; gx += 23) ctx.fillRect(gx, y + 5, 6, 0.5);
    ctx.fillStyle = '#8a6a48';
    ctx.fillRect(3, y + 2, 0.5, 0.5);
    ctx.fillRect(W - 4, y + 2, 0.5, 0.5);
  }

  // ป้ายร้าน "ก๋วยเตี๋ยว": แขวนเชือก ขอบทอง รูปชามมีไอน้ำ
  half(ctx, '#6e4a2e', 16, 2, 0.5, 8);
  half(ctx, '#6e4a2e', 43.5, 2, 0.5, 8);
  half(ctx, '#8a2e3f', 9.5, 9.5, 41, 15);
  half(ctx, '#c8475f', 10, 10, 40, 14);
  half(ctx, '#f4c542', 11, 11, 38, 0.5);
  half(ctx, '#f4c542', 11, 22.5, 38, 0.5);
  half(ctx, '#ffffff', 20, 15, 20, 2);
  half(ctx, '#ffffff', 22, 17, 16, 2);
  half(ctx, '#ffffff', 25, 19, 10, 1.5);
  half(ctx, '#e7e2da', 36, 15, 4, 2);
  drawSteam(ctx, time);

  // น้องการ์ตูน (วาดก่อนสายพาน ให้สายพานบังช่วงล่าง)
  drawSprite(ctx, cartoonRows(state.face), CARTOON_X, BELT_Y - 34, 1);

  // เคาน์เตอร์ไม้
  half(ctx, '#8a5a34', 0, BELT_Y + 8, W, H - BELT_Y - 8);
  half(ctx, '#a06c42', 0, BELT_Y + 8, W, 1);
  for (let y = BELT_Y + 14; y < H; y += 10) {
    half(ctx, '#74492a', 0, y, W, 0.5);
    ctx.fillStyle = '#7d5030';
    for (let gx = (y * 5) % 19; gx < W; gx += 19) ctx.fillRect(gx, y + 4, 5, 0.5);
  }

  // สายพาน: ยางดำ มีลูกกลิ้งเลื่อนตามความเร็ว และขอบโลหะ
  half(ctx, '#3a3532', 0, BELT_Y, W, 8);
  half(ctx, '#8d8680', 0, BELT_Y, W, 0.5);
  half(ctx, '#2a2420', 0, BELT_Y + 7.5, W, 0.5);
  for (let bx = -8 + state.beltOffset; bx < W; bx += 8) {
    const rx = Math.round(bx * 2) / 2;
    half(ctx, '#5f5852', rx, BELT_Y + 1.5, 3, 5);
    half(ctx, '#7a736c', rx, BELT_Y + 1.5, 3, 0.5);
  }

  state.bowls.forEach((bowl) => drawBowl(ctx, bowl, time));
  state.particles.forEach((p) => drawSprite(ctx, ITEMS[p.kind], p.x, p.y, 0.5));
}
