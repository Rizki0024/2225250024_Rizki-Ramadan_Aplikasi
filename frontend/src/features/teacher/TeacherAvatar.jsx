// Guru virtual "Bu Sari" — karakter SVG buatan sendiri (tanpa aset berlisensi pihak ketiga).
// Ringan: hanya SVG + transisi/keyframe CSS pada transform; dihentikan saat "kurangi gerakan".
import './teacher.css';

export const EXPRESSIONS = ['neutral', 'happy', 'explaining', 'thinking', 'listening', 'proud'];
export const POSES = ['idle', 'wave', 'talk', 'point', 'listen', 'think', 'cheer'];

// Sudut lengan (derajat, searah jarum jam) di bahu kiri layar (64,152) dan kanan layar (136,152).
const ARMS = {
  idle: [12, -12],
  wave: [12, -150],
  talk: [12, -48],
  point: [96, -14],
  listen: [12, 178],
  think: [12, 151],
  cheer: [150, -150],
};
const HEAD_TILT = { listen: 6, think: -5 };

const SKIN = '#f5c6a5';
const INK = '#1b2440';

function Mouth({ expression, speaking }) {
  if (speaking) {
    return <ellipse className="t-mouth-talk" cx="100" cy="99" rx="7" ry="5" fill="#8f2d3a" />;
  }
  switch (expression) {
    case 'happy':
      return <path d="M88 95 Q100 109 112 95 Q100 100 88 95Z" fill="#8f2d3a" />;
    case 'proud':
      return <path d="M84 94 Q100 115 116 94 Q100 101 84 94Z" fill="#8f2d3a" />;
    case 'explaining':
      return <ellipse cx="100" cy="99" rx="6" ry="4" fill="#8f2d3a" />;
    case 'thinking':
      return <path d="M92 100 Q100 97 109 101" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    case 'listening':
      return <path d="M92 97 Q100 104 108 97" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M91 98 Q100 103 109 98" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
  }
}

function Eyes({ expression }) {
  if (expression === 'proud') {
    return (
      <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M81 80 Q87 73 93 80" />
        <path d="M107 80 Q113 73 119 80" />
      </g>
    );
  }
  const dx = expression === 'thinking' ? 2 : 0;
  const dy = expression === 'thinking' ? -2 : 0;
  return (
    <g className="t-eyes">
      <ellipse cx={87 + dx} cy={79 + dy} rx="4" ry="5" fill={INK} />
      <ellipse cx={113 + dx} cy={79 + dy} rx="4" ry="5" fill={INK} />
      <circle cx={88.5 + dx} cy={77 + dy} r="1.3" fill="#fff" />
      <circle cx={114.5 + dx} cy={77 + dy} r="1.3" fill="#fff" />
    </g>
  );
}

function Brows({ expression }) {
  const raise = expression === 'thinking' ? -4 : expression === 'listening' ? -2 : 0;
  return (
    <g stroke="#5b3a29" strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path d={`M80 ${69} Q87 ${65} 94 ${68}`} />
      <path d={`M106 ${68 + raise} Q113 ${64 + raise} 120 ${69 + raise}`} />
    </g>
  );
}

function Arm({ side, angle, animate }) {
  const ox = side === 'left' ? 64 : 136;
  const oy = 152;
  return (
    <g className="t-arm" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${ox}px ${oy}px` }}>
      <g className={animate ? `t-arm-anim ${animate}` : undefined} style={{ transformOrigin: `${ox}px ${oy}px` }}>
        <rect x={ox - 10} y={oy - 4} width="20" height="62" rx="10" fill="#4f7df3" />
        <circle cx={ox} cy={oy + 64} r="10" fill={SKIN} />
      </g>
    </g>
  );
}

/**
 * props:
 *  expression: neutral | happy | explaining | thinking | listening | proud
 *  pose: idle | wave | talk | point | listen | think | cheer
 *  speaking: mulut bergerak (sinkron kasar dengan suara)
 *  size: lebar piksel
 */
export default function TeacherAvatar({ expression = 'neutral', pose = 'idle', speaking = false, size = 200, title = 'Bu Sari, guru virtual' }) {
  const [la, ra] = ARMS[pose] || ARMS.idle;
  const tilt = HEAD_TILT[pose] || 0;
  const rightAnim = pose === 'wave' ? 'wave' : pose === 'talk' || (speaking && pose === 'idle') ? 'gesture' : null;
  return (
    <svg className={`teacher pose-${pose} expr-${expression}${speaking ? ' is-speaking' : ''}`}
      viewBox="0 0 200 240" width={size} height={(size * 240) / 200} role="img" aria-label={title}
      data-expression={expression} data-pose={pose} data-speaking={speaking ? 'true' : 'false'}>
      <g className="t-body">
        {/* lengan di belakang badan */}
        <Arm side="left" angle={la} animate={null} />
        <Arm side="right" angle={ra} animate={rightAnim} />
        {/* badan: blus + kardigan */}
        <path d="M54 240 C54 186 66 150 100 146 C134 150 146 186 146 240Z" fill="#6f95f6" />
        <path d="M84 150 L100 186 L116 150 C110 148 90 148 84 150Z" fill="#fff" />
        <path d="M100 186 L100 240" stroke="#5a80e8" strokeWidth="2" />
        <circle cx="100" cy="204" r="2.4" fill="#fff" />
        <circle cx="100" cy="222" r="2.4" fill="#fff" />
        {/* kepala + kerudung */}
        <g className="t-head" style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '100px 128px' }}>
          <path d="M58 92 C54 44 78 30 100 30 C122 30 146 44 142 92 C146 120 128 150 100 152 C72 150 54 120 58 92Z" fill="#8fb3ff" />
          <ellipse cx="100" cy="84" rx="31" ry="35" fill={SKIN} />
          <path d="M66 70 C70 46 86 40 100 40 C114 40 130 46 134 70 C126 56 114 50 100 50 C86 50 74 56 66 70Z" fill="#7aa2fb" />
          <circle cx="80" cy="92" r="6" fill="#f59e9e" opacity="0.45" />
          <circle cx="120" cy="92" r="6" fill="#f59e9e" opacity="0.45" />
          <Brows expression={expression} />
          <Eyes expression={expression} />
          <path d="M100 84 Q98 90 101 91" stroke="#c98f6e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Mouth expression={expression} speaking={speaking} />
        </g>
        {/* tanda berpikir / mendengar */}
        {expression === 'thinking' ? (
          <g className="t-think-dots" fill="#b9c6e8">
            <circle cx="150" cy="44" r="4" /><circle cx="162" cy="30" r="6" /><circle cx="178" cy="14" r="9" />
          </g>
        ) : null}
        {expression === 'listening' ? (
          <g className="t-listen-waves" stroke="#8fb3ff" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M152 70 Q160 82 152 94" /><path d="M162 62 Q174 82 162 102" />
          </g>
        ) : null}
        {expression === 'proud' ? (
          <g className="t-sparkles" fill="#fbbf24">
            <path d="M40 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
            <path d="M160 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
          </g>
        ) : null}
      </g>
    </svg>
  );
}
