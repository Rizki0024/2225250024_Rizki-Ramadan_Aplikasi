// Komponen kecil yang dipakai di banyak halaman.
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="banner offline" role="status">
      Kamu sedang offline. Materi yang sudah terbuka tetap bisa dibaca; jawaban akan dikirim setelah online.
    </div>
  );
}

export function Loading({ text = 'Memuat…' }) {
  return (
    <div className="loader" role="status">
      <div className="loader-cube" aria-hidden="true" />
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="alert error" role="alert">
      <p style={{ margin: 0 }}>{error.message || String(error)}</p>
      {onRetry ? (
        <button type="button" className="btn secondary" style={{ marginTop: 10 }} onClick={onRetry}>Coba lagi</button>
      ) : null}
    </div>
  );
}

export function ProgressBar({ value, max, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars({ count = 0, max = 3 }) {
  return (
    <span className="stars" aria-label={`${count} dari ${max} bintang`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? '' : 'off'}>★</span>
      ))}
    </span>
  );
}

export const PROCESS_LABEL = { reasoning: 'Reasoning', formulate: 'Formulate', employ: 'Employ', interpret: 'Interpret' };

export function ProcessBadge({ process }) {
  if (!process) return null;
  return <span className={`badge ${process}`}>{PROCESS_LABEL[process] || process}</span>;
}

export function Modal({ title, children, actions }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal stack">
        <h2>{title}</h2>
        {children}
        <div className="btn-row">{actions}</div>
      </div>
    </div>
  );
}
