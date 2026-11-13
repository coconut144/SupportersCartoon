import './Section.css';
import './Game.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KINDS, CARD_W, CARD_H, fetchAllHearts, heartsToCsv, describeDesign, thaiTime, drawHeartCard,
} from './game/hearts';
import { loadCertificateFonts } from './game/certificate';
import { HeartNote, downloadBlob } from './HeartPage';

const kindLabel = (id) => KINDS.find((kind) => kind.id === id).label;
const fileSafe = (text) => text.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 30) || 'card';

// หน้าแอดมิน (ไม่มีลิงก์จากหน้าอื่น): ใส่รหัสแอดมินแล้วดูการ์ดทั้งหมดตามที่แฟนคลับแต่ง
// โหลดเป็นตาราง CSV หรือบันทึกทีละใบเป็นรูปได้ รหัสไม่ถูกเก็บในเครื่อง ปิดหน้าแล้วต้องใส่ใหม่
function HeartAdmin() {
  const [key, setKey] = useState('');
  const [hearts, setHearts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLoad = async (event) => {
    event.preventDefault();
    if (!key.trim()) { setMessage('ใส่รหัสแอดมินก่อนนะ'); return; }
    setLoading(true);
    setMessage('');
    try {
      setHearts(await fetchAllHearts(key.trim()));
    } catch (error) {
      setHearts(null);
      setMessage(error.message === 'offline' ? 'ตอนนี้โหลดการ์ดไม่ได้ ลองใหม่ภายหลัง' : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCsv = () => {
    // BOM นำหน้าให้ Excel อ่านภาษาไทยถูก
    const blob = new Blob(['﻿', heartsToCsv(hearts)], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `heart-to-heart-${thaiTime(Date.now()).slice(0, 10)}.csv`);
  };

  const handleImage = async (heart, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) { setMessage('เครื่องนี้วาดการ์ดเป็นรูปไม่ได้ ลองเปิดด้วยเบราว์เซอร์อื่น'); return; }
    await loadCertificateFonts();
    drawHeartCard(ctx, heart);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) downloadBlob(blob, `heart-${String(index + 1).padStart(4, '0')}-${fileSafe(heart.name)}.png`);
  };

  return (
    <section className="section game heart-page">
      <Link to="/heart" className="hand-link game-back">← Heart to Heart</Link>
      <header className="heart-hero">
        <p className="heart-kicker">HEART TO HEART · ADMIN</p>
        <h1 className="page-title">รวบรวมการ์ดถึงน้องการ์ตูน</h1>
      </header>

      <form className="sheet heart-form heart-admin-form" onSubmit={handleLoad}>
        <div className="cert-field">
          <label htmlFor="heart-admin-key">รหัสแอดมิน</label>
          <input
            id="heart-admin-key"
            type="password"
            value={key}
            autoComplete="off"
            onChange={(event) => { setKey(event.target.value); setMessage(''); }}
          />
        </div>
        <button type="submit" className="game-btn" disabled={loading}>{loading ? 'กำลังโหลด…' : 'โหลดการ์ดทั้งหมด'}</button>
      </form>
      {message && <p className="leaderboard-message" role="alert">{message}</p>}

      {hearts && (
        <>
          <div className="heart-admin-bar">
            <p className="heart-count">ทั้งหมด <strong>{hearts.length.toLocaleString('th-TH')}</strong> ใบ</p>
            {hearts.length > 0 && (
              <button type="button" className="game-btn game-btn-secondary" onClick={handleCsv}>ดาวน์โหลดตาราง CSV</button>
            )}
          </div>
          {hearts.length === 0 && <p className="leaderboard-empty">ยังไม่มีใครส่งใจมา</p>}
          <ol className="heart-admin-grid">
            {hearts.map((heart, index) => (
              <li key={heart.id || index} className="heart-admin-item">
                <HeartNote heart={heart} />
                <p className="heart-admin-meta">
                  <span>#{index + 1} · {thaiTime(heart.createdAt)}</span>
                  <button
                    type="button"
                    className="hand-link"
                    aria-label={`บันทึกการ์ดของ ${heart.name} เป็นรูป`}
                    title={`${kindLabel(heart.kind)} · ${describeDesign(heart)}`}
                    onClick={() => handleImage(heart, index)}
                  >
                    บันทึกรูป
                  </button>
                </p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

export default HeartAdmin;
