# Panduan Deployment

Urutan: **Supabase → backend → Vercel (frontend) → perbarui CORS → uji**. Semua layanan memiliki paket gratis.

Backend dapat di-hosting di **Render** (§3) atau di **Vercel** (§3B). Gunakan §3B jika Render meminta kartu kredit/debit — paket Hobby Vercel tidak memerlukan metode pembayaran. *Keputusan proyek ini (13 Nov 2026): backend memakai Vercel karena Render meminta kartu.*

## 3B. Vercel (backend FastAPI) — tanpa kartu
1. Vercel → *Add New → Project* → impor repo yang sama.
2. **Project Name**: mis. `kubus-balok-api`. **Root Directory**: `backend`. **Framework Preset**: *FastAPI* (jika tidak muncul, pilih *Other*).
3. *Environment Variables*: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `APP_JWT_SECRET` (salin dari `backend/.env`), dan `ALLOWED_ORIGINS` = `http://localhost:5173` (sementara).
4. *Deploy*. Buka `https://<kubus-balok-api>.vercel.app/api/health` → harus `"storage":"supabase"`.

Catatan teknis Vercel (serverless):
- Titik masuk: `backend/index.py` (mengimpor `app` dari `app/main.py`); versi Python dari `backend/.python-version`.
- Tidak ada "tidur" seperti Render; permintaan pertama hanya lambat ±1–3 detik.
- Pembatas percobaan login disimpan di memori tiap instans, sehingga perlindungan brute-force lebih lemah dibanding satu server. Cukup untuk demo kelas; untuk pemakaian luas, pindahkan penghitung kegagalan ke tabel Supabase.

> Jangan pernah menempelkan secret key ke chat, kode, atau GitHub. Isi hanya di dashboard layanan atau di file `.env` lokal (sudah diabaikan oleh `.gitignore`).

## 3C. Pembaruan 16 Nov 2026: soal bertahap & AI Bu Sari
1. **Migrasi database (sekali):** Supabase → SQL Editor → tempel isi `supabase/migrations/2026-11-16_soal_bertahap.sql` → Run. Hanya menambah kolom & melonggarkan batasan; tidak menghapus data.
2. **Isi soal baru:** dari folder `backend`: `python scripts/seed_supabase.py` (mengisi ML-1..ML-4, menonaktifkan EV-01..EV-10 tanpa menghapus).
3. **Deploy kode:** push ke `main` → Vercel membangun frontend & backend. (Urutan aman: kode baru tetap jalan dengan soal lama sampai langkah 1–2 selesai.)
4. **(Gratis) AI Bu Sari via Groq:** daftar di console.groq.com (tanpa kartu) → API Keys → Create. Di Vercel proyek **backend** → Settings → Environment Variables: `GROQ_API_KEY` = kunci → Redeploy. Cek `GET /api/health` → `"tutor": "groq"`. Kuota gratis (±30 permintaan/menit, ±1.000/hari, ±8.000 token/menit per model) dibagi ke beberapa model; bila habis, Bu Sari memakai jawaban siap pakai.
5. **(Opsional, berbayar) AI Bu Sari via Claude:** buat kunci di console.anthropic.com (beli kredit), lalu di Vercel proyek **backend** → Settings → Environment Variables: `ANTHROPIC_API_KEY` = kunci, `TUTOR_MODEL` = `claude-haiku-5-5` (murah) atau `claude-opus-5-5` → Redeploy. Cek `GET /api/health` → `"tutor": "claude"`. Kunci **tidak boleh** ditaruh di proyek frontend.

## 0. Persiapan akun
1. **GitHub** — https://github.com/signup
2. **Supabase** — https://supabase.com → *Start your project* (masuk dengan GitHub)
3. **Render** — https://render.com → masuk dengan GitHub
4. **Vercel** — https://vercel.com → masuk dengan GitHub

## 1. Unggah kode ke GitHub
```bash
git remote add origin https://github.com/<username>/belajar-kubus-balok.git
git push -u origin main
```
Pastikan `git status` tidak menampilkan file `.env` sebelum push.

## 2. Supabase
1. *New project* → nama `belajar-kubus-balok`, region **Southeast Asia (Singapore)**, simpan password database.
2. **SQL Editor** → tempel isi `supabase/schema.sql` → *Run*.
3. **SQL Editor** → tempel `supabase/seed_students.sql` (ganti kode/PIN/nama samaran) → *Run*.
4. **Project Settings → API Keys**: salin *Project URL* dan **secret key** (`sb_secret_…`; pada proyek lama: *service_role*).
5. Isi materi & soal dari komputer:
   ```bash
   cd backend
   # isi SUPABASE_URL dan SUPABASE_SECRET_KEY di backend/.env
   python scripts/seed_supabase.py
   ```
6. Cek **Table Editor**: `materials` 4 baris, `questions` 10 baris.

## 3. Render (backend FastAPI)
1. *New → Web Service* → pilih repo GitHub.
2. Isian:
   | Field | Nilai |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Python 3 |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips="*"` |
   | Instance | Free |
3. *Environment Variables*:
   | Key | Nilai |
   |---|---|
   | `PYTHON_VERSION` | `3.12.8` |
   | `SUPABASE_URL` | URL proyek Supabase |
   | `SUPABASE_SECRET_KEY` | secret key |
   | `APP_JWT_SECRET` | string acak ≥ 32 karakter (`python -c "import secrets;print(secrets.token_urlsafe(48))"`) |
   | `ALLOWED_ORIGINS` | sementara `http://localhost:5173` |
4. *Create Web Service*. Setelah selesai, buka `https://<nama>.onrender.com/api/health` → harus `{"status":"ok","storage":"supabase",…}`.

Alternatif: file `render.yaml` di akar repo dapat dipakai lewat *New → Blueprint*.

## 4. Vercel (frontend)
1. *Add New → Project* → impor repo.
2. **Root Directory**: `frontend`. Framework terdeteksi **Vite**.
3. *Environment Variables*: `VITE_API_URL` = `https://<nama>.onrender.com`.
4. *Deploy*. File `frontend/vercel.json` sudah mengatur agar semua rute SPA diarahkan ke `index.html`.

## 5. Sambungkan CORS
Di Render, ubah `ALLOWED_ORIGINS` menjadi `https://<proyek>.vercel.app,http://localhost:5173` → *Save* (layanan restart otomatis).

## 6. Uji setelah deploy
Jalankan checklist M1–M21 di [testing.md](testing.md) pada URL Vercel, termasuk dari HP Android.

## 7. Catatan penting untuk presentasi
- Render gratis **tidur setelah ±15 menit** tanpa akses; permintaan pertama butuh ±30–60 detik. **10 menit sebelum presentasi**, buka `/api/health` di browser. Aplikasi juga menampilkan pesan "server sedang dinyalakan".
- Proyek Supabase gratis dijeda setelah 7 hari tidak aktif — buka dashboard sebelum presentasi bila perlu.
- Siapkan kode demo yang bukan milik siswa sungguhan (mis. KB-001).

## 8. Pemecahan masalah
| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Galat CORS di konsol browser | `ALLOWED_ORIGINS` belum memuat domain Vercel | Tambahkan domain persis (tanpa `/` di akhir) |
| `storage: "local"` di Render | Env Supabase kosong/salah nama | Periksa `SUPABASE_URL`, `SUPABASE_SECRET_KEY` |
| Login selalu salah | Hash PIN tidak dibuat dengan `crypt()` | Jalankan ulang `update … set pin_hash = extensions.crypt(…)` |
| Refresh di Vercel → 404 | `vercel.json` tidak terbaca | Pastikan Root Directory = `frontend` |
| 503 dari backend | Proyek Supabase dijeda | *Restore* di dashboard Supabase |
