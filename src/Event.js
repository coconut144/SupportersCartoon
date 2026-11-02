import './Section.css';
import './Event.css';
import React from 'react';
import events from './data/events.json';
import { formatDate } from './data/format';

// วันนี้ในรูปแบบ YYYY-MM-DD ตามเวลาเครื่องผู้ชม เทียบกับวันที่ในไฟล์ได้ตรง ๆ
const today = new Date().toLocaleDateString('en-CA');

const byDate = (a, b) => a.date.localeCompare(b.date);
const upcoming = events.filter((event) => event.date >= today).sort(byDate);
const past = events.filter((event) => event.date < today).sort(byDate).reverse();

function EventList({ items }) {
  return (
    <ol className="event-list">
      {items.map((event) => (
        <li key={`${event.date}-${event.title}`}>
          <time dateTime={event.date}>{formatDate(event.date, 'th-TH')}</time>
          <div className="event-body">
            <strong className="event-title">{event.title}</strong>
            {event.location && <p className="event-location">{event.location}</p>}
            {event.schedule && (
              <ul className="event-schedule">
                {event.schedule.map((slot) => <li key={slot}>{slot}</li>)}
              </ul>
            )}
            {event.note && <p className="event-note">{event.note}</p>}
            {event.links && (
              <p className="event-links">
                {event.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                ))}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Event() {
  return (
    <section className="section">
      <h1 className="visually-hidden">กิจกรรม</h1>

      <h2 className="event-group-title">กำลังจะมา</h2>
      {upcoming.length > 0
        ? <EventList items={upcoming} />
        : <p className="event-empty">ยังไม่มีงานที่ประกาศ</p>}

      {past.length > 0 && (
        <>
          <h2 className="event-group-title">ที่ผ่านมา</h2>
          <EventList items={past} />
        </>
      )}
    </section>
  );
}

export default Event;
