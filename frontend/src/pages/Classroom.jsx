// Kelas Guru Virtual: Bu Sari menjelaskan di samping papan tulis, siswa dapat menyela dan bertanya.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { ErrorBox, Loading } from '../components/common.jsx';
import { AnimatedBar, CardLink, FeedbackMotion, Stagger } from '../components/motion.jsx';
import Teacher from '../features/characters/BuSari.jsx';
import Whiteboard from '../features/classroom/Whiteboard.jsx';
import AskPanel from '../features/classroom/AskPanel.jsx';
import { boardState, progressPercent, reducer as playerReducer, restore, teacherLook } from '../features/classroom/player.js';
import { hasIndonesianVoice, speak, stopSpeaking, sttSupported, ttsSupported, unlockSpeech, voicesReady } from '../features/voice/speech.js';
import { doneLessons, markLessonDone } from '../features/progress/progress.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import { api } from '../services/api.js';
import { load, save } from '../utils/storage.js';

const posKey = (code, slug) => `kb_lesson_${code}_${slug}`;

function useCachedFetch(key, fetcher) {
  const [data, setData] = useState(() => load(key));
  const [error, setError] = useState(null);
  const run = useCallback(() => {
    setError(null);
    fetcher().then((d) => { setData(d); save(key, d); }).catch(setError);
  }, [key, fetcher]);
  useEffect(() => { run(); }, [run]);
  return { data, error, retry: run };
}

export function ClassroomList() {
  const { student } = useAuth();
  const { data, error, retry } = useCachedFetch('kb_lessons', api.lessons);
  const done = new Set(doneLessons(student.code));
  return (
    <Page title="Belajar Bersama Guru">
      <div className="hero" style={{ minHeight: 0, background: '#fff' }}>
        <div>
          <h2>Halo, aku Bu Sari!</h2>
          <p>Aku menjelaskan materi di papan tulis. Kalau bingung, tekan <strong>mikrofon</strong> dan tanyakan saja, lalu kita lanjutkan dari bagian terakhir.</p>
          <span className="small" style={{ color: '#35406a' }}>Bu Sari adalah guru virtual (program komputer), bukan manusia.</span>
        </div>
        <div className="hero-figure"><Teacher size={140} expression="happy" pose="wave" /></div>
      </div>
      {error && !data ? <ErrorBox error={error} onRetry={retry} /> : null}
      {!data && !error ? <Loading /> : null}
      {data ? (
        <Stagger className="stack">
          {data.map((x, i) => {
            const pos = load(posKey(student.code, x.slug));
            const status = done.has(x.slug) ? 'Selesai' : pos && (pos.seg || pos.line) ? 'Lanjutkan' : `${x.segment_count} bagian`;
            return (
              <div key={x.slug} className="lesson-row">
              <CardLink to={`/kelas/${x.slug}`} className="list-link">
                <span className={`num ${['bg-blue', 'bg-mint', 'bg-lilac', 'bg-peach'][i % 4]}`}>{x.order_no}</span>
                <span className="grow"><strong>{x.title}</strong><span>{x.summary} · {status}</span></span>
                {done.has(x.slug) ? <span className="check-badge"><Icon name="check" size={16} /></span> : <span aria-hidden="true"><Icon name="play" size={18} /></span>}
              </CardLink>
              <Link to={`/video/${x.slug}`} className="video-btn" aria-label={`Video: ${x.title}`}><Icon name="video" size={24} />Video</Link>
              </div>
            );
          })}
        </Stagger>
      ) : null}
    </Page>
  );
}

export function ClassroomRoute() {
  const { slug } = useParams();
  return <Classroom key={slug} slug={slug} />;
}

function CheckCard({ check, onContinue, muted, rate }) {
  const [picked, setPicked] = useState(null);
  const correct = picked === check.answer;
  useEffect(() => {
    const s = speak(`Coba jawab dulu. ${check.question}`, { muted, rate });
    return () => s.cancel();
  }, [check, muted, rate]);
  return (
    <motion.section className="card stack check-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} aria-label="Cek pemahaman">
      <span className="badge">Cek pemahaman</span>
      <strong>{check.question}</strong>
      <div className="options">
        {check.options.map((opt, i) => {
          let cls = 'option';
          if (picked !== null && i === check.answer) cls += ' correct';
          else if (picked === i) cls += ' wrong';
          return (
            <button key={opt} type="button" className={cls} disabled={picked !== null} onClick={() => {
              setPicked(i);
              stopSpeaking();
              speak(i === check.answer ? `Benar! ${check.explain}` : `Belum tepat. ${check.explain}`, { muted, rate });
            }}>
              <span className="letter">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <FeedbackMotion correct={correct} className={`feedback ${correct ? 'ok' : 'bad'}`} role="status">
          {correct ? '✔ Benar! ' : '✘ Belum tepat. '}<span style={{ fontWeight: 600 }}>{check.explain}</span>
        </FeedbackMotion>
      ) : null}
      {picked !== null ? <button type="button" className="btn block" onClick={() => { stopSpeaking(); onContinue(); }}>Lanjut ke bagian berikutnya</button> : null}
    </motion.section>
  );
}

function Classroom({ slug }) {
  const { student } = useAuth();
  const fetcher = useCallback(() => api.lesson(slug), [slug]);
  const { data: lesson, error, retry } = useCachedFetch(`kb_lesson_data_${slug}`, fetcher);
  const [state, dispatch] = useReducer((s, a) => playerReducer(s, { ...a, lesson: a.lesson }), null, () => restore(null, null));
  const restored = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const { settings, update } = useSettings();
  const { muted, rate } = settings;
  const [voiceNote, setVoiceNote] = useState('');
  const [qaPhase, setQaPhase] = useState(null);
  const [qaMic, setQaMic] = useState(false);
  const [qaKey, setQaKey] = useState(0);
  // Di laptop guru berdiri di kanan papan → menghadap/menunjuk ke kiri.
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 900);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const act = useCallback((type, extra = {}) => dispatch({ type, lesson, ...extra }), [lesson]);

  // Pulihkan posisi terakhir sekali saat naskah tersedia.
  useEffect(() => {
    if (!lesson || restored.current) return;
    restored.current = true;
    const r = restore(load(posKey(student.code, slug)), lesson);
    dispatch({ type: '__SET__', lesson, state: r });
  }, [lesson, slug, student.code]);

  useEffect(() => {
    voicesReady().then(() => {
      if (!ttsSupported()) setVoiceNote('Perangkat ini tidak mendukung suara. Bu Sari menjelaskan lewat teks.');
      else if (!hasIndonesianVoice()) setVoiceNote('Suara Bahasa Indonesia belum terpasang di perangkat ini. Bu Sari menjelaskan lewat teks.');
    });
    return () => stopSpeaking();
  }, []);

  // Simpan posisi belajar (lokal) agar tidak hilang saat koneksi putus atau halaman ditutup.
  useEffect(() => {
    if (!lesson || !state || !restored.current) return;
    const pos = state.status === 'qa' && state.resume ? state.resume : state;
    save(posKey(student.code, slug), { seg: pos.seg, line: pos.line, finished: state.status === 'finished' });
    if (state.status === 'finished') markLessonDone(student.code, slug);
  }, [lesson, state, slug, student.code]);

  // Ucapkan baris aktif saat diputar.
  const line = lesson && state ? lesson.segments[state.seg]?.script[state.line] : null;
  useEffect(() => {
    if (!lesson || state?.status !== 'playing' || !line) return undefined;
    const s = speak(line.say, { muted, rate, onStart: () => setSpeaking(true) });
    s.done.then((why) => {
      setSpeaking(false);
      if (why === 'end') dispatch({ type: 'LINE_DONE', lesson });
    });
    return () => { s.cancel(); setSpeaking(false); };
  }, [lesson, state?.status, state?.seg, state?.line, line, muted, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state?.status !== 'finished') return undefined;
    const s = speak('Hebat! Kamu sudah menyelesaikan pelajaran ini.', { muted, rate });
    return () => s.cancel();
  }, [state?.status, muted]);

  const interrupt = (withMic) => {
    stopSpeaking();
    setQaMic(withMic);
    setQaKey((k) => k + 1);
    act('INTERRUPT');
  };

  const look = useMemo(() => (lesson && state ? teacherLook(lesson, state, { speaking, qaPhase }) : { expression: 'happy', pose: 'idle' }),
    [lesson, state, speaking, qaPhase]);

  if (error && !lesson) return <Page title="Belajar Bersama Guru" back="/kelas"><ErrorBox error={error} onRetry={retry} /></Page>;
  if (!lesson || !state) return <Page title="Belajar Bersama Guru" back="/kelas"><Loading text="Bu Sari menyiapkan papan tulis…" /></Page>;

  const segment = lesson.segments[state.seg];
  const { revealed, active } = boardState(lesson, state);
  const pct = progressPercent(lesson, state);
  const subtitle = state.status === 'idle' ? `Halo! Hari ini kita belajar "${lesson.title}". Tekan Mulai, ya.`
    : state.status === 'finished' ? 'Hebat! Kamu sudah menyelesaikan pelajaran ini.'
      : state.status === 'check' ? 'Coba jawab pertanyaan di bawah dulu.'
        : state.status === 'qa' ? 'Silakan bertanya. Bu Sari mendengarkan.'
          : line?.say;
  const playing = state.status === 'playing';

  return (
    <Page title={lesson.title} back="/kelas">
      <div className="lesson-head">
        <div className="row between small">
          <span><strong>Bagian {state.seg + 1}/{lesson.segments.length}</strong> · {segment.title}</span>
          <span className="muted">{pct}%</span>
        </div>
        <AnimatedBar value={pct} label="Progres pelajaran" />
        <div className="seg-dots" role="tablist" aria-label="Bagian pelajaran">
          {lesson.segments.map((sg, i) => (
            <button key={sg.id} type="button" role="tab" aria-selected={i === state.seg} title={sg.title}
              className={i === state.seg ? 'active' : i < state.seg ? 'done' : ''} onClick={() => act('GOTO_SEGMENT', { seg: i })}>
              {i + 1}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>🎯 {segment.goal}</p>
        {segment.rmt ? <p className="rmt-chip" title="Tahap berpikir menurut metode Rigorous Mathematical Thinking"><strong>Fase {segment.rmt.phase}</strong> · {segment.rmt.focus}</p> : null}
      </div>

      {voiceNote ? <div className="alert warn small">{voiceNote}</div> : null}

      <div className="classroom">
        <Whiteboard board={segment.board} revealed={revealed} active={active} segmentKey={segment.id} />
        <div className="teacher-col">
          <div className="teacher-stage">
            <Teacher size={200} facing={wide ? 'left' : 'right'} expression={look.expression} pose={look.pose} speaking={speaking && (playing || qaPhase === 'answering')} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${state.status}-${state.seg}-${state.line}`} className="speech-bubble" aria-live="polite"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {subtitle}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {state.status === 'check' && segment.check ? (
        <CheckCard key={segment.id} check={segment.check} muted={muted} rate={rate} onContinue={() => act('CHECK_CONTINUE')} />
      ) : null}

      {state.status === 'qa' ? (
        <AskPanel key={qaKey} lessonSlug={slug} segment={segment} muted={muted} startListening={qaMic}
          onPhase={setQaPhase} onResume={() => { setQaPhase(null); act('RESUME'); }} />
      ) : null}

      {state.status === 'finished' ? (
        <div className="card stack center">
          <h2>Pelajaran selesai! 🎉</h2>
          <div className="btn-row">
            <Link className="btn" to="/latihan">Latihan soal</Link>
            <Link className="btn secondary" to="/kelas">Pelajaran lain</Link>
            <button type="button" className="btn ghost" onClick={() => { unlockSpeech(); act('PLAY'); }}>Ulangi dari awal</button>
          </div>
        </div>
      ) : null}

      {state.status !== 'qa' ? (
        <div className="player-bar" role="toolbar" aria-label="Kontrol pelajaran">
          <button type="button" className="ctrl" onClick={() => act('PREV_SEGMENT')} aria-label="Bagian sebelumnya" disabled={state.seg === 0}><Icon name="prev" /></button>
          <button type="button" className="ctrl" onClick={() => act('REPLAY_SEGMENT')} aria-label="Ulangi bagian ini"><Icon name="replay" /></button>
          <button type="button" className="ctrl main" onClick={() => { unlockSpeech(); act(playing ? 'PAUSE' : 'PLAY'); }}
            aria-label={playing ? 'Jeda' : state.status === 'idle' ? 'Mulai' : 'Lanjutkan'} disabled={state.status === 'check'}>
            <Icon name={playing ? 'pause' : 'play'} size={28} />
          </button>
          <button type="button" className="ctrl" onClick={() => act('NEXT_SEGMENT')} aria-label="Bagian berikutnya" disabled={state.status === 'finished'}><Icon name="next" /></button>
          <button type="button" className={`ctrl${muted ? ' off' : ''}`} onClick={() => update({ muted: !muted })}
            aria-label={muted ? 'Nyalakan suara guru' : 'Matikan suara guru'} aria-pressed={muted}><Icon name="volume" /></button>
          <button type="button" className="ctrl ask" onClick={() => interrupt(sttSupported())} aria-label="Tanya Bu Sari">
            <Icon name={sttSupported() ? 'mic' : 'send'} size={24} /><span>Tanya</span>
          </button>
        </div>
      ) : null}
    </Page>
  );
}
