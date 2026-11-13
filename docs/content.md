# Kisi-kisi dan Isi Materi

Sumber konten tunggal: [`backend/app/data/materials.json`](../backend/app/data/materials.json). Dokumen ini menjelaskan susunan, alasan pedagogis, dan format datanya.

## 1. Urutan materi (sederhana → kompleks)

| No | Slug | Judul | Tujuan | Prinsip Cognitive Load |
|---|---|---|---|---|
| 1 | `prasyarat` | Luas Persegi & Persegi Panjang | Mengaktifkan prasyarat | Intrinsik: prasyarat sebelum rumus baru |
| 2 | `kubus` | Luas Permukaan Kubus | Unsur kubus, penurunan rumus 6 × s × s | Intrinsik: kubus dulu (semua sisi sama) |
| 3 | `balok` | Luas Permukaan Balok | Unsur balok, p/l/t, pasangan sisi, rumus 2 × (pl + pt + lt) | Intrinsik: balok setelah kubus |
| 4 | `soal-cerita` | Kubus vs Balok & Soal Cerita | Perbandingan, langkah Formulate–Employ–Interpret | Germane: menghubungkan ke kehidupan nyata |

## 2. Rincian isi

### 2.1 Prasyarat
- Rumus luas persegi `L = s × s`, contoh s = 6 cm → 36 cm².
- Rumus luas persegi panjang `L = p × l`, contoh 8 cm × 5 cm → 40 cm².
- Catatan satuan: luas selalu berpangkat dua (cm², m²).

### 2.2 Kubus
1. **Pengertian**: bangun ruang yang dibatasi 6 sisi berbentuk persegi yang sama besar.
2. **Unsur**: 6 sisi, 12 rusuk sama panjang (s), 8 titik sudut — disertai model 3D berlabel *s*.
3. **Konsep luas sisi**: luas permukaan = jumlah luas semua sisi; satu sisi = s × s.
4. **Penurunan rumus** (3 langkah) + jaring-jaring kubus: `L = 6 × s × s`.
5. **Contoh penerapan**:
   - Kotak kado rusuk 10 cm → kertas kado minimal 600 cm².
   - Kebalikan: LP 294 cm² → s × s = 294 : 6 = 49 → s = 7 cm (melatih pembagian).

### 2.3 Balok
1. **Pengertian**: bangun ruang yang dibatasi 6 sisi berbentuk persegi panjang; sisi yang berhadapan sama besar.
2. **Unsur**: panjang (p), lebar (l), tinggi (t); 6 sisi, 12 rusuk, 8 titik sudut.
3. **Pasangan sisi berhadapan** (warna sama pada 3D):
   - Biru — alas & tutup: p × l
   - Merah muda — depan & belakang: p × t
   - Hijau — kiri & kanan: l × t
4. **Penurunan rumus**: `L = 2 × (p × l) + 2 × (p × t) + 2 × (l × t) = 2 × (p×l + p×t + l×t)`.
5. **Contoh penerapan**: kotak sepatu 30 × 20 × 12 cm → 2 × (600 + 360 + 240) = 2 × 1.200 = 2.400 cm².

### 2.4 Kubus vs Balok & Soal Cerita
- Tabel perbandingan (bentuk sisi, rumus).
- Tiga langkah soal cerita:
  1. **Pahami (Formulate)** — tulis diketahui, ditanyakan; tentukan sisi mana yang dihitung.
  2. **Hitung (Employ)** — substitusi lalu hitung bertahap.
  3. **Tafsirkan (Interpret)** — cek satuan, sisi yang tidak dihitung, pembulatan.
- Contoh: kolam ikan tanpa tutup 2 m × 1 m × 1 m dikeramik bagian dalam → 2 + 4 + 2 = 8 m².
- Tips: "tanpa tutup" → kurangi satu sisi; jumlah barang (kaleng, lembar) → bulatkan ke atas.

## 3. Format contoh soal (wajib lengkap)

| Bagian | Contoh (kotak kado) |
|---|---|
| Soal | Kotak kado berbentuk kubus dengan rusuk 10 cm akan dibungkus kertas kado. Berapa luas kertas kado minimal? |
| Diketahui | s = 10 cm |
| Ditanyakan | Luas kertas kado minimal = luas permukaan kubus |
| Rumus | L = 6 × s × s |
| Substitusi | L = 6 × 10 × 10 |
| Perhitungan | 10 × 10 = 100 → 6 × 100 = 600 |
| Jawaban | 600 cm² |
| Interpretasi | Kertas kado yang dibutuhkan paling sedikit 600 cm² (belum termasuk lipatan). |

## 4. Format blok

`content` adalah daftar blok. Frontend merender tiap jenis blok dengan komponen tersendiri.

| `type` | Field | Tampilan |
|---|---|---|
| `heading` | `text` | Subjudul |
| `text` | `text` | Paragraf singkat (≤ 2 kalimat) |
| `list` | `items[]` | Daftar poin |
| `formula` | `label`, `expr`, `note?` | Kotak rumus menonjol |
| `figure` | `figure` (`square`, `rectangle`, `cube`, `cuboid`, `cube-net`, `cuboid-net`), `dims?`, `caption` | Gambar 3D/2D di samping teks |
| `steps` | `title`, `items[]` | Langkah bernomor (penurunan rumus) |
| `pairs` | `items[] {color,name,expr}` | Pasangan sisi berwarna |
| `compare` | `rows[] [aspek, kubus, balok]` | Tabel perbandingan |
| `example` | `title`, `soal`, `diketahui[]`, `ditanyakan`, `rumus`, `substitusi`, `perhitungan[]`, `jawaban`, `interpretasi?` | Kartu contoh soal; pembahasan dibuka bertahap |
| `tip` | `text` | Kotak catatan pastel |

## 5. Panduan menulis konten

- Satu ide per blok, kalimat ≤ 20 kata.
- Angka ≥ 1.000 ditulis dengan titik ribuan.
- Setiap rumus selalu didahului alasan (dari luas sisi), bukan sekadar dihafal.
- Warna sisi konsisten di seluruh aplikasi: biru = p×l, merah muda = p×t, hijau = l×t.
- Gambar selalu ditempatkan di dekat teks yang membahasnya.
