import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { PageMotion } from './motion.jsx';
import { showsTabBar } from './TabBar.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export function initials(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

/** Kerangka halaman: header (kembali, judul, avatar + keluar) + isi beranimasi. */
export default function Page({ title, back = '/beranda', children, header = true }) {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const withTabs = showsTabBar(pathname);

  useEffect(() => {
    document.title = `${title} · Belajar Kubus dan Balok`;
  }, [title]);

  return (
    <PageMotion>
      {header ? (
        <header className="topbar">
          <div className="container topbar-inner">
            {back ? (
              <Link to={back} className="icon-btn" aria-label="Kembali"><Icon name="back" /></Link>
            ) : null}
            <div className="topbar-title">{title}</div>
            {student ? (
              <div className="topbar-user">
                <span className="name" title={student.code}>{student.nickname}</span>
                <button type="button" className="icon-btn" aria-label="Keluar" title="Keluar"
                  onClick={() => { logout(); navigate('/masuk'); }}>
                  <Icon name="logout" size={20} />
                </button>
              </div>
            ) : null}
          </div>
        </header>
      ) : null}
      <main className={`page${withTabs ? ' has-tabbar' : ''}`}>
        <div className="container stack">{children}</div>
      </main>
    </PageMotion>
  );
}
