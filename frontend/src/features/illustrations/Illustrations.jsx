// Ilustrasi bergaya "kartun 3D" (gradasi + kilau + bayangan) — digambar sendiri, bebas lisensi.
import { useId } from 'react';

const ids = (base) => (name) => `${base}-${name}`.replace(/:/g, '');

function Shadow({ cx = 50, cy = 92, rx = 30 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="5" fill="#1b2440" opacity="0.12" />;
}

export function BookArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id('l')} x1="0" x2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#e9e4ff" /></linearGradient>
        <linearGradient id={id('r')} x1="0" x2="1"><stop offset="0" stopColor="#e9e4ff" /><stop offset="1" stopColor="#fff" /></linearGradient>
        <linearGradient id={id('c')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c9dff" /><stop offset="1" stopColor="#3f5fe0" /></linearGradient>
      </defs>
      <Shadow />
      <path d="M8 30 Q30 22 50 32 Q70 22 92 30 L92 82 Q70 74 50 84 Q30 74 8 82Z" fill={`url(#${id('c')})`} />
      <path d="M12 26 Q31 18 50 28 L50 78 Q31 68 12 76Z" fill={`url(#${id('l')})`} />
      <path d="M50 28 Q69 18 88 26 L88 76 Q69 68 50 78Z" fill={`url(#${id('r')})`} />
      <g stroke="#b9b0ea" strokeWidth="2.4" strokeLinecap="round">
        <path d="M20 36 Q31 31 43 37" /><path d="M20 45 Q31 40 43 46" /><path d="M20 54 Q31 49 43 55" />
        <path d="M57 37 Q69 31 80 36" /><path d="M57 46 Q69 40 80 45" />
      </g>
      <rect x="58" y="51" width="16" height="12" rx="2" fill="#93c5fd" />
      <path d="M58 51 l5 -4 h16 l-5 4z" fill="#bfdbfe" /><path d="M74 51 l5 -4 v12 l-5 4z" fill="#60a5fa" />
      <path d="M48 28 L52 28 L52 79 L48 79Z" fill="#c7bdf3" />
    </svg>
  );
}

export function ClockArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={id('b')} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#7c3aed" /></radialGradient>
        <radialGradient id={id('f')} cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#fffbea" /><stop offset="1" stopColor="#fde68a" /></radialGradient>
      </defs>
      <Shadow rx="26" />
      <circle cx="28" cy="20" r="11" fill={`url(#${id('b')})`} /><circle cx="72" cy="20" r="11" fill={`url(#${id('b')})`} />
      <path d="M30 80 l-8 10M70 80 l8 10" stroke="#6d28d9" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="54" r="34" fill={`url(#${id('b')})`} />
      <circle cx="50" cy="54" r="26" fill={`url(#${id('f')})`} />
      {[0, 90, 180, 270].map((a) => <rect key={a} x="48.5" y="31" width="3" height="6" rx="1.5" fill="#7c3aed" transform={`rotate(${a} 50 54)`} />)}
      <path d="M50 54 L50 38 M50 54 L62 60" stroke="#1b2440" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="54" r="3.5" fill="#1b2440" />
      <ellipse cx="38" cy="32" rx="9" ry="4" fill="#fff" opacity="0.55" transform="rotate(-30 38 32)" />
    </svg>
  );
}

export function TrophyArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id('g')} x1="0" x2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" /></linearGradient>
        <linearGradient id={id('b')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c9dff" /><stop offset="1" stopColor="#3f5fe0" /></linearGradient>
      </defs>
      <Shadow rx="24" />
      <path d="M26 22 Q8 22 12 38 Q16 50 32 50" fill="none" stroke={`url(#${id('g')})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M74 22 Q92 22 88 38 Q84 50 68 50" fill="none" stroke={`url(#${id('g')})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M26 14 H74 V36 Q74 62 50 64 Q26 62 26 36Z" fill={`url(#${id('g')})`} />
      <rect x="44" y="62" width="12" height="12" fill="#d97706" />
      <rect x="30" y="74" width="40" height="14" rx="5" fill={`url(#${id('b')})`} />
      <path d="M50 24 l3.5 7 7.5 1 -5.5 5 1.5 7.5 -7 -3.5 -7 3.5 1.5 -7.5 -5.5 -5 7.5 -1z" fill="#fff" opacity="0.9" />
      <rect x="32" y="18" width="5" height="34" rx="2.5" fill="#fff" opacity="0.4" />
    </svg>
  );
}

export function CubeArt({ size = 72, colors = ['#93c5fd', '#f9a8d4', '#86efac'] }) {
  const id = ids(useId());
  const [top, front, side] = colors;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id('t')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.7" /><stop offset="1" stopColor={top} /></linearGradient>
        <linearGradient id={id('f')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={front} /><stop offset="1" stopColor={front} stopOpacity="0.85" /></linearGradient>
      </defs>
      <Shadow rx="28" cy="93" />
      <path d="M50 10 L88 30 L50 50 L12 30Z" fill={top} />
      <path d="M50 10 L88 30 L50 50 L12 30Z" fill={`url(#${id('t')})`} />
      <path d="M12 30 L50 50 L50 90 L12 70Z" fill={`url(#${id('f')})`} />
      <path d="M88 30 L50 50 L50 90 L88 70Z" fill={side} />
      <path d="M88 30 L50 50 L50 90 L88 70Z" fill="#1b2440" opacity="0.08" />
      <path d="M50 10 L88 30 L50 50 L12 30Z M12 30 L50 50 L50 90 L12 70Z M88 30 L50 50 L50 90 L88 70Z" fill="none" stroke="#1e3a8a" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 34 L44 45" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function ClipboardArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id('b')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
      </defs>
      <Shadow rx="24" />
      <rect x="20" y="14" width="60" height="76" rx="10" fill={`url(#${id('b')})`} />
      <rect x="27" y="22" width="46" height="62" rx="6" fill="#fff" />
      <rect x="36" y="8" width="28" height="14" rx="6" fill="#fbbf24" />
      <g strokeLinecap="round" strokeWidth="4">
        <path d="M34 38 l4 4 7 -8" stroke="#22c55e" fill="none" />
        <path d="M50 38 H66" stroke="#c7d2fe" />
        <path d="M34 54 l4 4 7 -8" stroke="#22c55e" fill="none" />
        <path d="M50 54 H66" stroke="#c7d2fe" />
        <path d="M36 70 H44" stroke="#f9a8d4" />
        <path d="M50 70 H66" stroke="#c7d2fe" />
      </g>
    </svg>
  );
}

export function PencilArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id('b')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
      </defs>
      <Shadow rx="30" />
      <g transform="rotate(-35 50 50)">
        <rect x="20" y="40" width="54" height="20" rx="3" fill={`url(#${id('b')})`} />
        <rect x="20" y="40" width="54" height="6" fill="#fff" opacity="0.35" />
        <path d="M74 40 L92 50 L74 60Z" fill="#f5d0a9" /><path d="M86 47 L92 50 L86 53Z" fill="#1b2440" />
        <rect x="10" y="40" width="12" height="20" rx="4" fill="#f9a8d4" /><rect x="20" y="40" width="5" height="20" fill="#c4b5fd" />
      </g>
    </svg>
  );
}

export function GiftArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={id('b')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs>
      <Shadow rx="28" />
      <rect x="16" y="42" width="68" height="46" rx="6" fill={`url(#${id('b')})`} />
      <rect x="10" y="30" width="80" height="16" rx="5" fill="#a78bfa" />
      <rect x="44" y="30" width="12" height="58" fill="#f9a8d4" />
      <path d="M50 30 C36 12 20 20 30 30Z M50 30 C64 12 80 20 70 30Z" fill="#f472b6" />
      <rect x="22" y="48" width="6" height="34" rx="3" fill="#fff" opacity="0.3" />
    </svg>
  );
}

export function HourglassArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={id('w')} x1="0" x2="1"><stop offset="0" stopColor="#d6a26b" /><stop offset="1" stopColor="#8a5232" /></linearGradient></defs>
      <Shadow rx="22" />
      <rect x="24" y="10" width="52" height="8" rx="4" fill={`url(#${id('w')})`} />
      <rect x="24" y="82" width="52" height="8" rx="4" fill={`url(#${id('w')})`} />
      <path d="M32 18 H68 C68 38 54 44 54 50 C54 56 68 62 68 82 H32 C32 62 46 56 46 50 C46 44 32 38 32 18Z" fill="#e0f2fe" opacity="0.9" stroke="#93c5fd" strokeWidth="2" />
      <path d="M38 26 H62 C60 36 52 40 50 46 C48 40 40 36 38 26Z" fill="#fbbf24" />
      <path d="M36 80 C40 68 46 66 50 64 C54 66 60 68 64 80Z" fill="#fbbf24" />
      <path d="M50 46 V64" stroke="#fbbf24" strokeWidth="2" />
    </svg>
  );
}

export function StarMascot({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><radialGradient id={id('s')} cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff3b0" /><stop offset="1" stopColor="#f59e0b" /></radialGradient></defs>
      <Shadow rx="22" />
      <path d="M50 6 l12 26 28 3 -21 19 6 28 -25 -14 -25 14 6 -28 -21 -19 28 -3z" fill={`url(#${id('s')})`} stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="42" cy="46" r="3.5" fill="#1b2440" /><circle cx="58" cy="46" r="3.5" fill="#1b2440" />
      <path d="M42 56 Q50 64 58 56" stroke="#1b2440" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="#fb7185" opacity="0.5" /><ellipse cx="64" cy="54" rx="4" ry="2.5" fill="#fb7185" opacity="0.5" />
    </svg>
  );
}

const MEDAL_COLORS = { violet: ['#c4b5fd', '#7c3aed'], gold: ['#fde68a', '#d97706'], green: ['#86efac', '#15803d'], pink: ['#f9a8d4', '#be185d'], blue: ['#93c5fd', '#1d4ed8'] };

export function MedalArt({ size = 64, color = 'gold', locked = false }) {
  const id = ids(useId());
  const [a, b] = locked ? ['#e5e7eb', '#9ca3af'] : MEDAL_COLORS[color] || MEDAL_COLORS.gold;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><radialGradient id={id('m')} cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient></defs>
      <path d="M50 6 L86 26 L86 66 L50 94 L14 66 L14 26Z" fill={`url(#${id('m')})`} stroke={b} strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 22 L74 36 L74 62 L50 80 L26 62 L26 36Z" fill="#fff" opacity="0.25" />
      <path d="M50 34 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z" fill={locked ? '#d1d5db' : '#fff7d6'} />
      {locked ? <g><rect x="40" y="54" width="20" height="16" rx="3" fill="#6b7280" /><path d="M44 54 v-5 a6 6 0 0 1 12 0 v5" stroke="#6b7280" strokeWidth="3" fill="none" /></g> : null}
    </svg>
  );
}

export function GamepadArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={id('g')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs>
      <Shadow rx="30" />
      <path d="M22 34 H78 C92 34 96 58 92 72 C88 84 76 82 70 72 L64 64 H36 L30 72 C24 82 12 84 8 72 C4 58 8 34 22 34Z" fill={`url(#${id('g')})`} />
      <path d="M26 48 v14 M19 55 h14" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="70" cy="50" r="5" fill="#fde68a" /><circle cx="80" cy="58" r="5" fill="#86efac" />
      <path d="M26 38 H74" stroke="#fff" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

export function ChartArt({ size = 72 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <Shadow rx="30" />
      <rect x="16" y="56" width="14" height="30" rx="3" fill="#fbbf24" />
      <rect x="36" y="44" width="14" height="42" rx="3" fill="#22c55e" />
      <rect x="56" y="30" width="14" height="56" rx="3" fill="#3b82f6" />
      <rect x="76" y="40" width="14" height="46" rx="3" fill="#f472b6" />
      <path d="M14 46 L38 30 L58 38 L86 14" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 14 H86 V22" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BulbArt({ size = 72 }) {
  const id = ids(useId());
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs><radialGradient id={id('b')} cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#fff7c2" /><stop offset="1" stopColor="#fbbf24" /></radialGradient></defs>
      <g stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"><path d="M50 4 v8" /><path d="M18 18 l6 6" /><path d="M82 18 l-6 6" /><path d="M6 46 h8" /><path d="M86 46 h8" /></g>
      <path d="M50 18 C30 18 20 34 26 50 C30 60 38 64 38 74 H62 C62 64 70 60 74 50 C80 34 70 18 50 18Z" fill={`url(#${id('b')})`} />
      <rect x="38" y="76" width="24" height="8" rx="3" fill="#94a3b8" /><rect x="40" y="86" width="20" height="6" rx="3" fill="#64748b" />
      <ellipse cx="40" cy="36" rx="6" ry="9" fill="#fff" opacity="0.6" transform="rotate(25 40 36)" />
    </svg>
  );
}
