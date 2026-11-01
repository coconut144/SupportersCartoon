// วันที่ในไฟล์ข้อมูลเก็บเป็น YYYY-MM-DD จึงจัดรูปแบบด้วย UTC เพื่อไม่ให้วันเลื่อนตามโซนเวลา
export function formatDate(isoDate, locale, month = 'short') {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: 'numeric',
    month,
    year: 'numeric',
    timeZone: 'UTC',
  });
}
