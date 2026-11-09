import React from 'react';

// ไอคอนเส้นที่ใช้ในปุ่มและการ์ด สีตามตัวหนังสือ
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ArrowRight = () => (
  <svg {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const MusicNote = () => (
  <svg {...base} width={24} height={24}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
);

export const Cross = () => (
  <svg {...base} width={24} height={24}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
