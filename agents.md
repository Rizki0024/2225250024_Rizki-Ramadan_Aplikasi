# agents.md — Panduan untuk AI Coding Agent

Dokumen ini ditujukan bagi agen AI (atau pengembang baru) yang melanjutkan proyek **Belajar Kubus dan Balok**.

## Konteks
- Aplikasi web pembelajaran luas permukaan kubus & balok untuk siswa SMP kelas VIII. Antarmuka **Bahasa Indonesia**.
- Monorepo: `frontend/` (React + Vite + React Three Fiber), `backend/` (FastAPI), `supabase/` (SQL), `docs/` (perencanaan).
- Baca dahulu: `docs/prd.md`, `docs/architecture.md`, `docs/task.md`.

## Aturan wajib
1. **Jangan pernah** menaruh `SUPABASE_SECRET_KEY`, `APP_JWT_SECRET`, atau kunci Supabase apa pun di `frontend/`. Frontend hanya mengenal `VITE_API_URL`.
2. Jangan commit file `.env`. Tambahkan variabel baru ke `.env.example` beserta penjelasannya.
3. Kunci jawaban evaluasi (`answer_key`, `explanation`) **tidak boleh** dikirim ke browser sebelum evaluasi dikumpulkan.
4. Setiap endpoint data siswa wajib memakai dependensi `get_current_student` dan memfilter dengan `student.id` dari token.
5. Aturan parser angka harus identik di `frontend/src/utils/number.js` dan `backend/app/services/numbers.py`; ubah keduanya beserta tesnya.
6. Konten materi dan soal evaluasi hanya diedit di `backend/app/data/*.json`, lalu jalankan `scripts/seed_supabase.py`.
7. Jaga beban kognitif: teks pendek, satu konsep per blok, warna sisi konsisten (biru p×l, merah muda p×t, hijau l×t).
8. Jangan menandai tugas selesai di `docs/task.md` sebelum diuji; catat hasil di `docs/testing.md`.

## Perintah
```bash
# backend
cd backend && python -m venv .venv && .venv/Scripts/activate   # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements-dev.txt
uvicorn app.main:app --reload          # http://localhost:8000/docs
python -m pytest

# frontend
cd frontend && npm install
npm run dev                            # http://localhost:5173
npm test
npm run build
```

## Konvensi kode
- Python: type hints, Pydantic v2 untuk validasi, pesan galat Bahasa Indonesia di `HTTPException.detail`.
- React: komponen fungsi + hooks, satu halaman per file di `src/pages/`, CSS biasa di `src/styles/` dengan variabel dari `design.md`.
- Nama variabel/kode dalam bahasa Inggris; teks yang dilihat pengguna dalam Bahasa Indonesia.

## Tambahan v2 (guru virtual)
9. Naskah kelas (`backend/app/data/lessons.json`) dan bank tanya-jawab (`tutor_kb.json`) tidak boleh memuat angka soal evaluasi (diuji `test_lessons_do_not_leak_evaluation_items`).
10. `ANTHROPIC_API_KEY` hanya di backend. Mode bawaan tanpa kunci (curated) harus selalu berfungsi; kegagalan AI harus kembali ke curated.
11. Guru virtual wajib memberi tahu bahwa ia program komputer, menolak topik di luar materi, dan tidak menyimpan audio.
12. Animasi hanya `transform`/`opacity` dan harus menghormati `prefers-reduced-motion`.
13. Logika pemutar ada di `features/classroom/player.js` (fungsi murni). Ubah beserta `player.test.js`.
