import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Student from '../features/characters/Student.jsx';
import { CubeArt } from '../features/illustrations/Illustrations.jsx';
import { PageMotion } from '../components/motion.jsx';
import Icon from '../components/Icon.jsx';

export default function Landing() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    document.title = 'Belajar Kubus dan Balok';
    api.health().catch(() => {}); // membangunkan server lebih awal
  }, []);

  return (
    <PageMotion className="splash">
      <span className="sparkle float-y" style={{ left: '8%', top: '10%' }} aria-hidden="true"><Icon name="sparkle" size={22} /></span>
      <span className="sparkle float-y slow" style={{ right: '10%', top: '22%' }} aria-hidden="true"><Icon name="sparkle" size={16} /></span>
      <motion.h1 className="logo-title" initial={{ opacity: 0, y: -16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
        <span className="l1">Belajar</span>{" "}
        <span className="l2">Kubus <small>dan</small> Balok</span>
      </motion.h1>
      <p className="logo-sub">Matematika Jadi Lebih Mudah<br />dan Menyenangkan!</p>
      <div className="splash-stage" aria-hidden="true">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 16 }}
          style={{ marginRight: '28%' }}>
          <Student size={190} />
        </motion.div>
        <span className="float float-y" style={{ right: '22%', bottom: '10%', '--r': '-8deg' }}><CubeArt size={86} colors={['#93c5fd', '#3b82f6', '#a78bfa']} /></span>
        <span className="float float-y slow" style={{ right: '0%', bottom: '18%', '--r': '8deg' }}><CubeArt size={96} colors={['#fde68a', '#fb923c', '#f97316']} /></span>
      </div>
      <Link to={isLoggedIn ? '/beranda' : '/masuk'} className="btn yellow" aria-label="Mulai Belajar">
        Mulai Belajar <Icon name="arrow" size={20} />
      </Link>
      <div className="dots" aria-hidden="true"><span className="on" /><span /><span /></div>
      <p className="small" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>Dikembangkan oleh Rizki Ramadan (2225250024)</p>
    </PageMotion>
  );
}
