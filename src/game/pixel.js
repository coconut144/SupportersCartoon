// pixel art ที่ใช้ร่วมกันทุกเกม: จานสี, ตัวน้องการ์ตูน และฟังก์ชันวาด sprite จากตัวอักษร
//
// ความละเอียด: เกมคิดตำแหน่งบนตารางเล็ก (W × H ของแต่ละเกม) แต่ canvas จริงใหญ่กว่า RES เท่า
// sprite จึงวาดละเอียดได้ถึงครึ่งหน่วย (scale 0.5 = 1 จุดบน canvas) โดย logic และกรอบชนไม่เปลี่ยน
export const RES = 2;

export const PALETTE = {
  // น้องการ์ตูน
  h: '#3a2622', // ผม
  H: '#6b4239', // ผมส่วนเงาสะท้อน
  s: '#f6d6c2', // ผิว
  S: '#e8b49c', // ผิวส่วนเงา
  e: '#2a1c1a', // ตา / ขนตา / รองเท้า
  i: '#6b3f35', // ตาดำ
  b: '#f5a3ae', // แก้ม
  m: '#c8475f', // ปาก
  t: '#ee7d93', // ลิ้น
  w: '#ffffff', // เสื้อ
  z: '#ffffff', // ประกายตา (แยกจากเสื้อ เวลาเปลี่ยนสีเสื้อตาจะได้ไม่เปลี่ยนตาม)
  W: '#dfe5f0', // เสื้อส่วนเงา
  c: '#ff7fb2', // กิ๊บติดผม / โบว์
  C: '#c8475f', // โบว์ส่วนเงา
  n: '#3b4a7a', // กระโปรง
  N: '#2a3560', // กระโปรงส่วนเงา (จีบ)
  // ผักและของในชาม
  g: '#7cc36b', // ผักสีอ่อน
  G: '#3f8a3a', // ผักสีเข้ม
  v: '#b6e39a', // ผักส่วนสว่าง
  k: '#9a6a44', // ลูกชิ้น
  K: '#6e4a2e', // ลูกชิ้นส่วนเงา
  l: '#c8986e', // ลูกชิ้นส่วนสว่าง
  p: '#eba79d', // หมู
  P: '#c97a70', // หมูส่วนเงา
  f: '#fff4ec', // มันหมู
  y: '#f4c542', // หัวถั่วงอก / ดาว
  Y: '#fff2b0', // ส่วนสว่าง
  o: '#d9a520', // ดาวส่วนเงา
  // หัวใจ
  r: '#e0557a',
  R: '#ff9fb8',
  D: '#a8334f',
  // ไก่บนชาม
  a: '#d6453d',
  A: '#f2b33d',
  x: '#2a2420',
};

// ---------- น้องการ์ตูน 32 × 41 จุด ----------
// แถว 0–7 ผมด้านบน (มีกิ๊บชมพู), 8–21 หน้า, 22–27 คอ/ปกเสื้อ/โบว์, 28–32 เสื้อ, 33–37 กระโปรงจีบ, 38–40 ขา
const face = (left, middle, right) => `.${left}${middle}${right}.`;

const HEAD = [
  '..........hhhhhhhhhhhh..........',
  '.......hhhhhhhhhhhhhhhhhh.......',
  '.....hhhhhhHHHHhhhhhhhhhhhh.....',
  '....hhhhhHHHHhhhhhhhhhhcchhh....',
  '...hhhhHHHhhhhhhhhhhhhcCcchhh...',
  '..hhhHHhhhhhhhhhhhhhhhhcchhhhh..',
  '..hhhhhhhhhhhhhhhhhhhhhhhhhhhh..',
  '.hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh.',
];

// ตาสองข้างกับแก้ม แถว 12–16 ของหน้า (กว้าง 16 จุด)
const FACE_TOP = [
  'hhhhshhhhhshhhhh', // หน้าม้า
  'hhhsssshhsssshhh',
  'hssssssssssssssh',
  'ssssssssssssssss',
  'sseeeesssseeeess', // ขอบตาบน
];

const EYES = [
  'sseziesssseziess', // ประกายตา
  'sseiiesssseiiess',
  'sseeeesssseeeess',
  'sbbbssssssssbbbs', // แก้ม
];

// ปาก 2 แถว (กว้าง 16 จุด) ตามอารมณ์
const MOUTHS = {
  normal: ['ssssssmmmmssssss', 'ssssssssssssssss'],
  happy: ['sssssmssssmsssss', 'ssssssmttmssssss'],
  pout: ['ssssssmmmmssssss', 'sssssmssssmsssss'],
};

const FACE_BOTTOM = [
  'ssssssssssssssss',
  'SSssssssssssssSS',
  '..SSssssssssSS..',
];

const BODY = [
  '.hhhhhhh.....ssssss.....hhhhhhh.',
  '.hhhhhhh..wwwwccccwwww..hhhhhhh.',
  '.hhhhhhhwwwwwcCCcccwwwwwhhhhhhh.',
  '.hhhhhhwwwwwwwccccwwwwwwwhhhhhh.',
  '.hhhhhwwwwwwwwwcCwwwwwwwwwhhhhh.',
  '.hhhhwwwwwwwwwwwwwwwwwwwwwwhhhh.',
  '..hhwwwwwwwwwwwwwwwwwwwwwwwwhh..',
  '..sWwwwwwwwwwwwwwwwwwwwwwwwwWs..',
  '..sWwwwwwwwwwwwwwwwwwwwwwwwwWs..',
  '..ssWwwwwwwwwwwwwwwwwwwwwwwWss..',
  '...sWWWWWWWWWWWWWWWWWWWWWWWWs...',
  '.....nnnnnnnnnnnnnnnnnnnnnn.....',
  '....nnnnnNnnnnNnnnnNnnnnNnnn....',
  '....nnnnnNnnnnNnnnnNnnnnNnnn....',
  '...nnnnnnNnnnnNnnnnNnnnnNnnnn...',
  '...NNNNNNNNNNNNNNNNNNNNNNNNNN...',
];

// ขาสองท่าสลับกันตอนวิ่ง
const LEGS = {
  a: [
    '..........ss........ss..........',
    '..........ss........ss..........',
    '.........eee........eee.........',
  ],
  b: [
    '........ss............ss........',
    '.......ss..............ss.......',
    '......eee..............eee......',
  ],
  // กลางอากาศ: พับเข่า เท้าเตะไปด้านหลัง
  jump: [
    '.........sss........sss.........',
    '........eee........eee..........',
    '................................',
  ],
};

export const CARTOON_SPRITE_W = 32;
export const CARTOON_SPRITE_H = HEAD.length + FACE_TOP.length + EYES.length + 2 + FACE_BOTTOM.length + BODY.length;

const HAIR_L = 'hhHhhhh';
const HAIR_R = 'hhhhhhh';

export function cartoonRows(mood = 'normal', legs = null) {
  const mouth = MOUTHS[mood] || MOUTHS.normal;
  const faceRows = [...FACE_TOP, ...EYES, ...mouth, ...FACE_BOTTOM].map((middle, i) => (
    face(i < 2 || i > 10 ? 'hhhhhhh' : HAIR_L, middle, HAIR_R)
  ));
  const rows = [...HEAD, ...faceRows, ...BODY];
  return legs ? rows.concat(LEGS[legs]) : rows;
}

// วาด sprite ทีละจุด scale คือขนาดของ 1 จุดในหน่วยของเกม (0.5 = จุดเล็กสุดบน canvas)
const snap = (value) => Math.round(value * RES) / RES;

export function drawSprite(ctx, rows, x, y, scale = 1) {
  const ox = snap(x);
  const oy = snap(y);
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx += 1) {
      const ch = row[rx];
      if (ch !== '.') {
        ctx.fillStyle = PALETTE[ch];
        ctx.fillRect(ox + rx * scale, oy + ry * scale, scale, scale);
      }
    }
  });
}

// เตรียม canvas ให้วาดด้วยหน่วยของเกม (ขยาย RES เท่า) และปิดการเบลอ
export function beginFrame(ctx) {
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
