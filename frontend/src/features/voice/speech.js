// Suara guru (Text-to-Speech) dan pengenalan suara siswa (Speech-to-Text) memakai Web Speech API bawaan browser.
// Tidak ada rekaman suara yang disimpan oleh aplikasi. Jika fitur tidak tersedia, aplikasi memakai teks.
import { load } from '../../utils/storage.js';

// ---------------- TTS ----------------
export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

let cachedVoice;
function pickVoice() {
  if (!ttsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return cachedVoice ?? null;
  cachedVoice = voices.find((v) => v.lang === 'id-ID') || voices.find((v) => v.lang?.toLowerCase().startsWith('id')) || null;
  return cachedVoice;
}

/** Menunggu daftar suara dimuat (Chrome memuatnya secara asinkron). */
export function voicesReady(timeout = 1500) {
  if (!ttsSupported()) return Promise.resolve(null);
  if (window.speechSynthesis.getVoices().length) return Promise.resolve(pickVoice());
  return new Promise((resolve) => {
    const done = () => { window.speechSynthesis.removeEventListener?.('voiceschanged', done); resolve(pickVoice()); };
    window.speechSynthesis.addEventListener?.('voiceschanged', done);
    setTimeout(done, timeout);
  });
}

export function hasIndonesianVoice() {
  return !!pickVoice();
}

/** Perkiraan durasi baca (untuk mode tanpa suara: subtitle tetap tampil). */
export function readingMs(text, rate = 1) {
  const fast = load('kb_tts_fast', false) === true; // hanya untuk uji otomatis
  if (fast) return 120;
  const words = String(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1800, (words * 400) / rate);
}

/**
 * Mengucapkan teks. Mengembalikan { done: Promise<'end'|'cancel'>, cancel() }.
 * mode 'voice' memakai suara id-ID; mode 'text' (bisu / tidak ada suara Indonesia) memakai timer baca.
 */
export function speak(text, { muted = false, rate = 1, onStart } = {}) {
  let cancelFn = () => {};
  const done = new Promise((resolve) => {
    let settled = false;
    const finish = (why) => { if (!settled) { settled = true; resolve(why); } };
    const voice = muted ? null : pickVoice();
    if (!voice || load('kb_tts_fast', false) === true) {
      onStart?.('text');
      const t = setTimeout(() => finish('end'), readingMs(text, rate));
      cancelFn = () => { clearTimeout(t); finish('cancel'); };
      return;
    }
    const u = new window.SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = 'id-ID';
    u.rate = rate;
    u.pitch = 1.05;
    let cancelled = false;
    u.onstart = () => onStart?.('voice');
    u.onend = () => finish(cancelled ? 'cancel' : 'end');
    u.onerror = () => finish(cancelled ? 'cancel' : 'end');
    // Pengaman: beberapa perangkat tidak pernah memanggil onend.
    const guard = setTimeout(() => finish('end'), readingMs(text, rate) * 2.5 + 4000);
    u.addEventListener('end', () => clearTimeout(guard));
    cancelFn = () => { cancelled = true; clearTimeout(guard); window.speechSynthesis.cancel(); finish('cancel'); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
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
