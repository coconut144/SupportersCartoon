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
