import './Home.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import artist from './data/artist.json';
import { upcoming } from './data/events';
import { formatDate } from './data/format';
import { countdownOf } from './data/countdown';
import Ticket from './Ticket';
import { ArrowRight } from './icons';

const facts = [
  { label: 'วันเกิด', text: formatDate(artist.birthDate, 'th-TH', 'long') },
  { label: 'กรุ๊ปเลือด', text: artist.bloodGroup },
  { label: 'ส่วนสูง', text: `${artist.heightCm} ซม.` },
  { label: 'บ้านเกิด', text: `จังหวัด${artist.province}` },
  { label: 'ชอบ', text: artist.likes.join(', ') },
  { label: 'งานอดิเรก', text: artist.hobbies.join(', ') },
];

// บัตรสมาชิกเล็ก ๆ: เลขสมาชิกจากลิงก์ BNK48 Official + วันเกิดแบบ วว.ดด.ปปปป
const memberNo = new URL(artist.source.url).searchParams.get('memberId');
const birthday = artist.birthDate.split('-').reverse().join('.');

const next = upcoming[0];

// นาฬิกาที่อัปเดตทุก 30 วินาที พอสำหรับนับถอยหลังระดับนาที
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// การ์ดงานถัดไป: นับถอยหลังถึงเวลาเริ่ม วันที่มีงานสติกเกอร์เปลี่ยนเป็น "วันนี้!"
function NextEvent({ event }) {
  const countdown = countdownOf(event, useNow());
  return (
    <>
      <Ticket event={event} sticker={countdown && countdown.isToday ? 'วันนี้!' : 'ไปกัน!'} />
      <div className="home-more">
        {countdown && (
          <p className={`countdown${countdown.isToday ? ' is-today' : ''}`}>
            <span aria-hidden="true">⏳</span> {countdown.text}
          </p>
        )}
        <Link to="/event" className="hand-link">ดูตั๋วทั้งหมด <ArrowRight /></Link>
      </div>
    </>
  );
}

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="hero-text">
          <h1 className="hero-name">
            {artist.nickname} <span>{artist.group}</span>
          </h1>
          <p className="hero-fullname">{artist.nameTh} · {artist.nameEn}</p>
          <p className="member-pass" aria-hidden="true">
            <b>MEMBER</b>
            <span>{memberNo && `NO.${memberNo} · `}{birthday}</span>
          </p>
        </div>

        <figure className="polaroid">
          <span className="tape tape-center" aria-hidden="true" />
          <img src={artist.image} alt={`${artist.nickname} ${artist.group}`} />
          <figcaption className="polaroid-caption" aria-hidden="true">การ์ตูน ♡</figcaption>
          <span className="tape tape-sky polaroid-corner" aria-hidden="true" />
        </figure>
      </section>

      <section aria-labelledby="profile-title">
        <h2 className="hand-title" id="profile-title">เกี่ยวกับน้อง</h2>
        <div className="sheet notebook">
          <dl className="profile-list">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="profile-source">
          ที่มาของข้อมูล:{' '}
          <a href={artist.source.url} target="_blank" rel="noopener noreferrer">{artist.source.label}</a>
        </p>
      </section>

      {next && (
        <section aria-labelledby="next-title">
          <h2 className="hand-title" id="next-title">นัดเจอครั้งหน้า</h2>
          <NextEvent event={next} />
        </section>
      )}
    </div>
  );
}

export default Home;
