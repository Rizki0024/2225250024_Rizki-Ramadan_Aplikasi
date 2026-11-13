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
| M21 | Integrasi FE–BE produksi | Alur lengkap di URL Vercel | Semua langkah berhasil | ⬜ Belum — menunggu deployment |

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

**Belum diuji (jujur):** integrasi produksi Vercel–Render (M21) dan HP Android fisik (M15). Uji 3D dilakukan dengan renderer perangkat lunak (SwiftShader), bukan GPU HP.
