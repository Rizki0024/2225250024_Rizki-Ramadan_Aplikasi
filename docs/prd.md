# PRD — Belajar Kubus dan Balok

Product Requirements Document · versi 1.0 · Pengembang: Rizki Ramadan (2225250024)

## 1. Ringkasan

Aplikasi web pembelajaran **luas permukaan kubus dan balok** untuk siswa SMP kelas VIII. Aplikasi memuat materi bertahap, visualisasi 3D (dengan jaring-jaring yang dapat dibuka), latihan interaktif berumpan balik, evaluasi 10 soal berbatas waktu, dan riwayat hasil belajar yang tersimpan online. Aplikasi dapat dibuka melalui browser smartphone Android dan laptop.

## 2. Latar belakang

Aplikasi disusun dari wawancara dengan **satu** siswa kelas IX yang pernah mempelajari materi ini di kelas VIII. Temuan berikut digunakan sebagai **petunjuk desain awal, bukan generalisasi** untuk semua siswa.

| Temuan wawancara | Keputusan desain |
|---|---|
| Sulit mengingat rumus, kadang salah memilih rumus | Rumus diturunkan dari luas sisi (bukan dihafal); latihan "pilih rumus yang tepat"; umpan balik mengenali kesalahan memakai rumus volume |
| Salah hitung, kesulitan pembagian & bilangan besar | Langkah perhitungan ditulis satu per satu; soal "mencari rusuk dari luas" melatih pembagian; angka bertahap dari kecil ke besar |
| Soal cerita lebih sulit dipahami | Kerangka *Diketahui – Ditanyakan – Rumus – Substitusi – Perhitungan – Jawaban – Interpretasi*; level latihan khusus soal cerita |
| Gambar membantu, tetapi sulit dihubungkan dengan penjelasan | Warna sisi pada gambar 3D sama dengan warna pada rumus; ilustrasi diletakkan tepat di samping/atas penjelasan |
| Suka penyajian langsung ke inti; materi → contoh → latihan | Alur menu mengikuti urutan itu; teks pendek per kartu |
| Butuh langkah demi langkah | Pembahasan bertahap di contoh, latihan, dan evaluasi |
| Tampilan sederhana, tidak terlalu banyak teks | Satu konsep per layar, warna terbatas, tanpa animasi dekoratif |

## 3. Pengguna

- **Siswa** (pengguna utama): kelas VIII, mengakses dari HP Android (Chrome) atau laptop. Masuk memakai **kode siswa + PIN** yang dibagikan guru.
- **Guru/pengembang** (admin): membuat kode siswa dan melihat rekap nilai melalui **dashboard Supabase**. Tidak ada halaman admin di aplikasi (di luar cakupan MVP).

## 4. Tujuan pembelajaran

Siswa mampu: (1) mengenali unsur kubus dan balok; (2) memahami konsep luas permukaan; (3) menentukan rumus yang sesuai; (4) menghitung luas permukaan kubus dan balok; (5) mengidentifikasi informasi dalam soal cerita; (6) menggunakan matematika untuk masalah kontekstual; (7) menafsirkan hasil sesuai konteks.

Kemampuan sasaran: **Mathematical Literacy** dengan tiga proses — *Formulate*, *Employ*, *Interpret* (lihat [question-blueprint.md](question-blueprint.md)).

## 5. Fitur dan kriteria penerimaan

Prioritas: **P0** = wajib untuk demo, **P1** = fitur tambahan yang disepakati di interview.

| ID | Fitur | Prioritas | Kriteria penerimaan |
|---|---|---|---|
| F1 | Halaman awal | P0 | Nama aplikasi, ilustrasi kubus & balok, tombol **Mulai**, nama pengembang; rapi di lebar 360 px dan 1366 px |
| F2 | Login kode siswa + PIN | P0 | Kode & PIN divalidasi (format dan kecocokan); pesan salah yang jelas; nama samaran tampil setelah masuk; 5 kali gagal → dikunci 5 menit; tidak memakai email |
| F3 | Beranda | P0 | 6 kartu menu: Materi, Visualisasi 3D, Latihan, Evaluasi, Hasil Belajar, Petunjuk |
| F4 | Materi | P0 | 4 materi berurutan: Prasyarat → Kubus → Balok → Soal Cerita; setiap materi berisi pengertian/unsur/penurunan rumus/contoh sesuai [content.md](content.md) |
| F5 | Visualisasi 3D | P0 | Model kubus & balok bisa diputar (sentuh/mouse), label dimensi, warna per pasangan sisi, keterangan luas per warna di dekat model; ukuran dapat diubah |
| F5b | Jaring-jaring terbuka | P1 | Tombol/slider membuka dan menutup jaring-jaring secara animasi |
| F5c | Tampilan 2D | P0 | Otomatis jika WebGL tidak tersedia/galat; dapat dipilih manual |
| F6 | Contoh soal | P0 | Setiap contoh berisi Soal, Diketahui, Ditanyakan, Rumus, Substitusi, Perhitungan, Jawaban+satuan, Interpretasi (soal cerita) |
| F7 | Latihan | P0 | 4 level × 5 soal; pilihan ganda & isian angka; umpan balik langsung; pembahasan; progres; skor |
| F7b | Soal acak & bintang | P1 | Angka soal latihan dibangkitkan acak; urutan soal & opsi evaluasi diacak; bintang 0–3 per level |
| F8 | Menjawab soal | P0 | Input kosong ditolak; format angka salah ditolak dengan pesan; format Indonesia didukung (`4,5`, `1.800`) |
| F9 | Evaluasi | P0 | 10 soal, satu per layar, jawaban benar tidak ditampilkan selama mengerjakan; nilai dihitung server setelah kirim; tampil benar/salah dan pembahasan; tersimpan online |
| F9b | Batas waktu | P1 | 30 menit, hitung mundur, otomatis terkirim saat habis; waktu tidak ter-reset dengan memuat ulang |
| F10 | Hasil belajar | P0 | Kode & nama samaran, riwayat latihan & evaluasi (nilai, benar/salah, tanggal, durasi); pembahasan evaluasi dapat dibuka ulang |
| F11 | Petunjuk | P0 | Cara memakai aplikasi dalam langkah singkat |
| F12 | Penanganan koneksi | P0 | Banner saat offline; pesan jelas saat server tidak merespons/sedang "bangun"; jawaban evaluasi tidak hilang dan bisa dikirim ulang |

## 6. Kebutuhan non-fungsional

- **Responsif**: nyaman di 360–430 px (HP) hingga ≥1280 px (laptop); target sentuh ≥ 44 px.
- **Performa**: halaman awal tidak memuat Three.js (3D dimuat saat dibutuhkan); 3D memakai render on-demand.
- **Keamanan**: tidak ada secret key di frontend; PIN disimpan sebagai hash bcrypt; RLS aktif; kunci jawaban evaluasi tidak dikirim ke browser sebelum dikumpulkan.
- **Bahasa**: seluruh antarmuka berbahasa Indonesia.
- **Aksesibilitas dasar**: kontras cukup, label pada input, tidak bergantung pada warna saja (warna selalu disertai teks).

## 7. Di luar cakupan (MVP)

Halaman admin/guru, PWA/mode offline penuh, materi volume, papan peringkat, multi-kelas dengan hak akses guru.

## 8. Metrik keberhasilan demo

1. Siswa demo dapat login dari HP Android dan laptop.
2. Alur Materi → Contoh → Latihan → Evaluasi → Hasil berjalan tanpa galat.
3. Nilai evaluasi muncul di tabel `quiz_attempts` Supabase.
4. Semua skenario di [testing.md](testing.md) tercatat hasilnya.

## 9. Versi 2 — Rombak desain & guru virtual (14 November 2026)

| ID | Fitur | Kriteria penerimaan |
|---|---|---|
| V1 | Desain v2 | Palet biru + pastel, kartu membulat, tab bar bawah, beranda dasbor (sapaan, hero, progres, aktivitas) |
| V2 | Animasi | Transisi halaman, hover/tap kartu, umpan balik benar/salah, bintang, progres, loader; menghormati "kurangi gerakan" |
| V3 | Karakter guru 2D | 6 ekspresi, 7 pose, ringan (SVG) |
| V4 | Kelas bersegmen | 4 pelajaran sesuai materi; papan tulis bertahap; kontrol mulai/jeda/lanjut/ulang/kembali/tanya |
| V5 | Suara | Guru berbicara (id-ID, cadangan teks); siswa bertanya dengan mikrofon; transkrip dapat dikoreksi; cadangan ketik |
| V6 | Interupsi & kelanjutan | Menyela menghentikan suara dan menyimpan posisi; setelah "sudah paham" lanjut dari baris terakhir; "belum" → penjelasan alternatif |
| V7 | Tutor pedagogis | Jawaban sesuai materi, terpandu, menolak topik lain; Claude opsional |
| V8 | Kompatibilitas | Semua fitur v1 tetap berjalan dan semua tes lama tetap lulus |
