// Bagian tubuh karakter (ditulis baru dari nol untuk v3): tangan berjari, lengan bersendi siku, mata ilustrasi.
// Semua koordinat dalam satuan viewBox karakter. Tangan digambar dengan pergelangan di (0,0) mengarah ke +y.

export const SKIN_LINE = '#c98463';

/**
 * Tangan. kind: 'relaxed' | 'open' | 'point' | 'thumb'
 * mirror: cerminkan untuk tangan sisi kiri layar.
 */
export function Hand({ kind = 'relaxed', fill, mirror = false }) {
  const s = { fill, stroke: SKIN_LINE, strokeWidth: 1.3, strokeLinejoin: 'round' };
  let body;
  if (kind === 'open') {
    body = (
      <g>
        {[-20, -7, 6, 19].map((a, i) => (
          <rect key={a} x="-2.6" y="15" width="5.2" height={i === 0 || i === 3 ? 11 : 13} rx="2.6" transform={`rotate(${a} 0 15)`} {...s} />
        ))}
        <path d="M-9 0 C-11 7 -11 15 -7 19 C-3 22 4 22 7 19 C10 15 10 7 8 0Z" {...s} />
        <path d="M7 6 C13 8 15 13 12 16 C10 17 8 15 7 13" {...s} />
      </g>
    );
  } else if (kind === 'point') {
    body = (
      <g>
        <rect x="-2.8" y="13" width="5.6" height="19" rx="2.8" {...s} />
        <path d="M-8 0 C-11 6 -10 15 -6 18 C-2 21 4 20 7 17 C9 13 9 5 7 0Z" {...s} />
        <path d="M-7 14 C-6 18 -2 19 0 17" fill="none" stroke={SKIN_LINE} strokeWidth="1.2" />
        <path d="M6 7 C10 9 10 14 6 15" {...s} />
      </g>
    );
  } else if (kind === 'thumb') {
    body = (
      <g>
        <rect x="-2.9" y="14" width="5.8" height="14" rx="2.9" {...s} />
        <path d="M-9 0 C-11 6 -10 14 -5 17 C0 19 6 17 8 13 C10 8 9 3 7 0Z" {...s} />
        <path d="M-6 6 h10 M-6 10 h10" stroke={SKIN_LINE} strokeWidth="1" />
      </g>
    );
  } else {
    body = (
      <g>
        <path d="M-8.5 0 C-11 8 -10 18 -7 23 C-4 27 3 27 6 23 C9 18 10 8 8 0Z" {...s} />
        <path d="M-4 15 v8 M0 16 v9 M3.6 15 v8" stroke={SKIN_LINE} strokeWidth="1" strokeLinecap="round" />
        <path d="M7.5 4 C12 7 12 12 8.5 14" {...s} />
      </g>
    );
  }
  return <g transform={mirror ? 'scale(-1 1)' : undefined}>{body}</g>;
}

/**
 * Lengan bersendi: bahu (sx,sy) → siku → pergelangan. Sudut dalam derajat (0 = menggantung ke bawah,
 * positif = searah jarum jam). Transisi CSS membuat perubahan pose halus.
 */
export function Arm({ sx, sy, upper, fore, U = 56, F = 50, hand = 'relaxed', mirror = false, sleeve, cuff = '#ffffff', skin, anim = null, outline = 'none' }) {
  const ol = { stroke: outline, strokeWidth: outline === 'none' ? 0 : 1.4 };
  return (
    <g className="c-arm" style={{ transform: `rotate(${upper}deg)`, transformOrigin: `${sx}px ${sy}px` }}>
      <path d={`M${sx - 13} ${sy - 4} C${sx - 14} ${sy + U * 0.5} ${sx - 12} ${sy + U} ${sx - 11} ${sy + U + 4} L${sx + 11} ${sy + U + 4} C${sx + 12} ${sy + U} ${sx + 14} ${sy + U * 0.5} ${sx + 13} ${sy - 4}Z`} fill={sleeve} {...ol} />
      <g className="c-fore" style={{ transform: `rotate(${fore}deg)`, transformOrigin: `${sx}px ${sy + U}px` }}>
        <g className={anim ? `c-anim ${anim}` : undefined} style={{ transformOrigin: `${sx}px ${sy + U}px` }}>
          <path d={`M${sx - 11} ${sy + U - 6} L${sx - 9.5} ${sy + U + F - 2} L${sx + 9.5} ${sy + U + F - 2} L${sx + 11} ${sy + U - 6}Z`} fill={sleeve} {...ol} />
          <circle cx={sx} cy={sy + U} r="11" fill={sleeve} />
          <rect x={sx - 10} y={sy + U + F - 6} width="20" height="7" rx="3" fill={cuff} />
          <g transform={`translate(${sx} ${sy + U + F}) scale(1.35)`}><Hand kind={hand} fill={skin} mirror={mirror} /></g>
        </g>
      </g>
    </g>
  );
}

/** Mata bergaya ilustrasi (putih, iris bergradasi, pupil, dua kilau, garis kelopak & bulu mata). */
export function Eye({ cx, cy, iris, look = [0, 0], side = 'left', lashes = true, lid = '#2b1a12' }) {
  const [dx, dy] = look;
  const outer = side === 'left' ? -1 : 1;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="11" ry="12.5" fill="#fff" />
      <ellipse cx={cx + dx} cy={cy + 1.5 + dy} rx="8.6" ry="10.4" fill={iris} />
      <ellipse cx={cx + dx} cy={cy + 2.5 + dy} rx="4.2" ry="5.2" fill="#1a0f08" />
      <circle cx={cx + dx + 3.2} cy={cy - 2.5 + dy} r="3" fill="#fff" />
      <circle cx={cx + dx - 3} cy={cy + 5.5 + dy} r="1.4" fill="#fff" opacity="0.85" />
      <path d={`M${cx - 12} ${cy - 3} Q${cx} ${cy - 15.5} ${cx + 12} ${cy - 4}`} fill="none" stroke={lid} strokeWidth="3.4" strokeLinecap="round" />
      {lashes ? <path d={`M${cx + outer * 11.5} ${cy - 3.5} l${outer * 4.5} -3.5`} stroke={lid} strokeWidth="2.4" strokeLinecap="round" /> : null}
      <path d={`M${cx - 7.5} ${cy + 11.5} Q${cx} ${cy + 14} ${cx + 7.5} ${cy + 11.5}`} fill="none" stroke="#c98b6b" strokeWidth="1.2" opacity="0.6" />
    </g>
  );
}

/** Mata tertutup senang (^ ^). */
export function HappyEye({ cx, cy, lid = '#2b1a12' }) {
  return <path d={`M${cx - 11} ${cy + 2} Q${cx} ${cy - 10} ${cx + 11} ${cy + 2}`} fill="none" stroke={lid} strokeWidth="3.6" strokeLinecap="round" />;
}
