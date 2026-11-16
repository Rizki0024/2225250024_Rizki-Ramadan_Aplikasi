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

## 7. Pengujian v3.2 — mesin rig karakter raster (15 November 2026)
| Lapisan | Hasil |
|---|---|
| Vitest | **54/54** (+5 logika rig: validasi manifest, pemetaan pose, bentuk mulut per vokal, kedip/ekspresi/bicara, mask area) |
| Build | berhasil |
| E2E rig (`e2e/rig.e2e.mjs`) | **9/9** — gambar uji dibangkitkan kanvas & disajikan via intersepsi jaringan: cadangan SVG tanpa aset, rig raster dengan aset, cadangan pose, berkedip, sinkron bibir (sinyal kata), Penyetel Rig, manifest rusak ditolak. Hasil tempel varian diperiksa visual: mulut/mata hanya berubah di kotak area |
| E2E guru virtual (v2) | **33/33** |
| E2E v3 | **33/33** |

Catatan:
- H8 (laci tertutup dengan Escape) sempat gagal: fungsi benar (5/5 tertutup), tetapi animasi tutup 0,5–0,9 dtk melebihi jeda tetap 0,5 dtk di tes. Perbaikan: animasi laci dipercepat (±0,37 dtk) dan tes menunggu laci tertutup (maks. 3 dtk), bukan jeda tetap.
- Satu run v3 berhenti karena `/karakter` *timeout* saat dimuat, tepat setelah file diubah (server dev sedang memproses ulang). Diukur ulang: halaman dimuat ±0,5 dtk (3×), run ulang lulus 33/33. Dicatat sebagai potensi uji *flaky*.
- Belum diuji: aset karakter asli (belum tersedia) dan sinkron bibir dengan suara id-ID sungguhan di HP.


## 8. Pengujian v3.3 — aset asli Bu Sari terpasang (15 November 2026)
Aset: 25 gambar dari pengembang (6 pose; varian mata/mulut dibuat dengan inpainting). Diproses dengan `frontend/scripts/build_character_assets.py`: latar putih JPG *think*/*listen* dihapus (termasuk sisa latar yang terkurung rambut), varian disimpan dengan topeng per piksel (`"mask": "baked"`), frame tampilan kepala–pinggang. Total aset 3,6 MB (varian 10–30 KB).

| Lapisan | Hasil |
|---|---|
| Pemeriksa aset `scripts/check-character-assets.mjs` | **35 OK, 0 gagal** |
| Vitest | **56/56** (+2: frame tampilan, topeng baked) |
| Build | berhasil |
| E2E fitur lama (data bersih) | **36/36** |
| E2E guru virtual (v2) | **33/33** |
| E2E v3 | **33/33** |
| E2E rig | **10/10** (+R9: aset asli tampil, tidak ada gambar rusak; R1 kini menyimulasikan manifest hilang) |

Perubahan uji: pemilih `svg.teacher` diganti `[data-character="teacher"]` (berlaku untuk rig raster & SVG cadangan); v2 B4 memeriksa `.c-body` atau `.rig-body`.
Pemeriksaan visual: galeri `/karakter`, kelas desktop, beranda HP; wajah saat kedip, kata "balok" (mulut lebar), "kubus" (bulat), "sisi" (terbuka), ekspresi bangga. Ditemukan & diperbaiki: bercak terang di rambut dekat mata kanan saat varian mata tampil (AI sedikit mengubah helai rambut; kotak + mask elips ikut menempelkannya) → diganti topeng per piksel.
Belum diuji: sinkron bibir dengan suara id-ID sungguhan dan performa di HP Android fisik.

## 9. Karakter siswa dihapus (15 November 2026)
Atas permintaan pengembang hanya Bu Sari yang ditampilkan: `features/characters/Student.jsx` dihapus; halaman awal & laci menu memakai Bu Sari (pose melambai); avatar profil memakai huruf awal nama siswa; bagian "Siswa" di galeri dihapus.

| Lapisan | Hasil |
|---|---|
| pytest | **72/72** (+1 `test_local_repository.py`) |
| Vitest | **56/56** |
| Build | berhasil |
| E2E fitur lama (data bersih) | **36/36** |
| E2E guru virtual (v2) | **33/33** |
| E2E v3 | **33/33** (H1 kini: Bu Sari di halaman awal & tidak ada karakter siswa; S1: 7 pose Bu Sari, 0 karakter siswa) |
| E2E rig | **10/10** |

Ditemukan saat regresi & diperbaiki: penyimpanan lokal JSON (hanya mode pengembangan/E2E, bukan Supabase) sesekali gagal `PermissionError: Access is denied` saat mengganti `db.json` di Windows → evaluasi gagal dikirim (500). Perbaikan: kunci penulisan, file sementara unik, coba ulang. Tes baru gagal pada kode lama dan lulus pada kode baru.
Catatan: satu run legacy sempat berhenti saat Playwright mengambil *screenshot* halaman penuh (timeout alat uji, bukan fungsi aplikasi); run ulang dengan data bersih lulus 36/36.

## 10. Deploy v3 ke produksi (15 November 2026)
`redesign-v3` digabung (*fast-forward*) ke `main` dan di-push; Vercel membangun ulang frontend & backend otomatis. Tidak ada perubahan skema Supabase; mode tutor produksi `curated` (tanpa biaya).

Uji asap produksi **tanpa menulis data** (emulasi Pixel 7): **12/12** setelah koreksi P9.
- Halaman awal menampilkan Bu Sari (rig raster), tanpa karakter siswa; galeri 13 rig, 0 gambar rusak; Bu Sari berkedip; halaman masuk tampil; halaman siswa tanpa login diarahkan ke Masuk; tidak ada galat JavaScript.
- API sehat (`storage: supabase`, `tutor: curated`); rute guru virtual tersedia; CORS hanya mengizinkan domain frontend.
- Endpoint data siswa tanpa token → **401** (`/api/attempts`, `/api/auth/me`, `/api/evaluations/start`, `/api/tutor/ask`). `/api/lessons` & `/api/materials` sengaja publik (konten ajar); respons tidak memuat `answer_key`/`explanation`. (P9 awalnya mengharapkan 401 untuk `/api/lessons` — ekspektasi tes yang salah, bukan bug.)
- Bundel JS frontend dipindai: tidak ada kunci rahasia.

Belum diuji di produksi: alur login → kelas → evaluasi dengan akun sungguhan (perlu akun uji sementara di Supabase atau akun siswa nyata), suara id-ID & mikrofon di HP Android fisik.

## 11. Perbaikan suara Bu Sari di HP Android (15 November 2026)
Laporan pengembang: di HP, video pembelajaran tidak bersuara. Penyebab yang ditemukan di `features/voice/speech.js` & `pages/VideoLesson.jsx`:
1. Sebagian HP Android menamai suara Indonesia dengan kode Java lama `in-ID`/`in_ID`; aplikasi hanya mencari `id…` → suara tidak ditemukan → mode teks (bisu). Kini `isIndonesianLang` menerima `id`/`in` dengan `-` atau `_`; di Android tanpa suara terdaftar, ucapan tetap dikirim dengan `lang = id-ID` ke mesin TTS bawaan.
2. Halaman Video tidak menunggu daftar suara dimuat (di HP dimuat terlambat) → kini `speak()` menunggu `voicesReady()`.
3. Bug Chrome Android: `speak()` tepat setelah `cancel()` kadang diabaikan → jeda 80 ms bila masih berbicara; `resume()` sebelum `speak()`.
4. Galat suara dianggap "selesai" sehingga video berjalan diam-diam → kini dicatat (`voiceStatus.error`) dan dilanjutkan dengan mode teks.
5. `unlockSpeech()` dipanggil langsung di ketukan tombol Putar/Mulai (Video & Kelas).
Tambahan: peringatan suara di halaman Video (sama seperti Kelas) dan **Tes suara** + diagnosis di Pengaturan (suara dipakai, daftar suara Indonesia, galat).

| Lapisan | Hasil |
|---|---|
| Vitest | **60/60** (+4 `speech.test.js`: kode `in-ID`/`in_ID`, pilihan suara lokal, suara Android dipakai, galat → mode teks) |
| Build | berhasil |
| E2E legacy / v2 / v3 / rig | **36/36**, **33/33**, **33/33**, **10/10** (rig: R2/R9 kini menunggu semua rig dirender — sempat gagal karena menghitung terlalu cepat; 3× berturut-turut lulus) |
| Tes suara di emulasi Pixel 7 | jalur "bawaan Android (id-ID)" berjalan, laporan diagnosis tampil, tanpa galat JS |

Belum terbukti: bunyi sungguhan di HP Android fisik — menunggu uji ulang pengembang memakai tombol **Tes suara**.

## 12. Revisi: AI Bu Sari, evaluasi kisi-kisi bertahap, metode RMT (16 November 2026)
Perubahan: (1) tutor AI-first bila `ANTHROPIC_API_KEY` diisi + *system prompt* RMT, tanpa AI tidak mengulang jawaban sama; (2) evaluasi = 4 soal kisi-kisi ML-1..ML-4 bertahap, skor per tahap, carry-forward, total 24; (3) naskah kelas & materi direvisi mengikuti RMT (tujuan & manfaat, pertanyaan termediasi, fase Input/Elaborasi/Output/Refleksi, segmen baru cer-5 Reasoning & cer-6 memeriksa pekerjaan); (4) latihan level Literasi & Bank Soal; (5) suara: daftar suara cukup ditunggu sekali.

| Lapisan | Hasil |
|---|---|
| pytest | **77/77** (baru: penskoran parsial & carry-forward sesuai kisi-kisi, kunci dicek ulang dengan hitungan langsung, kunci/pembahasan tidak bocor saat mengerjakan, AI menjawab semua kecuali "ulangi", mode tanpa AI tidak mengulang jawaban, unsur RMT di *system prompt*, anti-kebocoran ukuran & jawaban ke konten, fase RMT di setiap segmen) |
| Vitest | **66/66** (baru: level Literasi 4 indikator tanpa angka evaluasi, Bank Soal, pemeriksaan pekerjaan teman, daftar suara ditunggu sekali) |
| Build | berhasil |
| E2E fitur lama | **38/38** (evaluasi kini: tahap & poin tampil, muat ulang menyimpan isian tahap, kirim offline → ulang, skor x/24, pembahasan per tahap 21 tahap, riwayat dibuka ulang; M16b slide pembuka "Tujuan & manfaat") |
| E2E guru virtual | **33/33** (D6 batas waktu 20 → 45 dtk karena kalimat pembuka tujuan; E2 kini menunggu ekspresi maks. 3 dtk — sempat gagal 1× karena waktu, 3 run berikutnya lulus) |
| E2E v3 / rig | **33/33**, **10/10** |

Tes anti-kebocoran dibuktikan bisa gagal: menyisipkan "Kotak 50 cm, 30 cm, dan 20 cm" ke naskah kelas → gagal sesuai harapan. Saat menulis tes ditemukan & diperbaiki: contoh "pekerjaan Rina" semula memakai urutan 60 + 50 + 30 yang mirip ML-3 → diganti balok 9 × 6 × 4 cm. Nilai 2.400 cm² (contoh kotak sepatu 30 × 20 × 12) sama dengan luas Kotak A ML-1 secara kebetulan → dicatat sebagai pengecualian beralasan di tes.

**Belum diuji (jujur):** jawaban AI sungguhan (belum ada kunci API; diuji dengan klien tiruan), migrasi & seed di Supabase produksi (menunggu pengembang menjalankan SQL), suara di HP Android fisik.

### Deploy revisi ke produksi (16 November 2026)
Pengembang menjalankan migrasi `2026-11-16_soal_bertahap.sql` di Supabase → `seed_supabase.py`: 14 soal (ML-1..ML-4 aktif, EV-01..EV-10 nonaktif, tidak dihapus). Pemeriksaan baca-saja kode baru terhadap Supabase produksi: 4 soal tersusun mudah → sulit, tidak ada kunci/pembahasan di data untuk siswa, kunci setiap soal bernilai 6/6, riwayat lama tetap terbaca. `main` di-push → Vercel; uji asap produksi **12/12** (P9 diperbarui: daftar kelas memang publik, tanpa kunci jawaban); `/api/health` → `tutor: curated` (AI belum aktif). Endpoint evaluasi/riwayat tanpa token → 401.
Belum diuji di produksi: mengerjakan evaluasi dengan akun siswa sungguhan.
