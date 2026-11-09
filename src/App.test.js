import { render, screen, within, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/');
  // jsdom วาด canvas ไม่ได้ เกมจะข้ามการวาดเมื่อไม่มี context
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('แสดงเมนูหลักครบทุกหน้า', () => {
  render(<App />);
  const nav = screen.getByRole('navigation');
  ['หน้าหลัก', 'กิจกรรม', 'วิดีโอ', 'ซัพพอร์ต', 'เกม'].forEach((label) => {
    expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
  });
});

test('หน้าแรกแสดงโปรไฟล์ศิลปินจากไฟล์ข้อมูล', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cartoon');
  expect(screen.getByText(/ณัฎฐธิดา ณ อัมภัย/)).toBeInTheDocument();
  expect(screen.getByText('26 สิงหาคม 2552')).toBeInTheDocument();
  expect(screen.getByText(/แพนด้าแดง/)).toBeInTheDocument();
  expect(screen.getByText('163 ซม.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'BNK48 Official Website' })).toHaveAttribute('href', expect.stringContaining('bnk48.com'));
});

test('footer แสดงช่องทางการติดตาม', () => {
  render(<App />);
  const footer = screen.getByRole('contentinfo');
  ['Facebook', 'Instagram', 'TikTok'].forEach((name) => {
    expect(within(footer).getByRole('link', { name })).toHaveAttribute('target', '_blank');
  });

  // เลขเวอร์ชันมาจาก package.json ผ่าน .env (ต้องรันด้วย npm test)
  expect(within(footer).getByText(`v${require('../package.json').version}`)).toBeInTheDocument();
});

test('หน้าซัพพอร์ตแสดง QR เข้ากลุ่ม OPC, TikTok และ X แฟนคลับ', () => {
  window.history.pushState({}, '', '/support');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'JOIN OPC' })).toBeInTheDocument();
  expect(screen.getByText('เข้ากลุ่ม LINE OpenChat ของแฟนคลับ')).toBeInTheDocument();
  expect(screen.getByAltText('QR code เข้ากลุ่ม LINE OpenChat ของแฟนคลับ')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เข้ากลุ่มใน LINE' })).toHaveAttribute('href', expect.stringMatching(/^https:\/\/line\.me\//));
  expect(screen.getByRole('link', { name: 'ไปที่ TikTok' })).toHaveAttribute('href', 'https://www.tiktok.com/@cartoonbnk48thfc');
  expect(screen.getByRole('link', { name: 'ไปที่ X' })).toHaveAttribute('href', 'https://x.com/cartoonbnk_thfc');
});

test('หน้าวิดีโอเรียงหมวด Highlight, Music Video, Performance, Variety', () => {
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
  expect(screen.getAllByText('MCC Hall, The Mall Lifestore Bangkapi')).toHaveLength(3);
  expect(screen.getAllByRole('link', { name: 'ซื้อบัตร' })).toHaveLength(2);
  expect(screen.getAllByAltText(/^โปสเตอร์ /)).toHaveLength(4);
});

test('หน้ารวมเกมมีลิงก์ไปทั้งสองเกม', () => {
  window.history.pushState({}, '', '/game');
  render(<App />);
  expect(screen.getByRole('link', { name: /น้ำตกไม่ผัก/ })).toHaveAttribute('href', '/game/naamtok');
  expect(screen.getByRole('link', { name: /Stage Runner/ })).toHaveAttribute('href', '/game/next-girls');
});

test('เกมน้ำตกไม่ผักเริ่มเล่นได้ และแสดงคะแนนกับจำนวนครั้งที่พลาด', () => {
  window.history.pushState({}, '', '/game/naamtok');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'น้ำตกไม่ผัก' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'เริ่มเล่น' }));
  expect(screen.queryByRole('button', { name: 'เริ่มเล่น' })).not.toBeInTheDocument();
  expect(screen.getByText('คะแนน')).toBeInTheDocument();
  expect(screen.getByLabelText('พลาด 0 จาก 3 ชาม')).toBeInTheDocument();
});

test('เกม Stage Runner เริ่มวิ่งได้ และแสดงระยะกับหัวใจ', () => {
  window.history.pushState({}, '', '/game/next-girls');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Stage Runner' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'เริ่มวิ่ง' }));
  expect(screen.queryByRole('button', { name: 'เริ่มวิ่ง' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('เก็บหัวใจได้ 0 ดวง')).toBeInTheDocument();
});

test('หน้ารวมเกมมีควิซและบัตรแฟนคลับด้วย', () => {
  window.history.pushState({}, '', '/game');
  render(<App />);
  expect(screen.getByRole('link', { name: /รู้จักน้องการ์ตูนแค่ไหน/ })).toHaveAttribute('href', '/game/quiz');
  expect(screen.getByRole('link', { name: /ทำบัตรแฟนคลับ/ })).toHaveAttribute('href', '/game/card');
});

test('ควิซเล่นได้ครบ 10 ข้อแล้วได้ระดับแฟน', () => {
  window.history.pushState({}, '', '/game/quiz');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'เริ่มควิซ' }));
  for (let i = 0; i < 10; i += 1) {
    expect(screen.getByText(new RegExp(`^ข้อ ${i + 1}/10`))).toBeInTheDocument();
    const group = screen.getByRole('group', { name: 'ตัวเลือก' });
    fireEvent.click(within(group).getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: i < 9 ? 'ข้อต่อไป' : 'ดูผล' }));
  }
  expect(screen.getByText(/คุณตอบถูก \d+ จาก 10 ข้อ/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'แชร์ผล' })).toBeInTheDocument();
});

test('ทำบัตรแฟนคลับ: ต้องใส่ชื่อก่อน แล้วได้เลขสมาชิก', () => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/game/card');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'ทำบัตร' }));
  expect(screen.getByRole('alert')).toHaveTextContent('ใส่ชื่อเล่นก่อนนะ');
  fireEvent.change(screen.getByLabelText('ชื่อเล่นที่จะอยู่บนบัตร'), { target: { value: 'มิว' } });
  fireEvent.click(screen.getByRole('button', { name: 'ทำบัตร' }));
  expect(screen.getByText(/เลขสมาชิก FC-\d{4}/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'อัปเดตบัตร' })).toBeInTheDocument();
});

test('แต่งตัวน้องในบัตรได้ เลือกได้หมวดละหนึ่งอย่าง', () => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/game/card');
  render(<App />);
  fireEvent.change(screen.getByLabelText('ชื่อเล่นที่จะอยู่บนบัตร'), { target: { value: 'มิว' } });
  fireEvent.click(screen.getByRole('button', { name: 'ทำบัตร' }));

  const item = screen.getByRole('radiogroup', { name: 'ของในมือ' });
  expect(within(item).getByRole('radio', { name: 'ไม่มี' })).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(within(item).getByRole('radio', { name: 'แท่งไฟ' }));
  expect(within(item).getByRole('radio', { name: 'แท่งไฟ' })).toHaveAttribute('aria-checked', 'true');
  expect(within(item).getByRole('radio', { name: 'ไม่มี' })).toHaveAttribute('aria-checked', 'false');
  expect(JSON.parse(window.localStorage.getItem('fan-card')).look.item).toBe('lightstick');
});

test('สแกน QR แล้วได้หน้าคำอวยพร ทักชื่อเจ้าของบัตร และสุ่มใหม่ได้', () => {
  window.history.pushState({}, '', '/wish?to=' + encodeURIComponent('มิว') + '&no=0042');
  render(<App />);
  expect(screen.getByText('มิว')).toBeInTheDocument();
  expect(screen.getByText(/FC-0042/)).toBeInTheDocument();
  const before = document.querySelector('.wish-text').textContent;
  expect(before).toMatch(/^ขอให้/);
  fireEvent.click(screen.getByRole('button', { name: 'สุ่มอีกใบ' }));
  expect(document.querySelector('.wish-text').textContent).not.toBe(before);
  expect(screen.getByRole('link', { name: 'ทำบัตรของคุณบ้าง' })).toHaveAttribute('href', '/game/card');
});
