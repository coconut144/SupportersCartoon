import './Section.css';
import './Event.css';
import React from 'react';
import { upcoming, past } from './data/events';
import Ticket from './Ticket';

// สีต้นขั้วสลับชมพู/ฟ้า งานแรกที่กำลังจะมาติดสติกเกอร์ "ไปกัน!"
function TicketList({ items, isPast = false }) {
  return (
    <ol className="ticket-list">
      {items.map((event, index) => (
        <Ticket
          key={`${event.date}-${event.title}`}
          as="li"
          event={event}
          tone={index % 2 ? 'sky' : 'pink'}
          sticker={!isPast && index === 0 ? 'ไปกัน!' : undefined}
          past={isPast}
        />
      ))}
    </ol>
  );
}

function Event() {
  return (
    <section className="section">
      <h1 className="page-title">กิจกรรม</h1>

      <div>
        <h2 className="hand-title">ตั๋วที่กำลังจะใช้</h2>
        {upcoming.length > 0
          ? <TicketList items={upcoming} />
          : <p className="empty-box">ยังไม่มีงานที่ประกาศ</p>}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="hand-title">ตั๋วที่เก็บไว้</h2>
          <TicketList items={past} isPast />
        </div>
      )}
    </section>
  );
}

export default Event;
