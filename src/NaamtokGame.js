import './Section.css';
import './Game.css';
import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { W, H, MAX_MISSES, GOLDEN_POINTS, createState, start, update, tap, render } from './game/naamtok';
import { SITE_URL, readBest, saveBest, shareScore, useGameLoop } from './game/shared';

const BEST_KEY = 'naamtok-best';

function NaamtokGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createState());
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [shareNote, setShareNote] = useState('');

  useGameLoop(canvasRef, stateRef, {
    step: (state, dt) => update(state, dt),
    draw: render,
    onFrame: (state) => {
      setScore(state.score);
      setMisses(state.misses);
      if (state.phase === 'over' && phase === 'playing') {
        setPhase('over');
        if (state.score > best) {
          saveBest(BEST_KEY, state.score);
          setBest(state.score);
        }
      }
    },
  });

  const handleStart = () => {
    start(stateRef.current);
    setShareNote('');
    setPhase('playing');
  };

  const handlePointer = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    tap(stateRef.current, x, y);
  }, []);

  const handleShare = async () => {
    const result = await shareScore(`ช่วยน้องการ์ตูนเขี่ยผักได้ ${score} คะแนน 🍜 #StandByToon`, `${SITE_URL}/game/naamtok`);
    if (result === 'copied') setShareNote('คัดลอกข้อความแล้ว');
  };

  return (
    <section className="section game">
      <h1 className="visually-hidden">เกมน้ำตกไม่ผัก</h1>
      <Link to="/game" className="game-back">← เกมทั้งหมด</Link>

      <div className="game-hud" aria-live="polite">
        <span>คะแนน <strong>{score}</strong></span>
        <span className="game-lives" aria-label={`พลาด ${misses} จาก ${MAX_MISSES} ชาม`}>
          {Array.from({ length: MAX_MISSES }, (_, i) => (
            <span key={i} className={i < MAX_MISSES - misses ? 'life' : 'life lost'} aria-hidden="true">♥</span>
          ))}
        </span>
      </div>

      <div className="game-stage">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="game-canvas"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={handlePointer}
          aria-label="สายพานชามก๋วยเตี๋ยว แตะที่ผักเพื่อเขี่ยออก"
        />

        {phase === 'ready' && (
          <div className="game-panel">
            <h2>น้ำตกไม่ผัก</h2>
            <p>น้องการ์ตูนชอบก๋วยเตี๋ยวน้ำตก แต่ไม่กินผัก!</p>
            <ul>
              <li>แตะเขี่ยผักทุกชนิด (ถั่วงอกด้วย!)</li>
              <li>อย่าเขี่ยลูกชิ้นกับหมู</li>
              <li>ผักอาจงอกใหม่ระหว่างทาง</li>
              <li>ชามทอง +{GOLDEN_POINTS} · พลาด 3 ชามจบเกม</li>
            </ul>
            <button type="button" className="game-btn" onClick={handleStart}>เริ่มเล่น</button>
            {best > 0 && <p className="game-best">สถิติของคุณ {best} คะแนน</p>}
          </div>
        )}

        {phase === 'over' && (
          <div className="game-panel">
            <h2>หมดเวลาเสิร์ฟ</h2>
            <p className="game-final">{score} คะแนน</p>
            <p className="game-best">
              {score > 0 && score >= best ? 'สถิติใหม่!' : `สถิติของคุณ ${best} คะแนน`}
            </p>
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleStart}>เล่นอีกครั้ง</button>
              <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์คะแนน</button>
            </div>
            {shareNote && <p className="game-best">{shareNote}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

export default NaamtokGame;
