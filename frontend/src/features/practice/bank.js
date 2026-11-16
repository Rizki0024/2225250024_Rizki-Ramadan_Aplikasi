// Bank soal latihan: 10 soal evaluasi versi lama (EV-01..EV-10), kini dipakai sebagai latihan.
// Dibuat dari backend/app/data/questions.json (soal nonaktif). Kunci boleh ada di browser karena ini latihan, bukan evaluasi.
export const BANK = [
 {
  "code": "EV-01",
  "type": "mc",
  "process": "employ",
  "prompt": "Sebuah kubus memiliki panjang rusuk 6 cm. Berapa luas permukaan kubus tersebut?",
  "unit": null,
  "solution": {
   "diketahui": [
    "s = 6 cm"
   ],
   "ditanyakan": "Luas permukaan kubus",
   "rumus": "L = 6 × s × s",
   "substitusi": "L = 6 × 6 × 6",
   "perhitungan": [
    "6 × 6 = 36 (luas satu sisi)",
    "6 × 36 = 216"
   ],
   "jawaban": "216 cm²",
   "interpretasi": null
  },
  "options": [
   {
    "id": "A",
    "label": "36 cm²"
   },
   {
    "id": "B",
    "label": "216 cm²"
   },
   {
    "id": "C",
    "label": "144 cm²"
   },
   {
    "id": "D",
    "label": "72 cm²"
   }
  ],
  "answer": "B"
 },
 {
  "code": "EV-02",
  "type": "numeric",
  "process": "employ",
  "prompt": "Sebuah balok berukuran panjang 8 cm, lebar 5 cm, dan tinggi 3 cm. Hitunglah luas permukaan balok tersebut.",
  "unit": "cm²",
  "solution": {
   "diketahui": [
    "p = 8 cm",
    "l = 5 cm",
    "t = 3 cm"
   ],
   "ditanyakan": "Luas permukaan balok",
   "rumus": "L = 2 × (p × l + p × t + l × t)",
   "substitusi": "L = 2 × (8 × 5 + 8 × 3 + 5 × 3)",
   "perhitungan": [
    "8 × 5 = 40",
    "8 × 3 = 24",
    "5 × 3 = 15",
    "40 + 24 + 15 = 79",
    "2 × 79 = 158"
   ],
   "jawaban": "158 cm²",
   "interpretasi": null
  },
  "answer": 158
 },
 {
  "code": "EV-03",
  "type": "mc",
  "process": "formulate",
  "prompt": "Rina akan membuat kotak pensil tertutup berbentuk balok dari karton. Panjang kotak p, lebarnya l, dan tingginya t. Rumus mana yang tepat untuk menghitung luas karton yang dibutuhkan?",
  "unit": null,
  "solution": {
   "diketahui": [
    "Kotak tertutup berbentuk balok",
    "Ukuran p, l, dan t"
   ],
   "ditanyakan": "Rumus luas karton = luas permukaan balok",
   "rumus": "L = 2 × (p × l + p × t + l × t)",
   "substitusi": "—",
   "perhitungan": [
    "Kotak tertutup punya 6 sisi = 3 pasang sisi.",
    "Tiap pasang dikali 2.",
    "p × l × t adalah rumus volume, bukan luas."
   ],
   "jawaban": "2 × (p × l + p × t + l × t)",
   "interpretasi": "Karton menutupi seluruh permukaan kotak, jadi dipakai rumus luas permukaan."
  },
  "options": [
   {
    "id": "A",
    "label": "p × l × t"
   },
   {
    "id": "B",
    "label": "2 × (p × l + p × t + l × t)"
   },
   {
    "id": "C",
    "label": "p × l + p × t + l × t"
   },
   {
    "id": "D",
    "label": "6 × p × l"
   }
  ],
  "answer": "B"
 },
 {
  "code": "EV-04",
  "type": "mc",
  "process": "formulate",
  "prompt": "Sebuah kotak hadiah berbentuk kubus dengan panjang rusuk 15 cm akan dibungkus seluruhnya dengan kertas kado. Model matematika yang tepat untuk menghitung luas kertas kado minimal adalah…",
  "unit": null,
  "solution": {
   "diketahui": [
    "Kotak berbentuk kubus",
    "s = 15 cm",
    "Dibungkus seluruhnya → 6 sisi"
   ],
   "ditanyakan": "Model luas kertas kado minimal",
   "rumus": "L = 6 × s × s",
   "substitusi": "L = 6 × 15 × 15",
   "perhitungan": [
    "15 × 15 × 15 adalah volume.",
    "4 × 15 × 15 hanya 4 sisi (lupa alas dan tutup).",
    "12 × 15 adalah panjang semua rusuk."
   ],
   "jawaban": "6 × 15 × 15",
   "interpretasi": "Kata \"seluruhnya\" berarti keenam sisi kubus ikut dibungkus."
  },
  "options": [
   {
    "id": "A",
    "label": "6 × 15 × 15"
   },
   {
    "id": "B",
    "label": "15 × 15 × 15"
   },
   {
    "id": "C",
    "label": "4 × 15 × 15"
   },
   {
    "id": "D",
    "label": "12 × 15"
   }
  ],
  "answer": "A"
 },
 {
  "code": "EV-05",
  "type": "numeric",
  "process": "employ",
  "prompt": "Luas permukaan sebuah kubus adalah 150 cm². Berapa panjang rusuk kubus tersebut?",
  "unit": "cm",
  "solution": {
   "diketahui": [
    "L = 150 cm²"
   ],
   "ditanyakan": "Panjang rusuk (s)",
   "rumus": "L = 6 × s × s",
   "substitusi": "150 = 6 × s × s",
   "perhitungan": [
    "s × s = 150 : 6",
    "150 : 6 = 25",
    "s × s = 25, maka s = 5 (karena 5 × 5 = 25)"
   ],
   "jawaban": "5 cm",
   "interpretasi": null
  },
  "answer": 5
 },
 {
  "code": "EV-06",
  "type": "mc",
  "process": "formulate",
  "prompt": "Pak Ahmad ingin mengecat seluruh permukaan luar lemari berbentuk balok, kecuali bagian alas yang menempel di lantai. Sisi mana saja yang perlu dihitung luasnya?",
  "unit": null,
  "solution": {
   "diketahui": [
    "Lemari berbentuk balok",
    "Alas menempel di lantai → tidak dicat"
   ],
   "ditanyakan": "Sisi yang dihitung",
   "rumus": "L = (p × l) + 2 × (p × t) + 2 × (l × t)",
   "substitusi": "—",
   "perhitungan": [
    "Balok punya 6 sisi.",
    "Alas tidak dicat, jadi 6 − 1 = 5 sisi.",
    "Tutup tetap dicat karena bagian luar."
   ],
   "jawaban": "Tutup, depan, belakang, kiri, dan kanan (5 sisi)",
   "interpretasi": "Hanya bagian yang terlihat dan bisa dicat yang dihitung."
  },
  "options": [
   {
    "id": "A",
    "label": "Keenam sisi lemari"
   },
   {
    "id": "B",
    "label": "Tutup, depan, belakang, kiri, dan kanan (5 sisi)"
   },
   {
    "id": "C",
    "label": "Depan, belakang, kiri, dan kanan saja (4 sisi)"
   },
   {
    "id": "D",
    "label": "Alas dan tutup saja"
   }
  ],
  "answer": "B"
 },
 {
  "code": "EV-07",
  "type": "mc",
  "process": "interpret",
  "prompt": "Sebuah akuarium berbentuk balok tanpa tutup berukuran panjang 60 cm, lebar 30 cm, dan tinggi 40 cm. Berapa luas kaca yang dibutuhkan untuk membuat akuarium tersebut?",
  "unit": null,
  "solution": {
   "diketahui": [
    "p = 60 cm",
    "l = 30 cm",
    "t = 40 cm",
    "Tanpa tutup → sisi atas tidak dihitung"
   ],
   "ditanyakan": "Luas kaca = alas + 4 sisi tegak",
   "rumus": "L = (p × l) + 2 × (p × t) + 2 × (l × t)",
   "substitusi": "L = (60 × 30) + 2 × (60 × 40) + 2 × (30 × 40)",
   "perhitungan": [
    "60 × 30 = 1.800",
    "2 × (60 × 40) = 2 × 2.400 = 4.800",
    "2 × (30 × 40) = 2 × 1.200 = 2.400",
    "1.800 + 4.800 + 2.400 = 9.000"
   ],
   "jawaban": "9.000 cm²",
   "interpretasi": "10.800 cm² adalah luas jika akuarium bertutup. Karena tanpa tutup, kaca yang dibutuhkan 9.000 cm²."
  },
  "options": [
   {
    "id": "A",
    "label": "9.000 cm²"
   },
   {
    "id": "B",
    "label": "10.800 cm²"
   },
   {
    "id": "C",
    "label": "72.000 cm²"
   },
   {
    "id": "D",
    "label": "7.200 cm²"
   }
  ],
  "answer": "A"
 },
 {
  "code": "EV-08",
  "type": "numeric",
  "process": "interpret",
  "prompt": "Dinding sebuah kamar berbentuk balok dengan panjang 4 m, lebar 3 m, dan tinggi 3 m akan dicat (lantai dan langit-langit tidak dicat). Satu kaleng cat cukup untuk 10 m². Berapa kaleng cat minimal yang harus dibeli?",
  "unit": "kaleng",
  "solution": {
   "diketahui": [
    "p = 4 m",
    "l = 3 m",
    "t = 3 m",
    "Hanya 4 dinding",
    "1 kaleng = 10 m²"
   ],
   "ditanyakan": "Banyak kaleng cat minimal",
   "rumus": "Luas dinding = 2 × (p × t) + 2 × (l × t)",
   "substitusi": "Luas dinding = 2 × (4 × 3) + 2 × (3 × 3)",
   "perhitungan": [
    "2 × 12 = 24",
    "2 × 9 = 18",
    "24 + 18 = 42 m²",
    "42 : 10 = 4,2 kaleng"
   ],
   "jawaban": "5 kaleng",
   "interpretasi": "Cat tidak dijual per 0,2 kaleng. 4 kaleng hanya cukup untuk 40 m², jadi harus membeli 5 kaleng."
  },
  "answer": 5
 },
 {
  "code": "EV-09",
  "type": "numeric",
  "process": "employ",
  "prompt": "Sebuah balok memiliki panjang 10 cm, lebar 6 cm, dan luas permukaan 376 cm². Berapa tinggi balok tersebut?",
  "unit": "cm",
  "solution": {
   "diketahui": [
    "p = 10 cm",
    "l = 6 cm",
    "L = 376 cm²"
   ],
   "ditanyakan": "Tinggi balok (t)",
   "rumus": "L = 2 × (p × l + p × t + l × t)",
   "substitusi": "376 = 2 × (10 × 6 + 10 × t + 6 × t)",
   "perhitungan": [
    "376 : 2 = 188",
    "188 = 60 + 10 × t + 6 × t",
    "188 − 60 = 128",
    "128 = 16 × t",
    "t = 128 : 16 = 8"
   ],
   "jawaban": "8 cm",
   "interpretasi": null
  },
  "answer": 8
 },
 {
  "code": "EV-10",
  "type": "mc",
  "process": "interpret",
  "prompt": "Toko kue menyediakan dua pilihan kotak tertutup: kotak kubus dengan rusuk 10 cm atau kotak balok berukuran 12 cm × 10 cm × 8 cm. Kotak mana yang membutuhkan karton lebih sedikit, dan berapa selisihnya?",
  "unit": null,
  "solution": {
   "diketahui": [
    "Kubus: s = 10 cm",
    "Balok: p = 12 cm, l = 10 cm, t = 8 cm"
   ],
   "ditanyakan": "Kotak yang lebih hemat karton dan selisihnya",
   "rumus": "Kubus: 6 × s × s; Balok: 2 × (p × l + p × t + l × t)",
   "substitusi": "Kubus: 6 × 10 × 10; Balok: 2 × (12 × 10 + 12 × 8 + 10 × 8)",
   "perhitungan": [
    "Kubus: 6 × 100 = 600 cm²",
    "Balok: 120 + 96 + 80 = 296",
    "Balok: 2 × 296 = 592 cm²",
    "Selisih: 600 − 592 = 8 cm²"
   ],
   "jawaban": "Kotak balok, lebih hemat 8 cm²",
   "interpretasi": "Kotak balok memakai karton 8 cm² lebih sedikit sehingga sedikit lebih hemat bahan."
  },
  "options": [
   {
    "id": "A",
    "label": "Kotak kubus, lebih hemat 8 cm²"
   },
   {
    "id": "B",
    "label": "Kotak balok, lebih hemat 8 cm²"
   },
   {
    "id": "C",
    "label": "Keduanya membutuhkan karton yang sama"
   },
   {
    "id": "D",
    "label": "Kotak balok, lebih hemat 40 cm²"
   }
  ],
  "answer": "B"
 }
];
