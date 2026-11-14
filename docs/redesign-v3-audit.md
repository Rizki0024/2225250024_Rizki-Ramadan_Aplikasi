# Audit & Rencana Redesign v3 (mengikuti gambar referensi)

Tanggal: 14 November 2026 · Branch: `redesign-v3` · Cadangan: tag `v2.1-guru-virtual`, `v1.0-mvp`, branch `mvp-backup`

## 1. Kondisi awal (kode aktual)
- Rute: `/`, `/masuk`, `/beranda`, `/kelas`, `/kelas/:slug`, `/materi`, `/materi/:slug`, `/visualisasi`, `/latihan`, `/latihan/:level`, `/evaluasi`, `/evaluasi/kerjakan`, `/hasil`, `/hasil/:id`, `/petunjuk`.
- Backend & database **tidak perlu diubah** untuk v3; semua panel referensi dapat dibangun dari API yang ada (`attempts`, `materials`, `lessons`, `tutor`).
- Tes awal: pytest 71, vitest 42, E2E 36 + 33 — semuanya lulus.

## 2. Pemetaan panel referensi → implementasi

| Panel referensi | Implementasi v3 | Status kode |
|---|---|---|
| Halaman Awal | `Landing.jsx`: latar gradasi biru, logo bertepi, karakter siswa, kubus, tombol kuning "Mulai Belajar" | ubah |
| Beranda | `Home.jsx`: tombol menu, sapaan + kode/kelas, **poin bintang**, kartu progres + piala, **grid 6 menu** berikon | ubah |
| Materi Pembelajaran | `MaterialDetail`: **slide per konsep** — guru di samping papan, Kembali/Lanjut, tombol bacakan (TTS), opsi "Lihat semua" | ubah |
| Video Pembelajaran | **baru** `/video/:slug`: pemutar bergaya video (adegan kelas, guru, papan), garis waktu, waktu, suara, layar penuh, teks, "Ringkasan Materi", "Ajukan Pertanyaan" | baru (pakai `player.js`) |
| Interaksi dengan Guru Virtual | `AskPanel`: gelembung dengan foto guru/siswa, tombol mikrofon besar + gelombang suara | ubah |
| Visualisasi 3D | latar biru gelap, pil Kubus/Balok, kontrol Putar (rotasi otomatis), Jaring-jaring, Mode 2D, layar penuh | ubah |
| Latihan Soal | kepala "Level · Soal x dari 5" + bintang, kartu soal berilustrasi, opsi 2×2, "Periksa Jawaban" | ubah |
| Evaluasi | pil timer, "Soal x dari 10" + label proses, isian "Masukkan jawaban… cm²", "Selanjutnya" | ubah |
| Hasil Belajar | kartu piala "Hebat, {nama}!", Nilai Akhir, Benar/Salah/Waktu, Lihat Pembahasan / Kembali ke Beranda | ubah |
| Petunjuk Penggunaan | langkah bernomor + guru menunjuk + tombol "Mengerti" | ubah |
| Profil & Progres | **baru** `/profil`: identitas, progres keseluruhan, **lencana prestasi** | baru |
| Menu Utama (mobile) | **baru**: laci menu (drawer) + navigasi bawah Beranda / Profil / Pengaturan; **baru** `/pengaturan` | baru |

## 3. Aset karakter (terpisah & dapat dipakai ulang)
- `features/teacher/TeacherAvatar.jsx`: guru dengan **dua tampilan** — `rambut` (rambut panjang + blazer, sesuai referensi; bawaan) dan `kerudung` (tampilan v2). Dapat dipilih di Pengaturan. Ekspresi, pose, dan API tetap sama.
- `features/student/StudentAvatar.jsx` (baru): karakter siswa untuk halaman awal & menu.
- Ilustrasi tambahan: hadiah, jam pasir, bintang maskot, lencana, stik permainan, grafik.

## 4. Risiko & mitigasi
| Risiko | Mitigasi |
|---|---|
| Selektor E2E lama berubah karena tata letak baru | Hanya selektor yang disesuaikan; semua pemeriksaan (cakupan) dipertahankan dan perubahannya dicatat di `testing.md` |
| Materi menjadi slide sehingga sulit dibaca sekaligus | Ada tombol "Lihat semua" yang menampilkan materi lengkap seperti sebelumnya |
| Latar penuh gradasi menurunkan kontras | Teks di atas gradasi berwarna putih tebal; konten di kartu putih |
| "Video" bukan file video | Dijelaskan di dokumentasi: video adalah pemutaran naskah guru yang terintegrasi dan dapat disela (sesuai master prompt §6) |
