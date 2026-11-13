import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import { ErrorBox, Loading, ProcessBadge, Stars } from '../components/common.jsx';
import SolutionSteps from '../components/SolutionSteps.jsx';
import { LEVELS } from '../features/practice/generators.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api.js';
import { formatDateTime, formatDuration } from '../utils/number.js';

const levelTitle = (id) => LEVELS.find((l) => l.id === id)?.title || id;
const attemptTitle = (a) => (a.mode === 'evaluasi' ? 'Evaluasi' : `Latihan: ${levelTitle(a.level)}`);

function useLoad(fetcher) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const run = useCallback(() => {
    setError(null);
    fetcher().then(setData).catch(setError);
  }, [fetcher]);
  useEffect(() => { run(); }, [run]);
  return { data, error, retry: run };
}

export function ResultList() {
  const { student } = useAuth();
  const { data, error, retry } = useLoad(api.attempts);
  const evals = data?.filter((a) => a.mode === 'evaluasi') || [];
  const best = evals.length ? Math.max(...evals.map((a) => a.score)) : null;

  return (
    <Page title="Hasil Belajar">
      <div className="card stack">
        <div className="row between">
          <div>
            <h1 style={{ marginBottom: 0 }}>{student.nickname}</h1>
            <span className="muted">Kode {student.code}{student.class_name ? ` · Kelas ${student.class_name}` : ''}</span>
          </div>
          {best !== null ? (
            <div className="center"><div className="small muted">Nilai evaluasi terbaik</div><div className="score-big" style={{ fontSize: '2rem' }}>{Math.round(best)}</div></div>
          ) : null}
        </div>
      </div>
      {error ? <ErrorBox error={error} onRetry={retry} /> : null}
      {!data && !error ? <Loading /> : null}
      {data && data.length === 0 ? (
        <div className="card center stack">
          <p>Belum ada riwayat. Yuk mulai dari latihan!</p>
          <Link className="btn" to="/latihan">Mulai latihan</Link>
        </div>
      ) : null}
      {data && data.length ? (
        <div className="stack">
          <h2>Riwayat</h2>
          {data.map((a) => (
            <Link key={a.id} to={`/hasil/${a.id}`} className="list-link">
              <span className="grow">
                <strong>{attemptTitle(a)}</strong>
                <span>{formatDateTime(a.submitted_at || a.started_at)} · {formatDuration(a.duration_seconds)}</span>
                <span style={{ display: 'block' }}>Benar {a.correct_count} · Salah {a.wrong_count}{a.mode === 'latihan' ? ' · ' : ''}{a.mode === 'latihan' ? <Stars count={a.stars || 0} /> : null}</span>
              </span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--blue-800)' }}>{Math.round(a.score)}</strong>
            </Link>
          ))}
        </div>
      ) : null}
    </Page>
  );
}

function ReviewItem({ item }) {
  const studentLabel = item.type === 'mc'
    ? item.options?.find((o) => o.id === item.student_answer)?.label
    : item.student_answer ? `${item.student_answer}${item.unit ? ` ${item.unit}` : ''}` : null;
  return (
    <div className={`card stack review-item ${item.is_correct ? 'ok' : 'bad'}`}>
      <div className="q-head">
        <strong>Soal {item.position} {item.is_correct ? '✔' : '✘'}</strong>
        <ProcessBadge process={item.process} />
      </div>
      <p style={{ margin: 0 }}>{item.prompt}</p>
      <p className="small" style={{ margin: 0 }}>
        Jawabanmu: <strong>{studentLabel || '(tidak dijawab)'}</strong>
        {!item.is_correct ? <> · Jawaban benar: <strong>{item.correct_label}</strong></> : null}
      </p>
      {item.explanation ? (
        <details open={!item.is_correct}>
          <summary>Pembahasan</summary>
          <SolutionSteps solution={item.explanation} />
        </details>
      ) : null}
    </div>
  );
}

export function ResultDetail() {
  const { id } = useParams();
  const location = useLocation();
  const fresh = location.state?.result;
  const fetcher = useCallback(() => (fresh ? Promise.resolve(null) : api.attempt(id)), [id, fresh]);
  const { data: fetched, error, retry } = useLoad(fetcher);
  const data = fresh ? { ...fresh, mode: 'evaluasi' } : fetched;

  return (
    <Page title="Hasil" back="/hasil">
      {error ? <ErrorBox error={error} onRetry={retry} /> : null}
      {!data && !error ? <Loading /> : null}
      {data ? (
        <>
          <div className="card stack center">
            {location.state?.fresh ? <div className="alert ok">Evaluasi berhasil dikumpulkan dan tersimpan.</div> : null}
            <h1>{data.mode === 'evaluasi' ? 'Nilai Evaluasi' : `Latihan: ${levelTitle(data.level)}`}</h1>
            {data.mode === 'latihan' ? <Stars count={data.stars || 0} /> : null}
            <div className="score-big">{Math.round(data.score)}</div>
            <div className="stats">
              <div><strong>{data.correct_count}</strong>benar</div>
              <div><strong>{data.wrong_count}</strong>salah</div>
              <div><strong>{formatDuration(data.duration_seconds).replace(' detik', ' dtk')}</strong>waktu</div>
            </div>
            {data.timed_out ? <div className="alert warn small">Dikumpulkan setelah batas waktu.</div> : null}
          </div>
          <h2>Pembahasan</h2>
          <div className="stack">
            {data.review.map((item) => <ReviewItem key={item.position} item={item} />)}
          </div>
          <div className="btn-row">
            <Link className="btn" to="/hasil">Riwayat</Link>
            <Link className="btn secondary" to="/beranda">Beranda</Link>
          </div>
        </>
      ) : null}
    </Page>
  );
}
