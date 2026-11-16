import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { ErrorBox, Loading, Modal, ProgressBar } from '../components/common.jsx';
import QuestionBody from '../features/quiz/QuestionBody.jsx';
import StagedQuestion, { stagedFilled, stagedInputs, stagedInvalid } from '../features/quiz/StagedQuestion.jsx';
import { formatClock, useCountdown } from '../hooks/useCountdown.js';
import { api } from '../services/api.js';
import { parseNumber } from '../utils/number.js';
import { load, remove, save } from '../utils/storage.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { BulbArt, ClipboardArt, HourglassArt } from '../features/illustrations/Illustrations.jsx';

// Jawaban evaluasi disimpan di perangkat agar tidak hilang saat koneksi putus / halaman dimuat ulang.
// Kunci per siswa agar aman bila satu perangkat dipakai bergantian.
const currentKey = (code) => `kb_eval_current_${code}`;

export function EvaluationIntro() {
  const { student } = useAuth();
  const pending = load(currentKey(student.code));
  return (
    <Page title="Evaluasi">
      <div className="card stack">
        <div className="row" style={{ flexWrap: 'nowrap' }}><ClipboardArt size={64} /><h1 style={{ margin: 0 }}>Evaluasi Luas Permukaan</h1></div>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li><strong>4 soal cerita</strong> literasi matematika: Formulate, Employ, Interpret, dan Reasoning.</li>
          <li>Setiap soal dikerjakan <strong>tahap demi tahap</strong>. Setiap tahap punya skor; skor maksimum 6 per soal, total <strong>24</strong>.</li>
          <li>Salah hitung di satu tahap tidak menghapus skor tahap berikutnya selama langkahmu konsisten.</li>
          <li>Waktu <strong>30 menit</strong>. Saat waktu habis, jawaban otomatis dikumpulkan.</li>
          <li>Jawaban <strong>tidak diperiksa</strong> sampai kamu menekan <em>Kumpulkan</em>.</li>
          <li>Kamu boleh pindah-pindah soal sebelum mengumpulkan.</li>
          <li>Nilai dan pembahasan muncul setelah dikumpulkan dan tersimpan di Hasil Belajar.</li>
        </ul>
        <div className="tip">Siapkan kertas coretan. Tulis yang diketahui dan ditanyakan sebelum menghitung.</div>
        <Link to="/evaluasi/kerjakan" className="btn yellow block">{pending ? 'Lanjutkan evaluasi' : 'Mulai evaluasi'}</Link>
      </div>
    </Page>
  );
}

export function EvaluationSession() {
  const navigate = useNavigate();
  const { student } = useAuth();
  const CURRENT_KEY = currentKey(student.code);
  const [state, setState] = useState(null); // { attemptId, questions, deadline, resumed }
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const submittedRef = useRef(false);
  const startedRef = useRef(false); // cegah dua permintaan start bersamaan

  const submit = useCallback(async (attemptId, ans) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setConfirm(false);
    try {
      const payload = Object.entries(ans).map(([question_id, answer]) => ({
        question_id,
        answer: answer && typeof answer === 'object'
          ? (Object.keys(answer).length ? JSON.stringify(answer) : null)
          : (answer === '' || answer === undefined ? null : String(answer)),
      }));
      const result = await api.submitEvaluation(attemptId, payload);
      remove(CURRENT_KEY);
      navigate(`/hasil/${result.attempt_id}`, { replace: true, state: { result, fresh: true } });
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      if (e.status === 400) { // sudah dikumpulkan sebelumnya
        remove(CURRENT_KEY);
        navigate(`/hasil/${attemptId}`, { replace: true });
        return;
      }
      setSubmitError(e);
    }
  }, [navigate, CURRENT_KEY]);

  const start = useCallback(async () => {
    setLoadError(null);
    const saved = load(CURRENT_KEY);
    // Evaluasi lama yang waktunya habis saat offline: kumpulkan dulu.
    if (saved && saved.deadline <= Date.now()) {
      setState(saved);
      setAnswers(saved.answers || {});
      submit(saved.attemptId, saved.answers || {});
      return;
    }
    try {
      const data = await api.startEvaluation();
      const offset = new Date(data.server_time).getTime() - Date.now();
      const deadline = new Date(data.expires_at).getTime() - offset;
      const prev = saved?.attemptId === data.attempt_id ? saved.answers || {} : {};
      const next = { attemptId: data.attempt_id, questions: data.questions, deadline, resumed: data.resumed, answers: prev };
      save(CURRENT_KEY, next);
      setState(next);
      setAnswers(prev);
    } catch (e) {
      if (saved) { // offline tetapi sesi tersimpan: tetap bisa mengerjakan
        setState(saved);
        setAnswers(saved.answers || {});
      } else {
        setLoadError(e);
      }
    }
  }, [submit, CURRENT_KEY]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  const remaining = useCountdown(state?.deadline, () => {
    if (state) submit(state.attemptId, load(CURRENT_KEY)?.answers || answers);
  });

  function setAnswer(qid, v) {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: v };
      const cur = load(CURRENT_KEY);
      if (cur) save(CURRENT_KEY, { ...cur, answers: next });
      return next;
    });
  }

  if (loadError) return <Page title="Evaluasi" back="/evaluasi"><ErrorBox error={loadError} onRetry={start} /></Page>;
  if (!state) return <Page title="Evaluasi" back="/evaluasi"><Loading text="Menyiapkan soal…" /></Page>;

  const { questions } = state;
  const q = questions[idx];
  const isAnswered = (qq) => (qq.type === 'staged'
    ? stagedFilled(qq, answers[qq.id]) === stagedInputs(qq).length
    : answers[qq.id] !== undefined && String(answers[qq.id]).trim() !== '');
  const answeredCount = questions.filter(isAnswered).length;
  const invalidCount = questions.filter((qq) => qq.type === 'numeric' && isAnswered(qq) && parseNumber(answers[qq.id]) === null).length
    + questions.filter((qq) => qq.type === 'staged').reduce((n, qq) => n + stagedInvalid(qq, answers[qq.id]), 0);
  const emptyFields = questions.filter((qq) => qq.type === 'staged').reduce((n, qq) => n + stagedInputs(qq).length - stagedFilled(qq, answers[qq.id]), 0);
  const numError = q.type === 'numeric' && isAnswered(q) && parseNumber(answers[q.id]) === null
    ? 'Format angka belum benar. Tulis angka saja, contoh: 216 atau 4,5.' : null;
  const low = remaining !== null && remaining < 5 * 60 * 1000;

  return (
    <Page title="Evaluasi" back="/beranda">
      {state.resumed ? <div className="alert info small">Melanjutkan evaluasi sebelumnya. Waktu tetap berjalan.</div> : null}
      <div className="stack">
        <div className="panel-head">
          <span className="pill"><BulbArt size={26} /> Evaluasi</span>
          <span className={`timer${low ? ' low' : ''}`} aria-live="off"><Icon name="clock" size={16} /> {formatClock(remaining)}</span>
        </div>
        <ProgressBar value={answeredCount} max={questions.length} label="Soal terjawab" />
      </div>

      <div className="deco-wrap">
      <span className="deco float-y slow" style={{ right: -6, bottom: 64 }} aria-hidden="true"><HourglassArt size={64} /></span>
      <div className="q-card stack" key={q.id}>
        <strong style={{ color: 'var(--blue-700)' }}>Soal {idx + 1} dari {questions.length}</strong>
        {q.type === 'staged'
          ? <StagedQuestion question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} idPrefix="ev" />
          : <QuestionBody question={q} value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} error={numError}
              inputId={`ev-${q.id}`} onEnter={() => idx < questions.length - 1 && setIdx(idx + 1)} />}
        <div className="btn-row">
          <button type="button" className="btn secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Sebelumnya</button>
          {idx < questions.length - 1
            ? <button type="button" className="btn" onClick={() => setIdx(idx + 1)}>Selanjutnya <Icon name="arrow" size={18} /></button>
            : <button type="button" className="btn yellow" onClick={() => setConfirm(true)} disabled={submitting}>Kumpulkan</button>}
        </div>
      </div>
      </div>

      <div className="card stack">
        <strong>Lompat ke soal</strong>
        <div className="qnav">
          {questions.map((qq, i) => (
            <button key={qq.id} type="button" onClick={() => setIdx(i)} aria-label={`Soal ${i + 1}${isAnswered(qq) ? ', sudah dijawab' : ''}`}
              className={`${isAnswered(qq) ? 'answered' : ''} ${i === idx ? 'current' : ''}`}>{i + 1}</button>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>Terjawab {answeredCount} dari {questions.length}. Jawaban tersimpan otomatis di perangkat ini.</p>
        <button type="button" className="btn secondary" onClick={() => setConfirm(true)} disabled={submitting}>Kumpulkan sekarang</button>
      </div>

      {submitting ? <Loading text="Mengirim jawaban…" /> : null}
      {submitError ? (
        <div className="alert error" role="alert">
          <p>Jawaban belum terkirim: {submitError.message}</p>
          <p className="small">Jawabanmu aman tersimpan di perangkat ini.</p>
          <button type="button" className="btn" onClick={() => submit(state.attemptId, answers)}>Kirim ulang</button>
        </div>
      ) : null}

      {confirm ? (
        <Modal title="Kumpulkan evaluasi?" actions={[
          <button key="b" type="button" className="btn secondary" onClick={() => setConfirm(false)}>Periksa lagi</button>,
          <button key="k" type="button" className="btn" onClick={() => submit(state.attemptId, answers)}>Kumpulkan</button>,
        ]}>
          {answeredCount < questions.length
            ? <p className="alert warn">Masih ada {questions.length - answeredCount} soal yang belum lengkap{emptyFields ? ` (${emptyFields} isian tahap kosong)` : ''}. Isian kosong mendapat skor 0.</p>
            : <p>Semua soal sudah dijawab.</p>}
          {invalidCount ? <p className="alert warn">{invalidCount} jawaban angka formatnya belum benar dan akan dihitung salah.</p> : null}
          <p className="small muted" style={{ margin: 0 }}>Setelah dikumpulkan, jawaban tidak bisa diubah.</p>
        </Modal>
      ) : null}
    </Page>
  );
}
