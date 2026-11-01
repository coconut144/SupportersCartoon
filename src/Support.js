import './Section.css';
import './Support.css';
import React from 'react';
import support from './data/support.json';

function Support() {
  return (
    <section className="section">
      <div className="support">
        <h1>{support.title}</h1>
        <p>{support.description}</p>
        <img src={support.qr} alt={`QR code ${support.title}`} />
        {/* ใส่ url ใน support.json แล้วปุ่มจะขึ้นเอง สำหรับคนที่เปิดเว็บจากมือถือและสแกน QR บนจอตัวเองไม่ได้ */}
        {support.url && (
          <a href={support.url} target="_blank" rel="noopener noreferrer">เปิดลิงก์</a>
        )}
      </div>
    </section>
  );
}

export default Support;
