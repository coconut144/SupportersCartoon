// บัตรแฟนคลับ: เก็บชื่อเล่น เลขสมาชิก และวันที่สมัครไว้ในเครื่อง แล้ววาดเป็นรูปขนาดสตอรี่ 1080 × 1920
// รูปน้องในบัตรเป็น pixel art ที่วาดเอง ไม่ใช้รูปทางการ จะได้แชร์ต่อได้สบายใจ

import qrcode from 'qrcode-generator';
import { PALETTE, cartoonRows } from './pixel';
import { formatDate } from '../data/format';
import { wishUrl } from './wish';

export const CARD_W = 1080;
export const CARD_H = 1920;
export const NAME_MAX = 16;

const STORE_KEY = 'fan-card';

// ================== ชุดแต่งตัวน้องในบัตร ==================
// แต่ละหมวดมีตัวเลือก { id, label, swatch (สีที่โชว์บนปุ่ม), colors (สีที่ทับจานสีของ sprite) }
export const LOOK_OPTIONS = {
  accent: {
    label: 'โบว์และกิ๊บ',
    choices: [
      { id: 'pink', label: 'ชมพู', swatch: '#ff7fb2', colors: { c: '#ff7fb2', C: '#c8475f' } },
      { id: 'sky', label: 'ฟ้า', swatch: '#6fc0ff', colors: { c: '#6fc0ff', C: '#1f6fb8' } },
      { id: 'yellow', label: 'เหลือง', swatch: '#f4c542', colors: { c: '#f4c542', C: '#b8860b' } },
      { id: 'purple', label: 'ม่วง', swatch: '#b18cf0', colors: { c: '#b18cf0', C: '#6f4fc0' } },
    ],
  },
  shirt: {
    label: 'เสื้อ',
    choices: [
      { id: 'white', label: 'ขาว', swatch: '#ffffff', colors: { w: '#ffffff', W: '#dfe5f0' } },
      { id: 'pink', label: 'ชมพู', swatch: '#ffd3e2', colors: { w: '#ffd3e2', W: '#f0a9c1' } },
      { id: 'sky', label: 'ฟ้า', swatch: '#d4ecff', colors: { w: '#d4ecff', W: '#a5cdf0' } },
      { id: 'yellow', label: 'เหลือง', swatch: '#fff0b8', colors: { w: '#fff0b8', W: '#f0d77a' } },
    ],
  },
  skirt: {
    label: 'กระโปรง',
    choices: [
      { id: 'navy', label: 'กรมท่า', swatch: '#3b4a7a', colors: { n: '#3b4a7a', N: '#2a3560' } },
      { id: 'red', label: 'แดง', swatch: '#c8475f', colors: { n: '#c8475f', N: '#94304a' } },
      { id: 'black', label: 'ดำ', swatch: '#2e2a2a', colors: { n: '#3a3434', N: '#1a1717' } },
      { id: 'mint', label: 'มิ้นท์', swatch: '#5cbfa5', colors: { n: '#5cbfa5', N: '#3d8f7a' } },
    ],
  },
  mood: {
    label: 'หน้า',
    choices: [
      { id: 'happy', label: 'ยิ้ม' },
      { id: 'normal', label: 'เฉย ๆ' },
      { id: 'pout', label: 'งอน' },
    ],
  },
  item: {
    label: 'ของในมือ',
    choices: [
      { id: 'none', label: 'ไม่มี' },
      { id: 'lightstick', label: 'แท่งไฟ' },
      { id: 'heart', label: 'หัวใจ' },
      { id: 'star', label: 'ดาว' },
    ],
  },
  bg: {
    label: 'พื้นหลัง',
    choices: [
      { id: 'pink', label: 'ชมพู', swatch: '#ffe3ee' },
      { id: 'sky', label: 'ฟ้า', swatch: '#ddf0ff' },
      { id: 'yellow', label: 'เหลือง', swatch: '#fff4cc' },
      { id: 'mint', label: 'มิ้นท์', swatch: '#dcf5ec' },
    ],
  },
};

export const DEFAULT_LOOK = Object.fromEntries(
  Object.entries(LOOK_OPTIONS).map(([part, { choices }]) => [part, choices[0].id]),
);

const choiceOf = (part, id) => LOOK_OPTIONS[part].choices.find((c) => c.id === id) || LOOK_OPTIONS[part].choices[0];

// ค่าที่ไม่รู้จัก (เช่นข้อมูลเก่า/เสีย) กลับเป็นค่าเริ่มต้นของหมวดนั้น
export function normalizeLook(look) {
  const source = look && typeof look === 'object' ? look : {};
  return Object.fromEntries(Object.keys(LOOK_OPTIONS).map((part) => [part, choiceOf(part, source[part]).id]));
}

// ชื่อเล่น: ตัดช่องว่างซ้ำและอักขระควบคุม ยาวไม่เกิน NAME_MAX ตัวอักษร
export function cleanName(raw) {
  // ตัดอักขระควบคุม (รหัสต่ำกว่า 32 และ 127) ออกก่อน
  const visible = [...String(raw || '')].filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127).join('');
  const name = visible.replace(/\s+/g, ' ').trim();
  return [...name].slice(0, NAME_MAX).join('');
}

export function readMember() {
  try {
    const data = JSON.parse(window.localStorage.getItem(STORE_KEY));
    if (data && typeof data.name === 'string' && /^\d{4}$/.test(data.no) && typeof data.joined === 'string') {
      return { ...data, look: normalizeLook(data.look) };
    }
  } catch (e) {
    // ข้อมูลเสียถือว่ายังไม่มีบัตร
  }
  return null;
}

// สร้างหรืออัปเดตบัตร: เปลี่ยนชื่อและชุดได้ แต่เลขสมาชิกและวันที่สมัครเดิมคงไว้
// ไม่ส่ง look มา = ใช้ชุดเดิม (หรือชุดเริ่มต้นถ้าเพิ่งทำบัตร)
export function saveMember(name, now = new Date(), rng = Math.random, look = undefined) {
  const previous = readMember();
  const member = {
    name: cleanName(name),
    look: normalizeLook(look || (previous && previous.look)),
    no: previous ? previous.no : String(1 + Math.floor(rng() * 9999)).padStart(4, '0'),
    // วันที่ตามเวลาเครื่อง (ไม่ใช่ UTC) ไม่งั้นช่วงเช้ามืดของไทยจะได้วันที่ของเมื่อวาน
    joined: previous ? previous.joined : now.toLocaleDateString('en-CA'),
  };
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(member));
  } catch (e) {
    // เก็บไม่ได้ก็ยังทำบัตรรอบนี้ได้
  }
  return member;
}

// ================== การวาด ==================

const COLORS = {
  paper: '#fbf8f2',
  grid: 'rgba(31, 111, 184, 0.08)',
  card: '#fffdf9',
  line: '#e8dcc8',
  ink: '#22305a',
  muted: '#5b6380',
  pink: '#ff7fb2',
  pinkSoft: '#ffe3ee',
  pinkDeep: '#b8275f',
  sky: '#6fc0ff',
  skySoft: '#ddf0ff',
  tapePink: 'rgba(255, 127, 178, 0.55)',
  tapeSky: 'rgba(111, 192, 255, 0.5)',
};

const FONTS = ['800 110px Prompt', '600 72px Mali', '500 36px "JetBrains Mono"', '500 44px "Noto Sans Thai"'];

// รอฟอนต์ของเว็บโหลดเสร็จก่อนวาด ไม่งั้นตัวหนังสือในรูปจะเป็นฟอนต์ระบบ
export async function loadCardFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all(FONTS.map((font) => document.fonts.load(font, 'Cartoon การ์ตูน 0123')));
  } catch (e) {
    // โหลดไม่ได้ก็วาดด้วยฟอนต์สำรอง
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tape(ctx, cx, cy, w, h, angle, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

function text(ctx, value, x, y, font, color, align = 'center') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

// ย่อขนาดตัวอักษรลงจนชื่อยาว ๆ พอดีความกว้าง
function fitFont(ctx, value, weight, family, maxSize, maxWidth) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 40 && ctx.measureText(value).width > maxWidth) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return `${weight} ${size}px ${family}`;
}

// ของในมือ วางทางขวาของตัวน้อง (คอลัมน์ 32–37 ของภาพรวม) แถวบนสุดของ sprite อยู่ที่แถว top
const ITEMS = {
  lightstick: { top: 16, rows: ['.YY..', 'YccY.', 'cccc.', 'cccc.', 'cccc.', 'cccc.', '.cc..', '.ee..', '.ee..', '.ee..', '.ee..', '.ee..', '.ee..', 'sss..'] },
  heart: { top: 22, rows: ['.rr.rr', 'rRrrrr', 'rrrrrr', '.rrrr.', '..rr..'] },
  star: { top: 20, rows: ['..y...', '..y...', 'yyYyy.', '.yyy..', '.y.y..'] },
};
export const ITEM_COLS = 6;

// รวมแถวของน้อง (กว้าง 32) กับของในมือ (กว้าง 6) เป็นภาพกว้าง 38 จุด
export function lookRows(look) {
  const { mood, item } = normalizeLook(look);
  const base = cartoonRows(mood, 'a');
  const extra = ITEMS[item];
  return base.map((row, ry) => {
    let body = row;
    // ถือแท่งไฟ: ยื่นแขนขวาออกไป 2 จุดให้มือแตะด้ามพอดี (แถว 29 คอลัมน์ 30–31)
    if (item === 'lightstick' && ry === 29) body = `${row.slice(0, 30)}ss`;
    const itemRow = extra && ry >= extra.top && ry < extra.top + extra.rows.length
      ? extra.rows[ry - extra.top].padEnd(ITEM_COLS, '.')
      : '.'.repeat(ITEM_COLS);
    return body + itemRow;
  });
}

// จานสีหลังแต่งตัว: ทับสีโบว์ เสื้อ กระโปรงลงบนจานสีเดิม
export function lookPalette(look) {
  const normalized = normalizeLook(look);
  return {
    ...PALETTE,
    ...choiceOf('accent', normalized.accent).colors,
    ...choiceOf('shirt', normalized.shirt).colors,
    ...choiceOf('skirt', normalized.skirt).colors,
  };
}

export const lookBackground = (look) => choiceOf('bg', normalizeLook(look).bg).swatch;

// วาดน้องลง canvas เล็ก 1 จุด = 1 พิกเซลก่อน แล้วค่อยขยายทั้งภาพ
// (ถ้าวาดทีละช่องบนบัตรที่เอียงอยู่ จะเห็นเส้นตารางบาง ๆ ระหว่างช่อง)
function drawPixelCartoon(ctx, x, y, scale, look) {
  const rows = lookRows(look);
  const palette = lookPalette(look);
  const sprite = document.createElement('canvas');
  sprite.width = rows[0].length;
  sprite.height = rows.length;
  const sctx = sprite.getContext('2d');
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx += 1) {
      const ch = row[rx];
      if (ch !== '.') {
        sctx.fillStyle = palette[ch];
        sctx.fillRect(rx, ry, 1, 1);
      }
    }
  });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, x, y, sprite.width * scale, sprite.height * scale);
}

// สร้างตาราง QR (true = จุดดำ) ใช้ระดับแก้ผิด L ให้ตารางเล็กสุด จุดจะได้ใหญ่และสแกนง่าย
export function qrMatrix(value) {
  const qr = qrcode(0, 'L');
  qr.addData(value, 'Byte');
  qr.make();
  const count = qr.getModuleCount();
  return Array.from({ length: count }, (_, r) => Array.from({ length: count }, (__, c) => qr.isDark(r, c)));
}

// วาด QR บนพื้นขาวมุมมน มีขอบว่าง 2 จุดรอบตาราง (quiet zone) ให้กล้องจับได้
function drawQr(ctx, value, x, y, size) {
  const matrix = qrMatrix(value);
  const count = matrix.length + 4;
  const cell = Math.floor(size / count);
  const offset = Math.floor((size - cell * count) / 2) + cell * 2;
  roundRect(ctx, x, y, size, size, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.line;
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  matrix.forEach((row, r) => row.forEach((dark, c) => {
    if (dark) ctx.fillRect(x + offset + c * cell, y + offset + r * cell, cell, cell);
  }));
}

export function drawFanCard(ctx, member) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // พื้นกระดาษตาราง
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = COLORS.grid;
  for (let gx = 0; gx < CARD_W; gx += 54) ctx.fillRect(gx, 0, 2, CARD_H);
  for (let gy = 0; gy < CARD_H; gy += 54) ctx.fillRect(0, gy, CARD_W, 2);

  // หัวรูป
  ctx.save();
  ctx.translate(CARD_W / 2, 200);
  ctx.rotate(-0.04);
  text(ctx, 'บัตรแฟนคลับ ♡', 0, 0, '600 72px Mali', COLORS.pinkDeep);
  ctx.restore();
  text(ctx, 'Cartoon BNK48', CARD_W / 2, 330, '800 110px Prompt', COLORS.ink);

  // ตัวบัตร
  const cx = 90;
  const cy = 430;
  const cw = 900;
  const ch = 1330;
  const stubH = 250;
  ctx.save();
  ctx.translate(CARD_W / 2, cy + ch / 2);
  ctx.rotate(-0.012);
  ctx.translate(-CARD_W / 2, -(cy + ch / 2));

  ctx.shadowColor = 'rgba(34, 48, 90, 0.16)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  roundRect(ctx, cx, cy, cw, ch, 44);
  ctx.fillStyle = COLORS.card;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.line;
  ctx.stroke();

  // ต้นขั้วด้านบน: MEMBER + เลขสมาชิก
  ctx.save();
  roundRect(ctx, cx, cy, cw, ch, 44);
  ctx.clip();
  ctx.fillStyle = COLORS.skySoft;
  ctx.fillRect(cx, cy, cw, stubH);
  ctx.restore();
  text(ctx, 'MEMBER', CARD_W / 2, cy + 130, '800 104px Prompt', COLORS.ink);
  text(ctx, `NO. FC-${member.no}`, CARD_W / 2, cy + 200, '500 40px "JetBrains Mono"', COLORS.muted);

  // รอยปรุ + รอยเว้าสองข้าง
  ctx.setLineDash([18, 14]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.line;
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy + stubH);
  ctx.lineTo(cx + cw - 40, cy + stubH);
  ctx.stroke();
  ctx.setLineDash([]);
  [cx, cx + cw].forEach((nx) => {
    ctx.beginPath();
    ctx.arc(nx, cy + stubH, 30, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
  });

  // โพลารอยด์รูปน้องแบบ pixel art เอียงนิด ๆ ติดเทป
  const px = CARD_W / 2;
  const py = cy + stubH + 330;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(0.05);
  ctx.shadowColor = 'rgba(34, 48, 90, 0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-210, -260, 420, 540);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = lookBackground(member.look);
  ctx.fillRect(-186, -236, 372, 410);
  // ภาพรวม 38 × 38 จุด (น้อง 32 + ของในมือ 6) ที่ scale 9 = 342 × 342 วางในกรอบพื้นหลัง (372 × 410)
  // ตัวน้องเยื้องซ้ายเล็กน้อย ของในมือยื่นไปทางขวาแต่ยังอยู่ในกรอบ
  drawPixelCartoon(ctx, -150, -216, 9, member.look);
  text(ctx, 'การ์ตูน ♡', 0, 240, '600 46px Mali', COLORS.ink);
  ctx.restore();
  tape(ctx, px, py - 262, 190, 50, -0.08, COLORS.tapePink);
  tape(ctx, px + 210, py + 250, 120, 40, 0.7, COLORS.tapeSky);

  // ชื่อเล่นของแฟนคลับ มีขีดไฮไลต์ชมพูอยู่ใต้ตัวหนังสือ (วาดขีดก่อน แล้วค่อยวาดชื่อทับ)
  const nameFont = fitFont(ctx, member.name, 800, 'Prompt', 96, cw - 120);
  ctx.font = nameFont;
  const nameW = Math.min(cw - 120, ctx.measureText(member.name).width);
  ctx.fillStyle = COLORS.pinkSoft;
  ctx.fillRect(CARD_W / 2 - nameW / 2 - 10, cy + stubH + 690, nameW + 20, 34);
  text(ctx, member.name, CARD_W / 2, cy + stubH + 720, nameFont, COLORS.ink);

  text(
    ctx,
    `สมัครเมื่อ ${formatDate(member.joined, 'th-TH', 'long')}`,
    CARD_W / 2,
    cy + stubH + 790,
    '500 44px "Noto Sans Thai"',
    COLORS.muted,
  );

  ctx.restore();

  // QR สแกนรับคำอวยพร (วาดนอกส่วนที่เอียง ให้เส้น QR ตรงเป๊ะ สแกนง่าย) + ข้อความลายมือด้านขวา
  const qrSize = 210;
  const qrX = 290;
  const qrY = cy + ch - qrSize - 40;
  drawQr(ctx, wishUrl(member), qrX, qrY, qrSize);
  text(ctx, 'สแกนรับ', qrX + qrSize + 34, qrY + 98, '600 48px Mali', COLORS.pinkDeep, 'left');
  text(ctx, 'คำอวยพร ♡', qrX + qrSize + 34, qrY + 156, '600 48px Mali', COLORS.pinkDeep, 'left');

  // สติกเกอร์วงกลมมุมบัตร
  ctx.save();
  ctx.translate(cx + cw - 30, cy + 20);
  ctx.rotate(0.22);
  ctx.beginPath();
  ctx.arc(0, 0, 82, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.pink;
  ctx.fill();
  text(ctx, 'Stand by', 0, -8, '600 34px Mali', COLORS.ink);
  text(ctx, 'Toon ♡', 0, 32, '600 34px Mali', COLORS.ink);
  ctx.restore();

  text(ctx, 'standbycartoon.vercel.app', CARD_W / 2, CARD_H - 90, '500 36px "JetBrains Mono"', COLORS.muted);
}
