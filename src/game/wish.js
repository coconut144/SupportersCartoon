// คำอวยพรถึงแฟนคลับ: QR บนบัตรแฟนคลับลิงก์มาที่ /wish แล้วสุ่มคำอวยพรให้ 1 ข้อทุกครั้งที่สแกน
// อยากเพิ่ม/แก้คำอวยพร แก้ในรายการ WISHES ได้เลย

import { SITE_URL } from './shared';

export const WISHES = [
  'ขอให้วันนี้เป็นวันที่ดี ยิ้มได้ทั้งวัน',
  'ขอให้ถูกหวยรางวัลที่ 1',
  'ขอให้กดบัตรทันทุกงาน',
  'ขอให้ได้ยืนแถวหน้าทุกคอนเสิร์ต',
  'ขอให้น้องการ์ตูนจำชื่อได้ตั้งแต่ครั้งแรก',
  'ขอให้สุ่มรูปได้ใบที่อยากได้',
  'ขอให้งานผ่าน สอบผ่าน ทุกอย่างผ่านฉลุย',
  'ขอให้เงินเดือนออกไวกว่าทุกเดือน',
  'ขอให้กินก๋วยเตี๋ยวน้ำตกแล้วไม่เจอผักสักใบ',
  'ขอให้สุขภาพแข็งแรง ไปเชียร์น้องได้ทุกงาน',
  'ขอให้แท่งไฟไม่แบตหมดกลางคอน',
  'ขอให้รถไม่ติดตอนไปงาน',
  'ขอให้ได้รูปคู่กับน้องสักครั้ง',
  'ขอให้นอนหลับฝันดี ตื่นมาสดชื่น',
  'ขอให้เจอแต่คนน่ารักใจดี',
  'ขอให้โชคดีเรื่องความรัก',
  'ขอให้เพื่อน ๆ ในกลุ่มแฟนคลับเป็นกำลังใจให้กันเสมอ',
  'ขอให้มีความสุขเหมือนวันที่ได้เจอน้องครั้งแรก',
];

export const NAME_MAX = 16;

// ลิงก์ใน QR: ใส่ชื่อเล่นกับเลขสมาชิกไว้ให้หน้า /wish ทักทายถูกคน (ไม่เก็บข้อมูลบน server)
export function wishUrl(member) {
  const params = new URLSearchParams({ to: member.name, no: member.no });
  return `${SITE_URL}/wish?${params.toString()}`;
}

// อ่านชื่อจากลิงก์อย่างระวัง: ตัดอักขระควบคุม ยาวไม่เกิน NAME_MAX เลขสมาชิกต้องเป็นตัวเลข 4 หลัก
export function readWishParams(search) {
  const params = new URLSearchParams(search);
  const visible = [...(params.get('to') || '')].filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127);
  const name = visible.join('').replace(/\s+/g, ' ').trim();
  const no = params.get('no') || '';
  return {
    name: [...name].slice(0, NAME_MAX).join(''),
    no: /^\d{4}$/.test(no) ? no : '',
  };
}

// สุ่มคำอวยพร ไม่ซ้ำกับข้อที่เพิ่งได้ (ตอนกด "สุ่มอีกใบ")
export function pickWish(rng = Math.random, previous = null) {
  const pool = WISHES.filter((wish) => wish !== previous);
  return pool[Math.floor(rng() * pool.length)];
}
