import './Section.css';
import './Game.css';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { W, H, createState, start, update, jump, render, metersOf, scoreOf, HEART_POINTS } from './game/nextGirls';
import { SITE_URL, readBest, saveBest, shareScore, useGameLoop } from './game/shared';

const BEST_KEY = 'next-girls-best';

function NextGirlsGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createState());
  const [phase, setPhase] = useState('ready');
  const [meters, setMeters] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [shareNote, setShareNote] = useState('');
  const score = meters + hearts * HEART_POINTS;

  useGameLoop(canvasRef, stateRef, {
    step: (state, dt) => update(state, dt),
    draw: render,
    onFrame: (state) => {
      setMeters(metersOf(state));
      setHearts(state.hearts);
      if (state.phase === 'over' && phase === 'playing') {
        setPhase('over');
        const final = scoreOf(state);
        if (final > best) {
          saveBest(BEST_KEY, final);
          setBest(final);
        }
      }
    },
  });

  const handleStart = () => {
    start(stateRef.current);
    setShareNote('');
    setPhase('playing');
  };

  // กด Space หรือลูกศรขึ้นเพื่อกระโดดได้ด้วย (เฉพาะตอนกำลังเล่น จะได้ไม่ไปกันการเลื่อนหน้า)
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const onKey = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        jump(stateRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleShare = async () => {
    const result = await shareScore(
      `พาน้องการ์ตูนวิ่งสู่ Next Girls ได้ ${score} คะแนน 🌟 #StandByToon`,
      `${SITE_URL}/game/next-girls`,
    );
    if (result === 'copied') setShareNote('คัดลอกข้อความแล้ว');
  };

  return (
    <section className="section game">
      <h1 className="visually-hidden">เกม Journey to Next Girls</h1>
      <Link to="/game" className="game-back">← เกมทั้งหมด</Link>

      <div className="game-hud" aria-live="polite">
        <span>ระยะ <strong>{meters}</strong> ม.</span>
        <span className="game-hearts" aria-label={`เก็บหัวใจได้ ${hearts} ดวง`}>
          <span className="life" aria-hidden="true">♥</span> <strong>{hearts}</strong>
        </span>
      </div>

      <div className="game-stage game-stage-wide">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="game-canvas"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={() => jump(stateRef.current)}
          aria-label="น้องการ์ตูนวิ่งบนเวที แตะเพื่อกระโดด"
        />

        {phase === 'ready' && (
          <div className="game-panel">
            <h2>Journey to Next Girls</h2>
            <p>พาน้องการ์ตูนวิ่งไปให้ถึงดาว!</p>
            <ul>
              <li>แตะจอ หรือกด Space เพื่อกระโดด</li>
              <li>หลบลำโพงกับกล่องอุปกรณ์</li>
              <li>เก็บหัวใจได้ดวงละ {HEART_POINTS} คะแนน</li>
            </ul>
            <button type="button" className="game-btn" onClick={handleStart}>เริ่มวิ่ง</button>
            {best > 0 && <p className="game-best">สถิติของคุณ {best} คะแนน</p>}
          </div>
        )}

        {phase === 'over' && (
          <div className="game-panel">
            <h2>สะดุดซะแล้ว</h2>
            <p className="game-final">{score} คะแนน</p>
            <p className="game-best">วิ่งได้ {meters} ม. · เก็บหัวใจ {hearts} ดวง</p>
            <p className="game-best">
              {score > 0 && score >= best ? 'สถิติใหม่!' : `สถิติของคุณ ${best} คะแนน`}
            </p>
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleStart}>วิ่งอีกครั้ง</button>
              <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์คะแนน</button>
            </div>
            {shareNote && <p className="game-best">{shareNote}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

export default NextGirlsGame;
