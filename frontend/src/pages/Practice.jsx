import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import { ErrorBox, ProgressBar, Stars } from '../components/common.jsx';
import { AnimatedStars, CardLink, FeedbackMotion, Stagger } from '../components/motion.jsx';
import Teacher from '../features/characters/Teacher.jsx';
import pickArt from '../features/illustrations/pickArt.jsx';
import { StarMascot } from '../features/illustrations/Illustrations.jsx';
import SolutionSteps from '../components/SolutionSteps.jsx';
import QuestionBody from '../features/quiz/QuestionBody.jsx';
import { feedbackFor, generateLevel, LEVELS, QUESTIONS_PER_LEVEL, starsFor } from '../features/practice/generators.js';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { parseNumber, sameNumber, validateNumberInput } from '../utils/number.js';
import { load, save } from '../utils/storage.js';

const bestKey = (code) => `kb_best_stars_${code}`;

export function PracticeMenu() {
  const { student } = useAuth();
  const [best, setBest] = useState(() => load(bestKey(student.code), {}));

  useEffect(() => {
    // Sinkronkan bintang terbaik dari riwayat online (jika tersedia).
    api.attempts().then((rows) => {
      const fromServer = {};
      for (const r of rows) {
        if (r.mode === 'latihan' && r.level) fromServer[r.level] = Math.max(fromServer[r.level] || 0, r.stars || 0);
      }
      setBest((local) => {
        const merged = { ...local };
        for (const [k, v] of Object.entries(fromServer)) merged[k] = Math.max(merged[k] || 0, v);
        save(bestKey(student.code), merged);
        return merged;
      });
    }).catch(() => {});
  }, [student.code]);

  return (
    <Page title="Latihan">
      <p className="muted">Setiap level berisi {QUESTIONS_PER_LEVEL} soal dengan angka acak. Jawab, lalu lihat pembahasannya.</p>
      <Stagger className="stack">
        {LEVELS.map((lv, i) => (
          <CardLink key={lv.id} to={`/latihan/${lv.id}`} className="list-link">
            <span className={`num ${['bg-blue', 'bg-mint', 'bg-lilac', 'bg-peach'][i]}`}>{i + 1}</span>
            <span className="grow"><strong>{lv.title}</strong><span>{lv.subtitle}</span></span>
            <Stars count={best[lv.id] || 0} />
          </CardLink>
        ))}
      </Stagger>
      <p className="small muted">★★★ = 5 benar · ★★ = 4 benar · ★ = 3 benar</p>
    </Page>
  );
}

/** Remount saat level berganti agar state soal ter-reset. */
export function PracticeRoute() {
  const { level } = useParams();
  return <PracticeSession key={level} />;
}

function PracticeSession() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();
  const levelInfo = LEVELS.find((l) => l.id === level);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => (levelInfo ? generateLevel(level) : []), [level, levelInfo, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(null); // { correct, message }
  const [records, setRecords] = useState([]);
  const [saveState, setSaveState] = useState({ status: 'idle', error: null });
  const startedAt = useRef(Date.now());

  const done = records.length === questions.length && questions.length > 0 && checked === null;
  const correctCount = records.filter((r) => r.is_correct).length;
  const stars = starsFor(correctCount, questions.length);

  const persist = useCallback(async (recs) => {
    const correct = recs.filter((r) => r.is_correct).length;
    const s = starsFor(correct, recs.length);
    const best = load(bestKey(student.code), {});
    best[level] = Math.max(best[level] || 0, s);
    save(bestKey(student.code), best);
    setSaveState({ status: 'saving', error: null });
    try {
      await api.savePractice({
        level, total_questions: recs.length, correct_count: correct, stars: s,
        duration_seconds: Math.round((Date.now() - startedAt.current) / 1000), answers: recs,
      });
      setSaveState({ status: 'saved', error: null });
    } catch (e) {
      setSaveState({ status: 'error', error: e });
    }
  }, [level, student.code]);

  if (!levelInfo) {
    return <Page title="Latihan" back="/latihan"><ErrorBox error={new Error('Level latihan tidak ditemukan.')} /></Page>;
  }

  const q = questions[idx];

  function check() {
    if (q.type === 'mc') {
      if (!value) { setError('Pilih salah satu jawaban dahulu.'); return; }
    } else {
      const msg = validateNumberInput(value);
      if (msg) { setError(msg); return; }
    }
    setError('');
    const parsed = q.type === 'numeric' ? parseNumber(value) : null;
    const correct = q.type === 'mc' ? value === q.answer : sameNumber(parsed, q.answer);
    const studentLabel = q.type === 'mc' ? q.options.find((o) => o.id === value)?.label : value.trim();
    setChecked({ correct, message: correct ? null : feedbackFor(q, value, parsed) });
    setRecords((r) => [...r, {
      position: idx + 1, prompt: q.prompt, answer: studentLabel, correct_answer: q.correctLabel, is_correct: correct,
    }]);
  }

  function next() {
    const isLast = idx === questions.length - 1;
    setChecked(null);
    setValue('');
    if (isLast) {
      persist(records);
    } else {
      setIdx((i) => i + 1);
    }
  }

  function restart() {
    setRound((r) => r + 1);
    setIdx(0); setValue(''); setError(''); setChecked(null); setRecords([]);
    setSaveState({ status: 'idle', error: null });
    startedAt.current = Date.now();
  }

  if (done) {
    const nextLevel = LEVELS[LEVELS.findIndex((l) => l.id === level) + 1];
    return (
      <Page title={`Latihan: ${levelInfo.title}`} back="/latihan">
        <div className="card stack center">
          <div className="center"><Teacher size={120} expression={stars >= 2 ? 'proud' : 'happy'} pose={stars >= 2 ? 'cheer' : 'idle'} /></div>
          <h1>Latihan selesai!</h1>
          <div><AnimatedStars count={stars} big /></div>
          <div className="score-big">{Math.round((correctCount / questions.length) * 100)}</div>
          <div className="stats">
            <div><strong>{correctCount}</strong>benar</div>
            <div><strong>{questions.length - correctCount}</strong>salah</div>
            <div><strong>{questions.length}</strong>soal</div>
          </div>
          {saveState.status === 'saving' ? <p className="muted">Menyimpan hasil…</p> : null}
          {saveState.status === 'saved' ? <div className="alert ok">Hasil tersimpan di Hasil Belajar.</div> : null}
          {saveState.status === 'error' ? (
            <div className="alert error">
              Hasil belum tersimpan: {saveState.error.message}
              <div><button type="button" className="btn secondary" style={{ marginTop: 8 }} onClick={() => persist(records)}>Simpan ulang</button></div>
            </div>
          ) : null}
        </div>
        <div className="stack">
          <h2>Ringkasan jawaban</h2>
          {records.map((r) => (
            <div key={r.position} className={`card review-item ${r.is_correct ? 'ok' : 'bad'}`}>
              <p className="small" style={{ marginBottom: 4 }}><strong>Soal {r.position}.</strong> {r.prompt}</p>
              <p className="small" style={{ margin: 0 }}>Jawabanmu: <strong>{r.answer}</strong> {r.is_correct ? '✔' : `✘ · Benar: ${r.correct_answer}`}</p>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <button type="button" className="btn" onClick={restart}>Ulangi dengan soal baru</button>
          {nextLevel ? <button type="button" className="btn secondary" onClick={() => navigate(`/latihan/${nextLevel.id}`)}>Level berikutnya</button>
            : <Link className="btn secondary" to="/evaluasi">Lanjut ke Evaluasi</Link>}
        </div>
      </Page>
    );
  }

  return (
    <Page title={`Latihan: ${levelInfo.title}`} back="/latihan">
      <div className="stack">
        <div className="panel-head">
          <span className="pill">★ Level {LEVELS.findIndex((l) => l.id === level) + 1} · Soal {idx + 1} dari {questions.length}</span>
          <Stars count={starsFor(correctCount, questions.length)} />
        </div>
        <ProgressBar value={records.length} max={questions.length} label="Progres latihan" />
      </div>
      <div className="deco-wrap">
      <span className="deco float-y" style={{ left: -10, top: -26 }} aria-hidden="true"><StarMascot size={56} /></span>
      <div className="q-card stack" key={q.id}>
        <QuestionBody question={q} value={value} onChange={(v) => { setValue(v); setError(''); }}
          locked={!!checked} correctId={q.type === 'mc' ? q.answer : undefined} error={error} art={pickArt(q.prompt)}
          onEnter={() => (checked ? next() : check())} />
        {checked ? (
          <>
            <FeedbackMotion correct={checked.correct} className={`feedback ${checked.correct ? 'ok' : 'bad'}`} role="status">
              {checked.correct ? '✔ Benar! Hebat.' : `✘ ${checked.message}`}
              {!checked.correct ? <div style={{ fontWeight: 600, marginTop: 4 }}>Jawaban benar: {q.correctLabel}</div> : null}
            </FeedbackMotion>
            <details open={!checked.correct}>
              <summary>Pembahasan langkah demi langkah</summary>
              <SolutionSteps solution={q.solution} />
            </details>
            <button type="button" className="btn block" onClick={next}>
              {idx === questions.length - 1 ? 'Lihat skor' : 'Soal berikutnya'}
            </button>
          </>
        ) : (
          <button type="button" className="btn block" onClick={check}>Periksa Jawaban</button>
        )}
      </div>
      </div>
    </Page>
  );
}
