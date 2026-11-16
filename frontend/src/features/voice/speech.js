// Suara guru (Text-to-Speech) dan pengenalan suara siswa (Speech-to-Text) memakai Web Speech API bawaan browser.
// Tidak ada rekaman suara yang disimpan oleh aplikasi. Jika fitur tidak tersedia, aplikasi memakai teks.
import { load } from '../../utils/storage.js';

// ---------------- TTS ----------------
export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

let cachedVoice;
/** Status suara terakhir untuk diagnosis: { mode, voice, error }. */
export const voiceStatus = { mode: null, voice: null, error: null };

/** Kode bahasa Indonesia: "id-ID", "id_ID", serta kode Java lama "in-ID"/"in_ID" yang dipakai sebagian HP Android. */
export function isIndonesianLang(lang = '') {
  const l = String(lang).toLowerCase().replace('_', '-');
  return l === 'id' || l === 'in' || l.startsWith('id-') || l.startsWith('in-');
}

export function isAndroid() {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');
}

/** Memilih suara Indonesia dari daftar suara (utamakan suara lokal/offline). */
export function chooseVoice(voices = []) {
  const indo = voices.filter((v) => isIndonesianLang(v.lang) || /indonesia/i.test(v.name || ''));
  return indo.find((v) => v.localService) || indo[0] || null;
}

function pickVoice() {
  if (!ttsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return cachedVoice ?? null;
  cachedVoice = chooseVoice(voices);
  return cachedVoice;
}

/** Menunggu daftar suara dimuat (Chrome/Android memuatnya secara asinkron). */
let voicesSettled = false; // daftar suara cukup ditunggu sekali; perangkat tanpa suara tidak ditunda tiap kalimat

export function voicesReady(timeout = 2000) {
  if (!ttsSupported()) return Promise.resolve(null);
  if (voicesSettled || window.speechSynthesis.getVoices().length) {
    voicesSettled = true;
    return Promise.resolve(pickVoice());
  }
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      voicesSettled = true;
      window.speechSynthesis.removeEventListener?.('voiceschanged', done);
      resolve(pickVoice());
    };
    window.speechSynthesis.addEventListener?.('voiceschanged', done);
    setTimeout(done, timeout);
  });
}

/** Ada suara Indonesia, atau HP Android (mesin TTS bawaan dapat berbahasa Indonesia lewat kode bahasa saja). */
export function hasIndonesianVoice() {
  return !!pickVoice() || (ttsSupported() && isAndroid());
}

/**
 * Membuka kunci suara di dalam ketukan pengguna (wajib di sebagian HP sebelum suara pertama).
 * Panggil langsung dari handler klik tombol Putar/Mulai.
 */
export function unlockSpeech() {
  if (!ttsSupported()) return;
  try {
    window.speechSynthesis.resume();
    if (!unlockSpeech.done) {
      const u = new window.SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.lang = 'id-ID';
      window.speechSynthesis.speak(u);
      unlockSpeech.done = true;
    }
  } catch { /* abaikan */ }
}

/** Perkiraan durasi baca (untuk mode tanpa suara: subtitle tetap tampil). */
export function readingMs(text, rate = 1) {
  const fast = load('kb_tts_fast', false) === true; // hanya untuk uji otomatis
  if (fast) return 120;
  const words = String(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1800, (words * 400) / rate);
}

/** Sinyal untuk sinkron bibir karakter: {type: 'start'|'word'|'end', word}. */
function emit(type, word = '') {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kb:speech', { detail: { type, word } }));
}

/**
 * Mengucapkan teks. Mengembalikan { done: Promise<'end'|'cancel'>, cancel() }.
 * mode 'voice' memakai suara id-ID; mode 'text' (bisu / tidak ada suara Indonesia) memakai timer baca.
 */
export function speak(text, { muted = false, rate = 1, onStart } = {}) {
  let cancelFn = () => {};
  let cancelledEarly = false;
  cancelFn = () => { cancelledEarly = true; };
  const done = new Promise((resolve) => {
    let settled = false;
    const finish = (why) => { if (!settled) { settled = true; emit('end'); resolve(why); } };

    // Mode teks: tanpa bunyi, tetapi sinyal kata dikirim dengan ritme baca agar mulut tetap bergerak.
    const textMode = (ms = readingMs(text, rate)) => {
      voiceStatus.mode = 'text';
      onStart?.('text');
      emit('start');
      const words = String(text).split(/\s+/).filter(Boolean);
      const step = ms / Math.max(1, words.length);
      const timers = words.map((w, i) => setTimeout(() => emit('word', w), i * step));
      const t = setTimeout(() => finish('end'), ms);
      cancelFn = () => { clearTimeout(t); timers.forEach(clearTimeout); finish('cancel'); };
    };

    if (muted || !ttsSupported() || load('kb_tts_fast', false) === true) { textMode(); return; }

    voicesReady().then((voice) => {
      if (cancelledEarly) { finish('cancel'); return; }
      const androidLangOnly = !voice && isAndroid();
      if (!voice && !androidLangOnly) { voiceStatus.voice = null; textMode(); return; }
      const synth = window.speechSynthesis;
      const u = new window.SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || 'id-ID';
      u.rate = rate;
      u.pitch = 1.05;
      voiceStatus.voice = voice ? `${voice.name} (${voice.lang})` : 'bawaan Android (id-ID)';
      let cancelled = false;
      let started = false;
      const startedAt = Date.now();
      u.onstart = () => { started = true; voiceStatus.mode = 'voice'; voiceStatus.error = null; emit('start'); onStart?.('voice'); };
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        const rest = text.slice(e.charIndex);
        emit('word', rest.slice(0, e.charLength || rest.search(/\s|$/)));
      };
      const guard = setTimeout(() => finish('end'), readingMs(text, rate) * 2.5 + 4000);
      u.onend = () => { clearTimeout(guard); finish(cancelled ? 'cancel' : 'end'); };
      u.onerror = (e) => {
        clearTimeout(guard);
        if (cancelled || e?.error === 'interrupted' || e?.error === 'canceled') { finish('cancel'); return; }
        // Suara gagal (mis. "not-allowed", "synthesis-failed"): catat & lanjutkan dalam mode teks.
        voiceStatus.error = e?.error || 'gagal';
        if (!started) textMode(Math.max(800, readingMs(text, rate) - (Date.now() - startedAt)));
        else finish('end');
      };
      cancelFn = () => { cancelled = true; clearTimeout(guard); synth.cancel(); finish('cancel'); };
      // Bug Chrome Android: speak() tepat setelah cancel() kadang diabaikan → beri jeda singkat.
      if (synth.speaking || synth.pending) {
        synth.cancel();
        setTimeout(() => { if (!cancelled) { synth.resume(); synth.speak(u); } }, 80);
      } else {
        synth.resume();
        synth.speak(u);
      }
    });
  });
  return { done, cancel: () => cancelFn() };
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

// ---------------- STT ----------------
function Recognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function sttSupported() {
  return !!Recognition();
}

export const STT_ERRORS = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon di pengaturan browser, atau ketik pertanyaanmu.',
  'service-not-allowed': 'Pengenalan suara tidak diizinkan di perangkat ini. Silakan ketik pertanyaanmu.',
  'no-speech': 'Bu Sari belum mendengar suaramu. Tekan mikrofon dan coba lagi, atau ketik pertanyaanmu.',
  'audio-capture': 'Mikrofon tidak ditemukan. Silakan ketik pertanyaanmu.',
  network: 'Pengenalan suara butuh internet. Periksa koneksi atau ketik pertanyaanmu.',
  aborted: null,
};

/**
 * Mendengarkan satu ucapan dalam Bahasa Indonesia.
 * callbacks: onInterim(text), onFinal(text, confidence), onError(message), onEnd()
 */
export function listen({ onInterim, onFinal, onError, onEnd } = {}) {
  const R = Recognition();
  if (!R) {
    onError?.('Perangkat ini belum mendukung pengenalan suara. Silakan ketik pertanyaanmu.');
    onEnd?.();
    return { stop() {}, abort() {} };
  }
  const rec = new R();
  rec.lang = 'id-ID';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let gotFinal = false;
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      const r = e.results[i];
      if (r.isFinal) {
        gotFinal = true;
        onFinal?.(r[0].transcript.trim(), r[0].confidence ?? 0);
      } else {
        interim += r[0].transcript;
      }
    }
    if (interim) onInterim?.(interim.trim());
  };
  rec.onerror = (e) => {
    const msg = STT_ERRORS[e.error];
    if (msg !== null) onError?.(msg || 'Pengenalan suara gagal. Silakan coba lagi atau ketik pertanyaanmu.');
  };
  rec.onend = () => {
    if (!gotFinal) onInterim?.('');
    onEnd?.();
  };
  try {
    rec.start();
  } catch {
    onError?.('Mikrofon sedang dipakai. Tunggu sebentar lalu coba lagi.');
    onEnd?.();
  }
  return { stop: () => { try { rec.stop(); } catch { /* abaikan */ } }, abort: () => { try { rec.abort(); } catch { /* abaikan */ } } };
}
