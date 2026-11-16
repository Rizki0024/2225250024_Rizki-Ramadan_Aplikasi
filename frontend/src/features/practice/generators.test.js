import { describe, expect, it } from 'vitest';
import { feedbackFor, generateLevel, LEVELS, QUESTIONS_PER_LEVEL, starsFor } from './generators.js';
import { formatNumber, parseNumber, validateNumberInput } from '../../utils/number.js';

// Pembangkit acak deterministik agar tes dapat diulang.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('parseNumber (harus sama dengan backend)', () => {
  const cases = [
    ['216', 216], ['4,5', 4.5], ['1.800', 1800], ['12.000', 12000], ['12.000,5', 12000.5], ['4.5', 4.5],
    [' 158 ', 158], ['-3', -3], ['', null], ['   ', null], ['abc', null], ['216 cm', null], ['2,5,1', null],
    ['1.80.0', null], [null, null],
  ];
  it.each(cases)('%s -> %s', (text, expected) => {
    expect(parseNumber(text)).toBe(expected);
  });

  it('memberi pesan validasi', () => {
    expect(validateNumberInput('')).toBe('Jawaban belum diisi.');
    expect(validateNumberInput('abc')).toMatch(/Tulis angka saja/);
    expect(validateNumberInput('4,5')).toBeNull();
  });

  it('memformat angka Indonesia', () => {
    expect(formatNumber(2400)).toBe('2.400');
    expect(formatNumber(4.2)).toBe('4,2');
  });
});

describe('starsFor', () => {
  it('mengikuti aturan bintang', () => {
    expect([0, 1, 2, 3, 4, 5].map((c) => starsFor(c, 5))).toEqual([0, 0, 0, 1, 2, 3]);
  });
});

describe('generateLevel', () => {
  for (const level of LEVELS) {
    it(`level ${level.id}: 500 kali bangkit tanpa galat dan konsisten`, () => {
      for (let seed = 1; seed <= 100; seed += 1) {
        const qs = generateLevel(level.id, seeded(seed * 7919 + level.id.length));
        expect(qs).toHaveLength(QUESTIONS_PER_LEVEL);
        for (const q of qs) {
          expect(q.prompt.length).toBeGreaterThan(10);
          expect(['formulate', 'employ', 'interpret', 'reasoning']).toContain(q.process);
          for (const key of ['diketahui', 'ditanyakan', 'rumus', 'substitusi', 'perhitungan', 'jawaban']) {
            expect(q.solution[key], `${q.id} ${key}`).toBeTruthy();
          }
          expect(q.prompt).not.toMatch(/NaN|undefined/);
          expect(JSON.stringify(q.solution)).not.toMatch(/NaN|undefined/);
          if (q.type === 'numeric') {
            expect(Number.isInteger(q.answer)).toBe(true);
            expect(q.answer).toBeGreaterThan(0);
            // jawaban yang benar bila diketik dengan format Indonesia tetap terbaca benar
            expect(parseNumber(formatNumber(q.answer))).toBe(q.answer);
            expect(q.solution.jawaban).toContain(formatNumber(q.answer));
          } else {
            const labels = q.options.map((o) => o.label);
            expect(new Set(labels).size).toBe(labels.length);
            expect(q.options.length).toBeGreaterThanOrEqual(3);
            expect(q.options.map((o) => o.id)).toContain(q.answer);
            expect(q.options.find((o) => o.id === q.answer).feedback).toBeNull();
          }
        }
      }
    });
  }

  it('kunci soal kubus benar secara matematis', () => {
    const qs = generateLevel('kubus', seeded(42));
    const lpNumeric = qs[2];
    const s = Number(lpNumeric.prompt.match(/rusuk (\d+) cm/)[1]);
    expect(lpNumeric.answer).toBe(6 * s * s);
  });

  it('kunci soal cat dibulatkan ke atas dan umpan balik diagnostik', () => {
    const q = generateLevel('soal-cerita', seeded(9))[3];
    const [, p, l, t, per] = q.prompt.match(/panjang (\d+) m, lebar (\d+) m, dan tinggi (\d+) m.*untuk (\d+) m²/).map(Number);
    const walls = 2 * p * t + 2 * l * t;
    expect(q.answer).toBe(Math.ceil(walls / per));
    expect(feedbackFor(q, String(walls), walls)).toMatch(/banyak kaleng/);
    expect(feedbackFor(q, String(Math.floor(walls / per)), Math.floor(walls / per))).toMatch(/Bulatkan ke atas/);
  });

  it('umpan balik mengenali kesalahan volume dan lupa dikali 2', () => {
    const q = generateLevel('balok', seeded(5))[2];
    const [, p, l, t] = q.prompt.match(/panjang (\d+) cm, lebar (\d+) cm, dan tinggi (\d+) cm/).map(Number);
    expect(q.answer).toBe(2 * (p * l + p * t + l * t));
    expect(feedbackFor(q, '', p * l + p * t + l * t)).toMatch(/dikali 2/);
  });
});

describe('level literasi & bank soal', () => {
  // Ukuran & jawaban soal evaluasi kisi-kisi (ML-1..ML-4) tidak boleh muncul di latihan.
  const FORBIDDEN = [/18 cm × 13 cm × 8 cm/, /20 cm × 15 cm × 10 cm/, /22 cm × 14 cm × 9 cm/, /(?<!\d)40 cm(?!²)/, /(?<!\d)50 cm(?!²)/, /(?<![\d.])1\.264/, /(?<![\d.])3\.950/, /(?<![\d.])6\.200/, /(?<![\d.])5\.200/];

  it('literasi mencakup keempat indikator dan tidak memakai angka soal evaluasi', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const qs = generateLevel('literasi', seeded(seed));
      expect(qs).toHaveLength(QUESTIONS_PER_LEVEL);
      expect(new Set(qs.map((q) => q.process))).toEqual(new Set(['formulate', 'employ', 'interpret', 'reasoning']));
      for (const q of qs) {
        for (const bad of FORBIDDEN) expect(q.prompt).not.toMatch(bad);
        if (q.type === 'mc') {
          const labels = q.options.map((o) => o.label);
          expect(new Set(labels).size).toBe(labels.length);
          expect(q.options.some((o) => o.id === q.answer)).toBe(true);
        }
      }
    }
  });

  it('bank soal memberi 5 soal berbeda dari 10 soal lama dengan kunci yang benar', () => {
    const qs = generateLevel('bank', seeded(7));
    expect(qs).toHaveLength(QUESTIONS_PER_LEVEL);
    expect(new Set(qs.map((q) => q.prompt)).size).toBe(QUESTIONS_PER_LEVEL);
    for (const q of qs) expect(q.correctLabel).toBeTruthy();
    expect(LEVELS.map((l) => l.id)).toEqual(['prasyarat', 'kubus', 'balok', 'soal-cerita', 'literasi', 'bank']);
  });

  it('pemeriksaan pekerjaan teman: jawaban benar = hasil Andi + pasangan sisi yang terlupa', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const q = generateLevel('literasi', seeded(seed)).find((x) => x.id.startsWith('check'));
      const label = q.options.find((o) => o.id === q.answer).label;
      const [, missing, right] = label.match(/kurang ([\d.]+) cm², seharusnya ([\d.]+) cm²/);
      const wrong = Number(q.prompt.match(/= ([\d.]+) cm² dan/)[1].replace('.', ''));
      expect(wrong + Number(missing.replace('.', ''))).toBe(Number(right.replace('.', '')));
    }
  });
});
