import './Home.css';
import React from 'react';
import { Link } from 'react-router-dom';
import artist from './data/artist.json';
import { formatDate } from './data/format';

const facts = [
  { label: 'วันเกิด', text: formatDate(artist.birthDate, 'th-TH', 'long') },
  { label: 'กรุ๊ปเลือด', text: artist.bloodGroup },
  { label: 'ส่วนสูง', text: `${artist.heightCm} ซม.` },
  { label: 'บ้านเกิด', text: `จังหวัด${artist.province}` },
  { label: 'ชอบ', text: artist.likes.join(', ') },
  { label: 'งานอดิเรก', text: artist.hobbies.join(', ') },
];

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="hero-text">
          <h1 className="hero-name">
            {artist.nickname} <span>{artist.group}</span>
          </h1>
          <p className="hero-fullname">{artist.nameTh} · {artist.nameEn}</p>
          <p className="hero-intro">
            รวมข้อมูล สเตจ และกิจกรรมของน้องการ์ตูนไว้ในที่เดียว
            ใครเพิ่งรู้จักน้องก็เริ่มจากตรงนี้ได้เลย
          </p>
          <div className="hero-actions">
            <Link to="/work" className="btn">ดูผลงาน</Link>
            <Link to="/support" className="text-link">ซัพพอร์ตน้อง</Link>
            <a href="#follow" className="text-link">ช่องทางติดตาม</a>
          </div>
        </div>

        <img src={artist.image} className="hero-photo" alt={`${artist.nickname} ${artist.group}`} />
      </section>

      <section className="home-section" aria-labelledby="profile-title">
        <h2 id="profile-title">ข้อมูลส่วนตัว</h2>
        <dl className="profile-list">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default Home;
