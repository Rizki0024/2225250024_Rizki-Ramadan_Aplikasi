// Karakter siswa — aset v3 (ditulis ulang dari nol mengikuti gaya papan desain):
// anak laki-laki, rambut cokelat berjambul, kemeja putih, dasi biru, tali ransel biru, tangan berjari.
import { useId } from 'react';
import { Arm, Eye, HappyEye } from './parts.jsx';
import './characters.css';

const POSE = {
  thumb: [10, -6, -150, -30, 'relaxed', 'thumb', null],
  wave: [10, -6, -140, -40, 'relaxed', 'open', 'wave'],
  idle: [10, -6, -10, 6, 'relaxed', 'relaxed', null],
};

export default function Student({ pose = 'thumb', size = 200, happy = true, title = 'Siswa' }) {
  const id = useId().replace(/:/g, '');
  const g = (n) => `${id}-${n}`;
  const [ul, fl, ur, fr, hl, hr, anim] = POSE[pose] || POSE.thumb;
  const skin = `url(#${g('skin')})`;
  const hair = `url(#${g('hair')})`;
  const shirt = `url(#${g('shirt')})`;
  const iris = `url(#${g('iris')})`;
  const W = 270;
  return (
    <svg className={`student pose-${pose}`} viewBox={`0 0 ${W} 300`} width={size} height={(size * 300) / W} role="img" aria-label={title} data-character="student">
      <defs>
        <radialGradient id={g('skin')} cx="0.42" cy="0.38" r="0.75"><stop offset="0" stopColor="#ffe3cf" /><stop offset="0.7" stopColor="#f6c39f" /><stop offset="1" stopColor="#e9a881" /></radialGradient>
        <linearGradient id={g('hair')} x1="0.2" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#7a4528" /><stop offset="1" stopColor="#3f2010" /></linearGradient>
        <linearGradient id={g('shirt')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e6ebf5" /></linearGradient>
        <clipPath id={g('clip')}><rect x="-60" y="-60" width="400" height="360" /></clipPath>
        <radialGradient id={g('iris')} cx="0.5" cy="0.6" r="0.6"><stop offset="0" stopColor="#a8693a" /><stop offset="0.6" stopColor="#5e3218" /><stop offset="1" stopColor="#2e170a" /></radialGradient>
      </defs>
      <g clipPath={`url(#${g('clip')})`}><g className="c-body">
        <Arm sx={86} sy={191} upper={ul} fore={fl} hand={hl} mirror sleeve={shirt} cuff="#e6ebf5" skin={skin} U={54} F={48} outline="#c3cce0" />
        <Arm sx={174} sy={191} upper={ur} fore={fr} hand={hr} sleeve={shirt} cuff="#e6ebf5" skin={skin} anim={anim} U={54} F={48} outline="#c3cce0" />

        <g transform="translate(0 -10)">
        <path d="M118 142 L142 142 L144 180 C138 186 122 186 116 180Z" fill={skin} />
        <path d="M117 150 Q130 162 143 150 L144 160 Q130 170 116 160Z" fill="#df9471" opacity="0.5" />

        {/* kemeja + ransel */}
        <path d="M68 300 C66 238 78 198 112 184 L130 196 L148 184 C182 198 194 238 192 300Z" fill={shirt} stroke="#c3cce0" strokeWidth="1.4" />
        <path d="M112 184 L130 196 L148 184 L146 176 C140 181 120 181 114 176Z" fill="#fff" />
        <path d="M112 184 L127 194 L118 206 L104 192Z" fill="#fff" stroke="#cdd5e6" strokeWidth="1.2" />
        <path d="M148 184 L133 194 L142 206 L156 192Z" fill="#fff" stroke="#cdd5e6" strokeWidth="1.2" />
        <path d="M126 196 L134 196 L136 204 L124 204Z" fill="#1e40af" />
        <path d="M124 204 L136 204 L140 252 L130 262 L120 252Z" fill="#2563eb" />
        <path d="M128 210 l6 10 M126 226 l8 12" stroke="#93c5fd" strokeWidth="2" />
        <path d="M84 206 C92 200 100 198 104 200 L102 300 L86 300 C82 270 80 236 84 206Z" fill="#2f5fe0" />
        <path d="M176 206 C168 200 160 198 156 200 L158 300 L174 300 C178 270 180 236 176 206Z" fill="#2f5fe0" />
        <rect x="88" y="244" width="12" height="16" rx="3" fill="#fbbf24" />
        <circle cx="168" cy="236" r="6" fill="#fde68a" stroke="#d4a017" strokeWidth="1.2" />
        <rect x="66" y="296" width="128" height="14" fill="#f3f5fb" />
        </g>

        {/* kepala */}
        <g className="c-head">
          <ellipse cx="86" cy="104" rx="8" ry="11" fill={skin} />
          <ellipse cx="174" cy="104" rx="8" ry="11" fill={skin} />
          <path d="M86 98 C86 60 106 42 130 42 C154 42 174 60 174 98 C174 126 158 148 130 152 C102 148 86 126 86 98Z" fill={skin} />
          <ellipse cx="102" cy="124" rx="8.5" ry="4.8" fill="#ff9aa8" opacity="0.42" />
          <ellipse cx="158" cy="124" rx="8.5" ry="4.8" fill="#ff9aa8" opacity="0.42" />
          <g stroke="#4a2614" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M99 84 Q110 78 121 83" /><path d="M139 83 Q150 78 161 84" />
          </g>
          <g className="c-eyes">
            {happy && pose === 'wave' ? (
              <><HappyEye cx={110} cy={104} /><HappyEye cx={150} cy={104} /></>
            ) : (
              <><Eye cx={110} cy={104} iris={iris} side="left" lashes={false} /><Eye cx={150} cy={104} iris={iris} side="right" lashes={false} /></>
            )}
          </g>
          <path d="M130 117 Q127.5 124 131 126" fill="none" stroke="#d48e70" strokeWidth="2" strokeLinecap="round" />
          <path d="M114 132 Q130 152 146 132 Q130 137 114 132Z" fill="#b8384f" />
          <path d="M118 133.5 Q130 137 142 133.5 L141 136 Q130 139 119 136Z" fill="#fff" />
          {/* rambut berjambul */}
          <path d="M82 100 C76 56 100 30 132 30 C162 30 186 54 178 100 C174 86 168 76 160 70 C158 80 150 86 140 88 C144 80 142 72 138 68 C130 80 116 88 100 88 C96 92 88 96 82 100Z" fill={hair} />
          <path d="M120 32 C122 22 132 14 144 16 C136 20 134 26 136 32Z" fill={hair} />
          <path d="M104 50 C116 40 136 38 152 44" stroke="#fff" strokeWidth="4" opacity="0.25" fill="none" strokeLinecap="round" />
        </g>
      </g></g>
    </svg>
  );
}
