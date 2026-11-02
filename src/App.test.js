import { render, screen, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

test('แสดงเมนูหลักครบทุกหน้า', () => {
  render(<App />);
  const nav = screen.getByRole('navigation');
  ['หน้าหลัก', 'กิจกรรม', 'ผลงาน', 'ซัพพอร์ต'].forEach((label) => {
    expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
  });
});

test('หน้าแรกแสดงโปรไฟล์ศิลปินจากไฟล์ข้อมูล', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cartoon');
  expect(screen.getByText(/ณัฏฐธิดา ณ อัมภัย/)).toBeInTheDocument();
  expect(screen.getByText('26 สิงหาคม 2552')).toBeInTheDocument();
  expect(screen.getByText(/แพนด้าแดง/)).toBeInTheDocument();
});

test('footer แสดงช่องทางการติดตาม', () => {
  render(<App />);
  const footer = screen.getByRole('contentinfo');
  ['Facebook', 'Instagram', 'TikTok'].forEach((name) => {
    expect(within(footer).getByRole('link', { name })).toHaveAttribute('target', '_blank');
  });
});

test('หน้าซัพพอร์ตแสดง QR เข้ากลุ่ม OPC, TikTok และ X แฟนคลับ', () => {
  window.history.pushState({}, '', '/support');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'JOIN OPC' })).toBeInTheDocument();
  expect(screen.getByText('เข้ากลุ่ม LINE OpenChat ของแฟนคลับ')).toBeInTheDocument();
  expect(screen.getByAltText('QR code JOIN OPC')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เข้ากลุ่มใน LINE' })).toHaveAttribute('href', expect.stringMatching(/^https:\/\/line\.me\//));
  expect(screen.getByRole('link', { name: 'ไปที่ TikTok' })).toHaveAttribute('href', 'https://www.tiktok.com/@cartoonbnk48thfc');
  expect(screen.getByRole('link', { name: 'ไปที่ X' })).toHaveAttribute('href', 'https://x.com/cartoonbnk_thfc');
});

test('หน้าผลงานเรียงหมวด Highlight, Music Video, Performance, Variety', () => {
  window.history.pushState({}, '', '/work');
  render(<App />);
  const categories = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
  expect(categories.slice(0, 4)).toEqual(['Highlight', 'Music Video', 'Performance', 'Variety']);
  expect(screen.getByTitle('จะยังไงก็รักเธอ (MV full)')).toBeInTheDocument();

  // หมวดที่ตั้ง sort: newest เรียงจากวันที่ลงล่าสุดก่อน
  document.querySelectorAll('.work-category').forEach((category) => {
    const dates = [...category.querySelectorAll('.work-video time')].map((t) => t.getAttribute('datetime'));
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

test('หน้ากิจกรรมแสดงงานจากไฟล์ข้อมูลพร้อมลิงก์', () => {
  window.history.pushState({}, '', '/event');
  render(<App />);
  expect(screen.getByText(/Roadshow/)).toBeInTheDocument();
  expect(screen.getAllByText('MCC Hall, The Mall Lifestore Bangkapi')).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: 'ซื้อบัตร' })).toHaveLength(2);
});
