// Laci menu utama (mobile friendly) — berisi semua menu aplikasi.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Icon from './Icon.jsx';
import Student from '../features/characters/Student.jsx';

export const MENU = [
  { to: '/materi', icon: 'book', label: 'Materi', bg: '#dbeafe' },
  { to: '/kelas', icon: 'teacher', label: 'Belajar Bersama Guru', bg: '#ffe7b3' },
  { to: '/visualisasi', icon: 'cube', label: 'Visualisasi 3D', bg: '#ede9fe' },
  { to: '/latihan', icon: 'pencil', label: 'Latihan', bg: '#fef3c7' },
  { to: '/evaluasi', icon: 'clipboard', label: 'Evaluasi', bg: '#dcfce7' },
  { to: '/hasil', icon: 'chart', label: 'Hasil Belajar', bg: '#fce7f3' },
  { to: '/petunjuk', icon: 'help', label: 'Petunjuk', bg: '#e0f2fe' },
];

export default function MenuDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div key="bd" className="drawer-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="dr" className="drawer" role="dialog" aria-modal="true" aria-label="Menu utama"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <div className="row between">
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup menu"><Icon name="cross" /></button>
              <Link to="/pengaturan" className="icon-btn" onClick={onClose} aria-label="Pengaturan"><Icon name="gear" /></Link>
            </div>
            <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-end' }}>
              <Student size={96} />
              <h2 className="logo-title" style={{ textAlign: 'left' }}><span className="l1">Belajar</span>{" "}<span className="l2">Kubus <small>dan</small> Balok</span></h2>
            </div>
            <nav className="drawer-list" aria-label="Daftar menu">
              {MENU.map((m) => (
                <Link key={m.to} to={m.to} onClick={onClose}>
                  <span className="di" style={{ background: m.bg }}><Icon name={m.icon} size={20} /></span>{m.label}
                </Link>
              ))}
            </nav>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
