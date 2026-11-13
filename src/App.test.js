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
  expect(screen.getByRole('link', { name: /ทำเกียรติบัตร/ })).toHaveAttribute('href', '/game/certificate');
  expect(screen.getByRole('link', { name: /Heart to Heart/ })).toHaveAttribute('href', '/heart');
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

test('ทำเกียรติบัตร: กรอกข้อมูลแล้วเลขที่เปลี่ยนตาม เลือก "อื่น ๆ" พิมพ์เองได้ และเปลี่ยนแบบได้', () => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/game/certificate');
  render(<App />);
  fireEvent.change(screen.getByLabelText('ชื่อที่จะอยู่บนเกียรติบัตร'), { target: { value: 'มิว' } });
  const serial = screen.getByText(/เลขที่ CTN-\d{4}-[0-9A-Z]{6}/).textContent;

  fireEvent.change(screen.getByLabelText('โปรเจกต์ที่ร่วม'), { target: { value: '__other' } });
  fireEvent.change(screen.getByLabelText('พิมพ์ชื่อโปรเจกต์'), { target: { value: 'โปรเจกต์ป้ายไฟ' } });
  expect(screen.getByText(/เลขที่ CTN-\d{4}-[0-9A-Z]{6}/).textContent).not.toBe(serial);

  const templates = screen.getByRole('radiogroup', { name: 'แบบ' });
  fireEvent.click(within(templates).getByRole('radio', { name: 'พาสเทล' }));
  expect(within(templates).getByRole('radio', { name: 'พาสเทล' })).toHaveAttribute('aria-checked', 'true');
  expect(within(templates).getByRole('radio', { name: 'คลาสสิก' })).toHaveAttribute('aria-checked', 'false');

  // ผู้ลงนามแก้ได้ และแบบ "ออกแบบเอง" มีตัวเลือกสี กรอบ และภาพพื้นหลัง
  expect(screen.getByLabelText('ผู้ลงนาม')).toHaveValue('Cartoon Fan Project');
  fireEvent.change(screen.getByLabelText('ผู้ลงนาม'), { target: { value: 'พี่มิว' } });
  expect(screen.getByLabelText('ผู้ลงนาม')).toHaveValue('พี่มิว');
  expect(screen.queryByLabelText('สีพื้น')).not.toBeInTheDocument();
  fireEvent.click(within(templates).getByRole('radio', { name: 'ออกแบบเอง' }));
  fireEvent.change(screen.getByLabelText('สีพื้น'), { target: { value: '#123456' } });
  expect(screen.getByLabelText('สีพื้น')).toHaveValue('#123456');
  fireEvent.click(screen.getByLabelText('ตราประทับ'));
  expect(screen.getByLabelText('ตราประทับ')).not.toBeChecked();
  expect(screen.getByLabelText(/ภาพพื้นหลังที่ออกแบบเอง/)).toBeInTheDocument();

  // สุ่มแบบ: ได้แบบหรือชุดสีใหม่ทุกครั้งที่กด
  const picked = () => within(templates).getAllByRole('radio').find((radio) => radio.getAttribute('aria-checked') === 'true').textContent
    + (screen.queryByLabelText('สีพื้น') ? screen.getByLabelText('สีพื้น').value : '');
  const before = picked();
  fireEvent.click(screen.getByRole('button', { name: 'สุ่มแบบ' }));
  expect(picked()).not.toBe(before);
});

test('Heart to Heart: เห็นแค่จำนวนคนที่ส่ง ส่งใจแล้วจำนวนเพิ่มและได้การ์ดไว้บันทึก ไม่มีเกียรติบัตร', async () => {
  window.localStorage.clear();
  const originalFetch = global.fetch;
  global.fetch = jest.fn(async (url, options) => {
    if (!options) return { ok: true, json: async () => ({ total: 12 }) };
    const heart = { ...JSON.parse(options.body), id: 'mine', createdAt: 2 };
    delete heart.token;
    return { ok: true, json: async () => ({ heart, total: 13 }) };
  });
  try {
    window.history.pushState({}, '', '/heart');
    render(<App />);
    expect(await screen.findByText(/ส่งใจมาแล้ว/)).toHaveTextContent('ส่งใจมาแล้ว 12 คน');

    fireEvent.click(screen.getByRole('button', { name: 'ส่งใจ' }));
    expect(screen.getByRole('alert')).toHaveTextContent('พิมพ์ข้อความก่อนนะ');

    fireEvent.change(screen.getByLabelText('ข้อความถึงน้อง'), { target: { value: 'สุขสันต์วันเกิด' } });
    fireEvent.change(screen.getByLabelText('ชื่อที่แสดง'), { target: { value: 'มิว' } });
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'สีการ์ด' })).getByRole('radio', { name: 'ฟ้า' }));
    fireEvent.click(screen.getByRole('button', { name: 'ส่งใจ' }));

    expect(await screen.findByText('ขอบคุณที่ส่งใจถึงน้อง')).toBeInTheDocument();
    expect(screen.getByText(/บันทึกเก็บไว้ในเครื่องได้เลย/)).toBeInTheDocument();
    expect(screen.queryByText(/เกียรติบัตร/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/ใส่รูป/)).not.toBeInTheDocument();
    expect(screen.getByText(/ส่งใจมาแล้ว/)).toHaveTextContent('ส่งใจมาแล้ว 13 คน');
    expect(screen.getByRole('heading', { name: 'แก้การ์ดของคุณ' })).toBeInTheDocument();
    const sentBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(sentBody).toMatchObject({ name: 'มิว', message: 'สุขสันต์วันเกิด', color: 2 });
    expect(sentBody.token).toMatch(/^[A-Za-z0-9-]{16,64}$/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Heart to Heart แอดมิน: ใส่รหัสแล้วเห็นการ์ดทั้งหมดตามที่แฟนคลับแต่ง รหัสผิดขึ้นข้อความ', async () => {
  const originalFetch = global.fetch;
  global.fetch = jest.fn(async (url, options) => (options.headers['x-admin-key'] === 'right-key'
    ? { ok: true, json: async () => ({ total: 2, hearts: [
      { id: 'a', name: 'มิว', message: 'ใบแรก', kind: 'wish', color: 2, sticker: 1, pattern: 'dots', font: 'hand', createdAt: Date.UTC(2026, 10, 14, 3, 30) },
      { id: 'b', name: 'ตูนตูน', message: 'ใบสอง', kind: 'cheer', createdAt: Date.UTC(2026, 10, 14, 4) },
    ] }) }
    : { ok: false, status: 401, json: async () => ({ error: 'รหัสแอดมินไม่ถูกต้อง' }) }));
  try {
    window.history.pushState({}, '', '/heart/admin');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'โหลดการ์ดทั้งหมด' }));
    expect(screen.getByRole('alert')).toHaveTextContent('ใส่รหัสแอดมินก่อนนะ');

    fireEvent.change(screen.getByLabelText('รหัสแอดมิน'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'โหลดการ์ดทั้งหมด' }));
    expect(await screen.findByText('รหัสแอดมินไม่ถูกต้อง')).toBeInTheDocument();
    expect(screen.queryByText('ใบแรก')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('รหัสแอดมิน'), { target: { value: 'right-key' } });
    fireEvent.click(screen.getByRole('button', { name: 'โหลดการ์ดทั้งหมด' }));
    expect(await screen.findByText('ใบแรก')).toBeInTheDocument();
    expect(screen.getByText('ใบสอง')).toBeInTheDocument();
    expect(screen.getByText(/^ทั้งหมด/)).toHaveTextContent('ทั้งหมด 2 ใบ');
    expect(screen.getByText(/#1 · 2026-11-14 10:30/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดาวน์โหลดตาราง CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกการ์ดของ มิว เป็นรูป' })).toBeInTheDocument();
  } finally {
    global.fetch = originalFetch;
  }
});

test('Heart to Heart: กดสุ่มได้ข้อความตามประเภทที่เลือก กดซ้ำได้ข้อใหม่', async () => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/heart');
  render(<App />);
  const box = await screen.findByLabelText('ข้อความถึงน้อง');
  expect(screen.getByRole('link', { name: '← เกมทั้งหมด' })).toHaveAttribute('href', '/game');
  fireEvent.click(screen.getByRole('button', { name: 'สุ่มคำอวยพร' }));
  const first = box.value;
  expect(first).toMatch(/^ขอให้/);
  fireEvent.click(screen.getByRole('button', { name: 'สุ่มคำอวยพร' }));
  expect(box.value).not.toBe(first);

  fireEvent.click(within(screen.getByRole('radiogroup', { name: 'ประเภทข้อความ' })).getByRole('radio', { name: 'ให้กำลังใจ' }));
  fireEvent.click(screen.getByRole('button', { name: 'สุ่มคำให้กำลังใจ' }));
  expect(box.value).not.toMatch(/^ขอให้/);
  expect(box.value.length).toBeGreaterThan(0);
});

test('Heart to Heart: โหลดจำนวนไม่ได้ก็ไม่ขึ้นข้อความผิดพลาด ยังเขียนข้อความได้', async () => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/heart');
  render(<App />);
  expect(await screen.findByLabelText('ข้อความถึงน้อง')).toBeInTheDocument();
  expect(screen.queryByText(/ส่งใจมาแล้ว/)).not.toBeInTheDocument();
  expect(screen.queryByText(/โหลด.*ไม่ได้/)).not.toBeInTheDocument();
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
