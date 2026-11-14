// Panel tanya-jawab dengan Bu Sari: suara (mikrofon) atau ketik, jawaban bersuara, lalu cek pemahaman.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from '../../components/Icon.jsx';
import { api } from '../../services/api.js';
import { listen, speak, stopSpeaking, sttSupported } from '../voice/speech.js';
import { classifyUnderstanding } from './player.js';
import TeacherAvatar from '../teacher/TeacherAvatar.jsx';

function Face({ role }) {
  if (role === 'student') return <span className="bubble-face me" aria-hidden="true"><Icon name="user" size={22} /></span>;
  return <span className="bubble-face" aria-hidden="true"><TeacherAvatar size={66} expression="happy" /></span>;
}

const AUTO_SEND_MS = 1800;

export default function AskPanel({ lessonSlug, segment, muted, startListening, onPhase, onResume }) {
  const [phase, setPhase] = useState('idle'); // idle | listening | review | thinking | answering | confirm
  const [log, setLog] = useState([]); // { role: 'student'|'teacher', text }
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [last, setLast] = useState(null); // { question, intent, canSimplify, followUp }
  const [notYet, setNotYet] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false); // tombol paham/belum tampil begitu jawaban datang
  const [awaitingReply, setAwaitingReplyState] = useState(false); // mikrofon/ketikan untuk menjawab "sudah paham?"
  const awaitingRef = useRef(false);
  const setAwaitingReply = (v) => { awaitingRef.current = v; setAwaitingReplyState(v); };
  const listener = useRef(null);
  const speech = useRef(null);
  const autoSend = useRef(null);
  const logEnd = useRef(null);

  useEffect(() => { onPhase?.(phase); }, [phase, onPhase]);
  useEffect(() => { logEnd.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); }, [log, phase]);
  useEffect(() => () => { listener.current?.abort(); speech.current?.cancel(); clearTimeout(autoSend.current); }, []);

  const say = useCallback((msg) => {
    speech.current?.cancel();
    speech.current = speak(msg, { muted });
    return speech.current.done;
  }, [muted]);

  const ask = useCallback(async (question, { simpler = false } = {}) => {
    clearTimeout(autoSend.current);
    setError('');
    setPhase('thinking');
    const history = log.slice(-6);
    if (!simpler) setLog((l) => [...l, { role: 'student', text: question }]);
    try {
      const res = await api.tutorAsk({
        lesson_slug: lessonSlug, segment_id: segment.id, question, history, simpler, intent: simpler ? last?.intent : undefined,
      });
      const full = res.follow_up ? `${res.answer} ${res.follow_up}` : res.answer;
      setLog((l) => [...l, { role: 'teacher', text: res.answer, followUp: res.follow_up, source: res.source }]);
      setLast({ question, intent: res.intent, canSimplify: res.can_simplify, followUp: res.follow_up });
      setShowConfirm(!!res.follow_up);
      setPhase('answering');
      const why = await say(full);
      if (why === 'end') setPhase('confirm');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }, [lessonSlug, segment.id, log, last, say]);

  const handleReply = useCallback((reply) => {
    const kind = classifyUnderstanding(reply);
    speech.current?.cancel();
    setShowConfirm(false);
    setLog((l) => [...l, { role: 'student', text: reply }]);
    if (kind === 'yes') {
      say('Bagus! Kita lanjutkan pelajarannya ya.').then(() => onResume());
      setPhase('answering');
    } else if (kind === 'no') {
      const n = notYet + 1;
      setNotYet(n);
      if (n >= 3) {
        const msg = 'Tidak apa-apa. Coba catat pertanyaanmu dan tanyakan juga kepada guru di kelas. Sekarang kita lanjutkan dulu, ya.';
        setLog((l) => [...l, { role: 'teacher', text: msg }]);
        setPhase('answering');
        say(msg).then((why) => { if (why === 'end') { setShowConfirm(true); setPhase('confirm'); } });
      } else {
        ask(last?.question || 'Saya belum paham', { simpler: true });
      }
    } else {
      const msg = 'Maaf, Bu Sari belum menangkap jawabanmu. Tekan "Sudah paham" atau "Belum paham", ya.';
      setLog((l) => [...l, { role: 'teacher', text: msg }]);
      say(msg);
      setShowConfirm(true);
      setPhase('confirm');
    }
  }, [notYet, last, ask, say, onResume]);

  const send = useCallback((value) => {
    const q = (value ?? text).trim();
    clearTimeout(autoSend.current);
    if (!q) { setError('Tulis atau ucapkan pertanyaanmu dulu.'); return; }
    if (q.length > 300) { setError('Pertanyaan terlalu panjang (maksimal 300 huruf).'); return; }
    setText('');
    if (awaitingRef.current) { setAwaitingReply(false); handleReply(q); return; }
    ask(q);
  }, [text, ask, handleReply]);

  const sendRef = useRef(send);
  sendRef.current = send;

  const startMic = useCallback((forReply = false) => {
    speech.current?.cancel();
    stopSpeaking();
    clearTimeout(autoSend.current);
    setError('');
    setInterim('');
    setAwaitingReply(forReply);
    setPhase('listening');
    listener.current = listen({
      onInterim: setInterim,
      onFinal: (t) => {
        setInterim('');
        if (!t) return;
        setText(t);
        setPhase('review');
        // Konfirmasi teks: kirim otomatis sebentar lagi, kecuali siswa mengubahnya.
        autoSend.current = setTimeout(() => sendRef.current(t), AUTO_SEND_MS);
      },
      onError: (msg) => { setError(msg); },
      onEnd: () => setPhase((p) => {
        if (p !== 'listening') return p;
        if (forReply) setShowConfirm(true);
        return forReply ? 'confirm' : 'idle';
      }),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopMic = () => { listener.current?.stop(); };

  // Dibuka lewat tombol mikrofon → langsung mendengarkan.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (startListening && sttSupported()) startMic(false);
  }, [startListening, startMic]);

  const editing = () => { clearTimeout(autoSend.current); setPhase((p) => (p === 'review' ? 'idle' : p)); };

  return (
    <section className="ask-panel card stack" aria-label="Tanya Bu Sari">
      <div className="row between">
        <strong>Tanya Bu Sari</strong>
        <span className="small muted">Bu Sari adalah guru virtual (program komputer).</span>
      </div>

      <div className="chat" role="log" aria-live="polite">
        {log.length === 0 ? <p className="muted small" style={{ margin: 0 }}>Contoh: "Kenapa dikali 6?", "Apa bedanya luas dan volume?", "Tolong ulangi".</p> : null}
        <AnimatePresence initial={false}>
          {log.map((m, i) => (
            <motion.div key={i} className={`bubble-row ${m.role}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {m.role === 'teacher' ? <Face role="teacher" /> : null}
              <div className={`bubble ${m.role}`}>
                {m.text}
                {m.followUp ? <div className="bubble-follow">{m.followUp}</div> : null}
              </div>
              {m.role === 'student' ? <Face role="student" /> : null}
            </motion.div>
          ))}
        </AnimatePresence>
        {phase === 'thinking' ? <div className="bubble-row teacher"><Face role="teacher" /><div className="bubble teacher typing" aria-label="Bu Sari sedang berpikir"><span /><span /><span /></div></div> : null}
        <div ref={logEnd} />
      </div>

      {phase === 'listening' ? (
        <div className="mic-live" role="status">
          <span className="rec-dot" aria-hidden="true" /> <strong>Mendengarkan…</strong>
          <span className="muted">{interim || (awaitingReply ? 'Jawab: sudah atau belum paham?' : 'Silakan bicara')}</span>
          <button type="button" className="btn small secondary" onClick={stopMic}><Icon name="micOff" size={18} /> Berhenti</button>
        </div>
      ) : null}

      {phase === 'review' ? (
        <div className="alert info small" role="status">
          Bu Sari mendengar: <strong>"{text}"</strong>. Mengirim sebentar lagi…{' '}
          <button type="button" className="btn ghost small" onClick={editing}>Ubah</button>
        </div>
      ) : null}

      {showConfirm && (phase === 'confirm' || phase === 'answering') ? (
        <div className="confirm-row">
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => handleReply('sudah paham')}>Sudah paham, lanjutkan</button>
            <button type="button" className="btn secondary" onClick={() => handleReply('belum paham')}>Belum paham</button>
            {sttSupported() ? <button type="button" className="btn ghost" onClick={() => { setShowConfirm(false); startMic(true); }}><Icon name="mic" size={18} /> Jawab dengan suara</button> : null}
          </div>
        </div>
      ) : null}

      {error ? <div className="alert error small" role="alert">{error}</div> : null}

      <div className="mic-hero">
        <div className="row">
          <span className={`wave${phase === 'listening' ? ' live' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <button type="button" className={`mic-big${phase === 'listening' ? ' on' : ''}`} aria-label={phase === 'listening' ? 'Matikan mikrofon' : 'Bicara dengan mikrofon'}
            onClick={() => (phase === 'listening' ? stopMic() : startMic(phase === 'confirm'))} disabled={!sttSupported() || phase === 'thinking'}
            title={sttSupported() ? 'Bicara' : 'Pengenalan suara tidak tersedia, silakan ketik'}>
            <Icon name={phase === 'listening' ? 'micOff' : 'mic'} size={32} />
          </button>
          <span className={`wave${phase === 'listening' ? ' live' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></span>
        </div>
        <span className="small muted">{!sttSupported() ? 'Mikrofon tidak tersedia — ketik pertanyaanmu' : phase === 'listening' ? 'Ketuk untuk berhenti' : 'Klik untuk berbicara'}</span>
      </div>

      <form className="ask-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="input" value={text} maxLength={300} placeholder={phase === 'confirm' ? 'Ketik: sudah / belum' : 'Ketik pertanyaanmu…'}
          aria-label="Pertanyaan untuk Bu Sari" onChange={(e) => { setText(e.target.value); editing(); }} onFocus={editing}
          disabled={phase === 'thinking'} onKeyDown={() => { if (phase === 'confirm') setAwaitingReply(true); }} />
        <button type="submit" className="icon-btn send-btn" aria-label="Kirim" disabled={phase === 'thinking'}><Icon name="send" size={20} /></button>
      </form>

      <button type="button" className="btn dark block" onClick={() => { listener.current?.abort(); speech.current?.cancel(); onResume(); }}>
        <Icon name="play" size={18} /> Kembali ke pelajaran
      </button>
    </section>
  );
}
