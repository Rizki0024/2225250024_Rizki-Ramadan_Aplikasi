import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import MenuDrawer from '../components/MenuDrawer.jsx';
import { CardLink, Stagger, StaggerItem } from '../components/motion.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api.js';
import { points, summarize } from '../features/progress/progress.js';
import TeacherAvatar from '../features/teacher/TeacherAvatar.jsx';
import { BookArt, ChartArt, ClipboardArt, CubeArt, GamepadArt, TrophyArt } from '../features/illustrations/Illustrations.jsx';

function TeacherIcon() {
  return (
    <span style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', background: '#fff' }}>
      <span style={{ width: 96, marginTop: 2 }}><TeacherAvatar size={96} expression="happy" /></span>
    </span>
  );
}

const TILES = [
  { to: '/materi', label: 'Materi', art: <BookArt size={64} /> },
  { to: '/kelas', label: 'Belajar Bersama Guru', art: <TeacherIcon />, warm: true },
  { to: '/visualisasi', label: 'Visualisasi 3D', art: <CubeArt size={64} colors={['#93c5fd', '#3b82f6', '#a78bfa']} /> },
  { to: '/latihan', label: 'Latihan', art: <GamepadArt size={64} /> },
  { to: '/evaluasi', label: 'Evaluasi', art: <ClipboardArt size={64} /> },
  { to: '/hasil', label: 'Hasil Belajar', art: <ChartArt size={64} /> },
];

export default function Home() {
  const { student } = useAuth();
  const [attempts, setAttempts] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    api.attempts().then(setAttempts).catch(() => setAttempts([]));
  }, []);

  const p = summarize(student.code, attempts);
  const pts = points(p);

  return (
    <Page title="Beranda" back={null} header={false}>
      <div className="home-head">
        <button type="button" className="icon-btn" aria-label="Buka menu" onClick={() => setMenu(true)}><Icon name="menu" /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Halo, {student.nickname}!</h1>
          <span className="sub">Kode: {student.code}{student.class_name ? ` · Kelas ${student.class_name}` : ''}</span>
        </div>
        <span className="points-pill" title="Poin bintang dari progres belajarmu" aria-label={`${pts} poin bintang`}><span className="star">★</span>{pts}</span>
      </div>

      <Stagger className="stack">
        <StaggerItem>
          <Link to="/profil" className="card progress-hero" style={{ textDecoration: 'none' }}>
            <CubeArt size={52} colors={['#86efac', '#22c55e', '#16a34a']} />
            <span>
              <strong>Progres Belajar</strong><br />
              <span className="small muted">{p.read} dari 4 materi · {p.percent}%</span>
              <span className="bar" style={{ display: 'block' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.percent}%` }} transition={{ duration: 0.8 }} style={{ height: '100%' }} />
              </span>
            </span>
            <span className="float-y"><TrophyArt size={60} /></span>
          </Link>
        </StaggerItem>

        <Stagger as="nav" className="tile-grid" aria-label="Menu utama">
          {TILES.map((t) => (
            <CardLink key={t.to} to={t.to} className={`tile${t.warm ? ' warm' : ''}`}>
              {t.art}
              <span>{t.label}</span>
            </CardLink>
          ))}
        </Stagger>

        <StaggerItem>
          <Link to="/petunjuk" className="help-chip"><Icon name="help" /> Petunjuk penggunaan aplikasi <span style={{ marginLeft: 'auto' }}>›</span></Link>
        </StaggerItem>
      </Stagger>
      <MenuDrawer open={menu} onClose={() => setMenu(false)} />
    </Page>
  );
}
