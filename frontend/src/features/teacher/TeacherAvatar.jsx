// Guru virtual "Bu Sari" — aset karakter SVG terpisah, dapat dianimasikan & dipakai di banyak halaman.
// Dua tampilan: 'rambut' (rambut panjang + blazer, mengikuti desain v3) dan 'kerudung' (tampilan v2).
// Digambar sendiri (tanpa aset berlisensi pihak ketiga). Ringan: SVG + CSS transform.
import { useId } from 'react';
import { useSettings } from '../../hooks/useSettings.jsx';
import './teacher.css';

export const EXPRESSIONS = ['neutral', 'happy', 'explaining', 'thinking', 'listening', 'proud'];
export const POSES = ['idle', 'wave', 'talk', 'point', 'listen', 'think', 'cheer'];
export const LOOKS = { rambut: 'Rambut panjang', kerudung: 'Berkerudung' };

// Sudut lengan (derajat) di bahu kiri layar (64,152) dan kanan layar (136,152).
const ARMS = {
  idle: [12, -12], wave: [12, -150], talk: [12, -48], point: [96, -14],
  listen: [12, 178], think: [12, 151], cheer: [150, -150],
};
const HEAD_TILT = { listen: 6, think: -5 };
const INK = '#1b2440';
const LIP = '#c2415a';

const PALETTE = {
  rambut: { top: ['#f6d7b0', '#d39a5c'], sleeve: ['#e2b07a', '#c2884d'], cuff: '#fff', shirt: '#fff', accent: '#fde68a' },
  kerudung: { top: ['#5b8cff', '#2f5fe0'], sleeve: ['#6d9bff', '#3a68e8'], cuff: '#fff', shirt: '#fff', accent: '#fde68a' },
};

function Mouth({ expression, speaking }) {
  if (speaking) {
    return (
      <g className="t-mouth-talk">
        <ellipse cx="100" cy="101" rx="7.5" ry="6" fill={LIP} />
        <ellipse cx="100" cy="104" rx="4.5" ry="2.4" fill="#ff9aac" />
      </g>
    );
  }
  switch (expression) {
    case 'happy':
      return <g><path d="M87 96 Q100 112 113 96 Q100 101 87 96Z" fill={LIP} /><path d="M92 101 Q100 106 108 101" stroke="#ff9aac" strokeWidth="3" fill="none" strokeLinecap="round" /></g>;
    case 'proud':
      return <g><path d="M83 95 Q100 118 117 95 Q100 101 83 95Z" fill={LIP} /><path d="M89 102 Q100 109 111 102" stroke="#ff9aac" strokeWidth="3.4" fill="none" strokeLinecap="round" /></g>;
    case 'explaining':
      return <ellipse cx="100" cy="100" rx="6" ry="4.5" fill={LIP} />;
    case 'thinking':
      return <path d="M92 101 Q100 98 109 102" stroke={LIP} strokeWidth="3" fill="none" strokeLinecap="round" />;
    case 'listening':
      return <path d="M91 98 Q100 106 109 98" stroke={LIP} strokeWidth="3" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M90 99 Q100 105 110 99" stroke={LIP} strokeWidth="3" fill="none" strokeLinecap="round" />;
  }
}

function Eyes({ expression }) {
  if (expression === 'proud') {
    return (
      <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M78 81 Q86 72 94 81" /><path d="M106 81 Q114 72 122 81" />
      </g>
    );
  }
  const dx = expression === 'thinking' ? 2.5 : 0;
  const dy = expression === 'thinking' ? -2.5 : 0;
  const eye = (cx) => (
    <g key={cx}>
      <ellipse cx={cx} cy={80} rx="7.4" ry="8.8" fill="#fff" />
      <ellipse cx={cx + dx} cy={81 + dy} rx="5.8" ry="7.2" fill="#6b3a1f" />
      <ellipse cx={cx + dx} cy={82 + dy} rx="3.4" ry="4.4" fill={INK} />
      <circle cx={cx + dx + 2} cy={78 + dy} r="2.2" fill="#fff" />
      <circle cx={cx + dx - 2} cy={84.5 + dy} r="1" fill="#fff" opacity="0.8" />
    </g>
  );
  return (
    <g className="t-eyes">
      {eye(86)}{eye(114)}
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M78 75 Q86 69 94 74" /><path d="M106 74 Q114 69 122 75" />
        <path d="M78 75 l-3 -2" /><path d="M122 75 l3 -2" />
      </g>
    </g>
  );
}

function Brows({ expression }) {
  const raise = expression === 'thinking' ? -4 : expression === 'listening' ? -2 : 0;
  return (
    <g stroke="#5b3a29" strokeWidth="3" strokeLinecap="round" fill="none">
      <path d="M79 64 Q86 60 93 63" />
      <path d={`M107 ${63 + raise} Q114 ${59 + raise} 121 ${64 + raise}`} />
    </g>
  );
}

function Arm({ side, angle, animate, sleeve, skin, cuff }) {
  const ox = side === 'left' ? 64 : 136;
  const oy = 152;
  return (
    <g className="t-arm" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${ox}px ${oy}px` }}>
      <g className={animate ? `t-arm-anim ${animate}` : undefined} style={{ transformOrigin: `${ox}px ${oy}px` }}>
        <rect x={ox - 11} y={oy - 4} width="22" height="62" rx="11" fill={sleeve} />
        <rect x={ox - 11} y={oy + 46} width="22" height="8" rx="4" fill={cuff} opacity="0.9" />
        <circle cx={ox} cy={oy + 64} r="11" fill={skin} />
        <circle cx={ox - 3} cy={oy + 60} r="3.5" fill="#fff" opacity="0.35" />
      </g>
    </g>
  );
}

/** Lapisan rambut belakang (di belakang badan, ikut miring bersama kepala). */
function BackHair({ look, g }) {
  if (look !== 'rambut') return null;
  return <path d="M50 92 C42 40 78 22 100 22 C124 22 160 40 150 96 C156 150 150 176 132 184 C120 160 128 120 120 100 L80 100 C72 120 80 160 68 184 C50 176 44 150 50 92Z" fill={`url(#${g('hair')})`} />;
}

function HeadFrame({ look, g }) {
  if (look === 'kerudung') {
    return (
      <>
        <path d="M56 90 C50 40 78 24 100 24 C122 24 150 40 144 90 C148 122 128 152 100 154 C72 152 52 122 56 90Z" fill={`url(#${g('hijab')})`} />
        <ellipse cx="100" cy="84" rx="33" ry="36" fill={`url(#${g('skin')})`} />
        <path d="M64 70 C68 42 86 34 100 34 C114 34 132 42 136 70 C128 54 114 46 100 46 C86 46 72 54 64 70Z" fill="#7c6ae6" />
        <path d="M74 40 Q90 30 108 32" stroke="#fff" strokeWidth="5" opacity="0.35" strokeLinecap="round" fill="none" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="68" cy="88" rx="5" ry="8" fill={`url(#${g('skin')})`} />
      <ellipse cx="132" cy="88" rx="5" ry="8" fill={`url(#${g('skin')})`} />
      <ellipse cx="100" cy="84" rx="33" ry="37" fill={`url(#${g('skin')})`} />
      {/* poni menyamping */}
      <path d="M64 82 C60 48 82 34 102 34 C126 34 142 50 136 84 C130 66 120 56 106 52 C98 64 82 70 64 82Z" fill={`url(#${g('hair')})`} />
      <path d="M84 44 Q100 36 118 42" stroke="#fff" strokeWidth="4" opacity="0.28" strokeLinecap="round" fill="none" />
    </>
  );
}

/**
 * props:
 *  expression: neutral | happy | explaining | thinking | listening | proud
 *  pose: idle | wave | talk | point | listen | think | cheer
 *  speaking: mulut bergerak · size: lebar piksel · look: 'rambut' | 'kerudung' (bawaan: Pengaturan)
 */
export default function TeacherAvatar({ expression = 'neutral', pose = 'idle', speaking = false, size = 200, look, title = 'Bu Sari, guru virtual' }) {
  const { settings } = useSettings();
  const variant = look || settings.teacherLook || 'rambut';
  const pal = PALETTE[variant] || PALETTE.rambut;
  const uid = useId().replace(/:/g, '');
  const g = (n) => `${uid}-${n}`;
  const [la, ra] = ARMS[pose] || ARMS.idle;
  const tilt = HEAD_TILT[pose] || 0;
  const rightAnim = pose === 'wave' ? 'wave' : pose === 'talk' || (speaking && pose === 'idle') ? 'gesture' : null;
  const sleeve = `url(#${g('sleeve')})`;
  const skin = `url(#${g('skin')})`;
  const headStyle = { transform: `rotate(${tilt}deg)`, transformOrigin: '100px 132px' };
  return (
    <svg className={`teacher look-${variant} pose-${pose} expr-${expression}${speaking ? ' is-speaking' : ''}`}
      viewBox="0 0 200 240" width={size} height={(size * 240) / 200} role="img" aria-label={title}
      data-expression={expression} data-pose={pose} data-speaking={speaking ? 'true' : 'false'} data-look={variant}>
      <defs>
        <radialGradient id={g('skin')} cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#ffe1cc" /><stop offset="1" stopColor="#f0b48f" /></radialGradient>
        <linearGradient id={g('hijab')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b9a8ff" /><stop offset="1" stopColor="#6d5bd6" /></linearGradient>
        <linearGradient id={g('hair')} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#8a5232" /><stop offset="1" stopColor="#4e2a17" /></linearGradient>
        <linearGradient id={g('top')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.top[0]} /><stop offset="1" stopColor={pal.top[1]} /></linearGradient>
        <linearGradient id={g('sleeve')} x1="0" x2="1"><stop offset="0" stopColor={pal.sleeve[0]} /><stop offset="1" stopColor={pal.sleeve[1]} /></linearGradient>
      </defs>
      <ellipse cx="100" cy="236" rx="52" ry="5" fill={INK} opacity="0.12" />
      <g className="t-body">
        <g className="t-head-back" style={headStyle}><g transform="translate(100 92) scale(1.12) translate(-100 -92)"><BackHair look={variant} g={g} /></g></g>
        <Arm side="left" angle={la} animate={null} sleeve={sleeve} skin={skin} cuff={pal.cuff} />
        <Arm side="right" angle={ra} animate={rightAnim} sleeve={sleeve} skin={skin} cuff={pal.cuff} />
        {/* badan: blazer / kardigan */}
        <path d="M52 236 C52 184 66 148 100 144 C134 148 148 184 148 236Z" fill={`url(#${g('top')})`} />
        <path d="M84 148 L100 192 L116 148 C110 146 90 146 84 148Z" fill={pal.shirt} />
        {variant === 'rambut' ? (
          <g>
            <path d="M84 148 L100 192 L90 196 L74 160Z" fill="#c2884d" />
            <path d="M116 148 L100 192 L110 196 L126 160Z" fill="#c2884d" />
            <circle cx="100" cy="212" r="3.2" fill="#8a5232" /><circle cx="100" cy="226" r="3.2" fill="#8a5232" />
          </g>
        ) : (
          <g>
            <path d="M100 190 L100 236" stroke="#2a55cc" strokeWidth="2" />
            <circle cx="100" cy="206" r="3" fill={pal.accent} /><circle cx="100" cy="222" r="3" fill={pal.accent} />
          </g>
        )}
        <rect x="112" y="198" width="18" height="12" rx="3" fill={pal.accent} /><path d="M115 204 h12" stroke="#d97706" strokeWidth="2" />
        <path d="M60 190 Q66 170 78 160" stroke="#fff" strokeWidth="4" opacity="0.22" strokeLinecap="round" fill="none" />
        {/* kepala */}
        <g className="t-head" style={headStyle}>
          <g transform="translate(100 92) scale(1.12) translate(-100 -92)">
            <HeadFrame look={variant} g={g} />
            <ellipse cx="78" cy="94" rx="7" ry="4.5" fill="#ff8fa3" opacity="0.45" />
            <ellipse cx="122" cy="94" rx="7" ry="4.5" fill="#ff8fa3" opacity="0.45" />
            <Brows expression={expression} />
            <Eyes expression={expression} />
            <path d="M100 87 Q98 92 101 93" stroke="#d59474" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <Mouth expression={expression} speaking={speaking} />
            {variant === 'kerudung' ? <circle cx="134" cy="112" r="4" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" /> : <circle cx="132" cy="100" r="2.6" fill="#fde68a" />}
          </g>
        </g>
        {expression === 'thinking' ? (
          <g className="t-think-dots" fill="#c4b5fd"><circle cx="152" cy="42" r="4" /><circle cx="164" cy="28" r="6" /><circle cx="180" cy="12" r="9" /></g>
        ) : null}
        {expression === 'listening' ? (
          <g className="t-listen-waves" stroke="#a78bfa" strokeWidth="3.4" fill="none" strokeLinecap="round"><path d="M156 70 Q164 82 156 94" /><path d="M166 62 Q178 82 166 102" /></g>
        ) : null}
        {expression === 'proud' ? (
          <g className="t-sparkles" fill="#fbbf24"><path d="M36 36 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" /><path d="M164 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /></g>
        ) : null}
      </g>
    </svg>
  );
}
