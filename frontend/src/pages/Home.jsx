import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page, { initials } from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { AnimatedBar, CardLink, Stagger, StaggerItem } from '../components/motion.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api.js';
import { summarize } from '../features/progress/progress.js';
import TeacherAvatar from '../features/teacher/TeacherAvatar.jsx';
import { BookArt, ClipboardArt, CubeArt, PencilArt, TrophyArt } from '../features/illustrations/Illustrations.jsx';

const MORE = [
  { to: '/visualisasi', icon: 'cube', title: 'Visualisasi 3D', desc: 'Putar & buka jaring-jaring', bg: 'bg-pink' },
  { to: '/hasil', icon: 'chart', title: 'Hasil Belajar', desc: 'Nilai & riwayat', bg: 'bg-yellow' },
  { to: '/petunjuk', icon: 'help', title: 'Petunjuk', desc: 'Cara memakai aplikasi', bg: 'bg-blue' },
];

export default function Home() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(null);

  useEffect(() => {
    api.attempts().then(setAttempts).catch(() => setAttempts([]));
  }, []);

  const p = summarize(student.code, attempts);

  return (
    <Page title="Beranda" back={null} header={false}>
      <div className="greet" style={{ paddingTop: 10 }}>
        <span className="avatar lg" aria-hidden="true">{initials(student.nickname)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Halo, {student.nickname}!</h1>
          <span className="greet-sub">Kode {student.code}{student.class_name ? ` · Kelas ${student.class_name}` : ''}</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Keluar" title="Keluar" onClick={() => { logout(); navigate('/masuk'); }}>
          <Icon name="logout" size={20} />
        </button>
      </div>

      <Stagger className="stack">
        <StaggerItem className="hero">
          <div>
            <h2>Belajar Bersama<br /><span className="highlight">Guru</span> Virtual</h2>
            <p>Bu Sari menjelaskan langkah demi langkah. Kamu bisa menyela dan bertanya kapan saja.</p>
            <Link to="/kelas" className="btn dark small">Mulai <Icon name="arrow" size={18} /></Link>
          </div>
          <div className="hero-figure">
            <span className="trophy float-y" aria-hidden="true"><TrophyArt size={64} /></span>
            <TeacherAvatar size={150} expression="happy" pose="cheer" />
          </div>
        </StaggerItem>

        <StaggerItem className="section-head"><h2>Aktivitasmu</h2><Link to="/hasil" className="small" style={{ fontWeight: 800 }}>Lihat semua</Link></StaggerItem>
        <Stagger className="activity-grid">
          <CardLink to="/materi" className="activity-card bg-lilac">
            <span className="thumb"><BookArt size={84} /></span>
            <span><span className="label">Materi</span><br /><span className="big">{p.read}</span><span className="muted small"> / 4 dibuka</span></span>
            <span className="go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
          </CardLink>
          <CardLink to="/latihan" className="activity-card bg-yellow">
            <span className="thumb"><PencilArt size={84} /></span>
            <span><span className="label">Latihan</span><br /><span className="big">{p.totalStars}</span><span className="muted small"> / {p.maxStars} bintang</span></span>
            <span className="go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
          </CardLink>
          <CardLink to="/evaluasi" className="activity-card bg-blue">
            <span className="thumb"><ClipboardArt size={84} /></span>
            <span><span className="label">Evaluasi</span><br /><span className="big">{p.bestEval === null ? '–' : Math.round(p.bestEval)}</span><span className="muted small"> nilai terbaik</span></span>
            <span className="go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
          </CardLink>
        </Stagger>

        <StaggerItem className="card progress-card stack">
          <div className="row between">
            <span className="row" style={{ gap: 10 }}><CubeArt size={40} /><strong>Progres belajar</strong></span>
            <span className="pct">{p.percent}%</span>
          </div>
          <AnimatedBar value={p.percent} className="progress-fat" label="Progres belajar" />
          <span className="small muted">Dihitung dari materi, kelas guru, bintang latihan, dan nilai evaluasi.</span>
        </StaggerItem>

        <StaggerItem className="section-head"><h2>Menu lainnya</h2></StaggerItem>
        <Stagger as="nav" className="menu-grid three" aria-label="Menu lainnya">
          {MORE.map((m) => (
            <CardLink key={m.to} to={m.to} className="menu-card">
              <span className={`menu-icon ${m.bg}`}><Icon name={m.icon} size={26} /></span>
              <strong>{m.title}</strong>
              <span>{m.desc}</span>
            </CardLink>
          ))}
        </Stagger>
      </Stagger>
    </Page>
  );
}
