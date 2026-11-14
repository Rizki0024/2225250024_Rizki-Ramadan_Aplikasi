// Navigasi bawah (v3): Beranda · Profil · Pengaturan. Menu lengkap ada di laci menu (MenuDrawer).
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const TABS = [
  { to: '/beranda', icon: 'home', label: 'Beranda' },
  { to: '/profil', icon: 'user', label: 'Profil' },
  { to: '/pengaturan', icon: 'gear', label: 'Pengaturan' },
];

// Halaman "fokus" (sedang mengerjakan / belajar) tidak menampilkan navigasi agar tidak mengganggu.
const FOCUS = [/^\/materi\/.+/, /^\/latihan\/.+/, /^\/evaluasi\/kerjakan/, /^\/kelas\/.+/, /^\/video\/.+/];
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
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          {({ isActive }) => (
            <>
              {isActive ? <motion.span layoutId="tab-bg" className="tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} /> : null}
              <Icon name={t.icon} size={22} />
              <span className="tab-label">{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
