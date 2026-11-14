// Grafik batang aktivitas 7 hari terakhir (satu seri → satu warna, tanpa legenda; judul menamai seri).
// Hari ini ditandai dengan label tebal + angka di atas batang (bukan dengan warna lain).
import { useState } from 'react';
import { motion } from 'motion/react';

const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BAR = '#2563eb';

export function lastSevenDays(attempts, now = new Date()) {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ date: d, count: 0, today: i === 0 });
  }
  for (const a of attempts || []) {
    const t = new Date(a.submitted_at || a.started_at);
    const key = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
    const slot = days.find((d) => d.date.getTime() === key);
    if (slot) slot.count += 1;
  }
  return days;
}

export default function WeekChart({ attempts }) {
  const days = lastSevenDays(attempts);
  const [hover, setHover] = useState(null);
  const W = 320; const H = 150; const top = 22; const base = 118; const slot = W / 7; const bw = 24;
  const max = Math.max(1, ...days.map((d) => d.count));
  const y = (v) => base - ((base - top) * v) / max;
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <figure className="figure" style={{ position: 'relative' }}>
      <svg className="week-chart" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Aktivitas 7 hari terakhir: total ${total} latihan dan evaluasi`}>
        <line x1="0" x2={W} y1={base} y2={base} stroke="#d6dcea" strokeWidth="1" />
        {days.map((d, i) => {
          const cx = slot * i + slot / 2;
          const h = base - y(d.count);
          const x = cx - bw / 2;
          const r = Math.min(4, h);
          const path = h > 0
            ? `M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + bw - r} Q${x + bw},${base - h} ${x + bw},${base - h + r} V${base} Z`
            : null;
          const label = `${DAY_FULL[d.date.getDay()]}${d.today ? ' (hari ini)' : ''}: ${d.count} aktivitas`;
          return (
            <g key={i}>
              {path ? (
                <motion.path d={path} fill={BAR} opacity={hover === null || hover === i ? 1 : 0.55}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: `${cx}px ${base}px` }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
              ) : (
                <rect x={x} y={base - 3} width={bw} height="3" rx="1.5" fill="#d6dcea" />
              )}
              {d.today && d.count > 0 ? (
                <text x={cx} y={base - h - 6} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1b2440">{d.count}</text>
              ) : null}
              <text x={cx} y={base + 16} textAnchor="middle" fontSize={d.today ? 12 : 11} fontWeight={d.today ? 900 : 600} fill={d.today ? '#1b2440' : '#5f6b85'}>
                {DAY[d.date.getDay()]}
              </text>
              {d.today ? <text x={cx} y={base + 30} textAnchor="middle" fontSize="10" fontWeight="800" fill="#1b2440">Hari ini</text> : null}
              <rect className="bar-hit" x={cx - slot / 2} y={top - 10} width={slot} height={base - top + 10} fill="transparent"
                tabIndex={0} role="img" aria-label={label}
                onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} />
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div className="chart-tip" role="status"
          style={{ left: `${((slot * hover + slot / 2) / W) * 100}%`, top: `${(y(days[hover].count) / H) * 100}%` }}>
          {DAY_FULL[days[hover].date.getDay()]}: {days[hover].count} aktivitas
        </div>
      ) : null}
      <table className="sr-only">
        <caption>Aktivitas 7 hari terakhir</caption>
        <thead><tr><th>Hari</th><th>Aktivitas</th></tr></thead>
        <tbody>{days.map((d, i) => <tr key={i}><td>{DAY_FULL[d.date.getDay()]}</td><td>{d.count}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
