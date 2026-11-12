// เกียรติบัตรผู้ร่วมโปรเจกต์: กรอกชื่อ โปรเจกต์ บทบาท แล้ววาดเป็นรูปให้บันทึกได้ทันที
// ทุกอย่างทำในเครื่องของผู้ใช้ ไม่ส่งชื่อหรือรูปขึ้น server
// อยากเพิ่ม/แก้รายชื่อโปรเจกต์หรือบทบาท แก้ที่ PROJECTS กับ ROLES ได้เลย

export const PROJECTS = [
  'โปรเจกต์วันเกิดน้องการ์ตูน 2026',
  'โปรเจกต์ซัพพอร์ตเลือกตั้ง (General Election)',
  'โปรเจกต์ป้ายโฆษณาซัพพอร์ตน้องการ์ตูน',
  'โปรเจกต์ดอกไม้หน้าเธียเตอร์',
  'โปรเจกต์ครบรอบเดบิวต์',
];
export const ROLES = ['ผู้ร่วมสนับสนุน', 'ทีมงานโปรเจกต์', 'ผู้ออกแบบงานกราฟิก', 'ผู้ประสานงาน', 'อาสาสมัครหน้างาน'];

export const OTHER = '__other'; // ตัวเลือก "อื่น ๆ (พิมพ์เอง)" ใน select
export const SERIAL_PREFIX = 'CTN';
// ผู้ลงนามเริ่มต้น (ชื่อบนเส้น / ตำแหน่งหรือทีมใต้เส้น) ผู้ใช้แก้เองได้ในฟอร์ม
export const SIGNER_NAME = 'Cartoon Fan Project';
export const SIGNER = 'ทีมแอดมิน Cartoon BNK48 Fan Project';

export const LIMITS = { name: 40, project: 70, role: 40, message: 90, signer: 40, signerTitle: 50 };

export const TEMPLATES = [
  { id: 'classic', label: 'คลาสสิก', swatch: 'linear-gradient(135deg, #fbf8f2 50%, #c09a45 50%)' },
  { id: 'pastel', label: 'พาสเทล', swatch: 'linear-gradient(135deg, #ffd9e2, #ffe9cf, #e2ecff)' },
  { id: 'card', label: 'บัตรสมาชิก', swatch: 'linear-gradient(135deg, #1d2440 60%, #d9b65c 60%)' },
  { id: 'custom', label: 'ออกแบบเอง', swatch: 'conic-gradient(#ff7fb2, #f4c542, #5cbfa5, #6fc0ff, #b18cf0, #ff7fb2)' },
];

// ค่าเริ่มต้นของแบบ "ออกแบบเอง": สีพื้น สีเน้น สีตัวหนังสือ กรอบ และตราประทับ
// image = ภาพพื้นหลังที่ผู้ใช้ออกแบบมาเอง (อยู่ในเครื่องเท่านั้น) วางเต็มภาพแทนสีพื้น
export const DEFAULT_DESIGN = { bg: '#fffdf9', accent: '#b8275f', ink: '#22305a', frame: true, seal: true, image: null };

const isHexColor = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

// ค่าที่ไม่ใช่สีแบบ #rrggbb กลับเป็นค่าเริ่มต้น
export function normalizeDesign(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    bg: isHexColor(source.bg) ? source.bg : DEFAULT_DESIGN.bg,
    accent: isHexColor(source.accent) ? source.accent : DEFAULT_DESIGN.accent,
    ink: isHexColor(source.ink) ? source.ink : DEFAULT_DESIGN.ink,
    frame: source.frame !== false,
    seal: source.seal !== false,
    image: source.image && source.image.width && source.image.height ? source.image : null,
  };
}

// unit = ตัวคูณขนาดตัวหนังสือและระยะ ให้แบบ A4 ที่กว้างกว่าได้ตัวหนังสือใหญ่ตาม
export const SIZES = [
  { id: 'a4', label: 'A4 แนวนอน', hint: 'สำหรับพิมพ์', width: 1754, height: 1240, unit: 1.3, portrait: false },
  { id: 'ig', label: '4:5 แนวตั้ง', hint: 'สำหรับโซเชียล', width: 1080, height: 1350, unit: 1, portrait: true },
];

// ชุดสีสำเร็จรูปของแบบ "ออกแบบเอง" ใช้ตอนกดสุ่มแบบ (สีตัวหนังสือเข้มพอให้อ่านง่ายบนสีพื้น)
export const PALETTES = [
  { bg: '#fffdf9', accent: '#b8275f', ink: '#22305a' }, // ชมพูบนกระดาษ
  { bg: '#f1f8ff', accent: '#1f6fb8', ink: '#22305a' }, // ฟ้า
  { bg: '#fff8e1', accent: '#b8860b', ink: '#4a3a12' }, // เหลืองทอง
  { bg: '#effaf4', accent: '#2e7d5b', ink: '#1f3d30' }, // มิ้นท์
  { bg: '#f6f0ff', accent: '#6f4fc0', ink: '#2e2350' }, // ม่วง
  { bg: '#1d2440', accent: '#d9b65c', ink: '#fbf8f2' }, // กรมท่าทอง
  { bg: '#2b1b24', accent: '#ff9ec4', ink: '#fff4f8' }, // ดำชมพู
];

// สุ่มแบบเกียรติบัตร: แบบสำเร็จ 3 แบบ หรือแบบออกแบบเองกับชุดสีใดชุดหนึ่ง ไม่ซ้ำกับที่ใช้อยู่
// ภาพพื้นหลัง กรอบ และตราประทับที่ผู้ใช้ตั้งไว้คงเดิม เปลี่ยนเฉพาะแบบกับสี
export function randomLook(current = {}, rng = Math.random) {
  const design = normalizeDesign(current.design);
  const samePalette = (palette) => palette.bg === design.bg && palette.accent === design.accent && palette.ink === design.ink;
  const pool = [
    ...TEMPLATES.filter((template) => template.id !== 'custom' && template.id !== current.template)
      .map((template) => ({ template: template.id, design })),
    ...PALETTES.filter((palette) => !(current.template === 'custom' && samePalette(palette)))
      .map((palette) => ({ template: 'custom', design: { ...design, ...palette } })),
  ];
  return pool[Math.floor(rng() * pool.length)];
}

export const sizeOf = (id) => SIZES.find((size) => size.id === id) || SIZES[0];
const templateOf = (id) => (TEMPLATES.find((template) => template.id === id) || TEMPLATES[0]).id;

// ข้อความที่ผู้ใช้พิมพ์: ตัดอักขระควบคุมและช่องว่างซ้ำ ยาวไม่เกิน max ตัวอักษร
export function cleanText(raw, max) {
  const visible = [...String(raw || '')].filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127).join('');
  return [...visible.replace(/\s+/g, ' ').trim()].slice(0, max).join('');
}

// วันที่ของวันนี้ตามเวลาเครื่อง (ไม่ใช่ UTC) ไม่งั้นช่วงเช้ามืดของไทยจะได้วันที่ของเมื่อวาน
export const todayIso = (now = new Date()) => now.toLocaleDateString('en-CA');

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

// เลขที่บัตร: แฮช (FNV-1a) จากชื่อ โปรเจกต์ และวันที่ ข้อมูลเดิมได้เลขเดิมเสมอ
export function makeSerial(name, project, isoDate) {
  let hash = 2166136261;
  for (const ch of `${name}|${project}|${isoDate}`) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const code = (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `${SERIAL_PREFIX}-${isoDate.slice(0, 4)}-${code}`;
}

// รวมค่าจากฟอร์มเป็นข้อมูลที่พร้อมวาด
export function buildCertificate(form, now = new Date()) {
  const pick = (value, other, max) => cleanText(value === OTHER ? other : value, max) || '…';
  const isoDate = isIsoDate(form.date) ? form.date : todayIso(now);
  const name = cleanText(form.name, LIMITS.name) || 'ชื่อของคุณ';
  const project = pick(form.project, form.projectOther, LIMITS.project);
  return {
    name,
    project,
    role: pick(form.role, form.roleOther, LIMITS.role),
    message: cleanText(form.message, LIMITS.message),
    // ไม่ได้ส่งมาเลย = ใช้ค่าเริ่มต้น · ชื่อผู้ลงนามว่าง = ค่าเริ่มต้น · ตำแหน่งเว้นว่างได้
    signer: cleanText(form.signer, LIMITS.signer) || SIGNER_NAME,
    signerTitle: form.signerTitle === undefined ? SIGNER : cleanText(form.signerTitle, LIMITS.signerTitle),
    isoDate,
    date: new Date(isoDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    serial: makeSerial(name, project, isoDate),
  };
}

// แบ่งข้อความเป็นคำ: ภาษาไทยไม่เว้นวรรคระหว่างคำ จึงใช้ Intl.Segmenter ถ้ามี ไม่งั้นแบ่งตามช่องว่าง
function splitWords(text) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    try {
      return [...new Intl.Segmenter('th', { granularity: 'word' }).segment(text)].map((part) => part.segment);
    } catch (e) {
      // ใช้วิธีสำรองด้านล่าง
    }
  }
  return text.split(/(\s+)/).filter(Boolean);
}

// ตัดบรรทัดให้กว้างไม่เกิน maxWidth: ตัดระหว่างคำก่อน คำที่ยาวเกินบรรทัดจริง ๆ ถึงจะตัดกลางคำ
// บรรทัดที่เกิน maxLines ถูกตัดทิ้งและลงท้ายด้วย …
export function wrapLines(text, measure, maxWidth, maxLines = 2, words = splitWords(text)) {
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && measure(line + word) > maxWidth) {
      lines.push(line.trimEnd());
      line = word.trimStart();
    } else {
      line += word;
    }
    while (measure(line) > maxWidth && [...line].length > 1) {
      const chars = [...line];
      let cut = chars.length - 1;
      while (cut > 1 && measure(chars.slice(0, cut).join('')) > maxWidth) cut -= 1;
      lines.push(chars.slice(0, cut).join(''));
      line = chars.slice(cut).join('');
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${[...lines[maxLines - 1]].slice(0, -1).join('')}…`;
  }
  return lines;
}

// ตัวอักษรตัวแรกของชื่อสำหรับวงกลมแทนรูปโปรไฟล์ (ข้ามสระหน้าของไทย เช่น "เมย์" → "ม")
export function initialOf(name) {
  return [...name.replace(/^[เแโใไ\s]+/, '')][0] || '♡';
}

// ================== การวาด ==================

// ใช้ฟอนต์ชุดเดียวกับทั้งเว็บ (โหลดไว้แล้วใน public/index.html)
export const HEAD = 'Prompt, sans-serif';
export const BODY = '"Noto Sans Thai", sans-serif';
export const HAND = 'Mali, cursive';
const FONTS = ['600 72px Prompt', '500 36px Prompt', '600 72px Mali', '400 24px "Noto Sans Thai"'];

export async function loadCertificateFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all(FONTS.map((font) => document.fonts.load(font, 'Cartoon เกียรติบัตร 0123')));
  } catch (e) {
    // โหลดไม่ได้ก็วาดด้วยฟอนต์สำรอง
  }
}

export const setFont = (ctx, weight, px, family) => { ctx.font = `${weight} ${px}px ${family}`; };

// เขียนข้อความบรรทัดเดียว ถ้ายาวเกิน maxWidth ให้ย่อตัวหนังสือลงจนพอดี
export function fitText(ctx, text, x, y, maxWidth, px, weight, family, align = 'center') {
  let size = px;
  setFont(ctx, weight, size, family);
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 1;
    setFont(ctx, weight, size, family);
  }
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

// เขียนข้อความหลายบรรทัด คืนจำนวนบรรทัดที่ใช้
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const lines = wrapLines(text, (value) => ctx.measureText(value).width, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.fill();
  ctx.restore();
}

export function heart(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.3);
  ctx.bezierCurveTo(cx, cy, cx - s * 0.5, cy, cx - s * 0.5, cy + s * 0.3);
  ctx.bezierCurveTo(cx - s * 0.5, cy + s * 0.6, cx, cy + s * 0.8, cx, cy + s);
  ctx.bezierCurveTo(cx, cy + s * 0.8, cx + s * 0.5, cy + s * 0.6, cx + s * 0.5, cy + s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.5, cy, cx, cy, cx, cy + s * 0.3);
  ctx.fill();
  ctx.restore();
}

// ตราประทับขอบหยัก มีหัวใจกับคำว่า FAN PROJECT ตรงกลาง
function seal(ctx, cx, cy, r, color, ink) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 48; i += 1) {
    const angle = (Math.PI * 2 * i) / 48;
    const radius = i % 2 ? r : r * 0.92;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.74, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  heart(ctx, cx, cy - r * 0.42, r * 0.5, ink);
  ctx.fillStyle = ink;
  setFont(ctx, 500, r * 0.17, HEAD);
  ctx.textAlign = 'center';
  ctx.fillText('FAN PROJECT', cx, cy + r * 0.38);
  ctx.restore();
}

function footerLine(ctx, data, W, u, color, y) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  setFont(ctx, 400, 15 * u, BODY);
  ctx.textAlign = 'center';
  ctx.fillText(`เลขที่ ${data.serial}`, W / 2, y);
  ctx.restore();
}

// ผู้ลงนามบรรทัดเดียว เช่น "Cartoon Fan Project · ทีมแอดมิน" (ไม่มีตำแหน่งก็เหลือแค่ชื่อ)
const signerLine = (d) => [d.signer, d.signerTitle].filter(Boolean).join('  ·  ');

// ช่องลงนาม: ข้อความบนเส้น (ชื่อผู้ลงนาม หรือวันที่) กับคำกำกับใต้เส้น
function signBlock(ctx, x, y, w, u, top, bottom, { ink, soft, line, hand = false }) {
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();
  ctx.fillStyle = ink;
  if (hand) fitText(ctx, top, x, y - 14 * u, w, 28 * u, 600, HAND);
  else fitText(ctx, top, x, y - 14 * u, w, 22 * u, 500, BODY);
  ctx.fillStyle = soft;
  if (bottom) fitText(ctx, bottom, x, y + 28 * u, w, 17 * u, 400, BODY);
}

// สีแบบ #rrggbb → rgba() ที่ปรับความโปร่งได้
function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const CLASSIC_THEME = {
  paper: '#fbf8f2', ink: '#3d3226', accent: '#a8822f', line: '#c09a45', soft: '#8a7a66', sealInk: '#fbf8f2',
  dots: 'rgba(192, 154, 69, 0.07)', frame: true, seal: true, image: null,
};

function customTheme(design) {
  const { bg, accent, ink, frame, seal, image } = normalizeDesign(design);
  return {
    paper: bg, ink, accent, line: accent, soft: withAlpha(ink, 0.72), sealInk: bg, dots: null, frame, seal, image,
  };
}

// เกียรติบัตรแบบทางการ: ใช้ทั้งแบบ "คลาสสิก" และ "ออกแบบเอง" ต่างกันที่ชุดสี กรอบ และภาพพื้นหลัง
function drawFormal(ctx, d, W, H, u, portrait, t) {
  const { ink, accent, line, soft } = t;
  const cx = W / 2;
  const m = 34 * u;

  ctx.fillStyle = t.paper;
  ctx.fillRect(0, 0, W, H);
  if (t.image) {
    // ภาพพื้นหลังของผู้ใช้: ขยายให้เต็มภาพ ส่วนที่เกินถูกตัดเท่ากันทั้งสองด้าน
    const scale = Math.max(W / t.image.width, H / t.image.height);
    ctx.drawImage(t.image, (W - t.image.width * scale) / 2, (H - t.image.height * scale) / 2, t.image.width * scale, t.image.height * scale);
  }
  if (t.dots) {
    // ลายจุดจาง ๆ
    ctx.fillStyle = t.dots;
    for (let row = 0, y = 0; y < H; row += 1, y += 26 * u) {
      for (let x = (row % 2) * 13 * u; x < W; x += 26 * u) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6 * u, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  if (t.frame) {
    ctx.strokeStyle = line;
    ctx.lineWidth = 6 * u;
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = 1.5 * u;
    ctx.strokeRect(m + 14 * u, m + 14 * u, W - 2 * m - 28 * u, H - 2 * m - 28 * u);
    [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(([x, y]) => star(ctx, x, y, 22 * u, line));
  }

  let y = (portrait ? 330 : 190) * u;
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  fitText(ctx, 'C E R T I F I C A T E   O F   A P P R E C I A T I O N', cx, y - 70 * u, W * 0.8, 20 * u, 500, HEAD);
  ctx.fillStyle = ink;
  setFont(ctx, 600, 78 * u, HEAD);
  ctx.fillText('เกียรติบัตร', cx, y + 12 * u);
  y += 72 * u;
  ctx.fillStyle = soft;
  setFont(ctx, 400, 24 * u, BODY);
  ctx.fillText('ขอมอบให้ไว้เพื่อแสดงว่า', cx, y);
  y += 92 * u;
  ctx.fillStyle = ink;
  fitText(ctx, d.name, cx, y, W * 0.72, 70 * u, 600, HAND);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  ctx.moveTo(cx - W * 0.26, y + 30 * u);
  ctx.lineTo(cx + W * 0.26, y + 30 * u);
  ctx.stroke();
  y += 74 * u;
  ctx.fillStyle = ink;
  setFont(ctx, 400, 26 * u, BODY);
  ctx.textAlign = 'center';
  ctx.fillText('ได้ร่วมเป็น', cx, y);
  y += 46 * u;
  ctx.fillStyle = accent;
  fitText(ctx, d.role, cx, y, W * 0.7, 36 * u, 500, HEAD);
  y += 46 * u;
  ctx.fillStyle = ink;
  setFont(ctx, 400, 26 * u, BODY);
  ctx.fillText('ใน', cx, y);
  y += 48 * u;
  setFont(ctx, 500, 34 * u, HEAD);
  y += (wrapText(ctx, d.project, cx, y, W * 0.74, 44 * u) - 1) * 44 * u;
  if (d.message) {
    y += 48 * u;
    ctx.fillStyle = soft;
    setFont(ctx, 400, 22 * u, BODY);
    wrapText(ctx, `“${d.message}”`, cx, y, W * 0.7, 30 * u);
  }

  // แถวลงนาม: ซ้าย = วันที่ที่ให้ไว้ ขวา = ผู้ลงนาม ตราประทับอยู่กลาง (แนวตั้งตราอยู่เหนือแถว)
  const sy = H - (portrait ? 175 : 150) * u;
  const blockW = (portrait ? 330 : 330) * u;
  const offset = portrait ? W * 0.24 : W * 0.26;
  const colors = { ink, soft, line };
  signBlock(ctx, cx - offset, sy, blockW, u, d.date, 'ให้ไว้ ณ วันที่', colors);
  signBlock(ctx, cx + offset, sy, blockW, u, d.signer, d.signerTitle, { ...colors, hand: true });
  if (t.seal) seal(ctx, cx, portrait ? sy - 165 * u : sy - 10 * u, (portrait ? 58 : 64) * u, line, t.sealInk);
  footerLine(ctx, d, W, u, soft, H - m - 30 * u);
}

function drawPastel(ctx, d, W, H, u, portrait) {
  const ink = '#5a3a48';
  const pink = '#e46b86';
  const soft = '#9b7a86';
  const cx = W / 2;
  const m = 56 * u;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#ffd9e2');
  bg.addColorStop(0.5, '#ffeedd');
  bg.addColorStop(1, '#dfe9ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ของตกแต่ง: สุ่มด้วย seed คงที่ ให้ได้ลายเดิมทุกครั้งที่วาด
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 40; i += 1) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = (8 + rnd() * 18) * u;
    const kind = rnd();
    if (kind < 0.45) star(ctx, x, y, r, `rgba(255, 255, 255, ${0.5 + rnd() * 0.4})`);
    else if (kind < 0.8) heart(ctx, x, y, r * 1.6, `rgba(232, 122, 144, ${0.25 + rnd() * 0.3})`);
    else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.shadowColor = 'rgba(200, 120, 140, 0.25)';
  ctx.shadowBlur = 40 * u;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  roundRect(ctx, m, m, W - 2 * m, H - 2 * m, 40 * u);
  ctx.fill();
  ctx.restore();
  ctx.setLineDash([10 * u, 10 * u]);
  ctx.strokeStyle = '#f2a5b5';
  ctx.lineWidth = 2.5 * u;
  roundRect(ctx, m + 16 * u, m + 16 * u, W - 2 * m - 32 * u, H - 2 * m - 32 * u, 30 * u);
  ctx.stroke();
  ctx.setLineDash([]);

  let y = (portrait ? 360 : 190) * u;
  // ป้ายหัว
  const tag = 'THANK YOU FOR YOUR SUPPORT';
  setFont(ctx, 500, 24 * u, HEAD);
  const tagWidth = ctx.measureText(tag).width + 50 * u;
  ctx.fillStyle = pink;
  roundRect(ctx, cx - tagWidth / 2, y - 74 * u, tagWidth, 44 * u, 22 * u);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(tag, cx, y - 43 * u);
  ctx.fillStyle = ink;
  setFont(ctx, 600, 72 * u, HEAD);
  ctx.fillText('เกียรติบัตร', cx, y + 40 * u);
  y += 96 * u;
  ctx.fillStyle = soft;
  setFont(ctx, 400, 24 * u, BODY);
  ctx.fillText('ขอบคุณจากใจแฟนคลับน้องการ์ตูน มอบให้', cx, y);
  y += 90 * u;
  ctx.fillStyle = pink;
  fitText(ctx, d.name, cx, y, W * 0.7, 70 * u, 600, HEAD);
  y += 64 * u;
  ctx.fillStyle = ink;
  setFont(ctx, 400, 26 * u, BODY);
  ctx.textAlign = 'center';
  ctx.fillText('ในฐานะ', cx, y);
  setFont(ctx, 500, 28 * u, HEAD);
  const roleWidth = Math.min(ctx.measureText(d.role).width + 60 * u, W * 0.7);
  y += 22 * u;
  ctx.fillStyle = '#ffe3ea';
  roundRect(ctx, cx - roleWidth / 2, y, roleWidth, 54 * u, 27 * u);
  ctx.fill();
  ctx.fillStyle = pink;
  fitText(ctx, d.role, cx, y + 38 * u, roleWidth - 40 * u, 28 * u, 500, HEAD);
  y += 104 * u;
  ctx.fillStyle = ink;
  setFont(ctx, 500, 32 * u, HEAD);
  y += (wrapText(ctx, d.project, cx, y, W * 0.72, 42 * u) - 1) * 42 * u;
  if (d.message) {
    y += 46 * u;
    ctx.fillStyle = soft;
    setFont(ctx, 400, 22 * u, BODY);
    wrapText(ctx, d.message, cx, y, W * 0.66, 30 * u);
  }

  const sy = H - (portrait ? 170 : 140) * u;
  ctx.fillStyle = ink;
  fitText(ctx, signerLine(d), cx, sy - 34 * u, W * 0.76, 22 * u, 500, HEAD);
  ctx.fillStyle = soft;
  fitText(ctx, `ให้ไว้ ณ วันที่ ${d.date}`, cx, sy, W * 0.76, 20 * u, 400, BODY);
  footerLine(ctx, d, W, u, soft, sy + 40 * u);
}

function drawCard(ctx, d, W, H, u, portrait, photo) {
  const gold = '#d9b65c';
  const soft = '#c9c3dd';
  const white = '#fbf8f2';

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1d2440');
  bg.addColorStop(1, '#2e2350');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // แถบโฮโลแกรมบนล่าง
  const holo = ctx.createLinearGradient(0, 0, W, 0);
  ['#f7d9a0', '#f5b9cf', '#b9d4f5', '#c9f0dc', '#f7d9a0'].forEach((color, i, all) => holo.addColorStop(i / (all.length - 1), color));
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = holo;
  ctx.fillRect(0, 0, W, 16 * u);
  ctx.fillRect(0, H - 16 * u, W, 16 * u);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 60; i += 1) {
    star(ctx, (i * 137.5 * u) % W, (i * 91.3 * u) % H, (3 + (i % 4)) * u, 'rgba(217, 182, 92, 0.25)');
  }

  // รูปโปรไฟล์ (หรือวงกลมตัวอักษรแรกของชื่อ ถ้าไม่ได้ใส่รูป)
  const pr = (portrait ? 150 : 170) * u;
  const pcx = portrait ? W / 2 : 300 * u;
  const pcy = portrait ? 360 * u : H / 2 - 30 * u;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
  ctx.clip();
  if (photo && photo.width && photo.height) {
    const scale = Math.max((2 * pr) / photo.width, (2 * pr) / photo.height);
    ctx.drawImage(photo, pcx - (photo.width * scale) / 2, pcy - (photo.height * scale) / 2, photo.width * scale, photo.height * scale);
  } else {
    const fill = ctx.createLinearGradient(pcx - pr, pcy - pr, pcx + pr, pcy + pr);
    fill.addColorStop(0, '#f5b9cf');
    fill.addColorStop(1, '#b9d4f5');
    ctx.fillStyle = fill;
    ctx.fillRect(pcx - pr, pcy - pr, 2 * pr, 2 * pr);
    ctx.fillStyle = '#2e2350';
    setFont(ctx, 600, pr * 0.9, HEAD);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initialOf(d.name), pcx, pcy + 4 * u);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 6 * u;
  ctx.beginPath();
  ctx.arc(pcx, pcy, pr + 8 * u, 0, Math.PI * 2);
  ctx.stroke();
  if (!portrait) {
    ctx.textAlign = 'center';
    ctx.fillStyle = soft;
    setFont(ctx, 400, 17 * u, BODY);
    ctx.fillText('MEMBER NO.', pcx, pcy + pr + 60 * u);
    ctx.fillStyle = gold;
    setFont(ctx, 500, 24 * u, HEAD);
    ctx.fillText(d.serial, pcx, pcy + pr + 92 * u);
  }

  // ข้อความ: แนวตั้งจัดกลางใต้รูป แนวนอนชิดซ้ายข้างรูป
  const tx = portrait ? W / 2 : 560 * u;
  const align = portrait ? 'center' : 'left';
  const maxWidth = portrait ? W * 0.84 : W - tx - 90 * u;
  let y = portrait ? pcy + pr + 90 * u : 260 * u;
  ctx.fillStyle = gold;
  fitText(ctx, 'CARTOON FAN PROJECT · CERTIFIED SUPPORTER', tx, y, maxWidth, 20 * u, 500, HEAD, align);
  y += 70 * u;
  ctx.fillStyle = white;
  fitText(ctx, 'เกียรติบัตรผู้ร่วมโปรเจกต์', tx, y, maxWidth, 56 * u, 600, HEAD, align);
  y += 90 * u;
  ctx.fillStyle = gold;
  fitText(ctx, d.name, tx, y, maxWidth, 64 * u, 600, HEAD, align);
  y += 56 * u;
  ctx.fillStyle = soft;
  setFont(ctx, 400, 24 * u, BODY);
  ctx.textAlign = align;
  ctx.fillText('บทบาท', tx, y);
  ctx.fillStyle = white;
  if (portrait) {
    y += 40 * u;
    fitText(ctx, d.role, tx, y, maxWidth, 30 * u, 500, HEAD, 'center');
  } else {
    fitText(ctx, d.role, tx + 100 * u, y, maxWidth - 100 * u, 28 * u, 500, HEAD, 'left');
  }
  y += 50 * u;
  ctx.fillStyle = soft;
  setFont(ctx, 400, 24 * u, BODY);
  ctx.textAlign = align;
  ctx.fillText('โปรเจกต์', tx, y);
  y += 42 * u;
  ctx.fillStyle = white;
  setFont(ctx, 500, 30 * u, HEAD);
  y += (wrapText(ctx, d.project, tx, y, maxWidth, 40 * u) - 1) * 40 * u;
  if (d.message) {
    y += 46 * u;
    ctx.fillStyle = soft;
    setFont(ctx, 400, 21 * u, BODY);
    wrapText(ctx, d.message, tx, y, maxWidth, 30 * u);
  }

  y = H - (portrait ? 100 : 80) * u;
  ctx.fillStyle = soft;
  const issued = portrait ? `ให้ไว้ ณ วันที่ ${d.date}  ·  เลขที่ ${d.serial}` : `ให้ไว้ ณ วันที่ ${d.date}`;
  fitText(ctx, issued, tx, y, maxWidth, 19 * u, 400, BODY, align);
  ctx.fillStyle = white;
  fitText(ctx, signerLine(d), tx, y - 34 * u, maxWidth, 21 * u, 500, HEAD, align);
}

const DRAWERS = {
  classic: (ctx, d, W, H, u, portrait) => drawFormal(ctx, d, W, H, u, portrait, CLASSIC_THEME),
  pastel: drawPastel,
  card: drawCard,
  custom: (ctx, d, W, H, u, portrait, photo, design) => drawFormal(ctx, d, W, H, u, portrait, customTheme(design)),
};

// วาดเกียรติบัตรลง canvas (ต้องตั้งขนาด canvas ตาม sizeOf(size) ก่อน)
export function drawCertificate(ctx, data, { template, size, photo = null, design = null } = {}) {
  const { width, height, unit, portrait } = sizeOf(size);
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.textBaseline = 'alphabetic';
  DRAWERS[templateOf(template)](ctx, data, width, height, unit, portrait, photo, design);
  ctx.restore();
}
