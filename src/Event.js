import './Section.css';
import './Event.css';
import React from 'react';
import events from './data/events.json';
import { formatDate } from './data/format';

function Event() {
  return (
    <section className="section">
      <h1 className="section-title">กิจกรรม</h1>
      <p className="section-lead">งานอีเวนต์ที่น้องการ์ตูนไปร่วม</p>

      <ol className="event-list">
        {events.map((event) => (
          <li key={`${event.date}-${event.title}`}>
            <time dateTime={event.date}>{formatDate(event.date, 'th-TH')}</time>
            <span>{event.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default Event;
