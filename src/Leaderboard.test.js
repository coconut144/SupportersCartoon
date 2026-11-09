import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Leaderboard from './Leaderboard';

const okJson = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  delete global.fetch;
});

test('คนที่เข้ามาเห็นตารางอันดับที่มีอยู่แล้ว', async () => {
  global.fetch = jest.fn(() => okJson({ scores: [{ name: 'ตูนตูน', score: 120 }, { name: 'มิว', score: 80 }] }));
  render(<Leaderboard game="naamtok" pending={null} onSubmitted={() => {}} />);

  expect(await screen.findByText('ตูนตูน')).toBeInTheDocument();
  expect(screen.getByText('มิว')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/scores?game=naamtok', undefined);
  expect(screen.queryByRole('button', { name: 'ลงชื่อ' })).not.toBeInTheDocument();
});

test('จบรอบแล้วลงชื่อได้ ตารางอัปเดตและจำชื่อไว้ใช้รอบหน้า', async () => {
  global.fetch = jest.fn((url, options) => (
    options && options.method === 'POST'
      ? okJson({ rank: 1, scores: [{ name: 'มิว', score: 150 }] })
      : okJson({ scores: [] })
  ));
  const onSubmitted = jest.fn();
  render(<Leaderboard game="naamtok" pending={{ score: 150, id: 'run-1' }} onSubmitted={onSubmitted} />);

  expect(await screen.findByText('ยังไม่มีใครลงชื่อ เป็นคนแรกเลย!')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('ลงชื่อรอบนี้ (150 คะแนน)'), { target: { value: '  มิว ' } });
  fireEvent.click(screen.getByRole('button', { name: 'ลงชื่อ' }));

  expect(await screen.findByText('ลงชื่อแล้ว! ตอนนี้ มิว อยู่อันดับ 1')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([, opts]) => opts && opts.method === 'POST');
  expect(JSON.parse(options.body)).toEqual({ game: 'naamtok', name: 'มิว', score: 150 });
  expect(onSubmitted).toHaveBeenCalled();
  expect(window.localStorage.getItem('leaderboard-name')).toBe('มิว');
});

test('ยังไม่ใส่ชื่อ ไม่ส่งและบอกให้ใส่ชื่อ', async () => {
  global.fetch = jest.fn(() => okJson({ scores: [] }));
  render(<Leaderboard game="naamtok" pending={{ score: 10, id: 'run-1' }} onSubmitted={() => {}} />);
  await screen.findByText('ยังไม่มีใครลงชื่อ เป็นคนแรกเลย!');

  fireEvent.click(screen.getByRole('button', { name: 'ลงชื่อ' }));
  expect(screen.getByText('ใส่ชื่อเล่นก่อนนะ')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('ต่อ server ไม่ได้ แสดงข้อความแทน เกมยังเล่นได้', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) }));
  render(<Leaderboard game="naamtok" pending={null} onSubmitted={() => {}} />);
  await waitFor(() => expect(screen.getByText('ยังโหลดตารางอันดับไม่ได้ ลองใหม่ภายหลัง')).toBeInTheDocument());
});
