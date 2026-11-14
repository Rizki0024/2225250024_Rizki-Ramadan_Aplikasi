import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Page from '../components/Layout.jsx';
import { Stagger, StaggerItem } from '../components/motion.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api.js';
import { BADGES, points, summarize } from '../features/progress/progress.js';
import Student from '../features/characters/Student.jsx';
import { MedalArt } from '../features/illustrations/Illustrations.jsx';

export default function Profile() {
  const { student } = useAuth();
  const [attempts, setAttempts] = useState(null);
  useEffect(() => { api.attempts().then(setAttempts).catch(() => setAttempts([])); }, []);
  const p = summarize(student.code, attempts);
  const [picked, setPicked] = useState(null);
  const pickedBadge = BADGES.find((b) => b.id === picked);

  return (
    <Page title="Profil & Progres" back="/beranda">
      <Stagger className="stack">
        <StaggerItem className="card profile-card">
          <span className="avatar-xl" aria-hidden="true"><Student size={130} pose="wave" /></span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{student.nickname}</h1>
            <span className="muted">{student.code}{student.class_name ? ` • ${student.class_name}` : ''}</span><br />
            <span className="points-pill" style={{ marginTop: 8 }}><span className="star">★</span>{points(p)} poin</span>
          </div>
        </StaggerItem>

        <StaggerItem className="card stack">
          <div className="row between"><strong>Progres Keseluruhan</strong><strong style={{ fontSize: '1.3rem', color: 'var(--blue-900)' }}>{p.percent}%</strong></div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.percent} aria-label="Progres keseluruhan">
            <motion.div initial={{ width: 0 }} animate={{ width: `${p.percent}%` }} transition={{ duration: 0.8 }} />
          </div>
          <div className="stats small">
            <div><strong>{p.read}/4</strong>materi</div>
            <div><strong>{p.lessons}/4</strong>kelas guru</div>
            <div><strong>{p.totalStars}/{p.maxStars}</strong>bintang</div>
          </div>
        </StaggerItem>

        <StaggerItem className="card stack">
          <strong>Lencana Prestasi</strong>
          <div className="badge-grid">
            {BADGES.map((b, i) => {
              const earned = b.earned(p);
              return (
                <motion.button type="button" key={b.id} className={`badge-item${earned ? '' : ' locked'}`} title={b.desc}
                  aria-pressed={picked === b.id} onClick={() => setPicked(picked === b.id ? null : b.id)}
                  initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 18 }}
                  aria-label={`${b.name}: ${earned ? 'sudah didapat' : `belum — ${b.desc}`}`}>
                  <MedalArt size={56} color={b.color} locked={!earned} />
                  {b.name}
                </motion.button>
              );
            })}
          </div>
          {pickedBadge ? (
            <div className="alert info small" role="status"><strong>{pickedBadge.name}:</strong> {pickedBadge.desc} — {pickedBadge.earned(p) ? 'sudah didapat 🎉' : 'belum didapat'}.</div>
          ) : <span className="small muted">Ketuk lencana untuk melihat syaratnya. Lencana abu-abu belum didapat.</span>}
        </StaggerItem>

        <StaggerItem className="btn-row">
          <Link className="btn" to="/hasil">Riwayat nilai</Link>
          <Link className="btn secondary" to="/pengaturan">Pengaturan</Link>
        </StaggerItem>
      </Stagger>
    </Page>
  );
}
