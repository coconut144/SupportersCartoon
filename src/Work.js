import './Section.css';
import './Work.css';
import React, { useState } from 'react';
import videos from './data/videos.json';
import { formatDate } from './data/format';

// หมวดที่ตั้ง "sort": "newest" จะเรียงคลิปจากวันที่ลงล่าสุดก่อน เพิ่มคลิปใหม่ตรงไหนก็ได้ในไฟล์
const itemsOf = (category) =>
  category.sort === 'newest'
    ? [...category.items].sort((a, b) => b.date.localeCompare(a.date))
    : category.items;

const ALL = 'ทั้งหมด';
const filters = [ALL, ...videos.categories.map((category) => category.title)];
// สีป้ายหมวดสลับชมพู/ฟ้าตามลำดับในไฟล์ ไม่เปลี่ยนตอนกรอง
const toneOf = (category) => (videos.categories.indexOf(category) % 2 ? 'sky' : 'pink');

function Work() {
  const [filter, setFilter] = useState(ALL);
  const shown = videos.categories.filter((category) => filter === ALL || category.title === filter);

  return (
    <section className="section">
      <h1 className="page-title">วิดีโอ</h1>

      <div className="chips" role="group" aria-label="กรองตามหมวด">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            className="chip"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {shown.map((category) => (
        <div key={category.title} className="work-category">
          <h2 className="hand-title work-category-title">{category.title}</h2>

          <div className="work-videos-grid">
            {itemsOf(category).map((video) => (
              <figure key={video.url} className="sheet work-video">
                <span className={`tape tape-left${toneOf(category) === 'sky' ? ' tape-sky' : ''}`} aria-hidden="true" />
                <div className={`work-video-frame is-${toneOf(category)}`}>
                  <iframe
                    src={video.url}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  <span className={`tag tag-${toneOf(category)}`}>{category.title}</span>
                  <span className="work-video-title">{video.title}</span>
                  {video.date && <time dateTime={video.date}>{formatDate(video.date, 'th-TH')}</time>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default Work;
