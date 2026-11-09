import events from './events.json';

// วันนี้ในรูปแบบ YYYY-MM-DD ตามเวลาเครื่องผู้ชม เทียบกับวันที่ในไฟล์ได้ตรง ๆ
const today = new Date().toLocaleDateString('en-CA');

const byDate = (a, b) => a.date.localeCompare(b.date);

export const upcoming = events.filter((event) => event.date >= today).sort(byDate);
export const past = events.filter((event) => event.date < today).sort(byDate).reverse();
