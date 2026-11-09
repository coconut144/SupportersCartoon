import './Section.css';
import './Support.css';
import React from 'react';
import channels from './data/support.json';
import { ArrowRight, MusicNote, Cross } from './icons';

// ช่องทางที่มี QR เป็นบัตรเข้ากลุ่มใบใหญ่ด้านบน ส่วนช่องทางที่มีแค่ลิงก์เป็นกระดาษแผ่นเล็กวางข้างกัน
const withQr = channels.filter((channel) => channel.qr);
const linkOnly = channels.filter((channel) => !channel.qr);

// แยกชื่อบัญชี (@...) ท้ายคำอธิบายออกมาแสดงเด่น ๆ
const splitHandle = (text) => {
  const match = text.match(/^(.*?)\s*(@\S+)$/);
  return match ? { text: match[1], handle: match[2] } : { text, handle: null };
};

const iconOf = (title) => (title.toUpperCase() === 'X' ? <Cross /> : <MusicNote />);

function QrChannel({ channel }) {
  const [first, ...rest] = channel.title.split(' ');
  return (
    <div className="sheet support-pass">
      <div className="support-pass-main">
        <p className="support-code">LINE OPENCHAT · FREE ENTRY</p>
        <h1 className="page-title support-title">
          <span>{first}</span>{rest.length > 0 && <> <span>{rest.join(' ')}</span></>}
        </h1>
        <p className="support-desc">{channel.description}</p>
        {channel.url && (
          <a href={channel.url} className="btn" target="_blank" rel="noopener noreferrer">
            {channel.label} <ArrowRight />
          </a>
        )}
      </div>
      <div className="support-perf" aria-hidden="true" />
      <div className="support-qr-wrap">
        <div className="support-qr">
          <span className="tape tape-center support-qr-tape" aria-hidden="true" />
          <img src={channel.qr} alt={`QR code ${channel.description}`} />
        </div>
      </div>
    </div>
  );
}

function LinkChannel({ channel, tone }) {
  const { text, handle } = splitHandle(channel.description);
  return (
    <div className={`sheet support-card is-${tone}`}>
      <span className={`tape ${tone === 'sky' ? 'tape-sky tape-right' : 'tape-left'}`} aria-hidden="true" />
      <span className="support-icon">{iconOf(channel.title)}</span>
      <h3 className="support-card-title">{channel.title}</h3>
      <p className="support-card-text">{text}</p>
      {handle && <p className="support-handle">{handle}</p>}
      <a href={channel.url} className="btn btn-outline" target="_blank" rel="noopener noreferrer">{channel.label}</a>
    </div>
  );
}

function Support() {
  return (
    <section className="section">
      {withQr.length === 0 && <h1 className="visually-hidden">ซัพพอร์ตน้อง</h1>}

      {withQr.map((channel) => <QrChannel key={channel.title} channel={channel} />)}

      {linkOnly.length > 0 && (
        <div>
          <h2 className="hand-title">ติดตามแฟนคลับ</h2>
          <div className="support-row">
            {linkOnly.map((channel, index) => (
              <LinkChannel key={channel.title} channel={channel} tone={index % 2 ? 'sky' : 'pink'} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Support;
