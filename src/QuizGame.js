import './Section.css';
import './Game.css';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QUESTION_COUNT, buildQuiz, rankOf } from './game/quiz';
import { SITE_URL, readBest, saveBest, shareScore } from './game/shared';

const BEST_KEY = 'quiz-best';

// ควิซทีละข้อ: เลือกแล้วเฉลยทันที (ถูกเขียว / ผิดชมพู) แล้วกด "ข้อต่อไป"
function QuizGame() {
  const [questions, setQuestions] = useState(null); // null = หน้าเริ่ม
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [shareNote, setShareNote] = useState('');
  const nextRef = useRef(null);

  const done = questions && index >= questions.length;
  const current = questions && !done ? questions[index] : null;

  const handleStart = () => {
    setQuestions(buildQuiz());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setShareNote('');
  };

  const handlePick = (choice) => {
    if (picked !== null) return;
    setPicked(choice);
    if (choice === current.answer) setScore((s) => s + 1);
    // ย้ายโฟกัสไปปุ่มข้อต่อไป คนใช้คีย์บอร์ดกด Enter ต่อได้เลย
    setTimeout(() => nextRef.current && nextRef.current.focus(), 0);
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setPicked(null);
    if (nextIndex >= questions.length && score > best) {
      saveBest(BEST_KEY, score);
      setBest(score);
    }
  };

  const handleShare = async () => {
    const { title } = rankOf(score, questions.length);
    const result = await shareScore(
      `รู้จักน้องการ์ตูนได้ ${score}/${questions.length} ข้อ ระดับ "${title}" 🎀 #StandByToon`,
      `${SITE_URL}/game/quiz`,
    );
    if (result === 'copied') setShareNote('คัดลอกข้อความแล้ว');
  };

  const choiceClass = (choice) => {
    if (picked === null) return 'quiz-choice';
    if (choice === current.answer) return 'quiz-choice is-correct';
    if (choice === picked) return 'quiz-choice is-wrong';
    return 'quiz-choice is-dim';
  };

  return (
    <section className="section game">
      <h1 className="visually-hidden">ควิซรู้จักน้องการ์ตูนแค่ไหน</h1>
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>

      {!questions && (
        <div className="sheet quiz-card">
          <span className="tape tape-center" aria-hidden="true" />
          <h2 className="quiz-title">รู้จักน้องการ์ตูนแค่ไหน?</h2>
          <p>ตอบ {QUESTION_COUNT} ข้อเกี่ยวกับน้องการ์ตูน แล้วดูว่าคุณเป็นแฟนระดับไหน</p>
          <button type="button" className="game-btn" onClick={handleStart}>เริ่มควิซ</button>
          {best > 0 && <p className="game-best">สถิติของคุณ {best}/{QUESTION_COUNT} ข้อ</p>}
        </div>
      )}

      {current && (
        <div className="sheet quiz-card">
          <span className="tape tape-sky tape-center" aria-hidden="true" />
          <p className="quiz-progress">
            ข้อ {index + 1}/{questions.length} · ถูกแล้ว {score} ข้อ
          </p>
          <div className="quiz-bar" aria-hidden="true">
            <span style={{ width: `${((index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
          <h2 className="quiz-question">{current.question}</h2>
          <div className="quiz-choices" role="group" aria-label="ตัวเลือก">
            {current.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                className={choiceClass(choice)}
                onClick={() => handlePick(choice)}
                aria-pressed={picked === choice}
                disabled={picked !== null && picked !== choice && choice !== current.answer}
              >
                {choice}
              </button>
            ))}
          </div>
          {picked !== null && (
            <div className="quiz-feedback" role="status">
              <p className={picked === current.answer ? 'is-correct' : 'is-wrong'}>
                {picked === current.answer ? 'ถูกต้อง! เก่งมาก ♡' : `ยังไม่ใช่ คำตอบคือ "${current.answer}"`}
              </p>
              <button type="button" className="game-btn" ref={nextRef} onClick={handleNext}>
                {index + 1 < questions.length ? 'ข้อต่อไป' : 'ดูผล'}
              </button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="sheet quiz-card quiz-result">
          <span className="tape tape-center" aria-hidden="true" />
          <span className="sticker quiz-sticker" aria-hidden="true">{score}/{questions.length}</span>
          <p className="quiz-progress">คุณตอบถูก {score} จาก {questions.length} ข้อ</p>
          <h2 className="quiz-rank">{rankOf(score, questions.length).title}</h2>
          <p>{rankOf(score, questions.length).note}</p>
          <p className="game-best">
            {score > 0 && score >= best ? 'สถิติใหม่!' : `สถิติของคุณ ${best}/${QUESTION_COUNT} ข้อ`}
          </p>
          <div className="game-actions">
            <button type="button" className="game-btn" onClick={handleStart}>เล่นอีกครั้ง</button>
            <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์ผล</button>
          </div>
          {shareNote && <p className="game-best">{shareNote}</p>}
        </div>
      )}
    </section>
  );
}

export default QuizGame;
