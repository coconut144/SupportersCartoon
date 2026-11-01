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

test('หน้าซัพพอร์ตแสดง QR เข้ากลุ่ม OPC', () => {
  window.history.pushState({}, '', '/support');
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JOIN OPC');
  expect(screen.getByText('เข้ากลุ่ม LINE OpenChat ของแฟนคลับ')).toBeInTheDocument();
  expect(screen.getByAltText('QR code JOIN OPC')).toBeInTheDocument();
});
