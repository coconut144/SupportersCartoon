// Heart to Heart: เขียนคำอวยพร/กำลังใจถึงน้องการ์ตูน แล้วรับเกียรติบัตร หน้าเว็บแสดงแค่จำนวนคนที่ส่ง
// คุยกับ /api/hearts (ดู api/hearts.js) ตัวเลือกการ์ดด้านล่างต้องตรงกับฝั่ง api

import {
  HEAD, BODY, HAND, SIGNER, setFont, fitText, roundRect, heart, wrapLines,
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

// ================== เกียรติบัตร Heart to Heart ==================

export const CERT_W = 1080;
export const CERT_H = 1350;

const hash = (text) => {
  let h = 0;
  for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) | 0;
  return Math.abs(h);
};

// มุมเอียงเล็กน้อยของการ์ด คงที่ตาม id
export const tiltOf = (id) => ((hash(id || 'preview') % 5) - 2) * 0.6;

export function heartSerial(heartData) {
  const year = new Date(heartData.createdAt || Date.now()).getFullYear();
  const code = hash(heartData.name + heartData.message).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `HTH-${year}-${code}`;
}

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

const CERT_FONT = { sans: [400, 30, BODY], hand: [600, 31, HAND], display: [500, 30, HEAD] };

// photo (ไม่บังคับ) = รูปที่ผู้ใช้เลือกในเครื่อง ใช้กับเกียรติบัตรเท่านั้น ไม่ถูกส่งขึ้น server
export function drawHeartCertificate(ctx, raw, photo = null) {
  const w = normalizeHeart(raw);
  const W = CERT_W;
  const H = CERT_H;
  const cx = W / 2;
  const pink = '#e46b86';
  const ink = '#4a3340';
  const soft = '#9b7a86';
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#ffd9e2');
  bg.addColorStop(0.55, '#fff0e0');
  bg.addColorStop(1, '#e4ecff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // หัวใจพื้นหลัง: สุ่มด้วย seed จากชื่อ แต่ละคนได้ลายไม่เหมือนกัน
  let seed = (hash(w.name) % 233280) + 3;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 36; i += 1) heart(ctx, rnd() * W, rnd() * H, 14 + rnd() * 30, `rgba(228, 107, 134, ${0.12 + rnd() * 0.25})`);

  ctx.save();
  ctx.shadowColor = 'rgba(200, 110, 130, 0.25)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  roundRect(ctx, 70, 70, W - 140, H - 140, 44);
  ctx.fill();
  ctx.restore();
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = '#f2a5b5';
  ctx.lineWidth = 3;
  roundRect(ctx, 90, 90, W - 180, H - 180, 32);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = 'center';
  ctx.fillStyle = pink;
  setFont(ctx, 500, 26, HEAD);
  ctx.fillText('H E A R T   T O   H E A R T', cx, 200);
  heart(ctx, cx, 230, 70, pink);
  ctx.fillStyle = ink;
  setFont(ctx, 600, 68, HEAD);
  ctx.fillText('เกียรติบัตร', cx, 390);
  ctx.fillStyle = soft;
  setFont(ctx, 400, 28, BODY);
  ctx.fillText('ขอบคุณที่ร่วมส่งใจถึงน้องการ์ตูน มอบให้แก่', cx, 450);
  ctx.fillStyle = pink;
  fitText(ctx, w.name, cx, 560, W * 0.7, 72, 600, HAND);
  ctx.strokeStyle = '#f2a5b5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 260, 596);
  ctx.lineTo(cx + 260, 596);
  ctx.stroke();
  const kind = KINDS.find((item) => item.id === w.kind);
  ctx.fillStyle = ink;
  fitText(ctx, `ผู้ร่วมกิจกรรม Heart to Heart · ${kind.done}`, cx, 656, W * 0.74, 30, 500, HEAD);

  // กล่องข้อความที่เขียน ใช้สีเดียวกับการ์ดที่แต่งไว้
  const color = COLORS[w.color];
  const boxX = 150;
  const boxY = 700;
  const boxW = W - 300;
  const boxH = 330;
  ctx.fillStyle = color.bg;
  roundRect(ctx, boxX, boxY, boxW, boxH, 28);
  ctx.fill();
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(STICKERS[w.sticker], boxX + boxW - 40, boxY + 35);

  let textX = cx;
  let textW = boxW - 80;
  if (photo && photo.width && photo.height) {
    // รูปแบบโพลารอยด์เอียง ๆ ทางซ้ายของกล่อง มีเทปแปะด้านบน
    const S = 250;
    const px = boxX + 40 + S / 2;
    const py = boxY + 150;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.06);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-S / 2 - 12, -S / 2 - 12, S + 24, S + 56);
    ctx.shadowBlur = 0;
    const scale = Math.max(S / photo.width, S / photo.height);
    ctx.beginPath();
    ctx.rect(-S / 2, -S / 2, S, S);
    ctx.clip();
    ctx.drawImage(photo, (-photo.width * scale) / 2, (-photo.height * scale) / 2, photo.width * scale, photo.height * scale);
    ctx.restore();
    ctx.save();
    ctx.translate(px, py - S / 2 - 16);
    ctx.rotate(-0.12);
    ctx.fillStyle = 'rgba(255, 214, 140, 0.8)';
    ctx.fillRect(-45, -12, 90, 24);
    ctx.restore();
    const left = boxX + 40 + S + 40;
    const right = boxX + boxW - 30;
    textX = (left + right) / 2;
    textW = right - left - 20;
  }
  const [weight, size, family] = CERT_FONT[w.font];
  ctx.fillStyle = color.ink;
  setFont(ctx, weight, size, family);
  ctx.textAlign = 'center';
  const lineHeight = 46;
  const lines = wrapMessage(`“${w.message}”`, (value) => ctx.measureText(value).width, textW, 6);
  const top = boxY + (boxH - lines.length * lineHeight) / 2 + 32;
  lines.forEach((line, index) => ctx.fillText(line, textX, top + index * lineHeight));

  const date = new Date(w.createdAt || Date.now()).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = ink;
  fitText(ctx, `${date}  ·  ${SIGNER}`, cx, 1130, W * 0.76, 26, 400, BODY);
  ctx.fillStyle = soft;
  fitText(ctx, `เลขที่ ${heartSerial(w)}`, cx, 1190, W * 0.76, 20, 400, BODY);
  ctx.restore();
}
