import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

/** Kerangka halaman: header tetap (kembali, judul, nama samaran, keluar) + isi. */
export default function Page({ title, back = '/beranda', children }) {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${title} · Belajar Kubus dan Balok`;
  }, [title]);

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          {back ? (
            <Link to={back} className="icon-btn" aria-label="Kembali"><Icon name="back" /></Link>
          ) : (
            <Link to="/beranda" className="icon-btn" aria-label="Beranda"><Icon name="home" /></Link>
          )}
          <div className="topbar-title">{title}</div>
          {student ? (
            <div className="topbar-user">
              <span className="name" title={student.code}>{student.nickname}</span>
              <button type="button" className="icon-btn" aria-label="Keluar" title="Keluar"
                onClick={() => { logout(); navigate('/masuk'); }}>
                <Icon name="logout" />
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="page">
        <div className="container stack">{children}</div>
      </main>
    </>
  );
}
