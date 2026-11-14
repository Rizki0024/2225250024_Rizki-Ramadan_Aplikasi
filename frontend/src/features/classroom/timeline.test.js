import { describe, expect, it } from 'vitest';
import { buildTimeline, estimateMs, formatTime, positionAt, segmentStarts, timeOf } from './timeline.js';
import { reducer } from './player.js';
import { BADGES, points } from '../progress/progress.js';

const lesson = {
  segments: [
    { script: [{ say: 'satu dua' }, { say: Array(10).fill('kata').join(' ') }] },
    { script: [{ say: 'tiga' }] },
  ],
};

describe('garis waktu video', () => {
  it('durasi minimal 1,8 detik dan bertambah dengan jumlah kata', () => {
    expect(estimateMs('a')).toBe(1800);
    expect(estimateMs(Array(10).fill('k').join(' '))).toBe(4000);
    expect(estimateMs(Array(10).fill('k').join(' '), 2)).toBe(2000);
  });

  it('menyusun potongan waktu berurutan', () => {
    const tl = buildTimeline(lesson);
    expect(tl.entries.map((e) => e.start)).toEqual([0, 1800, 5800]);
    expect(tl.total).toBe(7600);
    expect(timeOf(tl, 1, 0)).toBe(5800);
    expect(segmentStarts(tl)).toEqual([{ seg: 0, start: 0 }, { seg: 1, start: 5800 }]);
  });

  it('mencari posisi dari waktu (seek)', () => {
    const tl = buildTimeline(lesson);
    expect(positionAt(tl, 0)).toEqual({ seg: 0, line: 0 });
    expect(positionAt(tl, 2000)).toEqual({ seg: 0, line: 1 });
    expect(positionAt(tl, 6000)).toEqual({ seg: 1, line: 0 });
    expect(positionAt(tl, 99999)).toEqual({ seg: 1, line: 0 });
    expect(positionAt(tl, -5)).toEqual({ seg: 0, line: 0 });
  });

  it('format waktu', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(332000)).toBe('5:32');
  });

  it('GOTO memindahkan posisi dan mempertahankan status putar', () => {
    const l = { segments: [{ script: [{}, {}] }, { script: [{}] }] };
    const playing = reducer({ seg: 0, line: 0, status: 'playing', resume: null }, { type: 'GOTO', seg: 1, line: 0, lesson: l });
    expect(playing).toMatchObject({ seg: 1, line: 0, status: 'playing' });
    const idle = reducer({ seg: 0, line: 0, status: 'idle', resume: null }, { type: 'GOTO', seg: 0, line: 1, lesson: l });
    expect(idle).toMatchObject({ line: 1, status: 'paused' });
  });
});

describe('poin & lencana', () => {
  it('poin dihitung dari progres', () => {
    expect(points({ read: 4, lessons: 2, totalStars: 5, bestEval: 80 })).toBe(40 + 50 + 50 + 80);
    expect(points({ read: 0, lessons: 0, totalStars: 0, bestEval: null })).toBe(0);
  });
  it('lencana terbuka sesuai syarat', () => {
    const p = { read: 4, lessons: 3, totalStars: 6, bestEval: 79 };
    expect(BADGES.filter((b) => b.earned(p)).map((b) => b.id)).toEqual(['materi', 'bintang']);
  });
});
