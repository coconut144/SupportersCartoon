// นับถอยหลังถึงงาน: เวลาเริ่มอ่านจากบรรทัดแรกของ schedule (เช่น "12:00 Door Open") คิดเป็นเวลาไทย
// ถ้าไม่มีเวลาในตาราง ถือว่าเริ่มต้นวัน (00:00)

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function startTimeOf(event) {
  const first = (event.schedule && event.schedule[0]) || '';
  const match = first.match(/(\d{1,2})[:.](\d{2})/);
  const hh = match ? match[1].padStart(2, '0') : '00';
  const mm = match ? match[2] : '00';
  return {
    start: new Date(`${event.date}T${hh}:${mm}:00+07:00`),
    clock: match ? `${hh}:${mm}` : null,
  };
}

// วันที่ปัจจุบันตามเวลาไทย (YYYY-MM-DD) ให้ทุกคนเห็น "วันนี้!" ตรงกันไม่ว่าเครื่องตั้งโซนเวลาไหน
const bangkokDate = (now) => new Date(now.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);

// คืน { text, isToday } หรือ null ถ้างานผ่านไปแล้ว
export function countdownOf(event, now = new Date()) {
  const { start, clock } = startTimeOf(event);
  const isToday = event.date === bangkokDate(now);
  const diff = start.getTime() - now.getTime();

  if (isToday) {
    if (!clock) return { text: 'วันนี้!', isToday };
    if (diff <= 0) return { text: 'กำลังจัดอยู่ตอนนี้!', isToday };
    const hours = Math.floor(diff / HOUR);
    const minutes = Math.floor((diff % HOUR) / 60000);
    const left = hours > 0 ? `อีก ${hours} ชั่วโมง ${minutes} นาที` : `อีก ${Math.max(1, minutes)} นาที`;
    return { text: `เริ่ม ${clock} · ${left}`, isToday };
  }

  if (diff <= 0) return null;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HOUR);
  if (days === 0) {
    const minutes = Math.floor((diff % HOUR) / 60000);
    return { text: `อีก ${hours} ชั่วโมง ${minutes} นาที`, isToday };
  }
  return { text: hours > 0 ? `อีก ${days} วัน ${hours} ชั่วโมง` : `อีก ${days} วัน`, isToday };
}
