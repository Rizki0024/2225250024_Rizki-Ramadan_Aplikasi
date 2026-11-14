// Logika pemutar pelajaran (reducer murni, tanpa efek samping) — diuji di player.test.js.
//
// status: idle → playing ⇄ paused
//         playing/paused/check → qa (siswa menyela) → kembali ke posisi tersimpan
//         akhir segmen → check (bila ada soal cek pemahaman) → segmen berikutnya → finished

export const initialState = { seg: 0, line: 0, status: 'idle', resume: null };

export function restore(saved, lesson) {
  if (!saved || !lesson) return initialState;
  const seg = Math.min(Math.max(0, saved.seg | 0), lesson.segments.length - 1);
  const line = Math.min(Math.max(0, saved.line | 0), lesson.segments[seg].script.length - 1);
  if (saved.finished) return { seg, line, status: 'finished', resume: null };
  return { seg, line, status: seg === 0 && line === 0 ? 'idle' : 'paused', resume: null };
}

function advanceSegment(state, lesson) {
  if (state.seg + 1 < lesson.segments.length) return { ...state, seg: state.seg + 1, line: 0, status: 'playing' };
  return { ...state, status: 'finished' };
}

export function reducer(state, action) {
  const { lesson } = action;
  const segment = lesson?.segments[state.seg];
  switch (action.type) {
    case '__SET__':
      return action.state;
    case 'PLAY':
      if (state.status === 'finished') return { ...initialState, status: 'playing' };
      if (state.status === 'idle' || state.status === 'paused') return { ...state, status: 'playing' };
      return state;
    case 'PAUSE':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;
    case 'LINE_DONE':
      if (state.status !== 'playing') return state;
      if (state.line + 1 < segment.script.length) return { ...state, line: state.line + 1 };
      if (segment.check) return { ...state, status: 'check' };
      return advanceSegment(state, lesson);
    case 'CHECK_CONTINUE':
      return state.status === 'check' ? advanceSegment(state, lesson) : state;
    case 'REPLAY_SEGMENT':
      return { ...state, line: 0, status: 'playing', resume: null };
    case 'PREV_SEGMENT':
      return { ...state, seg: Math.max(0, state.seg - 1), line: 0, status: 'playing', resume: null };
    case 'NEXT_SEGMENT':
      return advanceSegment({ ...state, resume: null }, lesson);
    case 'GOTO_SEGMENT':
      return { ...state, seg: Math.min(Math.max(0, action.seg), lesson.segments.length - 1), line: 0, status: 'playing', resume: null };
    case 'INTERRUPT':
      if (state.status === 'qa') return state;
      return { ...state, status: 'qa', resume: { status: state.status, seg: state.seg, line: state.line } };
    case 'RESUME': {
      // Lanjut dari posisi terakhir (baris yang disela diucapkan ulang, materi tidak diulang dari awal).
      if (state.status !== 'qa' || !state.resume) return state;
      const prev = state.resume.status;
      const status = prev === 'check' || prev === 'finished' ? prev : 'playing';
      return { seg: state.resume.seg, line: state.resume.line, status, resume: null };
    }
    default:
      return state;
  }
}

/** Berapa butir papan yang sudah ditampilkan, dan butir mana yang sedang ditunjuk guru. */
export function boardState(lesson, state) {
  const segment = lesson.segments[state.seg];
  const showAll = state.status === 'check' || state.status === 'finished';
  const upto = showAll ? segment.script.length - 1 : state.line;
  let maxShown = 0;
  for (let i = 0; i <= upto; i += 1) {
    const s = segment.script[i]?.show;
    if (typeof s === 'number') maxShown = Math.max(maxShown, s);
  }
  const revealed = showAll ? segment.board.length : maxShown + 1;
  const active = state.status === 'playing' || state.status === 'paused' ? segment.script[state.line]?.show ?? null : null;
  return { revealed, active };
}

/** Ekspresi & pose guru sesuai status. */
export function teacherLook(lesson, state, { speaking = false, qaPhase = null } = {}) {
  if (state.status === 'qa') {
    if (qaPhase === 'listening') return { expression: 'listening', pose: 'listen' };
    if (qaPhase === 'thinking') return { expression: 'thinking', pose: 'think' };
    if (qaPhase === 'answering') return { expression: 'explaining', pose: 'talk' };
    return { expression: 'happy', pose: 'idle' };
  }
  if (state.status === 'finished') return { expression: 'proud', pose: 'cheer' };
  if (state.status === 'check') return { expression: 'happy', pose: 'idle' };
  if (state.status === 'idle') return { expression: 'happy', pose: 'wave' };
  const line = lesson.segments[state.seg].script[state.line];
  if (!speaking || state.status === 'paused') return { expression: line?.expression === 'proud' ? 'proud' : 'neutral', pose: 'idle' };
  return { expression: line?.expression || 'explaining', pose: line?.pose || 'talk' };
}

/** Klasifikasi jawaban "sudah paham?" (suara atau ketik). */
export function classifyUnderstanding(text) {
  const t = ` ${String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ')} `;
  const no = [' belum ', ' tidak ', ' nggak ', ' gak ', ' enggak ', ' bingung ', ' masih ', ' kurang ', ' ga '];
  const yes = [' sudah ', ' udah ', ' paham ', ' mengerti ', ' ngerti ', ' jelas ', ' ya ', ' iya ', ' oke ', ' ok ', ' siap ', ' lanjut ', ' bisa '];
  if (no.some((w) => t.includes(w))) return 'no';
  if (yes.some((w) => t.includes(w))) return 'yes';
  return 'unknown';
}

export function progressPercent(lesson, state) {
  if (state.status === 'finished') return 100;
  const total = lesson.segments.reduce((s, x) => s + x.script.length, 0);
  let done = 0;
  for (let i = 0; i < state.seg; i += 1) done += lesson.segments[i].script.length;
  done += state.line;
  return Math.round((done / total) * 100);
}
