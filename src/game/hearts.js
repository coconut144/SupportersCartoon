// Heart to Heart: เขียนคำอวยพร/กำลังใจถึงน้องการ์ตูน แต่งการ์ด แล้วบันทึกการ์ดเป็นรูปลงเครื่องได้
// หน้าเว็บแสดงแค่จำนวนคนที่ส่ง แอดมินรวบรวมการ์ดทั้งหมดได้ที่ /heart/admin
// คุยกับ /api/hearts (ดู api/hearts.js) ตัวเลือกการ์ดด้านล่างต้องตรงกับฝั่ง api

import {
  HEAD, BODY, HAND, setFont, fitText, roundRect, heart, wrapLines,
} from './certificate';

const ENDPOINT = '/api/hearts';
const TOKEN_KEY = 'heart-token';
const DRAFT_KEY = 'heart-draft';

export const NAME_MAX = 30;
export const MESSAGE_MAX = 300;

export const KINDS = [
  { id: 'wish', label: 'คำอวยพร', done: 'ส่งคำอวยพร', random: 'สุ่มคำอวยพร' },
  { id: 'cheer', label: 'ให้กำลังใจ', done: 'ส่งกำลังใจ', random: 'สุ่มคำให้กำลังใจ' },
];
// [สีพื้นการ์ด, สีตัวหนังสือ]
export const COLORS = [
  { label: 'ชมพู', bg: '#ffe1e8', ink: '#7a3446' },
  { label: 'เหลือง', bg: '#fff1d6', ink: '#6b4a17' },
  { label: 'ฟ้า', bg: '#e3f0ff', ink: '#28436b' },
  { label: 'เขียว', bg: '#e5f6e8', ink: '#2c5a36' },
  { label: 'ม่วง', bg: '#efe6ff', ink: '#4b3576' },
];
export const STICKERS = ['💖', '🌷', '⭐', '🎀', '🍰', '🌈', '🐣', '✨'];
export const PATTERNS = [
  { id: 'none', label: 'เรียบ' },
  { id: 'dots', label: 'จุด' },
  { id: 'stripe', label: 'ลายทาง' },
  { id: 'hearts', label: 'หัวใจ' },
  { id: 'grid', label: 'สมุด' },
];
export const FONTS = [
  { id: 'sans', label: 'ปกติ' },
  { id: 'hand', label: 'ลายมือ' },
  { id: 'display', label: 'ตัวหนา' },
];

// ข้อความตัวอย่างสำหรับปุ่มสุ่ม แยกตามประเภท กดสุ่มแล้วแก้ต่อเองได้
// อยากเพิ่ม/แก้ข้อความ แก้ในรายการนี้ได้เลย (แต่ละข้อยาวไม่เกิน MESSAGE_MAX ตัวอักษร)
export const SUGGESTIONS = {
  wish: [
    'ขอให้น้องการ์ตูนมีความสุขมาก ๆ ยิ้มได้ทุกวันเลยนะ',
    'ขอให้น้องการ์ตูนสุขภาพแข็งแรง ไม่เจ็บไม่ป่วย มีแรงทำสิ่งที่รักไปนาน ๆ',
    'ขอให้ทุกความฝันของน้องการ์ตูนเป็นจริง จะคอยเชียร์อยู่ตรงนี้เสมอ',
    'ขอให้น้องการ์ตูนได้กินของอร่อยทุกวัน โดยเฉพาะก๋วยเตี๋ยวน้ำตกแบบไม่ใส่ผัก',
    'ขอให้ปีนี้เป็นปีที่ดีของน้องการ์ตูน ได้ทำงานที่อยากทำ ได้ขึ้นเวทีที่อยากขึ้น',
    'ขอให้น้องการ์ตูนเจอแต่คนใจดี เจอแต่เรื่องดี ๆ เข้ามาในชีวิต',
    'ขอให้น้องการ์ตูนได้พักผ่อนเยอะ ๆ นอนหลับฝันดีทุกคืน',
    'ขอให้รอยยิ้มของน้องการ์ตูนสดใสแบบนี้ตลอดไป',
    'ขอให้น้องการ์ตูนเติบโตในเส้นทางนี้อย่างมีความสุข และภูมิใจในตัวเองทุกวัน',
    'ขอให้น้องการ์ตูนมีแต่ความรักรอบตัว จากครอบครัว เพื่อน และแฟนคลับทุกคน',
  ],
  cheer: [
    'สู้ ๆ นะน้องการ์ตูน จะซัพพอร์ตไปเรื่อย ๆ เลย',
    'เหนื่อยเมื่อไหร่ก็พักได้นะ แฟนคลับรออยู่ตรงนี้เสมอ',
    'น้องการ์ตูนเก่งมากแล้ว ภูมิใจในตัวน้องเสมอนะ',
    'ไม่ว่าผลจะเป็นยังไง น้องการ์ตูนคือที่หนึ่งในใจเสมอ',
    'ขอบคุณที่พยายามมาตลอด ทุกความตั้งใจของน้องส่งมาถึงแฟนคลับจริง ๆ',
    'วันไหนท้อ ขอให้นึกถึงเสียงเชียร์ของพวกเรานะ จะเชียร์ให้ดังกว่าเดิม',
    'ค่อย ๆ ไปทีละก้าวก็ได้ จะเดินไปด้วยกันกับน้องการ์ตูน',
    'รอยยิ้มของน้องการ์ตูนเป็นกำลังใจให้พวกเราทุกวัน วันนี้ขอส่งกำลังใจกลับไปบ้าง',
    'เชื่อในตัวน้องการ์ตูนเสมอ ทำเต็มที่แบบที่เป็นตัวเองได้เลย',
    'อยู่ตรงนี้เสมอนะ ไม่ว่าวันที่ดีหรือวันที่เหนื่อย',
  ],
};

// สุ่มข้อความตามประเภท ไม่ซ้ำกับข้อที่อยู่ในช่องตอนนี้
export function pickSuggestion(kind, rng = Math.random, previous = '') {
  const list = SUGGESTIONS[kind] || SUGGESTIONS.wish;
  const pool = list.filter((text) => text !== previous);
  return pool[Math.floor(rng() * pool.length)];
}

export const DEFAULT_DRAFT = { name: '', message: '', kind: 'wish', color: 0, sticker: 0, pattern: 'none', font: 'sans' };

const idIn = (list, id) => (list.some((item) => item.id === id) ? id : list[0].id);
const indexIn = (list, index) => (Number.isInteger(index) && index >= 0 && index < list.length ? index : 0);

// ค่าที่ไม่รู้จัก (ข้อมูลเก่า/เสีย หรือการ์ดจาก server) กลับเป็นค่าเริ่มต้น
export function normalizeHeart(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    ...source,
    name: typeof source.name === 'string' ? source.name : '',
    message: typeof source.message === 'string' ? source.message : '',
    kind: idIn(KINDS, source.kind),
    color: indexIn(COLORS, source.color),
    sticker: indexIn(STICKERS, source.sticker),
    pattern: idIn(PATTERNS, source.pattern),
    font: idIn(FONTS, source.font),
  };
}

export const countChars = (text) => [...text].length;

// สรุปการแต่งการ์ดเป็นข้อความ เช่น "สีชมพู · 💖 · พื้นลายทาง · ตัวอักษรลายมือ" (ต้องตรงกับ describeDesign ใน api/hearts.js)
export function describeDesign(raw) {
  const h = normalizeHeart(raw);
  return [
    `สี${COLORS[h.color].label}`,
    STICKERS[h.sticker],
    `พื้น${PATTERNS.find((item) => item.id === h.pattern).label}`,
    `ตัวอักษร${FONTS.find((item) => item.id === h.font).label}`,
  ].join(' · ');
}

// เวลาไทยแบบ 2026-11-14 10:30 (เรียงในตารางได้)
export function thaiTime(ms) {
  if (!Number.isFinite(ms)) return '';
  return new Date(ms + 7 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
}

// ================== ข้อมูลในเครื่อง ==================

function randomToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => { bytes[i] = Math.floor(Math.random() * 256); });
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// token ประจำเครื่อง: ใช้ยืนยันว่าเป็นเจ้าของการ์ดตอนกลับมาแก้ (1 เครื่อง 1 การ์ด) ไม่เคยแสดงให้คนอื่นเห็น
export function readToken() {
  try {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved && /^[A-Za-z0-9-]{16,64}$/.test(saved)) return saved;
    const token = randomToken();
    window.localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch (e) {
    return randomToken(); // เก็บไม่ได้ก็ยังส่งรอบนี้ได้ แต่กลับมาแก้ทีหลังไม่ได้
  }
}

// การ์ดที่ส่งล่าสุดจากเครื่องนี้ ไว้เติมฟอร์มตอนกลับมาแก้
export function readDraft() {
  try {
    const data = JSON.parse(window.localStorage.getItem(DRAFT_KEY));
    return data && typeof data === 'object' ? normalizeHeart(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveDraft(heartData) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(heartData));
  } catch (e) {
    // จำไม่ได้ก็กรอกใหม่รอบหน้า
  }
}

// ================== คุยกับ server ==================

async function request(url, options) {
  if (typeof fetch !== 'function') throw new Error('offline');
  const response = await fetch(url, options);
  // ตอบกลับมาไม่ใช่ JSON (เช่น npm start ที่ไม่มี /api) ถือว่าต่อ server ไม่ได้
  const data = await response.json().catch(() => null);
  if (!data) throw new Error('offline');
  if (!response.ok) throw Object.assign(new Error(data.error || 'ส่งไม่สำเร็จ'), { status: response.status });
  return data;
}

const toTotal = (data) => (Number.isInteger(data.total) && data.total >= 0 ? data.total : 0);

// คืนจำนวนคนที่ส่งใจมาแล้ว
export async function fetchTotal() {
  return toTotal(await request(ENDPOINT));
}

// คืน { heart, total }
export async function sendHeart(token, draft) {
  const data = await request(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...draft }),
  });
  return { heart: normalizeHeart(data.heart), total: toTotal(data) };
}

// ================== แอดมิน: รวบรวมการ์ดทั้งหมด ==================

// key = รหัสแอดมิน (HEARTS_ADMIN_KEY ที่ตั้งไว้ใน Vercel) ส่งใน header ไม่อยู่ใน URL
export async function fetchAllHearts(key) {
  const data = await request(ENDPOINT, { headers: { 'x-admin-key': key } });
  return (Array.isArray(data.hearts) ? data.hearts : []).map(normalizeHeart);
}

const CSV_COLUMNS = [
  ['ลำดับ', (h, index) => index + 1],
  ['ส่งเมื่อ (เวลาไทย)', (h) => thaiTime(h.createdAt)],
  ['ชื่อ', (h) => h.name],
  ['ประเภท', (h) => KINDS.find((kind) => kind.id === h.kind).label],
  ['ข้อความ', (h) => h.message],
  ['การ์ด', (h) => describeDesign(h)],
  ['แก้ล่าสุด (เวลาไทย)', (h) => thaiTime(h.updatedAt)],
  ['id', (h) => h.id || ''],
];

// ขึ้นต้นด้วย = + - @ ใส่ ' นำหน้า กันโปรแกรมตารางตีความเป็นสูตร
const csvCell = (value) => {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

// ตาราง CSV เปิดใน Excel / Google Sheets ได้ (ตอนบันทึกไฟล์ใส่ BOM นำหน้าให้ภาษาไทยไม่เพี้ยน)
export function heartsToCsv(hearts) {
  const rows = [CSV_COLUMNS.map(([title]) => csvCell(title))];
  hearts.forEach((raw, index) => {
    const h = normalizeHeart(raw);
    rows.push(CSV_COLUMNS.map(([, read]) => csvCell(read(h, index))));
  });
  return rows.map((row) => row.join(',')).join('\r\n');
}

// ================== การ์ดเป็นรูป ==================

export const CARD_W = 1080;
export const CARD_H = 1350;

const hash = (text) => {
  let h = 0;
  for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) | 0;
  return Math.abs(h);
};

// มุมเอียงเล็กน้อยของการ์ด คงที่ตาม id
export const tiltOf = (id) => ((hash(id || 'preview') % 5) - 2) * 0.6;

// ตัดบรรทัดข้อความที่ผู้ใช้ขึ้นบรรทัดใหม่เองได้
export function wrapMessage(text, measure, maxWidth, maxLines) {
  const lines = text.split('\n').flatMap((paragraph) => (
    paragraph.trim() ? wrapLines(paragraph, measure, maxWidth, maxLines) : ['']
  ));
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${[...lines[maxLines - 1]].slice(0, -1).join('')}…`;
  }
  return lines;
}

const CARD_FONT = { sans: [400, BODY], hand: [600, HAND], display: [500, HEAD] };

// ลายพื้นการ์ด ให้เหมือนลายใน Game.css (.heart-pt-*)
function drawPattern(ctx, pattern, x, y, w, h) {
  if (pattern === 'dots') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let py = y + 24; py < y + h; py += 48) {
      for (let px = x + 24; px < x + w; px += 48) {
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'stripe') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 24;
    for (let offset = -h; offset < w; offset += 76) {
      ctx.beginPath();
      ctx.moveTo(x + offset, y + h);
      ctx.lineTo(x + offset + h, y);
      ctx.stroke();
    }
  } else if (pattern === 'grid') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = x + 54; px < x + w; px += 54) { ctx.moveTo(px, y); ctx.lineTo(px, y + h); }
    for (let py = y + 54; py < y + h; py += 54) { ctx.moveTo(x, py); ctx.lineTo(x + w, py); }
    ctx.stroke();
  } else if (pattern === 'hearts') {
    for (let py = y + 50; py < y + h; py += 100) {
      for (let px = x + 50; px < x + w; px += 100) heart(ctx, px, py - 22, 44, 'rgba(255, 255, 255, 0.55)');
    }
  }
}

// วาดการ์ดที่แฟนคลับแต่งไว้เป็นรูป (สี ลาย สติกเกอร์ ตัวอักษร ตามที่เลือก) ใช้ทั้งหน้าคนส่งและหน้าแอดมิน
export function drawHeartCard(ctx, raw) {
  const w = normalizeHeart(raw);
  const W = CARD_W;
  const H = CARD_H;
  const color = COLORS[w.color];
  const x = 90;
  const y = 150;
  const cw = W - 180;
  const ch = 1000;
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#fffaf5';
  ctx.fillRect(0, 0, W, H);

  // ตัวการ์ด
  ctx.save();
  ctx.shadowColor = 'rgba(34, 48, 90, 0.18)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = color.bg;
  roundRect(ctx, x, y, cw, ch, 44);
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, cw, ch, 44);
  ctx.clip();
  drawPattern(ctx, w.pattern, x, y, cw, ch);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = '120px sans-serif';
  ctx.fillText(STICKERS[w.sticker], x + cw - 110, y + 60);

  ctx.textAlign = 'left';
  ctx.fillStyle = color.ink;
  ctx.globalAlpha = 0.8;
  setFont(ctx, 500, 30, HEAD);
  ctx.fillText(KINDS.find((item) => item.id === w.kind).label, x + 70, y + 110);
  ctx.globalAlpha = 1;

  // ข้อความ: ลดขนาดตัวอักษรจนพอดีกล่อง
  const [weight, family] = CARD_FONT[w.font];
  const textW = cw - 140;
  const textTop = y + 170;
  const textH = ch - 170 - 190;
  const measure = (value) => ctx.measureText(value).width;
  let size = 64;
  let lines = [];
  for (; size >= 30; size -= 4) {
    setFont(ctx, weight, size, family);
    const maxLines = Math.floor(textH / (size * 1.6));
    lines = wrapMessage(w.message, measure, textW, maxLines + 1);
    if (lines.length <= maxLines) break;
  }
  if (size < 30) {
    size = 30;
    setFont(ctx, weight, size, family);
    lines = wrapMessage(w.message, measure, textW, Math.floor(textH / (size * 1.6)));
  }
  const lineHeight = size * 1.6;
  const top = textTop + (textH - lines.length * lineHeight) / 2 + size;
  lines.forEach((line, index) => ctx.fillText(line, x + 70, top + index * lineHeight));

  fitText(ctx, `— ${w.name || 'แฟนคลับน้องการ์ตูน'}`, x + 70, y + ch - 80, textW, 46, 600, HAND, 'left');

  // ท้ายรูป
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e46b86';
  setFont(ctx, 500, 26, HEAD);
  ctx.fillText('H E A R T   T O   H E A R T', W / 2, 96);
  ctx.fillStyle = '#9b7a86';
  const date = new Date(w.createdAt || Date.now()).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  fitText(ctx, `ส่งใจถึงน้องการ์ตูน  ·  ${date}`, W / 2, y + ch + 100, W * 0.8, 28, 400, BODY);
  ctx.restore();
}
