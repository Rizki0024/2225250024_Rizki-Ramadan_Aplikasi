# Rencana & Laporan Pengujian

Aturan: sebuah fitur hanya ditandai **Lulus** jika benar-benar sudah diuji. Kolom *Hasil* diisi saat pengujian dilakukan.

## 1. Uji otomatis

| Lapisan | Alat | Perintah | Cakupan |
|---|---|---|---|
| Backend | pytest + FastAPI TestClient (mode lokal) | `cd backend && python -m pytest` | Login (benar/salah/format/kunci), token, materi, evaluasi (start/resume/submit/penilaian/kepemilikan), latihan (validasi), riwayat, parser angka, integritas bank soal |
| Frontend | Vitest | `cd frontend && npm test` | Parser angka Indonesia, generator soal latihan (jawaban konsisten, bilangan bulat), aturan bintang |
| Build | Vite | `cd frontend && npm run build` | Kode frontend dapat dikompilasi untuk produksi |

## 2. Uji manual (checklist)

| No | Skenario | Langkah | Hasil diharapkan | Hasil |
|---|---|---|---|---|
| M1 | Login benar | KB-001 / 1234 | Masuk, "Halo, Elang" | ✅ Lulus (E2E) |
| M2 | Login salah | KB-001 / 0000 | "Kode siswa atau PIN salah." | ✅ Lulus (E2E) |
| M3 | Input kosong / format | kosongkan PIN; PIN "12a" | Pesan validasi tanpa memanggil server | ✅ Lulus (E2E) |
| M4 | Kunci percobaan | 6× PIN salah | Pesan tunggu 5 menit | ✅ Lulus (pytest; belum diuji lewat UI) |
| M5 | Navigasi | Buka semua 6 menu, tombol ←, Keluar | Tidak ada halaman kosong/galat; rute terlindungi mengarah ke Login | ✅ Lulus (E2E) |
| M6 | Materi kubus & balok | Baca 4 materi, buka pembahasan contoh | Semua bagian contoh tampil (Diketahui…Interpretasi) | ✅ Lulus (E2E) |
| M7 | Visualisasi 3D | Putar dengan jari/mouse, ubah ukuran, buka jaring | Label & luas berubah sesuai; animasi halus | ✅ Lulus (E2E, Chromium + SwiftShader) |
| M8 | Fallback 2D | Pilih "Tampilan 2D" | Gambar SVG + jaring-jaring tampil | ✅ Lulus (E2E) |
| M9 | Input jawaban | kosong, "abc", "4,5", "1.800" | Pesan sesuai aturan; nilai terbaca benar | ✅ Lulus (E2E + unit test) |
| M10 | Latihan | Selesaikan 1 level | Umpan balik langsung, pembahasan, progres, skor, bintang | ✅ Lulus (E2E) |
| M11 | Evaluasi | Kerjakan 10 soal | Tidak ada kunci selama mengerjakan; nilai, benar/salah, pembahasan setelah kirim | ✅ Lulus (E2E) |
| M12 | Timer | Muat ulang halaman saat evaluasi | Waktu berlanjut, jawaban tidak hilang | ✅ Lulus (E2E, setelah perbaikan bug) |
| M13 | Simpan online | Cek tabel `quiz_attempts` di Supabase | Baris baru dengan nilai yang sama | ✅ Lulus (Supabase, 13 Nov 2026) |
| M14 | Riwayat | Buka Hasil Belajar | Latihan & evaluasi tercantum; pembahasan evaluasi dapat dibuka | ✅ Lulus (E2E, mode lokal) |
| M15 | HP Android | Chrome Android, lebar ±360–412 px | Tidak ada scroll horizontal; tombol mudah disentuh; keyboard angka muncul | 🟡 Lulus di emulasi Pixel 7 (412 px); belum di HP Android fisik |
| M16 | Laptop | Chrome/Edge 1366 px | Tata letak 2 kolom pada materi & visualisasi | ✅ Lulus (E2E 1366 px) |
| M17 | Offline | Matikan data saat evaluasi, kirim | Banner offline; jawaban tersimpan; "Kirim ulang" berhasil setelah online | ✅ Lulus (E2E, mode offline Playwright) |
| M18 | Server mati | Hentikan backend, coba login | Pesan "Server belum bisa dihubungi…" | ✅ Lulus (E2E) |
| M19 | Keamanan DB | Panggil REST Supabase dengan anon key ke `students`/`questions` | Ditolak / data kosong | ✅ Lulus (Supabase, 13 Nov 2026) |
| M20 | Akses data siswa lain | Pakai token A untuk `GET /api/attempts/<id milik B>` | 404 | ✅ Lulus (pytest + E2E) |
| M21 | Integrasi FE–BE produksi | Alur lengkap di URL Vercel | Semua langkah berhasil | ✅ Lulus (produksi Vercel, 13 Nov 2026) |

Uji M19:
```bash
curl "https://<project>.supabase.co/rest/v1/students?select=*" -H "apikey: <publishable/anon key>"
# Diharapkan: galat izin (permission denied) atau [] — bukan data siswa
```

## 3. Laporan hasil

Lihat bagian **Laporan** di bawah. Bagian ini diperbarui setiap kali pengujian dijalankan.

### Laporan — 13 November 2026 (lingkungan lokal, backend mode lokal)

**Uji otomatis**

| Lapisan | Hasil |
|---|---|
| Backend pytest | **42/42 lulus** (auth, validasi, penguncian login, token palsu, evaluasi start/resume/submit, permintaan start bersamaan, kepemilikan data, latihan, parser angka, integritas & kebenaran matematis bank soal) |
| Frontend Vitest | **25/25 lulus** (parser angka identik dengan backend, aturan bintang, 400 set soal acak diperiksa: tanpa NaN, kunci bulat, opsi unik, kunci cocok dengan perhitungan) |
| Build produksi | **Berhasil**. Bundel awal ±102 KB gzip; Three.js (±256 KB gzip) dimuat terpisah hanya saat gambar 3D dibuka |

**Uji ujung-ke-ujung (Playwright, Chromium headless)** — emulasi Pixel 7 + laptop 1366×768, frontend dev server + backend lokal: **36/36 cek lulus** ditambah uji server mati (M18).

**Bug yang ditemukan dan diperbaiki saat pengujian**

| Bug | Penyebab | Perbaikan |
|---|---|---|
| Jawaban evaluasi hilang setelah muat ulang | Dua permintaan `start` bersamaan membuat dua attempt | Penjaga di frontend + kunci per siswa di backend + tes `test_concurrent_start_creates_single_attempt` |
| Label p/l/t tidak tampil di 3D & peringatan React | Komponen `Html` drei membuat React root terpisah | Label diganti sprite bertekstur kanvas (tanpa DOM) |
| Three.js ikut dimuat di halaman awal | Pengaturan `manualChunks` | Pengaturan dihapus; Three.js kembali lazy |

**Uji integrasi Supabase sungguhan (13 Nov 2026)** — backend lokal terhubung ke proyek Supabase, memakai akun uji sementara yang dihapus setelahnya: **17/17 lulus**. Cakupan: login, materi dari DB, evaluasi tanpa kunci jawaban, nilai tersimpan di `quiz_attempts` (M13), 10 baris `quiz_answers`, latihan, riwayat, pembahasan. RLS (M19): kunci publik (publishable) **ditolak (401)** untuk `students`, `questions`, `quiz_attempts`, `quiz_answers`, serta tidak dapat menulis nilai; `materials` boleh dibaca publik sesuai rancangan.

**Uji ujung-ke-ujung produksi (13 Nov 2026)** — frontend https://belajar-kubus-balok.vercel.app + backend https://kubus-balok-api.vercel.app + Supabase, emulasi Pixel 7 & laptop 1366 px, dua akun uji sementara (dihapus setelahnya): **36/36 lulus** (M21), termasuk penyimpanan online, muat ulang evaluasi, mode offline + kirim ulang, dan isolasi data antarsiswa. CORS diperiksa: hanya domain frontend yang diizinkan.

**Belum diuji (jujur):** HP Android fisik (M15). Uji 3D dilakukan dengan renderer perangkat lunak, bukan GPU HP. Uji 3D dilakukan dengan renderer perangkat lunak (SwiftShader), bukan GPU HP.

## 4. Pengujian versi 2 (guru virtual) — 14 November 2026

Lingkungan: branch `redesign-guru-virtual`, backend mode lokal (data bersih), Chromium headless (Playwright), emulasi Pixel 7 & laptop 1366 px.

### Ringkasan
| Lapisan | Hasil | Catatan |
|---|---|---|
| Backend pytest | **71/71 lulus** | 42 lama + 29 baru (lessons, tutor curated, keamanan endpoint, validasi, batas permintaan, provider Claude dengan client tiruan, fallback) |
| Frontend Vitest | **42/42 lulus** | 25 lama + 17 baru (pemutar pelajaran, interupsi & lanjut, klasifikasi "sudah paham?") |
| Build produksi | **Berhasil** | bundel awal 153 KB gzip (sebelumnya 102 KB; tambahan Motion + kelas guru) |
| E2E fitur lama | **36/36 lulus** | tanpa perubahan pada skrip uji |
| E2E fitur baru | **33/33 lulus** | `e2e/v2.e2e.mjs` |

### Cakupan E2E v2
| Kode | Skenario | Hasil |
|---|---|---|
| B1–B4 | Beranda v2, tab bar, progres bertambah, *reduced motion* dihormati | ✅ |
| C1 | Karakter guru tampil & berganti ekspresi (mendengarkan, berpikir, apresiasi) | ✅ |
| D1–D12 | Daftar pelajaran, mode fokus, papan bertahap + sorotan, jeda, cek pemahaman, lanjut bagian, selesai, status "Selesai" | ✅ |
| E1–E5 | Mikrofon aktif + indikator, konfirmasi transkrip, izin mikrofon ditolak → ketik, jawaban suara "sudah paham" | ✅ (mikrofon tiruan) |
| F1–F6 | Jawaban sesuai konteks, "sudah paham?", penjelasan alternatif, **lanjut dari baris yang disela**, tolak di luar topik, perhitungan terpandu | ✅ |
| G1–G3 | Layanan tutor 503, offline saat bertanya, muat ulang tanpa kehilangan progres | ✅ |
| M16 | Laptop: papan & guru berdampingan | ✅ |

### Bug yang ditemukan & diperbaiki selama pengujian v2
| Bug | Perbaikan |
|---|---|
| Pertanyaan tak relevan ("kubus bisa menggelinding?") dijawab rumus kubus karena satu kata umum + bonus konteks | Aturan pencocokan sebagian diperketat + tes regresi |
| "54 bagi 12" tidak dihitung (tanpa kata "berapa") | Urutan pemeriksaan aritmetika diperbaiki |
| Tombol "Sudah/Belum paham" baru muncul setelah jawaban panjang selesai dibacakan (±18 dtk) | Tombol tampil begitu jawaban datang; menekannya menghentikan suara |
| Jawaban suara "sudah" bisa terkirim sebagai pertanyaan (closure basi) | Memakai `ref` |

### Belum dapat diuji (jujur)
| Skenario | Alasan |
|---|---|
| Mikrofon & suara sungguhan di HP Android (Chrome) | Butuh perangkat fisik — **lakukan manual**: izinkan mikrofon, tanya "kenapa dikali enam", periksa suara id-ID |
| Kualitas suara Bahasa Indonesia | Tergantung mesin TTS perangkat (headless tidak punya suara id-ID → mode teks diuji) |
| Mesin Claude dengan kunci asli | Tidak ada API key (berbayar); diuji dengan client tiruan termasuk kegagalan & penolakan |
| Koneksi lambat sungguhan | Hanya offline & layanan gagal yang disimulasikan |
| Versi v2 di produksi (Vercel + Supabase) | Branch belum di-push/deploy; menunggu persetujuan |

### Regresi setelah desain v2.1 (14 November 2026)
pytest **71/71**, vitest **42/42**, build berhasil, E2E fitur lama **36/36** (data bersih), E2E v2 **33/33**.
Catatan: pada satu run pertama setelah perubahan kode, E2E lama sempat *timeout* (kemungkinan server dev Vite sedang mengompilasi modul baru). Run ulang pada data bersih lulus 36/36. Dicatat sebagai potensi uji *flaky*.

## 5. Pengujian v3 — redesign mengikuti papan desain (14 November 2026)

| Lapisan | Hasil |
|---|---|
| Backend pytest | **71/71** (backend tidak diubah) |
| Frontend Vitest | **49/49** (+7: garis waktu video, aksi GOTO, poin & lencana) |
| Build produksi | berhasil; bundel awal ±167 KB gzip |
| E2E fitur lama | **36/36** (data bersih) |
| E2E guru virtual (v2) | **33/33** |
| E2E v3 (`e2e/v3.e2e.mjs`) | **32/32**: halaman awal, 6 menu, poin, navigasi bawah, laci menu (Escape), visualisasi (Putar, Jaring-jaring, Mode 2D), slide materi (Lanjut/Kembali/bacakan/Lihat semua), video (waktu berjalan, CC, Ringkasan Materi, Ajukan Pertanyaan, kembali), pengaturan (tampilan guru, kurangi animasi, tersimpan), profil (lencana + syarat), keluar |

**Perubahan selektor pada skrip uji lama** (cakupan pemeriksaan tidak dikurangi):
| Pemeriksaan | Sebelum | Sesudah | Alasan |
|---|---|---|---|
| Petunjuk | heading "Cara memakai aplikasi" | "Cara Menggunakan Aplikasi" | teks sesuai referensi |
| Materi | langsung mencari rumus | klik "Lihat semua" dulu | materi kini per slide |
| Visualisasi | balok tampil awal; tombol "Buka jaring-jaring", "2D/3D" | klik tab Balok; "Jaring-jaring"; "Mode 2D" | kontrol sesuai referensi |
| Evaluasi | tombol "Berikutnya" | "Selanjutnya" | label sesuai referensi |
| Hasil | heading "Nilai Evaluasi", `.stats` | teks "Nilai Akhir", `.result-stats` | kartu hasil baru |
| Beranda (v2) | heading "Belajar Bersama", tab "Guru", `.progress-card` | tautan "Belajar Bersama Guru", `.progress-hero` | beranda grid 6 menu |

**Masalah yang ditemukan & diperbaiki saat uji visual v3**: label 3D terlalu besar menutupi kubus; navigasi bawah menutupi tombol slide materi; judul logo terbaca "BelajarKubus" oleh pembaca layar; teks kelas guru kurang kontras di atas gradasi; baris pengaturan terlalu sempit; lencana belum bisa diketuk di HP.

**Belum diuji**: HP Android fisik (suara, mikrofon, performa 3D) dan versi v3 di produksi.

## 6. Pengujian v3.1 — aset karakter baru (15 November 2026)
pytest **71/71**, vitest **49/49**, build berhasil, E2E fitur lama **36/36** (data bersih), E2E guru virtual **33/33**, E2E v3 **33/33**.
Perubahan uji: v2 B4 kini memeriksa kelas animasi `.c-body` milik aset baru; v3 S1 (ganti tampilan guru "berkerudung") **dihapus karena fiturnya dihapus atas permintaan**, diganti S1 (7 pose guru + 3 pose siswa di galeri) dan S1b (tidak ada sisa pilihan lama).
Pemeriksaan visual galeri `/karakter` menemukan & memperbaiki: rambut kaku → bergelombang; tangan kecil & menggantung → lebih besar, tubuh dipotong di pinggang; leher terlalu panjang (guru & siswa); tangan pose berpikir/mendengar tertutup tubuh/rambut → dipindah ke lapisan depan; lengan kemeja siswa tak terlihat di latar putih → diberi garis tepi.

