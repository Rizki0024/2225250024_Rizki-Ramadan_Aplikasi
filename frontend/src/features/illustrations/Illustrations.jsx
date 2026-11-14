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
