import React from 'react';

function Artist() {
  return (
    <section className="section">
      <h2>แนะนำศิลปิน</h2>
      <div className="artist-list">
        <div className="artist-card">
          <img src="/images/cartoon.jpg" alt="ศิลปิน A" className="artist-img" />
          <h3>ศิลปิน A</h3>
          <a href="https://web.facebook.com/cartoon.bnk48official" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
        <div className="artist-card">
          <img src="/images/cartoon.jpg" alt="ศิลปิน B" className="artist-img" />
          <h3>ศิลปิน B</h3>
          <a href="https://www.instagram.com/cartoon.bnk48office/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <div className="artist-card">
          <img src="/images/cartoon.jpg" alt="ศิลปิน C" className="artist-img" />
          <h3>ศิลปิน C</h3>
          <a href="https://www.tiktok.com/@cartoon.bnk48official?_r=1&_t=ZS-91fq7tU1JOq" target="_blank" rel="noopener noreferrer">TikTok</a>
        </div>
      </div>
    </section>
  );
}

export default Artist;
