import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Icon from '../components/Icon.jsx';

const CODE_RE = /^[A-Z0-9-]{3,20}$/;
const PIN_RE = /^\d{4,6}$/;

export function validateLogin(code, pin) {
  const c = code.trim().toUpperCase();
  if (!c) return 'Kode siswa wajib diisi.';
  if (!CODE_RE.test(c)) return 'Format kode siswa tidak valid. Contoh: KB-001.';
  if (!pin.trim()) return 'PIN wajib diisi.';
  if (!PIN_RE.test(pin.trim())) return 'PIN harus 4–6 angka.';
  return null;
}

export default function Login() {
  const { login, isLoggedIn, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => { document.title = 'Masuk · Belajar Kubus dan Balok'; }, []);

  if (isLoggedIn && !busy) return <Navigate to="/beranda" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    clearNotice();
    const msg = validateLogin(code, pin);
    if (msg) { setError(msg); return; }
    setError('');
    setBusy(true);
    const slowTimer = setTimeout(() => setSlow(true), 4000);
    try {
      await login(code.trim().toUpperCase(), pin.trim());
      navigate(location.state?.from || '/beranda', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="icon-btn" aria-label="Kembali"><Icon name="back" /></Link>
          <div className="topbar-title">Masuk</div>
        </div>
      </header>
      <main className="page">
        <div className="container" style={{ maxWidth: 440 }}>
          <form className="card stack" onSubmit={onSubmit} noValidate>
            <h1>Masuk dengan kode siswa</h1>
            {notice ? <div className="alert warn">{notice}</div> : null}
            <div className="field">
              <label htmlFor="code">Kode siswa</label>
              <input id="code" className="input" value={code} autoComplete="username" autoCapitalize="characters"
                placeholder="Contoh: KB-001" maxLength={20} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </div>
            <div className="field">
              <label htmlFor="pin">PIN</label>
              <input id="pin" className="input" type="password" inputMode="numeric" autoComplete="current-password"
                placeholder="4–6 angka" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            </div>
            {error ? <div className="alert error" role="alert">{error}</div> : null}
            {slow ? <div className="alert info">Menghubungi server… Server gratis butuh ±30 detik untuk menyala pertama kali.</div> : null}
            <button type="submit" className="btn block" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
            <p className="small muted center" style={{ margin: 0 }}>Belum punya kode? Minta kepada guru.</p>
          </form>
        </div>
      </main>
    </>
  );
}
