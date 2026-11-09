import './Section.css';
import './Game.css';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pickWish, readWishParams } from './game/wish';

// หน้าที่เปิดจาก QR บนบัตรแฟนคลับ: สุ่มคำอวยพร 1 ข้อ กดสุ่มใหม่ได้
function WishPage() {
  const { search } = useLocation();
  const { name, no } = readWishParams(search);
  const [wish, setWish] = useState(() => pickWish());
  const [round, setRound] = useState(0);

  const handleAgain = () => {
    setWish((previous) => pickWish(Math.random, previous));
    setRound((r) => r + 1);
  };

  return (
    <section className="section game wish-page">
      <h1 className="visually-hidden">คำอวยพร</h1>

      <div className="sheet wish-card">
        <span className="tape tape-center" aria-hidden="true" />
        <span className="sticker wish-sticker" aria-hidden="true">โชคดี!</span>
        <p className="wish-to">
          {name ? <>ถึง <strong>{name}</strong>{no && <span className="wish-no"> · FC-{no}</span>}</> : 'ถึงแฟนคลับน้องการ์ตูน'}
        </p>
        {/* key เปลี่ยนทุกครั้งที่สุ่ม ให้ข้อความเล่นอนิเมชันเด้งเข้ามาใหม่ */}
        <p className="wish-text" key={round} aria-live="polite">{wish}</p>
      </div>

      <div className="game-actions">
        <button type="button" className="game-btn" onClick={handleAgain}>สุ่มอีกใบ</button>
        <Link to="/game/card" className="game-btn game-btn-secondary">ทำบัตรของคุณบ้าง</Link>
      </div>
      <p className="wish-more">
        <Link to="/" className="hand-link">ไปดูเว็บน้องการ์ตูน →</Link>
      </p>
    </section>
  );
}

export default WishPage;
