import { useEffect, useRef, useState } from 'react';

/**
 * Hitung mundur menuju `deadlineMs` (waktu server sudah dikoreksi dengan offset).
 * Memanggil onExpire satu kali saat waktu habis.
 */
export function useCountdown(deadlineMs, onExpire) {
  const [remaining, setRemaining] = useState(() => (deadlineMs ? Math.max(0, deadlineMs - Date.now()) : null));
  const fired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  useEffect(() => {
    if (!deadlineMs) return undefined;
    fired.current = false;
    const tick = () => {
      const left = Math.max(0, deadlineMs - Date.now());
      setRemaining(left);
      if (left === 0 && !fired.current) {
        fired.current = true;
        cb.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  return remaining;
}

export function formatClock(ms) {
  if (ms === null || ms === undefined) return '--:--';
  const total = Math.ceil(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
