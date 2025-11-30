
import './Section.css';
import './Artist.css';
import React from 'react';

function Artist() {
  return (
    <section className="section">
      {/* <h2>แนะนำตัวศิลปิน</h2> */}
      <div className="artist-profile" style={{textAlign: 'center'}}>
        <img src="/images/cartoon.jpg" className="artist-img" alt="Cartoon BNK48" />
        <h3>Cartoon </h3>
        {/* <p>
          การ์ตูน BNK48 (Cartoon BNK48) เป็นสมาชิกวงไอดอล BNK48 รุ่นที่ 6
          มีความสามารถด้านการร้อง เต้น และมีบุคลิกสดใส เป็นกันเอง
        </p> */}
        <ul style={{listStyle: 'none', padding: 0}}>
          <li> ณัฎฐธิดา ณ อัมภัย</li>
          <li> Natthathida Na Amphai </li>
          <li><strong>Date of birth : </strong> 26 August 2009</li>
          <li><strong>Blood Group : </strong>AB</li>
          <li><strong>Height : </strong> 161 cm</li>
          <li><strong>Province  : </strong>ศรีสะเกษ</li>
          <li><strong>Like  : </strong>แมว / กระต่าย / แพนด้าแดง / ก๋วยเตี๋ยวน้ำตกไม่ผัก</li>
          <li><strong>Hobby : </strong>อ่านนิยาย / ร้องเพลง / ดูอะนิเมะ / เล่นเกม</li>
          
        </ul>
        {/* <div style={{marginTop: '1rem'}}>
          <a href="https://web.facebook.com/cartoon.bnk48official" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>Facebook</a>
          <a href="https://www.instagram.com/cartoon.bnk48office/" target="_blank" rel="noopener noreferrer" style={{marginRight: '1rem'}}>Instagram</a>
          <a href="https://www.tiktok.com/@cartoon.bnk48official?_r=1&_t=ZS-91fq7tU1JOq" target="_blank" rel="noopener noreferrer">TikTok</a>
        </div> */}
      </div>
    </section>
  );
}

export default Artist;
