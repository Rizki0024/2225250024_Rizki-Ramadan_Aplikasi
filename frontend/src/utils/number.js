// Parser angka format Indonesia. HARUS sama aturannya dengan backend/app/services/numbers.py.
//   "216" -> 216 · "4,5" -> 4.5 · "1.800" -> 1800 · "12.000,5" -> 12000.5 · "4.5" -> 4.5 · lainnya -> null
const THOUSANDS = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/;
const COMMA_DECIMAL = /^-?\d+(,\d+)?$/;
const DOT_DECIMAL = /^-?\d+\.\d+$/;

export function parseNumber(text) {
  if (text === null || text === undefined) return null;
  let s = String(text).trim();
  if (!s) return null;
  if (THOUSANDS.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (COMMA_DECIMAL.test(s)) s = s.replace(',', '.');
  else if (!DOT_DECIMAL.test(s)) return null;
  return Number(s);
}

/** Validasi isian angka. Mengembalikan pesan galat atau null jika valid. */
export function validateNumberInput(text) {
  if (text === null || text === undefined || String(text).trim() === '') return 'Jawaban belum diisi.';
  if (parseNumber(text) === null) return 'Tulis angka saja, contoh: 216 atau 4,5.';
  return null;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value);
}

export function sameNumber(a, b, tolerance = 0) {
  return a !== null && b !== null && Math.abs(a - b) <= tolerance + 1e-9;
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '–';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m ? `${m} menit ${s} detik` : `${s} detik`;
}

export function formatDateTime(iso) {
  if (!iso) return '–';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
