// Gambar 2D (SVG): persegi, persegi panjang, balok/kubus (proyeksi miring), dan jaring-jaring.
// Dipakai di materi dan sebagai cadangan bila WebGL tidak tersedia.
import { EDGE_COLOR, FACE_COLORS } from './faces.js';

const txt = { fontFamily: 'inherit', fontWeight: 800, fontSize: 15, fill: '#1e293b' };

export function SquareFigure({ s = 6 }) {
  return <RectFigure p={s} l={s} labelP="s" labelL="s" color={FACE_COLORS.a} />;
}

export function RectFigure({ p = 8, l = 5, labelP = 'p', labelL = 'l', color = FACE_COLORS.b }) {
  const k = Math.min(200 / p, 130 / l);
  const w = p * k; const h = l * k;
  return (
    <svg viewBox={`0 0 ${w + 70} ${h + 60}`} width="100%" style={{ maxHeight: 220 }} role="img" aria-label={`Bangun datar ${labelP} kali ${labelL}`}>
      <rect x={40} y={15} width={w} height={h} fill={color} stroke={EDGE_COLOR} strokeWidth={2} rx={2} />
      <text {...txt} x={40 + w / 2} y={h + 40} textAnchor="middle">{labelP}</text>
      <text {...txt} x={22} y={15 + h / 2 + 5} textAnchor="middle">{labelL}</text>
    </svg>
  );
}

export function BoxFigure({ p = 6, l = 4, t = 3, cube = false }) {
  const cos = Math.cos(Math.PI / 6); const sin = Math.sin(Math.PI / 6);
  const k = Math.min(220 / (p + 0.6 * l * cos), 170 / (t + 0.6 * l * sin));
  const W = p * k; const H = t * k; const dx = 0.6 * l * k * cos; const dy = 0.6 * l * k * sin;
  const x0 = 34; const y0 = dy + 14;
  const pts = (arr) => arr.map(([x, y]) => `${x},${y}`).join(' ');
  const L = cube ? { p: 's', l: 's', t: 's' } : { p: 'p', l: 'l', t: 't' };
  return (
    <svg viewBox={`0 0 ${W + dx + 70} ${H + dy + 50}`} width="100%" style={{ maxHeight: 280 }} role="img"
      aria-label={cube ? 'Kubus dengan rusuk s' : 'Balok dengan panjang p, lebar l, tinggi t'}>
      {/* rusuk tersembunyi */}
      <g stroke={EDGE_COLOR} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6}>
        <line x1={x0} y1={y0 + H} x2={x0 + dx} y2={y0 + H - dy} />
        <line x1={x0 + dx} y1={y0 + H - dy} x2={x0 + W + dx} y2={y0 + H - dy} />
        <line x1={x0 + dx} y1={y0 + H - dy} x2={x0 + dx} y2={y0 - dy} />
      </g>
      <g stroke={EDGE_COLOR} strokeWidth={2} strokeLinejoin="round" fillOpacity={0.85}>
        <polygon points={pts([[x0, y0], [x0 + dx, y0 - dy], [x0 + W + dx, y0 - dy], [x0 + W, y0]])} fill={FACE_COLORS.a} />
        <polygon points={pts([[x0 + W, y0], [x0 + W + dx, y0 - dy], [x0 + W + dx, y0 - dy + H], [x0 + W, y0 + H]])} fill={FACE_COLORS.c} />
        <rect x={x0} y={y0} width={W} height={H} fill={FACE_COLORS.b} />
      </g>
      <text {...txt} x={x0 + W / 2} y={y0 + H + 24} textAnchor="middle">{L.p}</text>
      <text {...txt} x={x0 - 16} y={y0 + H / 2 + 5} textAnchor="middle">{L.t}</text>
      <text {...txt} x={x0 + W + dx / 2 + 14} y={y0 + H - dy / 2 + 14} textAnchor="middle">{L.l}</text>
    </svg>
  );
}

export function NetFigure({ p = 6, l = 4, t = 3, cube = false, showArea = false }) {
  const W = p + 2 * t; const Hh = 2 * l + 2 * t;
  const k = Math.min(300 / W, 340 / Hh);
  const sym = cube ? { a: 's × s', b: 's × s', c: 's × s' } : { a: 'p × l', b: 'p × t', c: 'l × t' };
  const area = { a: p * l, b: p * t, c: l * t };
  const faces = [
    { name: 'Tutup', x: t, y: 0, w: p, h: l, c: 'a' },
    { name: 'Belakang', x: t, y: l, w: p, h: t, c: 'b' },
    { name: 'Kiri', x: 0, y: l + t, w: t, h: l, c: 'c' },
    { name: 'Alas', x: t, y: l + t, w: p, h: l, c: 'a' },
    { name: 'Kanan', x: t + p, y: l + t, w: t, h: l, c: 'c' },
    { name: 'Depan', x: t, y: 2 * l + t, w: p, h: t, c: 'b' },
  ];
  return (
    <svg viewBox={`-4 -4 ${W * k + 8} ${Hh * k + 8}`} width="100%" style={{ maxHeight: 360 }} role="img"
      aria-label={cube ? 'Jaring-jaring kubus: 6 persegi sama besar' : 'Jaring-jaring balok: 3 pasang persegi panjang'}>
      {faces.map((f) => {
        const big = f.w * k > 54 && f.h * k > 34;
        return (
          <g key={f.name}>
            <rect x={f.x * k} y={f.y * k} width={f.w * k} height={f.h * k} fill={FACE_COLORS[f.c]} stroke={EDGE_COLOR} strokeWidth={2} />
            {big ? (
              <text x={(f.x + f.w / 2) * k} y={(f.y + f.h / 2) * k} textAnchor="middle" style={{ ...txt, fontSize: 12 }}>
                <tspan x={(f.x + f.w / 2) * k} dy="-0.2em">{f.name}</tspan>
                <tspan x={(f.x + f.w / 2) * k} dy="1.2em" style={{ fontWeight: 600 }}>{showArea ? `${area[f.c]}` : sym[f.c]}</tspan>
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
