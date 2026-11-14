import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { BoxFigure } from '../features/shapes/Shape2D.jsx';
import TeacherAvatar from '../features/teacher/TeacherAvatar.jsx';
import { PageMotion } from '../components/motion.jsx';

export default function Landing() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    document.title = 'Belajar Kubus dan Balok';
    api.health().catch(() => {}); // membangunkan server lebih awal
  }, []);

  return (
    <PageMotion className="landing">
      <div className="landing-card stack">
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'nowrap', alignItems: 'flex-end', gap: 4 }} aria-hidden="true">
          <div style={{ width: '30%' }}><BoxFigure p={4} l={4} t={4} cube /></div>
          <TeacherAvatar size={150} expression="happy" pose="wave" />
          <div style={{ width: '34%' }}><BoxFigure p={6} l={4} t={3} /></div>
        </div>
        <h1>Belajar <span className="highlight">Kubus</span> dan <span className="highlight">Balok</span></h1>
        <p className="muted" style={{ margin: 0 }}>
          Luas permukaan untuk SMP kelas VIII — belajar bersama guru virtual, visualisasi 3D, latihan, dan evaluasi.
        </p>
        <div><Link to={isLoggedIn ? '/beranda' : '/masuk'} className="btn dark">Mulai Belajar</Link></div>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>Dikembangkan oleh Rizki Ramadan (2225250024)</p>
    </PageMotion>
  );
}
