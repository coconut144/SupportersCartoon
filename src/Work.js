import './Section.css';
import './Work.css';
import React from 'react';
import videos from './data/videos.json';
import { formatDate } from './data/format';

// หมวดที่ตั้ง "sort": "newest" จะเรียงคลิปจากวันที่ลงล่าสุดก่อน เพิ่มคลิปใหม่ตรงไหนก็ได้ในไฟล์
const itemsOf = (category) =>
  category.sort === 'newest'
    ? [...category.items].sort((a, b) => b.date.localeCompare(a.date))
    : category.items;

function Work() {
  return (
    <section className="section">
      <h1 className="visually-hidden">ผลงาน</h1>

      {videos.categories.map((category) => (
        <div key={category.title} className="work-category">
          <h2 className="work-category-title">{category.title}</h2>

          <div className="work-videos-grid">
            {itemsOf(category).map((video) => (
              <figure key={video.url} className="work-video">
                <div className="work-video-card">
                  <iframe
                    src={video.url}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  {video.title}
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
