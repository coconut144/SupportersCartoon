import './Section.css';
import './Game.css';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { W, H, createState, start, update, jump, releaseJump, render, metersOf, scoreOf, HEART_POINTS } from './game/nextGirls';
import { SITE_URL, readBest, saveBest, readHistory, addRun, shareScore, useGameLoop } from './game/shared';
import { RES } from './game/pixel';
import RunHistory from './RunHistory';
import Leaderboard from './Leaderboard';

const BEST_KEY = 'next-girls-best';
const GAME = 'next-girls';

// ข้อความใต้คะแนนตอนจบเกม: สถิติใหม่ > ติดอันดับ 3 ของรอบล่าสุด (และไม่ใช่รอบที่แย่สุด) > สถิติเดิม
function rankNote(score, best, rank, kept) {
  if (score > 0 && score >= best) return 'สถิติใหม่!';
  if (rank && rank <= 3 && rank < kept) return `ดีอันดับ ${rank} จาก ${kept} รอบล่าสุด`;
  return `สถิติของคุณ ${best} คะแนน`;
}

const runDetail = (run) => `${run.meters} ม. · ♥ ${run.hearts}`;

function NextGirlsGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createState());
  const [phase, setPhase] = useState('ready');
  const [meters, setMeters] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [shareNote, setShareNote] = useState('');
  const [history, setHistory] = useState(() => readHistory(GAME));
  const [rank, setRank] = useState(null);
  const [pending, setPending] = useState(null); // รอบที่จบแล้วแต่ยังไม่ได้ลงชื่อในตารางอันดับ
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
        const saved = addRun(GAME, { score: final, meters: metersOf(state), hearts: state.hearts });
        setHistory(saved.history);
        setRank(saved.rank);
        setPending(final > 0 ? { score: final, id: saved.history.runs[0].at } : null);
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
    setPending(null);
    setPhase('playing');
  };

  // กด Space หรือลูกศรขึ้นเพื่อกระโดดได้ด้วย กดค้างเพื่อกระโดดสูงขึ้น (เฉพาะตอนกำลังเล่น จะได้ไม่ไปกันการเลื่อนหน้า)
  // ปล่อยนิ้วนอกจอเกมก็นับว่าปล่อย จึงฟัง pointerup ทั้งหน้าต่าง
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const isJumpKey = (event) => event.code === 'Space' || event.code === 'ArrowUp';
    const onKeyDown = (event) => {
      if (!isJumpKey(event)) return;
      event.preventDefault();
      if (!event.repeat) jump(stateRef.current);
    };
    const onKeyUp = (event) => {
      if (isJumpKey(event)) releaseJump(stateRef.current);
    };
    const onRelease = () => releaseJump(stateRef.current);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerup', onRelease);
    window.addEventListener('pointercancel', onRelease);
    window.addEventListener('blur', onRelease);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('blur', onRelease);
    };
  }, [phase]);

  const handleShare = async () => {
    const result = await shareScore(
      `พาน้องการ์ตูนวิ่งใน Stage Runner ได้ ${score} คะแนน 🌟 #StandByToon`,
      `${SITE_URL}/game/next-girls`,
    );
    if (result === 'copied') setShareNote('คัดลอกข้อความแล้ว');
  };

  return (
    <section className="section game">
      <h1 className="visually-hidden">เกม Stage Runner</h1>
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>

      <div className="sheet game-hud" aria-live="polite">
        <span>ระยะ <strong>{meters}</strong> ม.</span>
        <span className="game-hearts" aria-label={`เก็บหัวใจได้ ${hearts} ดวง`}>
          <span className="life" aria-hidden="true">♥</span> <strong>{hearts}</strong>
        </span>
      </div>

      <div className="game-stage game-stage-wide">
        <span className="tape tape-sky tape-center" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          width={W * RES}
          height={H * RES}
          className="game-canvas"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={(event) => {
            event.preventDefault();
            jump(stateRef.current);
          }}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="น้องการ์ตูนวิ่งบนเวที แตะเพื่อกระโดด กดค้างเพื่อกระโดดสูงขึ้น"
        />

        {phase === 'ready' && (
          <div className="game-panel">
            <h2>Stage Runner</h2>
            <p>พาน้องการ์ตูนวิ่งไปให้ถึงดาว!</p>
            <ul>
              <li>แตะจอ หรือกด Space เพื่อกระโดด</li>
              <li>กดค้างไว้ กระโดดได้สูงและไกลขึ้น</li>
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
            <p className="game-best">{rankNote(score, best, rank, history.runs.length)}</p>
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleStart}>วิ่งอีกครั้ง</button>
              <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์คะแนน</button>
            </div>
            {shareNote && <p className="game-best">{shareNote}</p>}
          </div>
        )}
      </div>

      <Leaderboard game={GAME} pending={pending} onSubmitted={() => setPending(null)} />

      <RunHistory history={history} detail={runDetail} />
    </section>
  );
}

export default NextGirlsGame;
