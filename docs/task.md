# Daftar Tugas

Status: ✅ selesai & diuji · 🟡 selesai sebagian · ⬜ belum · 👤 perlu tindakan pengembang (akun/kredensial)

Pembaruan terakhir: 13 November 2026

## Tahap 1 — Interview kebutuhan ✅
- ✅ Mekanisme kode siswa: kode + PIN dari guru, dikelola lewat Supabase
- ✅ Penggunaan Android: browser HP dengan internet normal, fallback 2D
- ✅ Fitur tambahan: timer evaluasi, soal acak, jaring-jaring 3D, bintang latihan
- ✅ Evaluasi 10 soal / 30 menit; latihan & evaluasi disimpan

## Tahap 2 — Dokumen perencanaan ✅
- ✅ prd, architecture, design, api, database, content, question-blueprint, testing, deployment, task, presentation
- ✅ README.md, agents.md, .env.example, .gitignore, render.yaml

## Tahap 3–4 — Materi & kisi-kisi soal ✅
- ✅ Kisi-kisi materi ([content.md](content.md)) dan `materials.json` (4 materi)
- ✅ Kisi-kisi soal ([question-blueprint.md](question-blueprint.md)) dan `questions.json` (10 soal, kunci diverifikasi oleh tes)
- ✅ Generator soal latihan acak (4 level) + umpan balik diagnostik

## Tahap 5 — Desain & database ✅ / 🟡
- ✅ Token desain & wireframe ([design.md](design.md)) diterapkan di CSS
- ✅ `supabase/schema.sql` + RLS + `seed_students.sql` dijalankan di Supabase

## Tahap 6 — Frontend & backend ✅
- ✅ Backend FastAPI: auth, materi, evaluasi, latihan, riwayat, mode lokal & Supabase
- ✅ Frontend: semua halaman P0 + fitur P1

## Tahap 7 — Integrasi Three.js & Supabase ✅
- ✅ Visualisasi 3D + jaring-jaring + fallback 2D (diuji di Chromium)
- ✅ Proyek Supabase dibuat, skema & data terisi (4 materi, 10 soal, 3 siswa)
- ✅ Uji backend dengan Supabase sungguhan 17/17 (M13, M19)

## Tahap 8 — Pengujian 🟡
- ✅ Backend pytest 42/42 · Frontend Vitest 25/25 · Build produksi
- ✅ E2E Playwright (emulasi HP & laptop) 36/36 + uji server mati
- ⬜ Uji di HP Android fisik (M15)

## Tahap 9 — Deployment ⬜
- ✅ Akun Vercel, Render, GitHub
- ⬜ Deploy backend ke Render, frontend ke Vercel, uji ujung-ke-ujung (M21)

## Tahap 10 — GitHub & presentasi 🟡
- ✅ Repositori git + dipublikasikan ke GitHub
- ✅ Panduan presentasi ([presentation.md](presentation.md))

## Backlog (setelah demo)
- Halaman guru (rekap nilai di aplikasi)
- PWA / mode offline materi
- Bank soal evaluasi lebih besar (paket A/B)
