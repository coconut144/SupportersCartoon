// ของที่ทุกเกมใช้ร่วมกัน: สถิติสูงสุด, การแชร์คะแนน และ loop วาดภาพ
import { useEffect, useRef } from 'react';

export const SITE_URL = 'https://standbycartoon.vercel.app';

// localStorage อาจใช้ไม่ได้ (โหมดไม่ระบุตัวตน / ปิดคุกกี้) จึงห่อ try/catch ทุกครั้ง
export function readBest(key) {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch (e) {
    return 0;
  }
}

export function saveBest(key, score) {
  try {
    window.localStorage.setItem(key, String(score));
  } catch (e) {
    // เก็บไม่ได้ก็เล่นต่อได้ตามปกติ
  }
}

// ================== ประวัติคะแนนในเครื่อง ==================
// เก็บเป็น JSON ใน localStorage ต่อเกม: { plays: จำนวนรอบที่เล่นทั้งหมด, runs: รอบล่าสุดไม่เกิน HISTORY_LIMIT รอบ }
// แต่ละรอบมี score และ at (เวลาแบบ ISO) ใส่ข้อมูลอื่นของเกมเพิ่มได้ เช่น meters, hearts
export const HISTORY_LIMIT = 20;

const historyKey = (game) => `${game}-history`;
const emptyHistory = () => ({ plays: 0, runs: [] });

export function readHistory(game) {
  try {
    const data = JSON.parse(window.localStorage.getItem(historyKey(game)));
    if (!data || !Array.isArray(data.runs)) return emptyHistory();
    const runs = data.runs.filter((run) => run && Number.isFinite(run.score) && typeof run.at === 'string');
    return { plays: Math.max(Number(data.plays) || 0, runs.length), runs };
  } catch (e) {
    return emptyHistory();
  }
}

// บันทึกรอบใหม่ไว้หน้าสุด แล้วคืน history ใหม่ พร้อมอันดับของรอบนี้เทียบกับรอบที่เก็บไว้
// (rank 1 = ดีที่สุด, เสมอกันนับเป็นอันดับเดียวกัน)
export function addRun(game, run, now = new Date()) {
  const previous = readHistory(game);
  const entry = { ...run, at: now.toISOString() };
  const history = {
    plays: previous.plays + 1,
    runs: [entry, ...previous.runs].slice(0, HISTORY_LIMIT),
  };
  try {
    window.localStorage.setItem(historyKey(game), JSON.stringify(history));
  } catch (e) {
    // เก็บไม่ได้ก็ยังแสดงผลรอบนี้ได้ตามปกติ
  }
  const rank = 1 + history.runs.filter((other) => other.score > entry.score).length;
  return { history, rank };
}

// สรุปสำหรับหน้ารวมเกม: เล่นกี่รอบ และคะแนนเฉลี่ยของรอบที่เก็บไว้ (ปัดเป็นจำนวนเต็ม)
export function summarize(history) {
  const { plays, runs } = history;
  const average = runs.length ? Math.round(runs.reduce((sum, run) => sum + run.score, 0) / runs.length) : 0;
  return { plays, average };
}

// คืนค่า 'copied' เมื่อคัดลอกข้อความแทนการแชร์ (เครื่องที่ไม่มีเมนูแชร์)
export async function shareScore(text, url) {
  try {
    if (navigator.share) {
      await navigator.share({ text, url });
      return 'shared';
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch (e) {
    // ผู้เล่นกดยกเลิกการแชร์
    return null;
  }
}

// เรียก step(state, dt) แล้ว draw(ctx, state) ทุกเฟรม และ onFrame(state) เพื่ออัปเดต HUD
export function useGameLoop(canvasRef, stateRef, { step, draw, onFrame }) {
  const handlers = useRef({ step, draw, onFrame });
  handlers.current = { step, draw, onFrame };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return undefined;

    let frame;
    let last = performance.now();
    const loop = (now) => {
      // จำกัด dt ไว้ ไม่ให้ของในเกมกระโดดไกลตอนสลับแท็บกลับมา
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = stateRef.current;
      handlers.current.step(state, dt);
      handlers.current.draw(ctx, state);
      handlers.current.onFrame(state);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [canvasRef, stateRef]);
}
