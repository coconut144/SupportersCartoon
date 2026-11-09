import React from 'react';

const SHOWN = 5;

const formatWhen = (iso) =>
  new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// ประวัติรอบล่าสุดใต้เกม: รอบแรกในรายการคือรอบที่เพิ่งเล่น
// detail(run) คืนข้อความเสริมของแต่ละเกม เช่น "120 ม. · ♥ 4"
function RunHistory({ history, detail }) {
  if (!history.runs.length) return null;
  const best = Math.max(...history.runs.map((run) => run.score));

  return (
    <section className="sheet run-history" aria-labelledby="run-history-title">
      <h2 className="run-history-title" id="run-history-title">ประวัติ {Math.min(SHOWN, history.runs.length)} รอบล่าสุด</h2>
      <ol className="run-history-list">
        {history.runs.slice(0, SHOWN).map((run, index) => (
          <li key={`${run.at}-${index}`} className={index === 0 ? 'is-latest' : undefined}>
            <time dateTime={run.at}>{formatWhen(run.at)}</time>
            {detail && <span className="run-history-detail">{detail(run)}</span>}
            <strong>{run.score}</strong>
            {run.score === best && <span className="run-history-best">ดีที่สุด</span>}
          </li>
        ))}
      </ol>
      <p className="run-history-plays">เล่นไปแล้ว {history.plays} รอบในเครื่องนี้</p>
    </section>
  );
}

export default RunHistory;
