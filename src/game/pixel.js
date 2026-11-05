// pixel art ที่ใช้ร่วมกันทุกเกม: จานสี, ตัวน้องการ์ตูน และฟังก์ชันวาด sprite จากตัวอักษร

export const PALETTE = {
  h: '#3a2622', // ผม
  s: '#f6d6c2', // ผิว
  e: '#2a2420', // ตา
  b: '#f2a0a8', // แก้ม
  m: '#c8475f', // ปาก
  w: '#ffffff', // เสื้อ
  r: '#c8475f', // โบว์ / หัวใจ
  R: '#f08aa0', // หัวใจส่วนสว่าง
  n: '#3b4a7a', // กระโปรง
  g: '#7cc36b', // ผักสีอ่อน
  G: '#3f8a3a', // ผักสีเข้ม
  k: '#9a6a44', // ลูกชิ้น
  K: '#6e4a2e',
  l: '#c8986e',
  p: '#eba79d', // หมู
  P: '#c97a70',
  y: '#f4c542', // ดาว
  Y: '#fff2b0',
};

const CARTOON_BODY = [
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '.hhhsssssssshhh.',
  '.hhsssssssssshh.',
  '.hhseesssseeshh.',
  '.hhseesssseeshh.',
  '.hhbssssssssbhh.',
  null, // ปาก (เปลี่ยนตามอารมณ์)
  null,
  '..hh.ssssss.hh..',
  '..hh.wwrrww.hh..',
  '..hwwwwrrwwwwh..',
  '..wwwwwwwwwwww..',
  '.swwwwwwwwwwwws.',
  '.swwwwwwwwwwwws.',
  '..wwwwwwwwwwww..',
  '..nnnnnnnnnnnn..',
  '..nnnnnnnnnnnn..',
];

const FACES = {
  normal: ['.hhssssmmsssshh.', '.hhhsssssssshhh.'],
  happy: ['.hhsssmssmssshh.', '.hhhssmmmmsshhh.'],
  pout: ['.hhssssmmsssshh.', '.hhhssmssmsshhh.'],
};

// ขาสองท่าสลับกันตอนวิ่ง
const LEGS = {
  a: ['....ss....ss....', '....ee....ee....'],
  b: ['...ss......ss...', '...ee......ee...'],
};

export const CARTOON_W = 16;

export function cartoonRows(face = 'normal', legs = null) {
  const [mouthTop, mouthBottom] = FACES[face] || FACES.normal;
  const rows = CARTOON_BODY.map((row, i) => {
    if (i === 9) return mouthTop;
    if (i === 10) return mouthBottom;
    return row;
  });
  return legs ? rows.concat(LEGS[legs]) : rows;
}

export function drawSprite(ctx, rows, x, y, scale = 1) {
  const ox = Math.round(x);
  const oy = Math.round(y);
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
