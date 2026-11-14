// Guru virtual "Bu Sari" — aset karakter v3 (ditulis ulang dari nol mengikuti gaya papan desain):
// setengah badan, rambut cokelat panjang bergelombang, blazer cokelat muda, kemeja putih, tangan berjari.
import { useId } from 'react';
import { Arm, Eye, HappyEye } from './parts.jsx';
import './characters.css';

export const EXPRESSIONS = ['neutral', 'happy', 'explaining', 'thinking', 'listening', 'proud'];
export const POSES = ['idle', 'wave', 'talk', 'point', 'listen', 'think', 'cheer'];

// [atasKiri, bawahKiri, atasKanan, bawahKanan, tanganKiri, tanganKanan, animasiKanan]
const POSE = {
  idle: [10, -6, -10, 6, 'relaxed', 'relaxed', null],
  wave: [10, -6, -140, -40, 'relaxed', 'open', 'wave'],
  cheer: [140, 40, -140, -40, 'open', 'open', 'wave'],
  talk: [10, -6, -35, -100, 'relaxed', 'open', 'gesture'],
  point: [10, -6, -30, -80, 'relaxed', 'point', null],
  listen: [10, -6, -170, -15, 'relaxed', 'open', null],
  think: [10, -6, 50, 130, 'relaxed', 'relaxed', null],
};

const LID = '#2b1a12';
const LIP = '#b8384f';

function Mouth({ expression, speaking }) {
  if (speaking) {
    return (
      <g className="c-mouth-talk">
        <ellipse cx="130" cy="137" rx="7.5" ry="6" fill={LIP} />
        <ellipse cx="130" cy="140" rx="4.6" ry="2.6" fill="#ff8fa0" />
      </g>
    );
  }
  switch (expression) {
    case 'happy':
      return <g><path d="M117 132 Q130 147 143 132 Q130 136 117 132Z" fill={LIP} /><path d="M122 138 Q130 142 138 138" stroke="#ff8fa0" strokeWidth="3" fill="none" strokeLinecap="round" /></g>;
    case 'proud':
      return <g><path d="M113 130 Q130 152 147 130 Q130 135 113 130Z" fill={LIP} /><path d="M117 131.5 Q130 135 143 131.5 L142 134 Q130 137 118 134Z" fill="#fff" /></g>;
    case 'explaining':
      return <ellipse cx="130" cy="136" rx="6" ry="4.6" fill={LIP} />;
    case 'thinking':
      return <path d="M122 137 Q130 134 139 138" stroke={LIP} strokeWidth="2.8" fill="none" strokeLinecap="round" />;
    case 'listening':
      return <path d="M121 134 Q130 141 139 134" stroke={LIP} strokeWidth="2.8" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M120 134 Q130 142 140 134" stroke={LIP} strokeWidth="2.8" fill="none" strokeLinecap="round" />;
  }
}

/**
 * props: expression, pose, speaking (mulut bergerak), size (lebar px),
 *        facing: 'right' (bawaan, menunjuk ke kanan layar) | 'left' (dicerminkan)
 */
export default function Teacher({ expression = 'neutral', pose = 'idle', speaking = false, size = 220, facing = 'right', title = 'Bu Sari, guru virtual' }) {
  const id = useId().replace(/:/g, '');
  const g = (n) => `${id}-${n}`;
  const [ul, fl, ur, fr, hl, hr, anim] = POSE[pose] || POSE.idle;
  const rightAnim = anim;
  const skin = `url(#${g('skin')})`;
  const blazer = `url(#${g('blazer')})`;
  const sleeve = `url(#${g('sleeve')})`;
  const hair = `url(#${g('hair')})`;
  const iris = `url(#${g('iris')})`;
  const tilt = pose === 'listen' ? 5 : pose === 'think' ? -4 : 0;
  const look = expression === 'thinking' ? [2.5, -3] : expression === 'listening' ? [-1.5, 0] : [0, 0];
  const W = 270;
  // Lengan kanan di depan badan saat berpikir (tangan di dagu) & mendengar (tangan di telinga).
  const frontArm = pose === 'think' || pose === 'listen';
  const rightArm = <Arm sx={176} sy={193} upper={ur} fore={fr} hand={hr} sleeve={sleeve} skin={skin} anim={rightAnim} />;

  return (
    <svg className={`teacher pose-${pose} expr-${expression}${speaking ? ' is-speaking' : ''}`} viewBox={`0 0 ${W} 300`}
      width={size} height={(size * 300) / W} role="img" aria-label={title}
      data-expression={expression} data-pose={pose} data-speaking={speaking ? 'true' : 'false'} data-character="teacher">
      <defs>
        <radialGradient id={g('skin')} cx="0.42" cy="0.38" r="0.75"><stop offset="0" stopColor="#ffe6d4" /><stop offset="0.7" stopColor="#f8c9a8" /><stop offset="1" stopColor="#eeb08b" /></radialGradient>
        <linearGradient id={g('hair')} x1="0.2" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#8d5636" /><stop offset="0.55" stopColor="#6b3b22" /><stop offset="1" stopColor="#4a2614" /></linearGradient>
        <linearGradient id={g('blazer')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ecc597" /><stop offset="0.6" stopColor="#d6a26c" /><stop offset="1" stopColor="#bb8248" /></linearGradient>
        <linearGradient id={g('sleeve')} x1="0" x2="1"><stop offset="0" stopColor="#e2b685" /><stop offset="1" stopColor="#c48d55" /></linearGradient>
        <clipPath id={g('clip')}><rect x="-60" y="-60" width="400" height="360" /></clipPath>
        <radialGradient id={g('iris')} cx="0.5" cy="0.6" r="0.6"><stop offset="0" stopColor="#b8763f" /><stop offset="0.6" stopColor="#6e3c1c" /><stop offset="1" stopColor="#3a1d0c" /></radialGradient>
      </defs>
      <g clipPath={`url(#${g('clip')})`}><g transform={facing === 'left' ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <g className="c-body">
          {/* rambut belakang (jatuh sampai bahu) */}
          <g className="c-head-back" style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '130px 160px' }}>
            <path d="M76 98 C68 44 102 20 132 20 C164 20 196 44 188 98 C196 124 208 150 200 178 C210 202 202 230 182 240 C188 222 180 210 172 198 L88 198 C80 210 72 222 78 240 C58 230 50 202 60 178 C52 150 64 124 76 98Z" fill={hair} />
            <path d="M70 150 C64 168 70 186 64 204 M194 150 C200 168 194 186 200 204" stroke="#3e1f0f" strokeWidth="2" opacity="0.35" fill="none" />
          </g>

          {/* lengan */}
          <Arm sx={84} sy={193} upper={ul} fore={fl} hand={hl} mirror sleeve={sleeve} skin={skin} />
          {frontArm ? null : rightArm}

          <g transform="translate(0 -8)">
          {/* leher */}
          <path d="M117 140 L143 140 L145 178 C139 186 121 186 115 178Z" fill={skin} />
          <path d="M116 148 Q130 162 144 148 L145 158 Q130 170 115 158Z" fill="#e39a78" opacity="0.55" />

          {/* blazer + kemeja */}
          <path d="M64 300 C62 236 76 196 112 182 L130 202 L148 182 C184 196 198 236 196 300Z" fill={blazer} />
          <path d="M64 300 C62 236 76 196 112 182 L118 190 C92 206 82 240 84 300Z" fill="#000" opacity="0.06" />
          <path d="M112 182 L130 202 L148 182 L146 174 C140 179 120 179 114 174Z" fill="#fff" />
          <path d="M118 186 L130 236 L142 186 L130 204Z" fill="#fff" />
          <path d="M112 182 L125 197 L118 206 L105 190Z" fill="#fff" stroke="#dfe3ee" strokeWidth="1" />
          <path d="M148 182 L135 197 L142 206 L155 190Z" fill="#fff" stroke="#dfe3ee" strokeWidth="1" />
          <path d="M112 186 L130 236 L120 254 L95 202Z" fill="#b97f47" />
          <path d="M148 186 L130 236 L140 254 L165 202Z" fill="#b97f47" />
          <path d="M130 236 L130 300" stroke="#a46d39" strokeWidth="2" />
          <circle cx="136" cy="266" r="3.6" fill="#8a5a2b" />
          <path d="M150 238 h22" stroke="#a46d39" strokeWidth="2" strokeLinecap="round" />
          <circle cx="130" cy="214" r="2.6" fill="#fde68a" stroke="#d4a017" strokeWidth="1" />
          <rect x="60" y="296" width="140" height="12" fill={blazer} />
          </g>

          {/* helai rambut di depan bahu */}
          <g className="c-locks">
            <path d="M86 102 C72 128 84 150 76 172 C68 194 84 206 76 228 C72 240 84 248 96 242 C86 232 94 220 96 208 C100 190 88 172 96 150 C100 136 96 118 100 108Z" fill={hair} />
            <path d="M174 102 C188 128 176 150 184 172 C192 194 176 206 184 228 C188 240 176 248 164 242 C174 232 166 220 164 208 C160 190 172 172 164 150 C160 136 164 118 160 108Z" fill={hair} />
            <path d="M88 132 C82 152 90 170 84 190 C80 204 86 216 84 228" stroke="#b07651" strokeWidth="2.2" opacity="0.55" fill="none" strokeLinecap="round" />
            <path d="M172 132 C178 152 170 170 176 190 C180 204 174 216 176 228" stroke="#b07651" strokeWidth="2.2" opacity="0.55" fill="none" strokeLinecap="round" />
          </g>

          {pose === 'listen' ? rightArm : null}
          {/* kepala */}
          <g className="c-head" style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '130px 160px' }}>
            <path d="M82 100 C82 60 104 40 130 40 C156 40 178 60 178 100 C178 128 160 150 130 154 C100 150 82 128 82 100Z" fill={skin} />
            <ellipse cx="100" cy="124" rx="9" ry="5" fill="#ff9aa8" opacity="0.45" />
            <ellipse cx="160" cy="124" rx="9" ry="5" fill="#ff9aa8" opacity="0.45" />
            <g stroke="#6b3d22" strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M99 85 Q110 79 121 84" />
              <path d={expression === 'thinking' ? 'M139 80 Q150 74 161 80' : 'M139 84 Q150 79 161 85'} />
            </g>
            <g className="c-eyes">
              {expression === 'proud' ? (
                <><HappyEye cx={110} cy={104} lid={LID} /><HappyEye cx={150} cy={104} lid={LID} /></>
              ) : (
                <><Eye cx={110} cy={104} iris={iris} look={look} side="left" lid={LID} /><Eye cx={150} cy={104} iris={iris} look={look} side="right" lid={LID} /></>
              )}
            </g>
            <path d="M130 117 Q127.5 124 131 126" fill="none" stroke="#d9967a" strokeWidth="2" strokeLinecap="round" />
            <Mouth expression={expression} speaking={speaking} />
            {/* poni menyamping */}
            <path d="M84 104 C80 58 108 36 134 38 C160 40 180 60 176 104 C170 84 160 72 146 66 C140 82 120 94 98 98 C92 99 88 101 84 104Z" fill={hair} />
            <path d="M146 66 C150 80 160 90 172 96 C166 82 158 72 146 66Z" fill="#4a2614" opacity="0.55" />
            <path d="M100 54 C112 44 132 42 150 48" stroke="#fff" strokeWidth="4" opacity="0.28" fill="none" strokeLinecap="round" />
            <circle cx="172" cy="122" r="2.6" fill="#fde68a" />
          </g>

          {pose === 'think' ? rightArm : null}
          {expression === 'thinking' ? (
            <g className="c-think" fill="#c7d2fe"><circle cx="196" cy="58" r="4" /><circle cx="210" cy="42" r="6" /><circle cx="228" cy="24" r="9" /></g>
          ) : null}
          {expression === 'listening' ? (
            <g className="c-listen" stroke="#93c5fd" strokeWidth="3.4" fill="none" strokeLinecap="round"><path d="M200 86 Q208 98 200 110" /><path d="M212 78 Q224 98 212 118" /></g>
          ) : null}
          {expression === 'proud' ? (
            <g className="c-spark" fill="#fbbf24"><path d="M50 52 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" /><path d="M214 46 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /></g>
          ) : null}
        </g>
      </g></g>
    </svg>
  );
}
