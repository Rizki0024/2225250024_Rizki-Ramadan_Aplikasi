// Pembangkit soal latihan dengan angka acak (lihat docs/question-blueprint.md §2).
// Setiap soal: { id, type: 'mc'|'numeric', process, prompt, unit, answer, options?, mistakes?, solution, correctLabel }
import { formatNumber } from '../../utils/number.js';

export const LEVELS = [
  { id: 'prasyarat', title: 'Pemanasan', subtitle: 'Luas persegi & persegi panjang' },
  { id: 'kubus', title: 'Kubus', subtitle: 'Luas permukaan kubus' },
  { id: 'balok', title: 'Balok', subtitle: 'Luas permukaan balok' },
  { id: 'soal-cerita', title: 'Soal Cerita', subtitle: 'Masalah sehari-hari' },
];

export const QUESTIONS_PER_LEVEL = 5;

export function starsFor(correct, total) {
  if (!total) return 0;
  const r = correct / total;
  if (r >= 1) return 3;
  if (r >= 0.8) return 2;
  if (r >= 0.6) return 1;
  return 0;
}

// ---------- utilitas acak ----------
const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const n = (v) => formatNumber(v);
const withUnit = (v, unit) => (unit ? `${n(v)} ${unit}` : n(v));
let counter = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${(counter += 1)}`;

const MSG = {
  oneFace: 'Itu baru luas satu sisi. Jumlahkan luas semua sisinya.',
  fourFaces: 'Kamu baru menghitung 4 sisi. Jangan lupa alas dan tutup.',
  volume: 'Itu rumus volume (isi). Luas permukaan = jumlah luas semua sisi.',
  forgotTwo: 'Hampir! Setiap pasangan sisi ada dua, jadi hasilnya harus dikali 2.',
  sixS: 'Luas satu sisi kubus adalah s × s, bukan s. Coba 6 × s × s.',
  perimeter: 'Itu keliling. Luas dihitung dengan perkalian, bukan penjumlahan sisi.',
  ceil: 'Kaleng tidak bisa dibeli sebagian. Bulatkan ke atas.',
  area: 'Itu luas yang dicat. Pertanyaannya meminta banyak kaleng.',
  withLid: 'Itu luas jika bertutup. Soal ini tanpa tutup, jadi sisi atas tidak dihitung.',
};

/** Pilihan ganda dari nilai angka. distractors: [{ value, message }] */
function numericMC(rng, correct, distractors, unit) {
  const seen = new Set([correct]);
  const wrong = [];
  for (const d of distractors) {
    if (d.value > 0 && !seen.has(d.value) && Number.isInteger(d.value)) {
      seen.add(d.value);
      wrong.push(d);
    }
  }
  let step = 1;
  while (wrong.length < 3) {
    const v = correct + step * (step % 2 ? 6 : -4);
    if (v > 0 && !seen.has(v)) {
      seen.add(v);
      wrong.push({ value: v, message: 'Belum tepat. Periksa lagi perhitunganmu langkah demi langkah.' });
    }
    step += 1;
  }
  const all = shuffle(rng, [{ value: correct, message: null }, ...wrong.slice(0, 3)]);
  const options = all.map((o, i) => ({ id: String.fromCharCode(65 + i), label: withUnit(o.value, unit), feedback: o.message }));
  const answer = options[all.findIndex((o) => o.value === correct)].id;
  return { options, answer };
}

/** Pilihan ganda dari teks. items[0] adalah jawaban benar. */
function textMC(rng, items) {
  const all = shuffle(rng, items.map((it, i) => ({ ...it, correct: i === 0 })));
  const options = all.map((o, i) => ({ id: String.fromCharCode(65 + i), label: o.label, feedback: o.correct ? null : o.message }));
  return { options, answer: options[all.findIndex((o) => o.correct)].id };
}

function numeric({ prefix, process, prompt, unit, answer, mistakes = [], solution }) {
  return { id: uid(prefix), type: 'numeric', process, prompt, unit, answer, mistakes, solution, correctLabel: withUnit(answer, unit) };
}

function mc({ prefix, process, prompt, options, answer, solution }) {
  const label = options.find((o) => o.id === answer).label;
  return { id: uid(prefix), type: 'mc', process, prompt, options, answer, solution, correctLabel: label };
}

// ---------- Level 1: prasyarat ----------
function squareArea(rng, asMC) {
  const s = int(rng, 3, 15);
  const solution = {
    diketahui: [`s = ${s} cm`], ditanyakan: 'Luas persegi', rumus: 'L = s × s',
    substitusi: `L = ${s} × ${s}`, perhitungan: [`${s} × ${s} = ${n(s * s)}`], jawaban: `${n(s * s)} cm²`,
  };
  const prompt = `Sebuah persegi memiliki panjang sisi ${s} cm. Berapa luas persegi tersebut?`;
  const mistakes = [{ value: 4 * s, message: MSG.perimeter }, { value: 2 * s, message: 'Luas persegi = s × s, bukan s + s.' }];
  if (asMC) return mc({ prefix: 'sq', process: 'employ', prompt, solution, ...numericMC(rng, s * s, mistakes, 'cm²') });
  return numeric({ prefix: 'sq', process: 'employ', prompt, unit: 'cm²', answer: s * s, mistakes, solution });
}

function rectArea(rng, story) {
  const p = int(rng, 5, 20);
  const l = int(rng, 2, p - 1);
  const prompt = story
    ? `Selembar karton berbentuk persegi panjang berukuran ${p} cm × ${l} cm. Berapa luas karton tersebut?`
    : `Sebuah persegi panjang memiliki panjang ${p} cm dan lebar ${l} cm. Berapa luasnya?`;
  return numeric({
    prefix: 'rect', process: 'employ', prompt, unit: 'cm²', answer: p * l,
    mistakes: [{ value: 2 * (p + l), message: MSG.perimeter }, { value: p + l, message: MSG.perimeter }],
    solution: {
      diketahui: [`p = ${p} cm`, `l = ${l} cm`], ditanyakan: 'Luas persegi panjang', rumus: 'L = p × l',
      substitusi: `L = ${p} × ${l}`, perhitungan: [`${p} × ${l} = ${n(p * l)}`], jawaban: `${n(p * l)} cm²`,
    },
  });
}

function rectRule(rng) {
  return mc({
    prefix: 'rule', process: 'formulate',
    prompt: 'Rumus luas persegi panjang dengan panjang p dan lebar l adalah…',
    ...textMC(rng, [
      { label: 'p × l' },
      { label: '2 × (p + l)', message: 'Itu rumus keliling persegi panjang.' },
      { label: 'p + l', message: MSG.perimeter },
      { label: 'p × p', message: 'p × p hanya memakai panjang. Lebar juga harus dipakai.' },
    ]),
    solution: {
      diketahui: ['Panjang = p', 'Lebar = l'], ditanyakan: 'Rumus luas persegi panjang', rumus: 'L = p × l',
      substitusi: '—', perhitungan: ['Luas = banyak persegi satuan = panjang × lebar'], jawaban: 'p × l',
    },
  });
}

// ---------- Level 2: kubus ----------
function cubeLP(rng, asMC) {
  const s = int(rng, 2, 12);
  const face = s * s;
  const lp = 6 * face;
  const prompt = `Sebuah kubus memiliki panjang rusuk ${s} cm. Berapa luas permukaannya?`;
  const mistakes = [
    { value: face, message: MSG.oneFace }, { value: 4 * face, message: MSG.fourFaces },
    { value: s * s * s, message: MSG.volume }, { value: 6 * s, message: MSG.sixS },
  ];
  const solution = {
    diketahui: [`s = ${s} cm`], ditanyakan: 'Luas permukaan kubus', rumus: 'L = 6 × s × s',
    substitusi: `L = 6 × ${s} × ${s}`, perhitungan: [`${s} × ${s} = ${n(face)} (luas satu sisi)`, `6 × ${n(face)} = ${n(lp)}`],
    jawaban: `${n(lp)} cm²`,
  };
  if (asMC) return mc({ prefix: 'cube', process: 'employ', prompt, solution, ...numericMC(rng, lp, mistakes, 'cm²') });
  return numeric({ prefix: 'cube', process: 'employ', prompt, unit: 'cm²', answer: lp, mistakes, solution });
}

function cubeRule(rng) {
  return mc({
    prefix: 'rule', process: 'formulate', prompt: 'Rumus luas permukaan kubus dengan panjang rusuk s adalah…',
    ...textMC(rng, [
      { label: '6 × s × s' },
      { label: 's × s × s', message: MSG.volume },
      { label: '4 × s × s', message: MSG.fourFaces },
      { label: '12 × s', message: 'Itu panjang semua rusuk kubus, bukan luas.' },
    ]),
    solution: {
      diketahui: ['Kubus punya 6 sisi persegi yang sama besar', 'Luas satu sisi = s × s'], ditanyakan: 'Rumus luas permukaan',
      rumus: 'L = 6 × s × s', substitusi: '—', perhitungan: ['6 sisi × (s × s) = 6 × s × s'], jawaban: '6 × s × s',
    },
  });
}

function cubeFaceFromLP(rng) {
  const s = int(rng, 2, 12);
  const lp = 6 * s * s;
  return numeric({
    prefix: 'cubeface', process: 'employ', unit: 'cm²', answer: s * s,
    prompt: `Luas permukaan sebuah kubus adalah ${n(lp)} cm². Berapa luas satu sisinya?`,
    mistakes: [{ value: lp / 4, message: 'Kubus punya 6 sisi, jadi bagi dengan 6, bukan 4.' }, { value: s, message: 'Itu panjang rusuknya. Yang ditanya luas satu sisi.' }],
    solution: {
      diketahui: [`L = ${n(lp)} cm²`, 'Kubus punya 6 sisi sama besar'], ditanyakan: 'Luas satu sisi',
      rumus: 'Luas satu sisi = L : 6', substitusi: `Luas satu sisi = ${n(lp)} : 6`,
      perhitungan: [`${n(lp)} : 6 = ${n(s * s)}`], jawaban: `${n(s * s)} cm²`,
    },
  });
}

function cubeSideFromLP(rng) {
  const s = int(rng, 2, 12);
  const lp = 6 * s * s;
  return numeric({
    prefix: 'cubeside', process: 'employ', unit: 'cm', answer: s,
    prompt: `Luas permukaan sebuah kubus adalah ${n(lp)} cm². Berapa panjang rusuknya?`,
    mistakes: [{ value: s * s, message: `Itu luas satu sisi (s × s). Cari bilangan yang jika dikalikan dirinya sendiri hasilnya ${n(s * s)}.` }],
    solution: {
      diketahui: [`L = ${n(lp)} cm²`], ditanyakan: 'Panjang rusuk (s)', rumus: 'L = 6 × s × s',
      substitusi: `${n(lp)} = 6 × s × s`,
      perhitungan: [`s × s = ${n(lp)} : 6 = ${n(s * s)}`, `s = ${s}, karena ${s} × ${s} = ${n(s * s)}`], jawaban: `${s} cm`,
    },
  });
}

// ---------- Level 3: balok ----------
function cuboidDims(rng) {
  const p = int(rng, 4, 12);
  const l = int(rng, 2, p - 1);
  let t = int(rng, 2, 10);
  if (t === p || t === l) t += 1;
  return { p, l, t };
}

function cuboidSolution({ p, l, t }, unit = 'cm') {
  const a = p * l; const b = p * t; const c = l * t;
  const sum = a + b + c;
  return {
    diketahui: [`p = ${p} ${unit}`, `l = ${l} ${unit}`, `t = ${t} ${unit}`], ditanyakan: 'Luas permukaan balok',
    rumus: 'L = 2 × (p × l + p × t + l × t)', substitusi: `L = 2 × (${p} × ${l} + ${p} × ${t} + ${l} × ${t})`,
    perhitungan: [`${p} × ${l} = ${n(a)}`, `${p} × ${t} = ${n(b)}`, `${l} × ${t} = ${n(c)}`,
      `${n(a)} + ${n(b)} + ${n(c)} = ${n(sum)}`, `2 × ${n(sum)} = ${n(2 * sum)}`],
    jawaban: `${n(2 * sum)} ${unit}²`,
  };
}

function cuboidMistakes({ p, l, t }) {
  return [
    { value: p * l + p * t + l * t, message: MSG.forgotTwo },
    { value: p * l * t, message: MSG.volume },
    { value: 2 * (p * l + p * t), message: 'Ada pasangan sisi yang terlewat. Balok punya 3 pasang sisi: p×l, p×t, dan l×t.' },
    { value: p * l, message: MSG.oneFace },
  ];
}

function cuboidLP(rng, asMC) {
  const d = cuboidDims(rng);
  const lp = 2 * (d.p * d.l + d.p * d.t + d.l * d.t);
  const prompt = `Sebuah balok berukuran panjang ${d.p} cm, lebar ${d.l} cm, dan tinggi ${d.t} cm. Berapa luas permukaannya?`;
  const solution = cuboidSolution(d);
  if (asMC) return mc({ prefix: 'cub', process: 'employ', prompt, solution, ...numericMC(rng, lp, cuboidMistakes(d), 'cm²') });
  return numeric({ prefix: 'cub', process: 'employ', prompt, unit: 'cm²', answer: lp, mistakes: cuboidMistakes(d), solution });
}

function cuboidPairs(rng) {
  const variant = pick(rng, [
    { faces: 'alas dan tutup', correct: 'p × l' },
    { faces: 'depan dan belakang', correct: 'p × t' },
    { faces: 'kiri dan kanan', correct: 'l × t' },
  ]);
  const others = ['p × l', 'p × t', 'l × t'].filter((x) => x !== variant.correct);
  return mc({
    prefix: 'pair', process: 'formulate',
    prompt: `Sebuah balok berukuran panjang p, lebar l, dan tinggi t. Luas satu sisi ${variant.faces.split(' dan ')[0]} (pasangan ${variant.faces}) adalah…`,
    ...textMC(rng, [
      { label: variant.correct },
      ...others.map((o) => ({ label: o, message: `Bayangkan sisi ${variant.faces}. Ukuran apa saja yang membentuk sisi itu? Lihat gambar balok di menu Visualisasi.` })),
      { label: 'p × l × t', message: MSG.volume },
    ]),
    solution: {
      diketahui: ['Alas & tutup: p × l', 'Depan & belakang: p × t', 'Kiri & kanan: l × t'],
      ditanyakan: `Luas sisi ${variant.faces}`, rumus: variant.correct, substitusi: '—',
      perhitungan: ['Setiap sisi balok dibentuk oleh dua dari tiga ukuran p, l, t.'], jawaban: variant.correct,
    },
  });
}

function cuboidFromFaces(rng) {
  const { p, l, t } = cuboidDims(rng);
  const a = p * l; const b = p * t; const c = l * t;
  return numeric({
    prefix: 'faces', process: 'employ', unit: 'cm²', answer: 2 * (a + b + c),
    prompt: `Pada sebuah balok, luas alas ${n(a)} cm², luas sisi depan ${n(b)} cm², dan luas sisi kanan ${n(c)} cm². Berapa luas permukaan balok?`,
    mistakes: [{ value: a + b + c, message: MSG.forgotTwo }],
    solution: {
      diketahui: [`Alas = ${n(a)} cm²`, `Depan = ${n(b)} cm²`, `Kanan = ${n(c)} cm²`],
      ditanyakan: 'Luas permukaan', rumus: 'L = 2 × (alas + depan + kanan)', substitusi: `L = 2 × (${n(a)} + ${n(b)} + ${n(c)})`,
      perhitungan: [`${n(a)} + ${n(b)} + ${n(c)} = ${n(a + b + c)}`, `2 × ${n(a + b + c)} = ${n(2 * (a + b + c))}`],
      jawaban: `${n(2 * (a + b + c))} cm²`,
    },
  });
}

function cuboidHeight(rng) {
  const { p, l, t } = cuboidDims(rng);
  const lp = 2 * (p * l + p * t + l * t);
  const half = lp / 2;
  return numeric({
    prefix: 'height', process: 'employ', unit: 'cm', answer: t,
    prompt: `Sebuah balok memiliki panjang ${p} cm, lebar ${l} cm, dan luas permukaan ${n(lp)} cm². Berapa tingginya?`,
    solution: {
      diketahui: [`p = ${p} cm`, `l = ${l} cm`, `L = ${n(lp)} cm²`], ditanyakan: 'Tinggi (t)',
      rumus: 'L = 2 × (p × l + p × t + l × t)', substitusi: `${n(lp)} = 2 × (${p} × ${l} + ${p} × t + ${l} × t)`,
      perhitungan: [`${n(lp)} : 2 = ${n(half)}`, `${n(half)} = ${p * l} + ${p + l} × t`, `${n(half)} − ${p * l} = ${n(half - p * l)}`,
        `t = ${n(half - p * l)} : ${p + l} = ${t}`],
      jawaban: `${t} cm`,
    },
  });
}

// ---------- Level 4: soal cerita ----------
function storyGift(rng) {
  const s = int(rng, 8, 20);
  const lp = 6 * s * s;
  return numeric({
    prefix: 'gift', process: 'formulate', unit: 'cm²', answer: lp,
    prompt: `Dina akan membungkus seluruh permukaan kotak kado berbentuk kubus dengan rusuk ${s} cm. Berapa luas kertas kado minimal yang dibutuhkan?`,
    mistakes: [{ value: 4 * s * s, message: MSG.fourFaces }, { value: s * s * s, message: MSG.volume }, { value: s * s, message: MSG.oneFace }],
    solution: {
      diketahui: ['Kotak kado berbentuk kubus', `s = ${s} cm`, 'Dibungkus seluruhnya → 6 sisi'],
      ditanyakan: 'Luas kertas kado minimal', rumus: 'L = 6 × s × s', substitusi: `L = 6 × ${s} × ${s}`,
      perhitungan: [`${s} × ${s} = ${n(s * s)}`, `6 × ${n(s * s)} = ${n(lp)}`], jawaban: `${n(lp)} cm²`,
      interpretasi: `Dina membutuhkan kertas kado paling sedikit ${n(lp)} cm² (belum termasuk lipatan).`,
    },
  });
}

function storyBox(rng) {
  const item = pick(rng, ['kotak tisu', 'kotak sepatu', 'kotak makanan']);
  const d = cuboidDims(rng);
  const p = d.p * 2; const l = d.l * 2; const t = d.t;
  const lp = 2 * (p * l + p * t + l * t);
  const sol = cuboidSolution({ p, l, t });
  return numeric({
    prefix: 'box', process: 'formulate', unit: 'cm²', answer: lp, mistakes: cuboidMistakes({ p, l, t }),
    prompt: `Sebuah ${item} tertutup berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm dibuat dari karton. Berapa luas karton minimal yang dibutuhkan?`,
    solution: { ...sol, diketahui: [`${item[0].toUpperCase()}${item.slice(1)} berbentuk balok tertutup`, ...sol.diketahui],
      ditanyakan: 'Luas karton = luas permukaan balok',
      interpretasi: `Karton yang dibutuhkan paling sedikit ${n(lp)} cm² agar ${item} tertutup rapat.` },
  });
}

function storyAquarium(rng) {
  const p = pick(rng, [40, 50, 60, 80]);
  const l = pick(rng, [20, 25, 30]);
  const t = pick(rng, [30, 35, 40]);
  const open = p * l + 2 * p * t + 2 * l * t;
  return mc({
    prefix: 'aqua', process: 'interpret',
    prompt: `Akuarium tanpa tutup berbentuk balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Berapa luas kaca yang dibutuhkan?`,
    ...numericMC(rng, open, [
      { value: 2 * (p * l + p * t + l * t), message: MSG.withLid },
      { value: p * l * t, message: MSG.volume },
      { value: 2 * p * t + 2 * l * t, message: 'Alas akuarium juga terbuat dari kaca. Hanya tutupnya yang tidak ada.' },
    ], 'cm²'),
    solution: {
      diketahui: [`p = ${p} cm`, `l = ${l} cm`, `t = ${t} cm`, 'Tanpa tutup → sisi atas tidak dihitung'],
      ditanyakan: 'Luas kaca = alas + 4 sisi tegak', rumus: 'L = (p × l) + 2 × (p × t) + 2 × (l × t)',
      substitusi: `L = (${p} × ${l}) + 2 × (${p} × ${t}) + 2 × (${l} × ${t})`,
      perhitungan: [`${p} × ${l} = ${n(p * l)}`, `2 × ${n(p * t)} = ${n(2 * p * t)}`, `2 × ${n(l * t)} = ${n(2 * l * t)}`,
        `${n(p * l)} + ${n(2 * p * t)} + ${n(2 * l * t)} = ${n(open)}`],
      jawaban: `${n(open)} cm²`,
      interpretasi: `Kaca yang dibutuhkan ${n(open)} cm². Sisi atas tidak dihitung karena akuarium tidak bertutup.`,
    },
  });
}

function storyPaint(rng) {
  let p; let l; let t; let per; let walls;
  do {
    p = int(rng, 3, 6); l = int(rng, 3, p); t = 3; per = pick(rng, [10, 12]);
    walls = 2 * p * t + 2 * l * t;
  } while (walls % per === 0);
  const cans = Math.ceil(walls / per);
  return numeric({
    prefix: 'paint', process: 'interpret', unit: 'kaleng', answer: cans,
    prompt: `Dinding sebuah kamar berukuran panjang ${p} m, lebar ${l} m, dan tinggi ${t} m akan dicat (lantai dan langit-langit tidak dicat). Satu kaleng cat cukup untuk ${per} m². Berapa kaleng cat minimal yang harus dibeli?`,
    mistakes: [{ value: Math.floor(walls / per), message: MSG.ceil }, { value: walls, message: MSG.area },
      { value: Math.ceil(2 * (p * l + p * t + l * t) / per), message: 'Lantai dan langit-langit tidak dicat. Hitung 4 dinding saja.' }],
    solution: {
      diketahui: [`p = ${p} m`, `l = ${l} m`, `t = ${t} m`, 'Hanya 4 dinding', `1 kaleng = ${per} m²`], ditanyakan: 'Banyak kaleng minimal',
      rumus: 'Luas dinding = 2 × (p × t) + 2 × (l × t)', substitusi: `Luas dinding = 2 × (${p} × ${t}) + 2 × (${l} × ${t})`,
      perhitungan: [`2 × ${p * t} = ${2 * p * t}`, `2 × ${l * t} = ${2 * l * t}`, `${2 * p * t} + ${2 * l * t} = ${walls} m²`,
        `${walls} : ${per} = ${n(walls / per)} kaleng`],
      jawaban: `${cans} kaleng`,
      interpretasi: `${cans - 1} kaleng hanya cukup untuk ${(cans - 1) * per} m², jadi harus membeli ${cans} kaleng.`,
    },
  });
}

function storyCompare(rng) {
  let s; let p; let l; let t; let cube; let box;
  do {
    s = int(rng, 6, 12); p = s + int(rng, 1, 4); l = s; t = s - int(rng, 1, 4);
    cube = 6 * s * s; box = 2 * (p * l + p * t + l * t);
  } while (cube === box);
  const diff = Math.abs(cube - box);
  const winner = box < cube ? 'balok' : 'kubus';
  const loser = winner === 'balok' ? 'kubus' : 'balok';
  return mc({
    prefix: 'cmp', process: 'interpret',
    prompt: `Ada dua pilihan kotak tertutup: kubus dengan rusuk ${s} cm atau balok berukuran ${p} cm × ${l} cm × ${t} cm. Kotak mana yang membutuhkan karton lebih sedikit, dan berapa selisihnya?`,
    ...textMC(rng, [
      { label: `Kotak ${winner}, lebih hemat ${n(diff)} cm²` },
      { label: `Kotak ${loser}, lebih hemat ${n(diff)} cm²`, message: 'Bandingkan lagi: kotak dengan luas permukaan lebih kecil membutuhkan karton lebih sedikit.' },
      { label: 'Keduanya membutuhkan karton yang sama', message: 'Hitung luas permukaan keduanya. Hasilnya berbeda.' },
      { label: `Kotak ${winner}, lebih hemat ${n(diff * 2 + 4)} cm²`, message: 'Kotaknya benar, tetapi selisihnya belum tepat. Periksa perhitungan.' },
    ]),
    solution: {
      diketahui: [`Kubus: s = ${s} cm`, `Balok: p = ${p} cm, l = ${l} cm, t = ${t} cm`], ditanyakan: 'Kotak yang lebih hemat dan selisihnya',
      rumus: 'Kubus: 6 × s × s; Balok: 2 × (p × l + p × t + l × t)',
      substitusi: `Kubus: 6 × ${s} × ${s}; Balok: 2 × (${p} × ${l} + ${p} × ${t} + ${l} × ${t})`,
      perhitungan: [`Kubus: 6 × ${s * s} = ${n(cube)} cm²`, `Balok: 2 × ${n(box / 2)} = ${n(box)} cm²`, `Selisih: ${n(Math.max(cube, box))} − ${n(Math.min(cube, box))} = ${n(diff)} cm²`],
      jawaban: `Kotak ${winner}, lebih hemat ${n(diff)} cm²`,
      interpretasi: `Kotak ${winner} memakai karton ${n(diff)} cm² lebih sedikit.`,
    },
  });
}

// ---------- susunan level ----------
const BUILDERS = {
  prasyarat: (rng) => [squareArea(rng, false), rectArea(rng, false), rectRule(rng), squareArea(rng, true), rectArea(rng, true)],
  kubus: (rng) => [cubeLP(rng, true), cubeRule(rng), cubeLP(rng, false), cubeFaceFromLP(rng), cubeSideFromLP(rng)],
  balok: (rng) => [cuboidPairs(rng), cuboidLP(rng, true), cuboidLP(rng, false), cuboidFromFaces(rng), cuboidHeight(rng)],
  'soal-cerita': (rng) => [storyGift(rng), storyBox(rng), storyAquarium(rng), storyPaint(rng), storyCompare(rng)],
};

export function generateLevel(levelId, rng = Math.random) {
  const build = BUILDERS[levelId];
  if (!build) throw new Error(`Level tidak dikenal: ${levelId}`);
  return build(rng);
}

/** Pesan umpan balik untuk jawaban yang salah. */
export function feedbackFor(question, answer, parsedValue) {
  if (question.type === 'mc') {
    return question.options.find((o) => o.id === answer)?.feedback || 'Belum tepat. Lihat pembahasan di bawah.';
  }
  const hit = (question.mistakes || []).find((m) => Math.abs(m.value - parsedValue) < 1e-9);
  return hit ? hit.message : 'Belum tepat. Lihat langkah pembahasan di bawah.';
}
