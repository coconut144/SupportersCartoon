import './Section.css';
import './Event.css';
import React from 'react';

function Event() {
  return (
    <section className="section">
      <div className="section-inner">
        <h2>งานอีเว้นท์</h2>
        <ul>
          <li>Event 1: วันที่ 1 ธ.ค. 2025</li>
          <li>Event 2: วันที่ 10 ธ.ค. 2025</li>
        </ul>
      </div>
    </section>
  );
}

export default Event;