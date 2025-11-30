
import './Section.css';
import './Work.css';
import React from 'react';

function Work() {
  const videos = [
    "https://www.youtube.com/embed/jRVOQHriw2w?si=VuBEUWPB3s5F92L6",
    "https://www.youtube.com/embed/CDSCbCJRdQM?si=gLagKQoCGwl9NaUN",
    "https://www.youtube.com/embed/9kKtPML_8Zs?si=4fEXohPOYT9Kvivy",
    "https://www.youtube.com/embed/nJNxYPgJ8_A?si=J3LiMRVPbutQsMjG",
    "https://www.youtube.com/embed/EC0JdxudDzk?si=DihZliO3uy73W935"
  ];

  return (
    <section className="section work-section">
      <h2 className="work-title">Debut Stage</h2>

      <div className="work-videos-grid">
        {videos.map((url, index) => (
          <div key={index} className="work-video-card">
            <iframe
              src={url}
              title={`YouTube video ${index + 1}`}
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
