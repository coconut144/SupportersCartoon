// วันที่ในไฟล์ข้อมูลเก็บเป็น YYYY-MM-DD จึงจัดรูปแบบด้วย UTC เพื่อไม่ให้วันเลื่อนตามโซนเวลา
export function formatDate(isoDate, locale, month = 'short') {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: 'numeric',
    month,
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// แยกวันที่สำหรับต้นขั้วตั๋ว: วัน (14) เดือน (พ.ย.) ปี (2569)
export function dateParts(isoDate) {
  const date = new Date(isoDate);
  const part = (options) => date.toLocaleDateString('th-TH', { ...options, timeZone: 'UTC' });
  return {
    day: part({ day: 'numeric' }),
    month: part({ month: 'short' }),
    year: part({ year: 'numeric' }).replace(/\D/g, ''),
  };
}
