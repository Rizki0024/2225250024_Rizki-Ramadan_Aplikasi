import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import TeacherAvatar from '../features/teacher/TeacherAvatar.jsx';
import { BookArt, CubeArt, PencilArt } from '../features/illustrations/Illustrations.jsx';
import { PageMotion } from '../components/motion.jsx';
import Icon from '../components/Icon.jsx';

export default function Landing() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    document.title = 'Belajar Kubus dan Balok';
    api.health().catch(() => {}); // membangunkan server lebih awal
  }, []);

  return (
    <PageMotion className="landing">
      <section className="welcome">
        <motion.div className="welcome-title" initial={{ opacity: 0, y: -12, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}>
          <h1>Selamat Datang<br />di Belajar <span className="highlight">Kubus</span><br />dan <span className="highlight">Balok</span></h1>
        </motion.div>
        <div className="welcome-art" aria-hidden="true">
          <span className="float float-y" style={{ left: '2%', top: '8%', '--r': '-8deg' }}><CubeArt size={86} /></span>
          <span className="float float-y slow" style={{ right: '2%', top: '2%', '--r': '10deg' }}><CubeArt size={70} colors={['#c4b5fd', '#fde68a', '#93c5fd']} /></span>
          <span className="float float-y slow" style={{ left: '0%', bottom: '6%' }}><BookArt size={84} /></span>
          <span className="float float-y" style={{ right: '0%', bottom: '10%', '--r': '6deg' }}><PencilArt size={80} /></span>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, type: 'spring', stiffness: 160, damping: 16 }}>
            <TeacherAvatar size={210} expression="happy" pose="wave" />
          </motion.div>
        </div>
        <p className="welcome-sub">Luas permukaan untuk SMP kelas VIII. Belajar bersama Bu Sari, guru virtual yang bisa kamu ajak bicara.</p>
        <Link to={isLoggedIn ? '/beranda' : '/masuk'} className="swipe-btn" aria-label="Mulai Belajar">
          <span className="knob"><Icon name="arrow" /></span>
          <span>Mulai Belajar</span>
          <span className="chev" aria-hidden="true">›››</span>
        </Link>
      </section>
      <p className="small muted" style={{ marginTop: 14 }}>Dikembangkan oleh Rizki Ramadan (2225250024)</p>
    </PageMotion>
  );
}
