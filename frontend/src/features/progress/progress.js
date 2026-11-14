// Ringkasan progres belajar siswa (per perangkat + riwayat online).
import { load, save } from '../../utils/storage.js';

export const MATERIAL_COUNT = 4;
export const LEVEL_COUNT = 4;
export const LESSON_COUNT = 4;

const readKey = (code) => `kb_read_${code}`;
const lessonDoneKey = (code) => `kb_lesson_done_${code}`;
export const bestStarsKey = (code) => `kb_best_stars_${code}`;

export function markMaterialRead(code, slug) {
  const set = new Set(load(readKey(code), []));
  set.add(slug);
  save(readKey(code), [...set]);
}

export function readMaterials(code) {
  return load(readKey(code), []);
}

export function markLessonDone(code, slug) {
  const set = new Set(load(lessonDoneKey(code), []));
  set.add(slug);
  save(lessonDoneKey(code), [...set]);
}

export function doneLessons(code) {
  return load(lessonDoneKey(code), []);
}

/** Menggabungkan data lokal dengan riwayat attempt dari server (boleh null bila offline). */
export function summarize(code, attempts) {
  const stars = { ...load(bestStarsKey(code), {}) };
  let bestEval = null;
  for (const a of attempts || []) {
    if (a.mode === 'latihan' && a.level) stars[a.level] = Math.max(stars[a.level] || 0, a.stars || 0);
    if (a.mode === 'evaluasi' && a.score !== null && a.score !== undefined) bestEval = Math.max(bestEval ?? 0, a.score);
  }
  const totalStars = Object.values(stars).reduce((s, v) => s + v, 0);
  const read = Math.min(readMaterials(code).length, MATERIAL_COUNT);
  const lessons = Math.min(doneLessons(code).length, LESSON_COUNT);
  const parts = [read / MATERIAL_COUNT, lessons / LESSON_COUNT, totalStars / (LEVEL_COUNT * 3), (bestEval ?? 0) / 100];
  const percent = Math.round((parts.reduce((s, v) => s + v, 0) / parts.length) * 100);
  return { read, lessons, totalStars, maxStars: LEVEL_COUNT * 3, bestEval, percent, stars };
}

/** Poin bintang (gamifikasi ringan) dihitung dari progres; tidak memengaruhi nilai. */
export function points(p) {
  return p.read * 10 + p.lessons * 25 + p.totalStars * 10 + Math.round(p.bestEval ?? 0);
}

export const BADGES = [
  { id: 'materi', name: 'Penjelajah Materi', desc: 'Membuka keempat materi', color: 'violet', earned: (p) => p.read >= 4 },
  { id: 'guru', name: 'Murid Bu Sari', desc: 'Menyelesaikan semua kelas guru', color: 'gold', earned: (p) => p.lessons >= 4 },
  { id: 'bintang', name: 'Bintang Latihan', desc: 'Mengumpulkan 6 bintang latihan', color: 'green', earned: (p) => p.totalStars >= 6 },
  { id: 'evaluasi', name: 'Juara Evaluasi', desc: 'Nilai evaluasi minimal 80', color: 'pink', earned: (p) => (p.bestEval ?? 0) >= 80 },
];

