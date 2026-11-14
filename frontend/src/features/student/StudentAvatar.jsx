// Karakter siswa (aset SVG terpisah) untuk halaman awal & menu. Digambar sendiri.
import { useId } from 'react';
import '../teacher/teacher.css';

export default function StudentAvatar({ size = 180, pose = 'thumb', title = 'Siswa' }) {
  const uid = useId().replace(/:/g, '');
  const g = (n) => `${uid}-${n}`;
  return (
    <svg className={`student pose-${pose}`} viewBox="0 0 200 240" width={size} height={(size * 240) / 200} role="img" aria-label={title}>
      <defs>
        <radialGradient id={g('skin')} cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#ffe1cc" /><stop offset="1" stopColor="#efb08a" /></radialGradient>
        <linearGradient id={g('hair')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b3b1f" /><stop offset="1" stopColor="#3b1f10" /></linearGradient>
        <linearGradient id={g('bag')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f7df3" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="236" rx="50" ry="5" fill="#1b2440" opacity="0.14" />
      <g className="t-body">
        {/* tas */}
        <rect x="48" y="146" width="104" height="70" rx="20" fill={`url(#${g('bag')})`} />
        {/* celana + badan */}
        <path d="M72 200 h56 v34 h-24 v-18 h-8 v18 h-24z" fill="#23315e" />
        <path d="M60 210 C60 168 74 146 100 144 C126 146 140 168 140 210Z" fill="#fff" />
        <path d="M92 150 L100 168 L108 150Z" fill="#dbe6ff" />
        <path d="M98 160 l2 26 2 -26z" fill="#1d4ed8" />
        {/* lengan kiri layar */}
        <g style={{ transform: 'rotate(18deg)', transformOrigin: '66px 158px' }}>
          <rect x="56" y="154" width="20" height="50" rx="10" fill="#fff" /><circle cx="66" cy="208" r="10" fill={`url(#${g('skin')})`} />
        </g>
        {/* lengan kanan layar: jempol */}
        <g className="t-arm-anim wave" style={{ transformOrigin: '134px 158px' }}>
          <g style={{ transform: pose === 'thumb' ? 'rotate(-150deg)' : 'rotate(-18deg)', transformOrigin: '134px 158px' }}>
            <rect x="124" y="154" width="20" height="48" rx="10" fill="#fff" />
            <circle cx="134" cy="206" r="11" fill={`url(#${g('skin')})`} />
            {pose === 'thumb' ? <rect x="138" y="198" width="7" height="14" rx="3.5" fill={`url(#${g('skin')})`} /> : null}
          </g>
        </g>
        {/* kepala */}
        <g transform="translate(100 92) scale(1.1) translate(-100 -92)">
          <ellipse cx="66" cy="90" rx="6" ry="9" fill={`url(#${g('skin')})`} />
          <ellipse cx="134" cy="90" rx="6" ry="9" fill={`url(#${g('skin')})`} />
          <ellipse cx="100" cy="88" rx="34" ry="37" fill={`url(#${g('skin')})`} />
          <path d="M64 86 C56 44 84 30 104 32 C130 34 146 52 136 86 C132 70 124 62 114 58 C108 66 94 66 84 60 C76 66 70 74 64 86Z" fill={`url(#${g('hair')})`} />
          <path d="M96 32 l6 -8 4 9z" fill="#3b1f10" />
          <g className="t-eyes">
            {[86, 114].map((cx) => (
              <g key={cx}><ellipse cx={cx} cy="86" rx="7" ry="8.4" fill="#fff" /><ellipse cx={cx} cy="87" rx="5.4" ry="6.6" fill="#5a3218" /><ellipse cx={cx} cy="88" rx="3.2" ry="4" fill="#1b2440" /><circle cx={cx + 2} cy="84" r="2" fill="#fff" /></g>
            ))}
          </g>
          <g stroke="#3b1f10" strokeWidth="3" strokeLinecap="round" fill="none"><path d="M79 73 Q86 69 93 72" /><path d="M107 72 Q114 69 121 73" /></g>
          <ellipse cx="78" cy="99" rx="6" ry="4" fill="#ff8fa3" opacity="0.45" /><ellipse cx="122" cy="99" rx="6" ry="4" fill="#ff8fa3" opacity="0.45" />
          <path d="M86 102 Q100 118 114 102 Q100 107 86 102Z" fill="#c2415a" />
        </g>
      </g>
    </svg>
  );
}
