import './Home.css';
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="home-layout">
      <div className="home-hero">
        <div className="hero-sparkles" aria-hidden="true">
          <span className="sparkle s1">✦</span>
          <span className="sparkle s2">✦</span>
          <span className="sparkle s3">✧</span>
          <span className="sparkle s4">✦</span>
        </div>

        <p className="hero-eyebrow">สาวน้อยแห่ง</p>
        <h1 className="hero-name">
          Cartoon
          <span className="hero-group-tag">BNK48</span>
        </h1>
        <p className="hero-desc">
          มาเริ่มต้นรู้จักกับน้องการ์ตูน และติดตามผลงานล่าสุดของเธอได้ที่นี่
        </p>
        <div className="hero-actions">
          <Link to="/work" className="btn btn-primary">ดูผลงาน</Link>
          <Link to="/contact" className="btn btn-secondary">ติดตามช่องทาง</Link>
        </div>
      </div>

      <div className="home-body">
        <div className="fact-strip" role="list" aria-label="ข้อมูลเบื้องต้นของ Cartoon">
          <div className="fact-chip" role="listitem">
            <span className="fact-icon" aria-hidden="true">🎂</span>
            <span>26 ส.ค. 2552</span>
          </div>
          <div className="fact-chip" role="listitem">
            <span className="fact-icon" aria-hidden="true">🩸</span>
            <span>กรุ๊ปเลือด AB</span>
          </div>
          <div className="fact-chip" role="listitem">
            <span className="fact-icon" aria-hidden="true">📏</span>
            <span>ส่วนสูง 161 ซม.</span>
          </div>
          <div className="fact-chip" role="listitem">
            <span className="fact-icon" aria-hidden="true">📍</span>
            <span>ศรีสะเกษ</span>
          </div>
        </div>

        <div className="home-feature-grid">
          <Link to="/artist" className="feature-card tone-pink">
            <span className="feature-tag">Artist</span>
            <strong className="feature-title">ประวัติศิลปิน</strong>
            <p className="feature-desc">ข้อมูลเบื้องต้นและรายละเอียดที่ช่วยให้ผู้ชมเข้าใจศิลปินได้ชัดเจน</p>
          </Link>

          <Link to="/event" className="feature-card tone-mint">
            <span className="feature-tag">Event</span>
            <strong className="feature-title">กิจกรรม</strong>
            <p className="feature-desc">ติดตามข้อมูลอีเวนต์และโอกาสใหม่ ๆ ที่น่าสนใจ</p>
          </Link>

          <Link to="/work" className="feature-card tone-violet">
            <span className="feature-tag">Work</span>
            <strong className="feature-title">ผลงาน</strong>
            <p className="feature-desc">ชมวิดีโอและผลงานที่จัดวางให้อ่านง่ายและมีความเป็นระเบียบ</p>
          </Link>

          <Link to="/contact" className="feature-card tone-gold">
            <span className="feature-tag">Follow</span>
            <strong className="feature-title">ช่องทางติดตาม</strong>
            <p className="feature-desc">เข้าถึงบัญชีโซเชียลได้ทันทีเพื่อรับข้อมูลและอัปเดตล่าสุด</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;