import './Section.css';
import './Game.css';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NAME_MAX, MESSAGE_MAX, KINDS, COLORS, STICKERS, PATTERNS, FONTS, DEFAULT_DRAFT, CARD_W, CARD_H,
  countChars, tiltOf, readToken, readDraft, saveDraft, fetchTotal, sendHeart, pickSuggestion, drawHeartCard,
} from './game/hearts';
import { loadCertificateFonts } from './game/certificate';
import { readMember } from './game/fanCard';
import { readName } from './game/leaderboard';

const FILE_NAME = 'heart-to-heart-card.png';

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
const kindLabel = (id) => KINDS.find((kind) => kind.id === id).label;

// บันทึกไฟล์ลงเครื่อง (ใช้ทั้งรูปการ์ดและไฟล์ CSV ของแอดมิน)
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// การ์ดข้อความ 1 ใบ (ตัวอย่างในฟอร์ม และหน้าแอดมิน)
export function HeartNote({ heart }) {
  const color = COLORS[heart.color];
  return (
    <article
      className={`heart-note heart-pt-${heart.pattern}`}
      style={{ backgroundColor: color.bg, color: color.ink, transform: `rotate(${tiltOf('')}deg)` }}
    >
      <span className="heart-note-sticker" aria-hidden="true">{STICKERS[heart.sticker]}</span>
      <span className="heart-note-kind">{kindLabel(heart.kind)}</span>
      <p className={`heart-note-message heart-font-${heart.font}`}>{heart.message || 'ข้อความของคุณจะขึ้นตรงนี้'}</p>
      <p className="heart-note-by">
        <span>— {heart.name || 'แฟนคลับน้องการ์ตูน'}</span>
      </p>
    </article>
  );
}

// ปุ่มเลือกได้อันเดียวต่อหมวด (สี สติกเกอร์ ลาย ลายมือ)
function Picker({ label, options, value, onChange, className = '' }) {
  return (
    <div className="heart-picker" role="radiogroup" aria-label={label}>
      <span className="heart-picker-label">{label}</span>
      <div className="heart-picker-choices">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            aria-label={option.name}
            className={`look-choice ${className}${value === option.value ? ' is-on' : ''}`}
            style={option.style}
            onClick={() => onChange(option.value)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const COLOR_OPTIONS = COLORS.map((color, index) => ({ value: index, name: color.label, style: { background: color.bg } }));
const STICKER_OPTIONS = STICKERS.map((sticker, index) => ({ value: index, name: `สติกเกอร์ ${sticker}`, text: sticker }));
const PATTERN_OPTIONS = PATTERNS.map((pattern) => ({ value: pattern.id, name: pattern.label, text: pattern.label }));
const FONT_OPTIONS = FONTS.map((font) => ({ value: font.id, name: font.label, text: font.label }));

// ชื่อเริ่มต้น: การ์ดที่เคยส่งจากเครื่องนี้ ไม่งั้นใช้ชื่อจากบัตรแฟนคลับหรือตารางอันดับ
const initialDraft = () => {
  const saved = readDraft();
  if (saved) return { ...DEFAULT_DRAFT, ...saved };
  const member = readMember();
  return { ...DEFAULT_DRAFT, name: (member ? member.name : readName()).slice(0, NAME_MAX) };
};

// Heart to Heart: เขียนข้อความถึงน้อง แต่งการ์ด ส่งแล้วบันทึกการ์ดเป็นรูปลงเครื่องได้
// หน้านี้แสดงแค่จำนวนคนที่ส่ง ไม่แสดงข้อความของคนอื่น
function HeartPage() {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const justSent = useRef(false);
  const [draft, setDraft] = useState(initialDraft);
  const [myId, setMyId] = useState(() => { const saved = readDraft(); return saved ? saved.id : null; });
  const [total, setTotal] = useState(null); // จำนวนคนที่ส่งใจมาแล้ว (null = ยังไม่รู้ / โหลดไม่ได้ ก็ไม่ต้องแสดง)
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  // การ์ดที่ส่งสำเร็จแล้ว (รวมที่เคยส่งจากเครื่องนี้) → แสดงเป็นรูปให้บันทึกลงเครื่อง
  const [sent, setSent] = useState(() => { const saved = readDraft(); return saved && saved.id ? saved : null; });
  const [note, setNote] = useState('');
  const [canDraw, setCanDraw] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchTotal()
      .then((count) => { if (alive) setTotal(count); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // ส่งสำเร็จแล้วเลื่อนขึ้นไปที่การ์ด (อยู่เหนือฟอร์ม) เปิดหน้ามาเฉย ๆ ไม่ต้องเลื่อน
  useEffect(() => {
    if (!justSent.current) return;
    justSent.current = false;
    if (cardRef.current && cardRef.current.scrollIntoView) cardRef.current.scrollIntoView({ block: 'start' });
  }, [sent]);

  // วาดการ์ดเป็นรูปเมื่อส่งสำเร็จ
  useEffect(() => {
    if (!sent) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) {
      setCanDraw(false);
      return undefined;
    }
    let alive = true;
    loadCertificateFonts().then(() => { if (alive) drawHeartCard(ctx, sent); });
    return () => { alive = false; };
  }, [sent]);

  const update = (key) => (value) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.message.trim()) { setMessage('พิมพ์ข้อความก่อนนะ'); return; }
    if (!draft.name.trim()) { setMessage('ใส่ชื่อที่แสดงด้วยนะ'); return; }
    setSending(true);
    setMessage('');
    try {
      const result = await sendHeart(readToken(), draft);
      saveDraft(result.heart);
      setMyId(result.heart.id);
      setDraft({ ...DEFAULT_DRAFT, ...result.heart });
      setTotal(result.total);
      justSent.current = true;
      setSent(result.heart);
      setNote('');
    } catch (error) {
      setMessage(error.message === 'offline' ? 'ตอนนี้ส่งใจไม่ได้ ลองใหม่ภายหลัง' : error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSave = async () => {
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    downloadBlob(blob, FILE_NAME);
    setNote('บันทึกการ์ดแล้ว ถ้าใช้มือถือ รูปจะอยู่ในไฟล์ดาวน์โหลด หรือกดค้างที่รูปเพื่อบันทึกลงอัลบั้ม');
  };

  const handleShare = async () => {
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    try {
      await navigator.share({ files: [file], text: 'ส่งใจถึงน้องการ์ตูนแล้ว ♡ #StandByToon' });
    } catch (e) {
      // ผู้ใช้กดยกเลิกการแชร์
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
    && typeof File === 'function' && navigator.canShare({ files: [new File([''], FILE_NAME, { type: 'image/png' })] });

  const length = countChars(draft.message);

  return (
    <section className="section game heart-page">
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>
      <header className="heart-hero">
        <p className="heart-kicker">HEART TO HEART</p>
        <h1 className="page-title">ส่งใจถึงน้องการ์ตูน</h1>
        <p className="heart-lead">เขียนคำอวยพรหรือให้กำลังใจน้องการ์ตูน</p>
        {total !== null && (
          <p className="heart-count">ส่งใจมาแล้ว <strong>{total.toLocaleString('th-TH')}</strong> คน</p>
        )}
      </header>

      {sent && (
        <div className="sheet heart-card" ref={cardRef}>
          <span className="tape tape-sky tape-center" aria-hidden="true" />
          <h2 className="quiz-title">ขอบคุณที่ส่งใจถึงน้อง</h2>
          <p className="heart-lead">นี่คือการ์ดที่คุณส่งถึงน้องการ์ตูน บันทึกเก็บไว้ในเครื่องได้เลย</p>
          {canDraw ? (
            <canvas
              ref={canvasRef}
              width={CARD_W}
              height={CARD_H}
              className="heart-card-canvas"
              role="img"
              aria-label={`การ์ด Heart to Heart ของ ${sent.name}: ${sent.message}`}
            />
          ) : (
            <p className="leaderboard-empty">เครื่องนี้วาดการ์ดเป็นรูปไม่ได้ ลองเปิดด้วยเบราว์เซอร์อื่น</p>
          )}
          {canDraw && (
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleSave}>บันทึกการ์ด</button>
              {canShareFiles && (
                <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์</button>
              )}
            </div>
          )}
          {note && <p className="fan-card-meta" role="status">{note}</p>}
        </div>
      )}

      <form className="sheet heart-form" onSubmit={handleSubmit}>
        <span className="tape tape-center" aria-hidden="true" />
        <h2 className="quiz-title">{myId ? 'แก้การ์ดของคุณ' : 'เขียนข้อความของคุณ'}</h2>

        <div className="heart-studio">
          <div className="heart-fields">
            <div className="heart-kinds" role="radiogroup" aria-label="ประเภทข้อความ">
              {KINDS.map((kind) => (
                <button
                  key={kind.id}
                  type="button"
                  role="radio"
                  aria-checked={draft.kind === kind.id}
                  className={`look-choice${draft.kind === kind.id ? ' is-on' : ''}`}
                  onClick={() => update('kind')(kind.id)}
                >
                  {kind.label}
                </button>
              ))}
            </div>

            <div className="cert-field">
              <label htmlFor="heart-message">ข้อความถึงน้อง</label>
              <textarea
                id="heart-message"
                value={draft.message}
                maxLength={MESSAGE_MAX}
                rows={4}
                placeholder="เช่น ขอให้น้องการ์ตูนมีความสุขทุกวัน สู้ ๆ นะ จะซัพพอร์ตไปเรื่อย ๆ เลย"
                onChange={(event) => update('message')(event.target.value)}
              />
              <button
                type="button"
                className="look-choice heart-random"
                onClick={() => update('message')(pickSuggestion(draft.kind, Math.random, draft.message))}
              >
                {KINDS.find((kind) => kind.id === draft.kind).random}
              </button>
              <p className="heart-meta">
                <span>1 เครื่อง 1 การ์ด · ส่งใหม่เพื่อแก้การ์ดเดิมได้</span>
                <span>{length}/{MESSAGE_MAX}</span>
              </p>
            </div>

            <div className="cert-field">
              <label htmlFor="heart-name">ชื่อที่แสดง</label>
              <input
                id="heart-name"
                type="text"
                value={draft.name}
                maxLength={NAME_MAX}
                placeholder="ชื่อเล่น หรือแฮนเดิล"
                autoComplete="nickname"
                onChange={(event) => update('name')(event.target.value)}
              />
            </div>

            <Picker label="สีการ์ด" options={COLOR_OPTIONS} value={draft.color} onChange={update('color')} className="heart-swatch" />
            <Picker label="สติกเกอร์" options={STICKER_OPTIONS} value={draft.sticker} onChange={update('sticker')} className="heart-sticker-choice" />
            <Picker label="ลายพื้นการ์ด" options={PATTERN_OPTIONS} value={draft.pattern} onChange={update('pattern')} />
            <Picker label="ลายมือ" options={FONT_OPTIONS} value={draft.font} onChange={update('font')} />
          </div>

          <div className="heart-preview">
            <p className="heart-preview-cap">ตัวอย่างการ์ดของคุณ</p>
            <HeartNote heart={draft} />
          </div>
        </div>

        <div className="game-actions">
          <button type="submit" className="game-btn" disabled={sending}>{sending ? 'กำลังส่งใจ…' : 'ส่งใจ'}</button>
        </div>
        {message && <p className="leaderboard-message" role="alert">{message}</p>}
      </form>
    </section>
  );
}

export default HeartPage;
