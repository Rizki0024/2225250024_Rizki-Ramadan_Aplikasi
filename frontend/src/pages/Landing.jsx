import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { BoxFigure } from '../features/shapes/Shape2D.jsx';

export default function Landing() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    document.title = 'Belajar Kubus dan Balok';
    api.health().catch(() => {}); // membangunkan server lebih awal
  }, []);

  return (
    <main className="landing">
      <div className="hero-art row" style={{ justifyContent: 'center', flexWrap: 'nowrap', gap: 0 }} aria-hidden="true">
        <div style={{ width: '42%' }}><BoxFigure p={4} l={4} t={4} cube /></div>
        <div style={{ width: '58%' }}><BoxFigure p={6} l={4} t={3} /></div>
      </div>
      <h1>Belajar Kubus dan Balok</h1>
      <p className="muted" style={{ maxWidth: 420 }}>
        Luas permukaan kubus dan balok untuk SMP kelas VIII — materi, visualisasi 3D, latihan, dan evaluasi.
      </p>
      <Link to={isLoggedIn ? '/beranda' : '/masuk'} className="btn">Mulai Belajar</Link>
      <p className="small muted" style={{ marginTop: 24 }}>Dikembangkan oleh Rizki Ramadan (2225250024)</p>
    </main>
  );
}
