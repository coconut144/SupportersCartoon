import './Section.css';
import './Game.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { readBest, readHistory, summarize } from './game/shared';

const games = [
  {
    path: '/game/naamtok',
    title: 'น้ำตกไม่ผัก',
    description: 'แตะเขี่ยผักออกจากชามก๋วยเตี๋ยว ก่อนถึงมือน้องการ์ตูน',
    bestKey: 'naamtok-best',
    historyKey: 'naamtok',
  },
  {
    path: '/game/next-girls',
    title: 'Stage Runner',
    description: 'พาน้องวิ่งเก็บหัวใจจากแฟนคลับ กระโดดหลบอุปกรณ์บนเวที',
    bestKey: 'next-girls-best',
    historyKey: 'next-girls',
  },
  {
    path: '/game/quiz',
    title: 'รู้จักน้องการ์ตูนแค่ไหน?',
    description: 'ควิซ 10 ข้อเกี่ยวกับน้อง ตอบแล้วดูว่าเป็นแฟนระดับไหน',
    bestKey: 'quiz-best',
    bestLabel: (best) => `สถิติของคุณ ${best}/10 ข้อ`,
  },
  {
    path: '/game/card',
    title: 'ทำบัตรแฟนคลับ',
    description: 'ใส่ชื่อเล่น รับบัตร MEMBER ของตัวเอง ',
    play: 'ทำบัตรเลย →',
  },
  {
    path: '/game/certificate',
    title: 'ทำเกียรติบัตร',
    description: 'ร่วมโปรเจกต์ซัพพอร์ตน้องแล้ว รับเกียรติบัตรผู้ร่วมโปรเจกต์ไปเก็บไว้ได้เลย',
    play: 'ทำเกียรติบัตร →',
  },
  {
    path: '/heart',
    title: 'Heart to Heart',
    description: 'เขียนคำอวยพรหรือกำลังใจถึงน้อง แล้วรับเกียรติบัตร Heart to Heart',
    play: 'ส่งใจเลย →',
  },
];

function GameHub() {
  return (
    <section className="section">
      <h1 className="page-title">เกม</h1>
      <ul className="game-list">
        {games.map((game, index) => {
          const best = game.bestKey ? readBest(game.bestKey) : 0;
          const { plays, average } = game.historyKey ? summarize(readHistory(game.historyKey)) : { plays: 0, average: 0 };
          return (
            <li key={game.path}>
              <Link to={game.path} className="sheet">
                <span className={`tape ${index % 2 ? 'tape-sky tape-right' : 'tape-left'}`} aria-hidden="true" />
                <strong>{game.title}</strong>
                <span>{game.description}</span>
                {best > 0 && <span className="game-list-best">{game.bestLabel ? game.bestLabel(best) : `สถิติของคุณ ${best} คะแนน`}</span>}
                {plays > 0 && <span className="game-list-stats">เล่นแล้ว {plays} รอบ · เฉลี่ย {average} คะแนน</span>}
                <span className="game-list-play" aria-hidden="true">{game.play || 'เล่นเลย →'}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default GameHub;
