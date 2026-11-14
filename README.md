# Belajar Kubus dan Balok

Aplikasi web pembelajaran **luas permukaan kubus dan balok** untuk siswa SMP kelas VIII. Aplikasi ini memuat materi bertahap, visualisasi 3D dengan jaring-jaring yang dapat dibuka, latihan dengan umpan balik diagnostik, evaluasi 10 soal berbatas waktu, dan riwayat hasil belajar yang tersimpan online. Dapat dibuka di smartphone Android maupun laptop.

**Aplikasi online:** https://belajar-kubus-balok.vercel.app · API: https://kubus-balok-api.vercel.app/docs

Proyek mata kuliah Algoritma dan Pemrograman — **Rizki Ramadan (2225250024)**, Pendidikan Matematika.

## Fitur

| Fitur | Keterangan |
|---|---|
| **Belajar Bersama Guru** (v2) | Guru virtual 2D "Bu Sari" menjelaskan di papan tulis digital per segmen; siswa menyela dengan **suara** atau ketikan; guru menjawab sesuai materi, memastikan pemahaman, lalu **melanjutkan dari posisi terakhir** |
| Desain v3 | Mengikuti papan desain: latar gradasi biru, logo bertepi, beranda 6 menu + poin, laci menu, navigasi bawah, profil & lencana, pengaturan |
| Video Pembelajaran | Guru + papan tulis dalam adegan kelas dengan kontrol video (garis waktu, CC, layar penuh), Ringkasan Materi, dan Ajukan Pertanyaan |
| Login kode siswa + PIN | Tanpa email; PIN di-hash bcrypt; dikunci 5 menit setelah 5 kali salah |
| Materi | Prasyarat → Kubus → Balok → Soal Cerita; contoh soal dengan pembahasan bertahap |
| Visualisasi 3D | Kubus & balok dapat diputar, ukuran dapat diubah, jaring-jaring beranimasi; otomatis 2D jika perangkat tidak mendukung |
| Latihan | 4 level × 5 soal acak, pilihan ganda & isian angka, umpan balik yang mengenali kesalahan umum, bintang ★★★ |
| Evaluasi | 10 soal (Formulate/Employ/Interpret), 30 menit, dinilai di server, jawaban aman saat koneksi putus |
| Hasil belajar | Riwayat latihan & evaluasi, nilai, waktu pengerjaan, pembahasan |

## Teknologi

- **Frontend**: React 19 + Vite 8, React Router, React Three Fiber + Three.js, Motion (animasi), Web Speech API (suara), CSS biasa
- **Backend**: Python + FastAPI, Pydantic, PyJWT, bcrypt, httpx; tutor curated + Claude API opsional (`anthropic`)
- **Database**: Supabase PostgreSQL dengan Row Level Security
- **Hosting**: Vercel (frontend & backend FastAPI serverless), Supabase (database). Render tetap didukung lewat `render.yaml`.

## Struktur folder

```
├── docs/                 dokumen perencanaan (PRD, arsitektur, desain, API, database, konten, kisi-kisi, pengujian, deployment, tugas, presentasi)
├── frontend/             React + Vite
│   └── src/
│       ├── components/   komponen UI umum
│       ├── features/     shapes (3D/2D), materials, practice (generator soal), quiz
│       ├── hooks/        useAuth, useOnlineStatus, useCountdown
│       ├── pages/        satu file per halaman
│       ├── services/     klien REST API
│       ├── styles/       CSS global
│       └── utils/        parser angka Indonesia, localStorage
├── backend/              FastAPI
│   ├── app/
│   │   ├── api/          route + dependensi autentikasi
│   │   ├── core/         konfigurasi & keamanan
│   │   ├── data/         materials.json, questions.json (sumber konten)
│   │   ├── models/       konstanta domain
│   │   ├── schemas/      validasi Pydantic
│   │   └── services/     repository (Supabase/lokal), penilaian, evaluasi
│   ├── scripts/          seed_supabase.py, add_student.py
│   └── tests/            pytest
├── supabase/             schema.sql (tabel + RLS), seed_students.sql
├── agents.md             panduan untuk AI agent / pengembang
├── render.yaml           blueprint Render
└── .env.example          contoh konfigurasi
```

## Instalasi & menjalankan secara lokal

Prasyarat: **Python 3.12+**, **Node.js 20+**, Git.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (Linux/macOS: source .venv/bin/activate)
pip install -r requirements-dev.txt
uvicorn app.main:app --reload    # http://localhost:8000/docs
```

Tanpa file `.env`, backend berjalan dalam **mode lokal** (data di `backend/.localdata/db.json`) dengan akun demo:

| Kode | PIN | Nama samaran |
|---|---|---|
| KB-001 | 1234 | Elang |
| KB-002 | 2345 | Merpati |
| KB-003 | 3456 | Rajawali |

### Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

Secara bawaan frontend memanggil `http://localhost:8000`. Untuk mengubahnya, buat `frontend/.env` berisi `VITE_API_URL=...`.

Untuk membuka dari HP di jaringan WiFi yang sama: jalankan backend dengan `--host 0.0.0.0`, set `VITE_API_URL=http://<IP-laptop>:8000` dan `ALLOWED_ORIGINS=http://<IP-laptop>:5173`, lalu buka `http://<IP-laptop>:5173` di Chrome HP.

### Pengujian

```bash
cd backend  && python -m pytest     # 71 tes
cd frontend && npm test             # 49 tes
cd frontend && npm run build
# E2E (Playwright): lihat e2e/README.md — 36 cek fitur lama + 33 cek guru virtual + 32 cek v3
```

## Konfigurasi Supabase

1. Buat proyek di https://supabase.com (region Singapore).
2. SQL Editor → jalankan `supabase/schema.sql` (tabel, RLS, view rekap).
3. SQL Editor → jalankan `supabase/seed_students.sql` setelah mengganti kode/PIN.
4. Salin `Project URL` dan **secret key** ke `backend/.env`:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_xxx
   APP_JWT_SECRET=<string acak ≥ 32 karakter>
   ```
5. `cd backend && python scripts/seed_supabase.py` untuk mengisi materi & soal.
6. Tambah siswa kapan saja: `python scripts/add_student.py KB-004 4567 "Kenari" --class VIII-A`.

Detail desain database dan RLS: [docs/database.md](docs/database.md).

## Deployment

Langkah lengkap untuk Supabase, Render, dan Vercel: [docs/deployment.md](docs/deployment.md).

> **Keamanan:** jangan pernah meng-commit file `.env`. Secret key Supabase dan `APP_JWT_SECRET` hanya boleh disimpan di backend (Render). Frontend hanya memerlukan `VITE_API_URL`.

## Dokumentasi

[Audit v3](docs/redesign-v3-audit.md) · [Guru virtual](docs/virtual-teacher.md) · [Suara](docs/realtime-voice.md) · [Animasi](docs/animation-guide.md) · [Audit v2](docs/redesign-audit.md) · [PRD](docs/prd.md) · [Arsitektur](docs/architecture.md) · [Desain](docs/design.md) · [API](docs/api.md) · [Database](docs/database.md) · [Konten](docs/content.md) · [Kisi-kisi soal](docs/question-blueprint.md) · [Pengujian](docs/testing.md) · [Deployment](docs/deployment.md) · [Tugas](docs/task.md) · [Panduan presentasi](docs/presentation.md)
