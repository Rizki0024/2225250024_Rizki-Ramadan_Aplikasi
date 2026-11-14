# Audit & Rencana Rombak — Versi 2 (Guru Virtual)

Tanggal: 14 November 2026 · Branch kerja: `redesign-guru-virtual` · Cadangan MVP: tag `v1.0-mvp`, branch `mvp-backup`

## 1. Hasil audit kode aktual

### Fitur yang tersedia (diperiksa di kode, bukan hanya dokumen)
| Area | Implementasi | Status uji |
|---|---|---|
| Login kode + PIN | `backend/app/api/routes/auth.py`, bcrypt, JWT HS256 8 jam, pembatas 5 kegagalan | pytest + E2E produksi |
| Materi (4) | `backend/app/data/materials.json` → tabel `materials`; dirender `features/materials/MaterialBlocks.jsx` | E2E |
| Visualisasi 3D + jaring-jaring | `features/shapes/ShapeViewer3D.jsx` (R3F, render on-demand, label sprite), fallback `Shape2D.jsx` | E2E (SwiftShader) |
| Latihan 4 level | `features/practice/generators.js` (soal acak + umpan balik diagnostik) | vitest 400 set + E2E |
| Evaluasi 10 soal / 30 menit | `services/evaluation.py` (dinilai server, kunci per siswa), `pages/Evaluation.jsx` (simpan lokal, kirim ulang) | pytest + E2E |
| Hasil belajar | `routes/attempts.py`, `pages/Results.jsx` | E2E |
| Mode lokal | `services/repository/local.py` | pytest |

API aktual: `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/materials`, `GET /api/materials/{slug}`, `POST /api/evaluations/start`, `POST /api/evaluations/{id}/submit`, `POST /api/practice/attempts`, `GET /api/attempts`, `GET /api/attempts/{id}`, `GET /api/health`.

Baseline sebelum rombak (14 Nov 2026): **pytest 42/42**, **vitest 25/25** lulus.

### Perbedaan dokumen vs kenyataan
| Dokumen / prompt | Kenyataan |
|---|---|
| Backend di Render | Backend di **Vercel** (`backend/index.py`) karena Render meminta kartu. `render.yaml` tetap ada sebagai opsi |
| Framer Motion | Belum dipakai; animasi hanya CSS minimal |
| `docs/design.md` warna biru-putih | Sesuai; belum ada navigasi bawah, kartu progres, atau animasi |

### Komponen yang dapat dipakai ulang
`ShapeViewer3D` / `Shape2D` (ilustrasi di papan tulis), `SolutionSteps` (langkah rumus bertahap), `generators.js` (soal cek pemahaman), `materials.json` (sumber naskah guru), `api.js` (galat jaringan), `useAuth`, `useOnlineStatus`, seluruh backend.

### Bagian yang perlu diperbaiki/ditambah
- Tata letak: belum ada navigasi bawah (tab bar) untuk HP, belum ada ringkasan progres di beranda.
- Animasi: tidak ada transisi halaman/umpan balik; belum menghormati `prefers-reduced-motion` secara menyeluruh.
- Belum ada guru virtual, papan tulis, segmen pelajaran, maupun suara.

## 2. Temuan penting: kebijakan penyedia AI untuk pengguna < 18 tahun

Siswa SMP berusia di bawah 18 tahun, sehingga syarat layanan menentukan pilihan penyedia.

| Penyedia | Suara realtime 2 arah | Pengguna < 18 | Biaya | Butuh kartu |
|---|---|---|---|---|
| **Google Gemini Live API** | Ya (native audio) | **Dilarang**: syarat API melarang aplikasi yang "directed towards or is likely to be accessed by individuals under the age of 18" | Ada tier gratis; berbayar ±$0,005/menit masuk, $0,018/menit keluar | Tidak (tier gratis) |
| **OpenAI Realtime API** | Ya (WebRTC + token sementara, interupsi bawaan) | Boleh dengan pengaman tambahan ("Under 18 API Guidance"); data anak < 13 tahun memerlukan zero data retention | ±$0,02/menit audio masuk + ±$0,08/menit audio keluar (sumber pihak ketiga, perlu konfirmasi) | Ya (kredit prabayar) |
| **Anthropic Claude API** | Tidak ada model suara; dipakai sebagai "otak" teks + suara dari browser | Boleh dengan pengaman sesuai "Guidelines for Organizations Serving Minors" (wajib memberi tahu bahwa lawan bicara adalah AI) | Claude Opus 5.5 $4/$20 per 1 juta token ≈ ±Rp300/pertanyaan; Claude Haiku 5.5 $0,10/$0,50 ≈ ±Rp8/pertanyaan | Ya (kredit prabayar) |
| **Web Speech API (browser)** | Pengenalan + sintesis suara di Chrome; bukan AI generatif | Bukan layanan API terpisah | Gratis | Tidak |

Catatan: Web Speech API di Chrome memproses suara lewat layanan Google. Ketersediaan suara `id-ID` bergantung pada perangkat; jika tidak tersedia, aplikasi beralih ke mode teks.

## 3. Rekomendasi arsitektur guru virtual

**Mesin tutor yang dapat ditukar (pluggable)** di backend `POST /api/tutor/ask`:

1. **`curated` (bawaan, gratis, tanpa kunci)**: guru menjawab dari bank tanya-jawab yang disusun dari materi proyek (mis. "kenapa dikali 6", "beda luas dan volume", "apa itu tanpa tutup"). Pencocokan kata kunci dan sinonim dilakukan di server. Pertanyaan di luar topik dijawab dengan jujur ("di luar materi, tanyakan kepada guru"). Aman untuk siswa, tidak mengarang, dan siap untuk demo minggu depan.
2. **`claude` (opsional)**: aktif hanya jika `ANTHROPIC_API_KEY` diisi di backend. Jawaban dibatasi oleh *system prompt* pedagogis dan konteks segmen yang sedang dibahas; jika layanan gagal, kembali ke `curated`.

Suara: **Web Speech API** (sintesis untuk guru, pengenalan untuk siswa) dengan interupsi = menekan mikrofon langsung menghentikan suara guru. Teks hasil pengenalan selalu ditampilkan untuk dikonfirmasi; tersedia juga kotak ketik.

Opsi masa depan: OpenAI Realtime (speech-to-speech sejati), ditambahkan hanya dengan persetujuan dan anggaran.

## 4. Rencana implementasi (bertahap, diuji per fase)

| Fase | Pekerjaan | Uji |
|---|---|---|
| B | Sistem desain baru (biru + pastel), tab bar bawah HP / sidebar laptop, beranda gaya dasbor (sapaan, kartu hero "Belajar Bersama Guru", kartu aktivitas, progres), animasi Motion (transisi halaman, kartu, umpan balik benar/salah, bintang, loading), `prefers-reduced-motion` | E2E lama diperbarui selektornya, bukan dilemahkan + screenshot HP/laptop |
| C | Karakter guru SVG buatan sendiri (6 ekspresi, 7 gerakan, mulut bergerak saat bicara), komponen papan tulis | Unit + visual |
| D | Ruang kelas: segmen per materi (tujuan, naskah, ilustrasi, rumus bertahap, contoh), kontrol mulai/jeda/lanjut/ulang/kembali, progres tersimpan lokal | vitest (pemutar segmen) + E2E |
| E | Suara: TTS guru, mikrofon siswa (izin, indikator, mati/nyala, fallback teks), interupsi | E2E dengan suara palsu (mock) + uji manual di HP |
| F | `POST /api/tutor/ask` (curated + claude opsional), konteks segmen, alur "sudah paham?" → lanjut / penjelasan alternatif, lanjut dari posisi terakhir | pytest (keamanan, validasi, luar topik, penyedia gagal) |
| G | Integrasi, regresi semua tes lama, dokumentasi (`virtual-teacher.md`, `realtime-voice.md`, `animation-guide.md`), deploy pratinjau | Semua tes + produksi |

Basis data: **tidak ada migrasi wajib**. Progres kelas guru disimpan lokal terlebih dahulu. Tabel tambahan `lesson_progress` (bersifat menambah, tidak mengubah tabel lama) hanya dibuat jika Anda setuju.

## 5. Dependensi tambahan
| Paket | Fungsi | Ukuran (gzip, perkiraan) |
|---|---|---|
| `motion` (Framer Motion) | animasi transisi & komponen | ±30–40 KB |
| `anthropic` (Python, opsional) | mesin `claude` | backend saja |

Tidak ada aset berlisensi pihak ketiga: karakter digambar sendiri sebagai SVG.

## 6. Risiko
| Risiko | Mitigasi |
|---|---|
| Rombak tampilan merusak alur lama | Logika halaman (evaluasi, latihan, auth) tidak diubah; hanya lapisan tampilan. Semua tes lama wajib lulus |
| Suara `id-ID` tidak tersedia di sebagian HP | Deteksi suara; fallback teks + subtitle selalu tampil |
| Animasi memberatkan HP | Hanya animasi `transform`/`opacity`, `reduced-motion` dihormati, karakter berupa SVG ringan |
| Biaya AI tak terkendali | Mode `curated` gratis sebagai bawaan; `claude` dibatasi panjang jawaban dan jumlah permintaan per siswa |
| Vercel serverless tidak mendukung WebSocket jangka panjang | Arsitektur yang dipilih tidak memerlukannya (permintaan HTTP biasa) |
