# Kisi-kisi Soal Mathematical Literacy

Sumber kisi-kisi: dokumen pengembang **"Kisi-kisi Soal Mathematical Literacy — Luas Permukaan Kubus dan Balok" (Tabel 2)**.
Kerangka: empat indikator literasi matematika.

| Indikator | Yang dilakukan siswa |
|---|---|
| **Reasoning** | Mengidentifikasi hubungan matematis, membandingkan alternatif, memberi alasan, dan menentukan keputusan yang dapat dipertanggungjawabkan |
| **Formulate** | Mengidentifikasi informasi relevan, menentukan besaran, dan menerjemahkan situasi nyata menjadi model matematika |
| **Employ** | Memilih serta menggunakan konsep, operasi, prosedur, dan strategi matematika untuk memperoleh solusi |
| **Interpret** | Menafsirkan hasil dalam konteks, menilai kewajaran hasil, dan mengambil keputusan berdasarkan hasil perhitungan |

## 1. Evaluasi (4 soal cerita bertahap, 30 menit, skor maksimum 24)

Sumber data: [`backend/app/data/questions.json`](../backend/app/data/questions.json) (kode `ML-1`..`ML-4`, `type: "staged"`).
Teks soal dan pembagian skor **persis** mengikuti Tabel 2.

| Kode | Indikator | Judul | Tahap & skor | Maks |
|---|---|---|---|---|
| ML-1 | Reasoning | Memilih Kotak Pengiriman | 1 + 2 + 1 + 1 + 1 | 6 |
| ML-2 | Formulate | Membungkus Kotak Hadiah | 1 + 1 + 1 + 1 + 1 + 1 | 6 |
| ML-3 | Employ | Mengecat Kotak Penyimpanan | 1 + 2 + 2 + 1 | 6 |
| ML-4 | Interpret | Memeriksa Perhitungan Kertas Pelapis | 1 + 1 + 1 + 1 + 1 + 1 | 6 |
| | | | **Total** | **24** |

**Bentuk jawaban per tahap.** Setiap tahap kisi-kisi menjadi isian di layar: angka (mis. luas tiap kotak, p×l, hasil akhir) atau pilihan (tujuan, rumus/model, urutan, keputusan, alasan, kesimpulan). Siswa melihat judul tahap dan skornya saat mengerjakan, tetapi **tidak** melihat kunci, aturan *carry-forward*, atau pembahasan sebelum mengumpulkan (diuji di `test_start_hides_answer_keys_and_orders_by_difficulty`).

**Pedoman penskoran (dari kisi-kisi) dan penerapannya** — `backend/app/services/staged.py`:
1. *Skor penuh bila tahapan benar* → tahap mendapat skornya bila semua isian tahap itu benar.
2. *Skor parsial tetap diberikan bila tahapan benar tetapi salah hitung pada tahap berikutnya* → **carry-forward**: isian yang bergantung pada hasil sebelumnya dinilai benar bila konsisten dengan angka siswa sendiri. Contoh: ML-2 tahap 6 benar bila sama dengan 2 × (jumlah hasil tahap 5 milik siswa); ML-1 tahap 3–4 benar bila urutan/pilihan cocok dengan luas yang dihitung siswa.
3. *Penilaian berdasarkan proses tiap tahap* → tahap bernilai 2 memberi skor parsial: ML-1 tahap 2 (3 benar = 2, 1–2 benar = 1), ML-3 tahap 2 (3 benar = 2, 1–2 benar = 1), ML-3 tahap 3 (2 benar = 2, 1 benar = 1).
4. *Skor maksimal 24, 6 per indikator* → `nilai = skor diperoleh / 24 × 100`. Isian kosong = 0.

Urutan soal: tingkat kesulitan 1 → 3 (ML-2/ML-3 acak, lalu ML-4, lalu ML-1). Soal lama EV-01..EV-10 **dinonaktifkan, tidak dihapus**, agar riwayat nilai lama tetap dapat dibuka; isinya kini menjadi level latihan **Bank Soal**.

Kebocoran dicegah oleh tes: ukuran (p, l, t berurutan) dan jawaban akhir ML-1..ML-4 tidak boleh muncul di naskah kelas, bank tanya-jawab, materi, maupun latihan (`test_content_does_not_leak_staged_evaluation`, `generators.test.js`).

## 2. Latihan (6 level × 5 soal)

Level 1–4 seperti di bawah. **Level 5 Literasi**: model/rumus untuk situasi (Formulate), menghitung luas balok (Employ), memeriksa pekerjaan teman (Interpret), membandingkan dua dan tiga kotak dengan alasan (Reasoning); ukuran ≤ 12 agar berbeda dari soal evaluasi. **Level 6 Bank Soal**: 5 soal acak dari 10 soal evaluasi versi lama.


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
