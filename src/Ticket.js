import './Ticket.css';
import React from 'react';
import { dateParts, formatDate } from './data/format';

// ตั๋วกิจกรรมแปะสมุด: ต้นขั้ววันที่ | รอยปรุ | รายละเอียด + โปสเตอร์
// tone สลับสีต้นขั้ว/เทป, sticker = ข้อความสติกเกอร์วงกลม (ถ้ามี), past = งานที่ผ่านไปแล้ว
function Ticket({ event, tone = 'pink', sticker, past = false, as: Tag = 'div' }) {
  const { day, month, year } = dateParts(event.date);
  return (
    <Tag className={`sheet ticket is-${tone}${past ? ' is-past' : ''}`}>
      <span className={`tape ${tone === 'sky' ? 'tape-sky tape-right' : 'tape-left'}`} aria-hidden="true" />
      {sticker && <span className="sticker" aria-hidden="true">{sticker}</span>}

      <time className="ticket-stub" dateTime={event.date} aria-label={formatDate(event.date, 'th-TH', 'long')}>
        <b aria-hidden="true">{day}</b>
        <span aria-hidden="true">{month}</span>
        <small aria-hidden="true">{year}</small>
      </time>

      <div className="ticket-perf" aria-hidden="true" />

      <div className="ticket-body">
        <div className="ticket-info">
          <strong className="ticket-title">{event.title}</strong>
          {event.location && <p className="ticket-location">{event.location}</p>}
          {event.schedule && (
            <ul className="ticket-schedule">
              {event.schedule.map((slot) => <li key={slot}>{slot}</li>)}
            </ul>
          )}
          {event.note && <p className="ticket-note">{event.note}</p>}
          <div className="ticket-foot">
            {event.links && (
              <p className="ticket-links">
                {event.links.map((link) => (
                  <a key={link.url} href={link.url} className="hand-link" target="_blank" rel="noopener noreferrer">{link.label}</a>
                ))}
              </p>
            )}
            <span className="ticket-barcode" aria-hidden="true" />
          </div>
        </div>

        {event.poster && (
          <a href={event.poster} className="ticket-poster" target="_blank" rel="noopener noreferrer">
            <img src={event.poster} alt={`โปสเตอร์ ${event.title}`} loading="lazy" />
          </a>
        )}
      </div>
    </Tag>
  );
}

export default Ticket;
