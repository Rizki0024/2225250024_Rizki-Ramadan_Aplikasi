// Video Pembelajaran terintegrasi: guru + papan tulis dalam adegan kelas, dengan kontrol seperti pemutar video
// (putar/jeda, garis waktu, suara, teks, layar penuh). Dapat disela dengan "Ajukan Pertanyaan".
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { ErrorBox, Loading } from '../components/common.jsx';
import Teacher from '../features/characters/BuSari.jsx';
import Whiteboard from '../features/classroom/Whiteboard.jsx';
import AskPanel from '../features/classroom/AskPanel.jsx';
import { boardState, reducer as playerReducer, restore, teacherLook } from '../features/classroom/player.js';
import { buildTimeline, formatTime, positionAt, segmentStarts, timeOf } from '../features/classroom/timeline.js';
import { hasIndonesianVoice, speak, stopSpeaking, sttSupported, ttsSupported, unlockSpeech, voicesReady } from '../features/voice/speech.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import { api } from '../services/api.js';
import { load, save } from '../utils/storage.js';

const posKey = (code, slug) => `kb_video_${code}_${slug}`;

export default function VideoLesson() {
  const { slug } = useParams();
  const { student } = useAuth();
  const { settings, update } = useSettings();
  const [lesson, setLesson] = useState(() => load(`kb_lesson_data_${slug}`));
  const [error, setError] = useState(null);
  const [state, dispatch] = useReducer((s, a) => playerReducer(s, a), null, () => restore(null, null));
  const [elapsed, setElapsed] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [cc, setCc] = useState(true);
  const [qaPhase, setQaPhase] = useState(null);
  const [qaKey, setQaKey] = useState(0);
  const [voiceNote, setVoiceNote] = useState('');
  const frame = useRef(null);
  const restored = useRef(false);

  const fetchLesson = useCallback(() => {
    setError(null);
    api.lesson(slug).then((d) => { setLesson(d); save(`kb_lesson_data_${slug}`, d); }).catch(setError);
  }, [slug]);
  useEffect(() => { fetchLesson(); }, [fetchLesson]);

  const act = useCallback((type, extra = {}) => dispatch({ type, lesson, ...extra }), [lesson]);
  const timeline = useMemo(() => (lesson ? buildTimeline(lesson, settings.rate) : null), [lesson, settings.rate]);

  useEffect(() => {
    if (!lesson || restored.current) return;
    restored.current = true;
    dispatch({ type: '__SET__', lesson, state: restore(load(posKey(student.code, slug)), lesson) });
  }, [lesson, slug, student.code]);

  useEffect(() => {
    if (!lesson || !state || !restored.current) return;
    const pos = state.status === 'qa' && state.resume ? state.resume : state;
    save(posKey(student.code, slug), { seg: pos.seg, line: pos.line, finished: state.status === 'finished' });
  }, [lesson, state, slug, student.code]);

  // Video bersifat menonton: cek pemahaman dilewati otomatis (tersedia di Kelas Interaktif).
  useEffect(() => { if (state?.status === 'check') act('CHECK_CONTINUE'); }, [state?.status, act]);

  const line = lesson && state ? lesson.segments[state.seg]?.script[state.line] : null;
  useEffect(() => {
    setElapsed(0);
    if (!lesson || state?.status !== 'playing' || !line) return undefined;
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Date.now() - started), 250);
    const s = speak(line.say, { muted: settings.muted, rate: settings.rate, onStart: () => setSpeaking(true) });
    s.done.then((why) => {
      setSpeaking(false);
      if (why === 'end') dispatch({ type: 'LINE_DONE', lesson });
    });
    return () => { clearInterval(tick); s.cancel(); setSpeaking(false); };
  }, [lesson, state?.status, state?.seg, state?.line, line, settings.muted, settings.rate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    voicesReady().then(() => {
      if (!ttsSupported()) setVoiceNote('Perangkat ini tidak mendukung suara. Bu Sari menjelaskan lewat teks.');
      else if (!hasIndonesianVoice()) setVoiceNote('Suara Bahasa Indonesia belum terpasang di perangkat ini. Bu Sari menjelaskan lewat teks. Coba "Tes suara" di Pengaturan.');
    });
    return () => stopSpeaking();
  }, []);

  if (error && !lesson) return <Page title="Video Pembelajaran" back="/kelas"><ErrorBox error={error} onRetry={fetchLesson} /></Page>;
  if (!lesson || !state || !timeline) return <Page title="Video Pembelajaran" back="/kelas"><Loading text="Menyiapkan video…" /></Page>;

  const segment = lesson.segments[state.seg];
  const { revealed, active } = boardState(lesson, state);
  const entry = timeline.entries.find((e) => e.seg === state.seg && e.line === state.line);
  const now = state.status === 'finished' ? timeline.total : timeOf(timeline, state.seg, state.line) + Math.min(elapsed, (entry?.dur ?? 0) - 100);
  const pct = Math.min(100, (now / timeline.total) * 100);
  const playing = state.status === 'playing';
  const look = teacherLook(lesson, state, { speaking, qaPhase });

  const seekTo = (clientX, el) => {
    const r = el.getBoundingClientRect();
    const t = ((clientX - r.left) / r.width) * timeline.total;
    const pos = positionAt(timeline, t);
    act('GOTO', pos);
  };
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else frame.current?.requestFullscreen?.().catch(() => {});
  };
  const ask = () => { stopSpeaking(); setQaKey((k) => k + 1); act('INTERRUPT'); };

  return (
    <Page title="Video Pembelajaran" back="/kelas">
      <h1 style={{ marginBottom: 0 }}>{lesson.title}</h1>
      {voiceNote && !settings.muted ? <div className="alert warn small">{voiceNote}</div> : null}
      <div className="video-frame" ref={frame}>
        <div className="video-scene" onClick={() => { if (state.status === 'qa') return; unlockSpeech(); act(playing ? 'PAUSE' : 'PLAY'); }} role="presentation">
          <div className="window" /><div className="shelf" />
          <div className="chalk"><Whiteboard board={segment.board} revealed={revealed} active={active} segmentKey={segment.id} autoScroll={false} maxItems={3} /></div>
          <div className="teacher-pos"><Teacher size={220} expression={look.expression} pose={look.pose} speaking={speaking && playing} /></div>
          {!playing && state.status !== 'qa' ? (
            <button type="button" className="video-bigplay" aria-label={state.status === 'finished' ? 'Putar ulang video' : 'Putar video'}
              onClick={(e) => { e.stopPropagation(); unlockSpeech(); act('PLAY'); }}>
              <Icon name={state.status === 'finished' ? 'replay' : 'play'} size={34} />
            </button>
          ) : null}
          {cc && line && (playing || state.status === 'paused') ? <div className="video-cc" aria-live="polite">{line.say}</div> : null}
        </div>
        <div className="video-bar" role="toolbar" aria-label="Kontrol video">
          <button type="button" onClick={() => { unlockSpeech(); act(playing ? 'PAUSE' : 'PLAY'); }} aria-label={playing ? 'Jeda' : 'Putar'} disabled={state.status === 'qa'}>
            <Icon name={playing ? 'pause' : 'play'} size={20} />
          </button>
          <span aria-label="Waktu video">{formatTime(now)} / {formatTime(timeline.total)}</span>
          <div className="seek" role="slider" tabIndex={0} aria-label="Posisi video" aria-valuemin={0} aria-valuemax={Math.round(timeline.total / 1000)}
            aria-valuenow={Math.round(now / 1000)} aria-valuetext={`${formatTime(now)} dari ${formatTime(timeline.total)}`}
            onPointerDown={(e) => seekTo(e.clientX, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') act('GOTO', positionAt(timeline, now + 5000));
              if (e.key === 'ArrowLeft') act('GOTO', positionAt(timeline, Math.max(0, timeOf(timeline, state.seg, state.line) - 1)));
            }}>
            {segmentStarts(timeline).slice(1).map((s) => <i key={s.seg} className="tick" style={{ left: `${(s.start / timeline.total) * 100}%` }} />)}
            <div className="fill" style={{ width: `${pct}%` }} />
            <span className="knob" style={{ left: `${pct}%` }} />
          </div>
          <button type="button" onClick={() => update({ muted: !settings.muted })} aria-label={settings.muted ? 'Nyalakan suara' : 'Matikan suara'} aria-pressed={settings.muted}>
            <Icon name={settings.muted ? 'micOff' : 'volume'} size={20} />
          </button>
          <button type="button" onClick={() => setCc((c) => !c)} aria-label="Teks penjelasan" aria-pressed={cc}><Icon name="cc" size={20} /></button>
          <button type="button" onClick={toggleFull} aria-label="Layar penuh"><Icon name="expand" size={20} /></button>
        </div>
      </div>

      {state.status === 'qa' ? (
        <AskPanel key={qaKey} lessonSlug={slug} segment={segment} muted={settings.muted} startListening={sttSupported()}
          onPhase={setQaPhase} onResume={() => { setQaPhase(null); act('RESUME'); }} />
      ) : (
        <button type="button" className="btn yellow block" onClick={ask}><Icon name="mic" size={20} /> Ajukan Pertanyaan</button>
      )}

      <details className="card" open>
        <summary>Ringkasan Materi</summary>
        <div className="summary-list">
          {lesson.segments.map((sg, i) => (
            <button key={sg.id} type="button" className={i === state.seg ? 'on' : ''} onClick={() => act('GOTO', { seg: i, line: 0 })}>
              <span className="num" style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--pastel-blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span>{sg.title}<br /><span className="small muted" style={{ fontWeight: 600 }}>{sg.goal}</span>{sg.rmt ? <><br /><span className="rmt-chip">Fase {sg.rmt.phase}</span></> : null}</span>
              <span className="t">{formatTime(timeOf(timeline, i, 0))}</span>
            </button>
          ))}
        </div>
      </details>
      <Link className="btn secondary block" to={`/kelas/${slug}`}>Buka kelas interaktif (dengan cek pemahaman)</Link>
      <p className="small">Durasi adalah perkiraan; kecepatan sebenarnya mengikuti suara perangkat.</p>
    </Page>
  );
}
