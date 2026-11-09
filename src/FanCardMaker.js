import './Section.css';
import './Game.css';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CARD_W, CARD_H, NAME_MAX, LOOK_OPTIONS, cleanName, readMember, saveMember, drawFanCard, loadCardFonts,
} from './game/fanCard';
import { readName } from './game/leaderboard';
import { wishUrl } from './game/wish';

const FILE_NAME = 'cartoon-fan-card.png';

// ลิงก์เดียวกับใน QR แต่เปิดในเว็บนี้เลย (ตัดชื่อโดเมนออก)
const wishPath = (member) => {
  const url = new URL(wishUrl(member));
  return url.pathname + url.search;
};

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

// เลือกชุดของน้องทีละหมวด ปุ่มแต่ละอันเป็น radio (เลือกได้อันเดียวต่อหมวด)
function LookPicker({ look, onChange }) {
  return (
    <div className="sheet look-picker">
      <span className="tape tape-sky tape-right" aria-hidden="true" />
      <h2 className="look-title">แต่งตัวน้องในบัตร</h2>
      {Object.entries(LOOK_OPTIONS).map(([part, { label, choices }]) => (
        <div key={part} className="look-group" role="radiogroup" aria-label={label}>
          <span className="look-label">{label}</span>
          <div className="look-choices">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={look[part] === choice.id}
                className={`look-choice${look[part] === choice.id ? ' is-on' : ''}`}
                onClick={() => onChange({ ...look, [part]: choice.id })}
              >
                {choice.swatch && <span className="look-swatch" style={{ background: choice.swatch }} aria-hidden="true" />}
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ทำบัตรแฟนคลับ: ใส่ชื่อเล่น → เห็นบัตรทันที → แต่งตัวน้อง → บันทึกรูปหรือแชร์ลงสตอรี่
function FanCardMaker() {
  const canvasRef = useRef(null);
  const [member, setMember] = useState(readMember);
  const [name, setName] = useState(() => (member ? member.name : readName()));
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [canDraw, setCanDraw] = useState(true);

  // วาดบัตรใหม่ทุกครั้งที่ข้อมูลบัตรเปลี่ยน (รอฟอนต์ก่อน)
  useEffect(() => {
    if (!member) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) {
      setCanDraw(false);
      return undefined;
    }
    let alive = true;
    loadCardFonts().then(() => { if (alive) drawFanCard(ctx, member); });
    return () => { alive = false; };
  }, [member]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleaned = cleanName(name);
    if (!cleaned) {
      setError('ใส่ชื่อเล่นก่อนนะ');
      return;
    }
    setError('');
    setNote('');
    setName(cleaned);
    setMember(saveMember(cleaned));
  };

  const handleSave = async () => {
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNote('บันทึกรูปแล้ว ถ้าใช้มือถือ รูปจะอยู่ในไฟล์ดาวน์โหลด หรือกดค้างที่รูปเพื่อบันทึกลงอัลบั้ม');
  };

  const shareFile = async () => {
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    try {
      await navigator.share({ files: [file], text: 'บัตรแฟนคลับน้องการ์ตูนของฉัน ♡ #StandByToon' });
    } catch (e) {
      // ผู้ใช้กดยกเลิกการแชร์
    }
  };

  // เปลี่ยนชุดแล้วบันทึกทันที บัตรวาดใหม่ตาม
  const handleLook = (look) => {
    setNote('');
    setMember(saveMember(member.name, undefined, undefined, look));
  };

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
    && typeof File === 'function' && navigator.canShare({ files: [new File([''], FILE_NAME, { type: 'image/png' })] });

  return (
    <section className="section game fan-card-page">
      <h1 className="visually-hidden">ทำบัตรแฟนคลับ</h1>
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>

      <form className="sheet fan-card-form" onSubmit={handleSubmit}>
        <span className="tape tape-center" aria-hidden="true" />
        <h2 className="quiz-title">ทำบัตรแฟนคลับ</h2>
        <label htmlFor="fan-card-name">ชื่อเล่นที่จะอยู่บนบัตร</label>
        <div className="leaderboard-form-row">
          <input
            id="fan-card-name"
            type="text"
            value={name}
            maxLength={NAME_MAX}
            placeholder="ชื่อเล่น"
            autoComplete="nickname"
            onChange={(event) => { setName(event.target.value); setError(''); }}
          />
          <button type="submit" className="game-btn">{member ? 'อัปเดตบัตร' : 'ทำบัตร'}</button>
        </div>
        {error && <p className="leaderboard-message" role="alert">{error}</p>}
        {member && <p className="fan-card-meta">เลขสมาชิก FC-{member.no} · เปลี่ยนชื่อได้ เลขสมาชิกเดิมคงไว้</p>}
      </form>

      {member && (
        <div className="fan-card-studio">
          <div className="fan-card-result">
            {canDraw ? (
              <canvas
                ref={canvasRef}
                width={CARD_W}
                height={CARD_H}
                className="fan-card-canvas"
                role="img"
                aria-label={`บัตรแฟนคลับของ ${member.name} เลขสมาชิก FC-${member.no}`}
              />
            ) : (
              <p className="leaderboard-empty">เครื่องนี้วาดบัตรไม่ได้ ลองเปิดด้วยเบราว์เซอร์อื่น</p>
            )}
            {canDraw && (
              <div className="game-actions">
                <button type="button" className="game-btn" onClick={handleSave}>บันทึกรูป</button>
                {canShareFiles && (
                  <button type="button" className="game-btn game-btn-secondary" onClick={shareFile}>แชร์ลงสตอรี่</button>
                )}
              </div>
            )}
            {note && <p className="fan-card-meta" role="status">{note}</p>}
            <Link to={wishPath(member)} className="hand-link">
              ลองดูคำอวยพรที่ได้ตอนสแกน QR →
            </Link>
          </div>
          <LookPicker look={member.look} onChange={handleLook} />
        </div>
      )}
    </section>
  );
}

export default FanCardMaker;
