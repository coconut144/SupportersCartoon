import './Section.css';
import './Artist.css';
import React from 'react';

function Artist() {
  return (
    <section className="section">
      <div className="section-inner">
        <div className="artist-profile">
          <img src="/images/cartoon.jpg" className="artist-img" alt="Cartoon BNK48" />

          <div>
            <h3>Cartoon</h3>
            <ul className="artist-detail-list">
              <li>ณัฏฐธิดา ณ อัมภัย</li>
              <li>Natthathida Na Amphai</li>
              <li><strong>Date of birth :</strong> 26 August 2009</li>
              <li><strong>Blood Group :</strong> AB</li>
              <li><strong>Height :</strong> 161 cm</li>
              <li><strong>Province :</strong> ศรีสะเกษ</li>
              <li><strong>Like :</strong> แมว / กระต่าย / แพนด้าแดง / ก๋วยเตี๋ยวน้ำตกไม่ผัก</li>
              <li><strong>Hobby :</strong> อ่านนิยาย / ร้องเพลง / ดูอะนิเมะ / เล่นเกม</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Artist;