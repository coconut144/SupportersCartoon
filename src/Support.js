import './Section.css';
import './Support.css';
import React from 'react';
import channels from './data/support.json';

// ช่องทางที่มี QR แสดงเต็มแถว ส่วนช่องทางที่มีแค่ลิงก์วางเรียงข้างกัน
const withQr = channels.filter((channel) => channel.qr);
const linkOnly = channels.filter((channel) => !channel.qr);

function Channel({ channel }) {
  return (
    <div className="support">
      <h2>{channel.title}</h2>
      <p>{channel.description}</p>
      {channel.qr && <img src={channel.qr} alt={`QR code ${channel.title}`} />}
      {channel.url && (
        <a href={channel.url} className="support-join" target="_blank" rel="noopener noreferrer">{channel.label}</a>
      )}
    </div>
  );
}

function Support() {
  return (
    <section className="section">
      <h1 className="visually-hidden">ซัพพอร์ตน้อง</h1>

      {withQr.map((channel) => <Channel key={channel.title} channel={channel} />)}

      {linkOnly.length > 0 && (
        <div className="support-row">
          {linkOnly.map((channel) => <Channel key={channel.title} channel={channel} />)}
        </div>
      )}
    </section>
  );
}

export default Support;
