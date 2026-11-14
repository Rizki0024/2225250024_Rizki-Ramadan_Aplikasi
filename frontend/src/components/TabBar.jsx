import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const TABS = [
  { to: '/beranda', icon: 'home', label: 'Beranda' },
  { to: '/materi', icon: 'book', label: 'Materi' },
  { to: '/kelas', icon: 'teacher', label: 'Guru', teacher: true },
  { to: '/latihan', icon: 'pencil', label: 'Latihan' },
  { to: '/hasil', icon: 'chart', label: 'Hasil' },
];

// Halaman "fokus" (sedang mengerjakan / belajar) tidak menampilkan tab bar agar tidak mengganggu.
const FOCUS = [/^\/latihan\/.+/, /^\/evaluasi\/kerjakan/, /^\/kelas\/.+/];
const PUBLIC = ['/', '/masuk'];

export function showsTabBar(pathname) {
  if (PUBLIC.includes(pathname)) return false;
  return !FOCUS.some((re) => re.test(pathname));
}

export default function TabBar() {
  const { isLoggedIn } = useAuth();
  const { pathname } = useLocation();
  if (!isLoggedIn || !showsTabBar(pathname)) return null;
  return (
    <nav className="tabbar" aria-label="Navigasi utama">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `${isActive ? 'active' : ''}${t.teacher ? ' teacher-tab' : ''}`}>
          {({ isActive }) => (
            <>
              {isActive ? <motion.span layoutId="tab-bg" className="tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} /> : null}
              <Icon name={t.icon} size={22} />
              <span>{t.label}</span>
              {t.teacher && !isActive ? <span className="tab-dot" aria-hidden="true" /> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
