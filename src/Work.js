import './Section.css';
import './Work.css';
import React from 'react';
import videos from './data/videos.json';

function Work() {
  return (
    <section className="section">
      <h1 className="section-title">ผลงาน</h1>
      <p className="section-lead">{videos.title}</p>

      <div className="work-videos-grid">
        {videos.items.map((url, index) => (
          <div key={url} className="work-video-card">
            <iframe
              src={url}
              title={`${videos.title} คลิปที่ ${index + 1}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Work;
