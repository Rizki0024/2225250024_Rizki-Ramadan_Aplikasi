import { Link } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const MENU = [
  { to: '/materi', icon: 'book', title: 'Materi', desc: 'Konsep & contoh soal', bg: '#dbeafe' },
  { to: '/visualisasi', icon: 'cube', title: 'Visualisasi 3D', desc: 'Putar & buka jaring-jaring', bg: '#fce7f3' },
  { to: '/latihan', icon: 'pencil', title: 'Latihan', desc: '4 level, ada bintang', bg: '#dcfce7' },
  { to: '/evaluasi', icon: 'clipboard', title: 'Evaluasi', desc: '10 soal · 30 menit', bg: '#ede9fe' },
  { to: '/hasil', icon: 'chart', title: 'Hasil Belajar', desc: 'Nilai & riwayat', bg: '#fef3c7' },
  { to: '/petunjuk', icon: 'help', title: 'Petunjuk', desc: 'Cara memakai aplikasi', bg: '#e0f2fe' },
];

export default function Home() {
  const { student } = useAuth();
  return (
    <Page title="Beranda" back={null}>
      <div>
        <h1 style={{ marginBottom: 4 }}>Halo, {student?.nickname}!</h1>
        <p className="muted" style={{ margin: 0 }}>Kode: {student?.code}{student?.class_name ? ` · Kelas ${student.class_name}` : ''}</p>
      </div>
      <div className="card soft small">
        Urutan belajar yang disarankan: <strong>Materi → Visualisasi → Latihan → Evaluasi</strong>.
      </div>
      <nav className="menu-grid" aria-label="Menu utama">
        {MENU.map((m) => (
          <Link key={m.to} to={m.to} className="menu-card">
            <span className="menu-icon" style={{ background: m.bg }}><Icon name={m.icon} size={26} /></span>
            <strong>{m.title}</strong>
            <span>{m.desc}</span>
          </Link>
        ))}
      </nav>
    </Page>
  );
}
