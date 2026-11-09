import React, { useEffect, useState } from 'react';
import { fetchTop, submitScore, readName, saveName } from './game/leaderboard';

const NAME_MAX = 16;

// ตารางอันดับรวม 10 อันดับแรก ใครเข้าเว็บมาก็เห็นเหมือนกัน
// pending = { score, id } ของรอบที่เพิ่งจบ (ยังไม่ได้ลงชื่อ) ถ้ามีจะแสดงช่องลงชื่อ
function Leaderboard({ game, pending, onSubmitted }) {
  const [scores, setScores] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [name, setName] = useState(readName);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [mine, setMine] = useState(null); // ชื่อที่เพิ่งลง ไว้ไฮไลต์ในตาราง

  useEffect(() => {
    let alive = true;
    fetchTop(game)
      .then((top) => { if (alive) { setScores(top); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [game]);

  // รอบใหม่จบ: ล้างข้อความของรอบก่อน
  const pendingId = pending ? pending.id : null;
  useEffect(() => {
    if (pendingId) setMessage('');
  }, [pendingId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage('ใส่ชื่อเล่นก่อนนะ');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      const result = await submitScore(game, trimmed, pending.score);
      saveName(trimmed);
      setScores(result.scores);
      setStatus('ready');
      setMine(trimmed);
      setMessage(`ลงชื่อแล้ว! ตอนนี้ ${trimmed} อยู่อันดับ ${result.rank}`);
      onSubmitted();
    } catch (error) {
      setMessage(error.message === 'offline' ? 'ตอนนี้ส่งคะแนนไม่ได้ ลองใหม่ภายหลัง' : error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="sheet leaderboard" aria-labelledby={`leaderboard-${game}`}>
      <span className="tape tape-right" aria-hidden="true" />
      <h2 className="leaderboard-title" id={`leaderboard-${game}`}>ตารางอันดับ</h2>

      {pending && (
        <form className="leaderboard-form" onSubmit={handleSubmit}>
          <label htmlFor={`leaderboard-name-${game}`}>ลงชื่อรอบนี้ ({pending.score} คะแนน)</label>
          <div className="leaderboard-form-row">
            <input
              id={`leaderboard-name-${game}`}
              type="text"
              value={name}
              maxLength={NAME_MAX}
              placeholder="ชื่อเล่น"
              autoComplete="nickname"
              onChange={(event) => { setName(event.target.value); setMessage(''); }}
            />
            <button type="submit" className="game-btn" disabled={sending}>{sending ? 'กำลังส่ง…' : 'ลงชื่อ'}</button>
          </div>
        </form>
      )}
      {message && <p className="leaderboard-message" role="status">{message}</p>}

      {status === 'loading' && <p className="leaderboard-empty">กำลังโหลดอันดับ…</p>}
      {status === 'error' && <p className="leaderboard-empty">ยังโหลดตารางอันดับไม่ได้ ลองใหม่ภายหลัง</p>}
      {status === 'ready' && scores.length === 0 && <p className="leaderboard-empty">ยังไม่มีใครลงชื่อ เป็นคนแรกเลย!</p>}
      {status === 'ready' && scores.length > 0 && (
        <ol className="leaderboard-list">
          {scores.map((entry, index) => (
            <li key={entry.name} className={entry.name === mine ? 'is-mine' : undefined}>
              <span className={`leaderboard-rank rank-${index + 1}`}>{index + 1}</span>
              <span className="leaderboard-name">{entry.name}</span>
              <strong>{entry.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default Leaderboard;
