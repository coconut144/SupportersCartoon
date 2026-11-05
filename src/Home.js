import './Home.css';
import React from 'react';
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
        <p className="profile-source">
          ที่มาของข้อมูล:{' '}
          <a href={artist.source.url} target="_blank" rel="noopener noreferrer">{artist.source.label}</a>
        </p>
      </section>
    </div>
  );
}

export default Home;
