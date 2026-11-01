import './Footer.css';
import React from 'react';
import socials from './data/socials.json';

function Footer() {
  return (
    <footer id="follow" className="site-footer">
      <div className="footer-inner">
        <h2 className="footer-title">ช่องทางการติดตาม</h2>
        <ul className="footer-socials">
          {socials.map((social) => (
            <li key={social.name}>
              <a href={social.url} target="_blank" rel="noopener noreferrer">{social.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
