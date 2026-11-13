# Kisi-kisi Soal Mathematical Literacy

Kerangka proses (diadaptasi dari PISA):

| Proses | Yang dilakukan siswa | Indikator pada aplikasi |
|---|---|---|
| **Formulate** | Mengidentifikasi informasi & menyusun model matematika dari situasi | Memilih rumus/model yang tepat; menentukan sisi mana yang dihitung (mis. tanpa tutup) |
| **Employ** | Menerapkan rumus dan prosedur | Menghitung luas permukaan; mencari unsur yang belum diketahui (pembagian) |
| **Interpret** | Menafsirkan hasil dalam konteks nyata | Membulatkan ke atas jumlah kaleng; membandingkan kebutuhan bahan; menyadari bagian yang tidak dihitung |

## 1. Evaluasi (10 soal, 30 menit)

Sumber data: [`backend/app/data/questions.json`](../backend/app/data/questions.json).

| Kode | Proses | Bangun | Tingkat | Tipe | Indikator | Konteks | Kunci |
|---|---|---|---|---|---|---|---|
| EV-01 | Employ | Kubus | 1 | PG | Menghitung LP kubus dari rusuk | — | 216 cm² |
| EV-02 | Employ | Balok | 1 | Isian | Menghitung LP balok dari p, l, t | — | 158 cm² |
| EV-03 | Formulate | Balok | 1 | PG | Memilih rumus untuk luas karton kotak | Kotak pensil | 2 × (p×l + p×t + l×t) |
| EV-04 | Formulate | Kubus | 2 | PG | Menyusun model luas kertas kado | Kado | 6 × 15 × 15 |
| EV-05 | Employ | Kubus | 2 | Isian | Mencari rusuk dari LP (pembagian) | — | 5 cm |
| EV-06 | Formulate | Balok | 2 | PG | Menentukan sisi yang dicat (tanpa alas) | Lemari | 5 sisi |
| EV-07 | Interpret | Balok | 3 | PG | LP tanpa tutup | Akuarium | 9.000 cm² |
| EV-08 | Interpret | Balok | 3 | Isian | Luas dinding → jumlah kaleng (bulat ke atas) | Cat kamar | 5 kaleng |
| EV-09 | Employ | Balok | 3 | Isian | Mencari tinggi dari LP | — | 8 cm |
| EV-10 | Interpret | Campuran | 3 | PG | Membandingkan bahan dua kotak | Karton | Balok, hemat 8 cm² |

Sebaran: **Formulate 3 · Employ 4 · Interpret 3** · Kubus 3 · Balok 6 · Campuran 1 · PG 6 · Isian 4.

Penyajian: soal diurutkan menurut tingkat kesulitan (1 → 3); **di dalam tingkat yang sama urutan diacak**, opsi PG juga diacak. Dengan begitu tiap siswa mendapat urutan berbeda tetapi tetap dari mudah ke sulit (beban kognitif intrinsik bertahap).

Penskoran: tiap soal bernilai sama. `nilai = benar / 10 × 100`. Tidak dijawab = salah.

### Pengecoh (distraktor) dan miskonsepsi yang ditargetkan

| Miskonsepsi | Contoh pengecoh |
|---|---|
| Hanya menghitung satu sisi | EV-01 opsi 36 cm² |
| Memakai rumus volume | EV-03 `p × l × t`, EV-07 72.000 cm² |
| Lupa dikali 2 | EV-03 `p×l + p×t + l×t` |
| Menghitung 4 sisi saja (sisi tegak) | EV-01 144 cm², EV-04 `4 × 15 × 15` |
| Tidak mengurangi sisi tanpa tutup | EV-07 10.800 cm² |
| Tidak membulatkan ke atas | EV-08 (jawaban 4 atau 4,2 dinilai salah) |
| Selisih salah dihitung | EV-10 "hemat 40 cm²" |

## 2. Latihan (4 level × 5 soal, angka acak)

Sumber: [`frontend/src/features/practice/generators.js`](../frontend/src/features/practice/generators.js). Setiap soal dibangkitkan dengan bilangan bulat acak di rentang aman sehingga hasil bagi selalu bulat.

| Level | Proses dominan | Jenis soal (dipilih acak) | Rentang angka |
|---|---|---|---|
| 1. Pemanasan: Luas Persegi & Persegi Panjang | Employ | Luas persegi (isian); luas persegi panjang (isian); pilih rumus luas persegi panjang (PG) | s 3–15; p 5–20, l 2–(p−1) |
| 2. Kubus | Employ, Formulate | LP dari rusuk (isian/PG); rusuk dari LP (isian); pilih rumus LP kubus (PG) | s 2–15 |
| 3. Balok | Employ, Formulate | LP dari p,l,t (isian/PG); pasangan sisi berhadapan (PG); tinggi dari LP (isian) | p 4–15, l 2–(p−1), t 2–12 |
| 4. Soal Cerita | Formulate, Interpret | Kotak karton; kertas kado kubus; akuarium tanpa tutup; cat dinding + kaleng; bandingkan dua kotak | disesuaikan konteks |

### Umpan balik diagnostik

Untuk jawaban salah, aplikasi mencocokkan jawaban dengan pola kesalahan umum lalu menampilkan pesan khusus, misalnya:

| Jawaban siswa sama dengan… | Pesan |
|---|---|
| Luas satu sisi | "Itu baru luas **satu** sisi. Kubus punya 6 sisi." |
| Volume (p×l×t atau s×s×s) | "Kamu menghitung **volume**. Luas permukaan = jumlah luas semua sisi." |
| p×l + p×t + l×t | "Hampir! Setiap pasangan sisi ada **dua**, jadi hasilnya dikali 2." |
| 4 × s × s | "Kamu menghitung 4 sisi. Jangan lupa alas dan tutup." |
| Hasil sebelum dibulatkan | "Kaleng cat tidak bisa dibeli sebagian — bulatkan ke atas." |

Jika tidak cocok dengan pola mana pun: "Belum tepat. Lihat langkah pembahasan di bawah." Pembahasan langkah demi langkah selalu ditampilkan setelah menjawab.

### Aturan bintang

Per level (5 soal): **5 benar → ★★★**, **4 → ★★**, **3 → ★**, ≤ 2 → tanpa bintang. Rumus umum: rasio = benar/total; ≥ 1 → 3, ≥ 0,8 → 2, ≥ 0,6 → 1, selain itu 0. Bintang terbaik per level ditampilkan di menu latihan.

## 3. Aturan input jawaban angka

| Masukan | Hasil |
|---|---|
| (kosong) | Ditolak: "Jawaban belum diisi." |
| `216` | 216 |
| `4,5` | 4,5 (koma = desimal) |
| `1.800` / `12.000` | 1800 / 12000 (titik = pemisah ribuan bila diikuti tepat 3 digit per kelompok) |
| `4.5` | 4,5 (titik dengan bukan 3 digit = desimal) |
| `216 cm`, `abc`, `2,5,1` | Ditolak: "Tulis angka saja, contoh: 216 atau 4,5." |

Aturan ini diterapkan sama di frontend (`utils/number.js`) dan backend (`services/numbers.py`), dan diuji di keduanya.
