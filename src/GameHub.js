import './Section.css';
import './Game.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { readBest } from './game/shared';

const games = [
  {
    path: '/game/naamtok',
    title: 'น้ำตกไม่ผัก',
    description: 'แตะเขี่ยผักออกจากชามก๋วยเตี๋ยว ก่อนถึงมือน้องการ์ตูน',
    bestKey: 'naamtok-best',
  },
  {
    path: '/game/next-girls',
    title: 'Journey to Next Girls',
    description: 'พาน้องวิ่งเก็บหัวใจจากแฟนคลับ กระโดดหลบอุปกรณ์บนเวที',
    bestKey: 'next-girls-best',
  },
];

function GameHub() {
  return (
    <section className="section">
      <h1 className="visually-hidden">เกม</h1>
      <ul className="game-list">
        {games.map((game) => {
          const best = readBest(game.bestKey);
          return (
            <li key={game.path}>
              <Link to={game.path}>
                <strong>{game.title}</strong>
                <span>{game.description}</span>
                {best > 0 && <span className="game-list-best">สถิติของคุณ {best} คะแนน</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default GameHub;
