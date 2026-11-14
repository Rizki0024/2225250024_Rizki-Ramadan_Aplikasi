import { describe, expect, it } from 'vitest';
import { boardState, classifyUnderstanding, initialState, progressPercent, reducer, restore, teacherLook } from './player.js';

const lesson = {
  segments: [
    { board: [{}, {}, {}], script: [{ show: 0 }, { show: 2, pose: 'point', expression: 'explaining' }], check: { question: 'q' } },
    { board: [{}, {}], script: [{ show: 1 }, { show: null }] },
  ],
};
const run = (state, ...types) => types.reduce((s, t) => reducer(s, { type: t, lesson }), state);

describe('pemutar pelajaran', () => {
  it('memutar baris demi baris, lalu cek pemahaman, lalu segmen berikutnya, lalu selesai', () => {
    let s = run(initialState, 'PLAY');
    expect(s).toMatchObject({ seg: 0, line: 0, status: 'playing' });
    s = run(s, 'LINE_DONE');
    expect(s.line).toBe(1);
    s = run(s, 'LINE_DONE');
    expect(s.status).toBe('check');
    s = run(s, 'CHECK_CONTINUE');
    expect(s).toMatchObject({ seg: 1, line: 0, status: 'playing' });
    s = run(s, 'LINE_DONE', 'LINE_DONE');
    expect(s.status).toBe('finished');
  });

  it('LINE_DONE diabaikan saat dijeda (suara yang terhenti tidak memajukan materi)', () => {
    const s = run(initialState, 'PLAY', 'PAUSE', 'LINE_DONE');
    expect(s).toMatchObject({ line: 0, status: 'paused' });
  });

  it('interupsi menyimpan posisi dan RESUME melanjutkan dari baris yang sama', () => {
    let s = run(initialState, 'PLAY', 'LINE_DONE');
    s = run(s, 'INTERRUPT');
    expect(s.status).toBe('qa');
    expect(s.resume).toEqual({ status: 'playing', seg: 0, line: 1 });
    s = run(s, 'LINE_DONE'); // diabaikan saat tanya jawab
    expect(s.line).toBe(1);
    s = run(s, 'RESUME');
    expect(s).toMatchObject({ seg: 0, line: 1, status: 'playing', resume: null });
  });

  it('interupsi saat cek pemahaman kembali ke cek, bukan melompati', () => {
    let s = run(initialState, 'PLAY', 'LINE_DONE', 'LINE_DONE', 'INTERRUPT', 'RESUME');
    expect(s.status).toBe('check');
    s = run(s, 'CHECK_CONTINUE');
    expect(s.seg).toBe(1);
  });

  it('ulangi, kembali, dan lompat segmen', () => {
    let s = run(initialState, 'PLAY', 'LINE_DONE', 'REPLAY_SEGMENT');
    expect(s).toMatchObject({ seg: 0, line: 0, status: 'playing' });
    s = run(s, 'NEXT_SEGMENT');
    expect(s.seg).toBe(1);
    s = run(s, 'PREV_SEGMENT', 'PREV_SEGMENT');
    expect(s.seg).toBe(0);
  });

  it('memulihkan progres tersimpan secara aman', () => {
    expect(restore({ seg: 1, line: 1 }, lesson)).toMatchObject({ seg: 1, line: 1, status: 'paused' });
    expect(restore({ seg: 9, line: 9 }, lesson)).toMatchObject({ seg: 1, line: 1 });
    expect(restore({ seg: 1, line: 0, finished: true }, lesson).status).toBe('finished');
    expect(restore(null, lesson)).toEqual(initialState);
  });

  it('papan menampilkan butir sesuai baris & menunjuk butir aktif', () => {
    const s = run(initialState, 'PLAY');
    expect(boardState(lesson, s)).toEqual({ revealed: 1, active: 0 });
    const s2 = run(s, 'LINE_DONE');
    expect(boardState(lesson, s2)).toEqual({ revealed: 3, active: 2 });
    const s3 = run(s2, 'LINE_DONE');
    expect(boardState(lesson, s3)).toEqual({ revealed: 3, active: null });
  });

  it('ekspresi guru mengikuti status', () => {
    const s = run(initialState, 'PLAY', 'LINE_DONE');
    expect(teacherLook(lesson, s, { speaking: true })).toEqual({ expression: 'explaining', pose: 'point' });
    const qa = run(s, 'INTERRUPT');
    expect(teacherLook(lesson, qa, { qaPhase: 'listening' })).toEqual({ expression: 'listening', pose: 'listen' });
    expect(teacherLook(lesson, qa, { qaPhase: 'thinking' }).pose).toBe('think');
  });

  it('progres persen', () => {
    expect(progressPercent(lesson, initialState)).toBe(0);
    expect(progressPercent(lesson, { seg: 1, line: 0, status: 'playing' })).toBe(50);
    expect(progressPercent(lesson, { seg: 0, line: 0, status: 'finished' })).toBe(100);
  });
});

describe('klasifikasi jawaban "sudah paham?"', () => {
  it.each([
    ['Sudah, Bu!', 'yes'], ['iya paham', 'yes'], ['oke lanjut', 'yes'], ['Belum, masih bingung', 'no'],
    ['tidak paham', 'no'], ['gak ngerti', 'no'], ['hmm', 'unknown'], ['', 'unknown'],
  ])('%s → %s', (text, expected) => {
    expect(classifyUnderstanding(text)).toBe(expected);
  });
});
