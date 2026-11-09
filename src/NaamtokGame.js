import './Section.css';
import './Game.css';
import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { W, H, MAX_MISSES, GOLDEN_POINTS, createState, start, update, tap, render } from './game/naamtok';
import { SITE_URL, readBest, saveBest, readHistory, addRun, shareScore, useGameLoop } from './game/shared';
import { RES } from './game/pixel';
import RunHistory from './RunHistory';
import Leaderboard from './Leaderboard';

const BEST_KEY = 'naamtok-best';
const GAME = 'naamtok';

// ข้อความใต้คะแนนตอนจบเกม: สถิติใหม่ > ติดอันดับ 3 ของรอบล่าสุด (และไม่ใช่รอบที่แย่สุด) > สถิติเดิม
function rankNote(score, best, rank, kept) {
  if (score > 0 && score >= best) return 'สถิติใหม่!';
  if (rank && rank <= 3 && rank < kept) return `ดีอันดับ ${rank} จาก ${kept} รอบล่าสุด`;
  return `สถิติของคุณ ${best} คะแนน`;
}

function NaamtokGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createState());
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [shareNote, setShareNote] = useState('');
  const [history, setHistory] = useState(() => readHistory(GAME));
  const [rank, setRank] = useState(null);
  const [pending, setPending] = useState(null); // รอบที่จบแล้วแต่ยังไม่ได้ลงชื่อในตารางอันดับ

  useGameLoop(canvasRef, stateRef, {
    step: (state, dt) => update(state, dt),
    draw: render,
    onFrame: (state) => {
      setScore(state.score);
      setMisses(state.misses);
      if (state.phase === 'over' && phase === 'playing') {
        setPhase('over');
        const saved = addRun(GAME, { score: state.score });
        setHistory(saved.history);
        setRank(saved.rank);
        setPending(state.score > 0 ? { score: state.score, id: saved.history.runs[0].at } : null);
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
    setPending(null);
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
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>

      <div className="sheet game-hud" aria-live="polite">
        <span>คะแนน <strong>{score}</strong></span>
        <span className="game-lives" aria-label={`พลาด ${misses} จาก ${MAX_MISSES} ชาม`}>
          {Array.from({ length: MAX_MISSES }, (_, i) => (
            <span key={i} className={i < MAX_MISSES - misses ? 'life' : 'life lost'} aria-hidden="true">♥</span>
          ))}
        </span>
      </div>

      <div className="game-stage">
        <span className="tape tape-center" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          width={W * RES}
          height={H * RES}
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
            <p className="game-best">{rankNote(score, best, rank, history.runs.length)}</p>
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleStart}>เล่นอีกครั้ง</button>
              <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์คะแนน</button>
            </div>
            {shareNote && <p className="game-best">{shareNote}</p>}
          </div>
        )}
      </div>

      <Leaderboard game={GAME} pending={pending} onSubmitted={() => setPending(null)} />

      <RunHistory history={history} />
    </section>
  );
}

export default NaamtokGame;
