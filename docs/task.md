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

## Tahap 9 — Deployment ✅
- ✅ Akun Vercel, Render, GitHub
- ✅ Backend di Vercel (Render meminta kartu): https://kubus-balok-api.vercel.app
- ✅ Frontend di Vercel: https://belajar-kubus-balok.vercel.app
- ✅ Uji ujung-ke-ujung produksi 36/36 (M21)

## Tahap 10 — GitHub & presentasi 🟡
- ✅ Repositori git + dipublikasikan ke GitHub
- ✅ Panduan presentasi ([presentation.md](presentation.md))

## Backlog (setelah demo)
- Halaman guru (rekap nilai di aplikasi)
- PWA / mode offline materi
- Bank soal evaluasi lebih besar (paket A/B)

## Versi 2 — Rombak & guru virtual (branch `redesign-guru-virtual`)
- ✅ Fase A: audit + rencana ([redesign-audit.md](redesign-audit.md)); cadangan MVP: tag `v1.0-mvp`, branch `mvp-backup`
- ✅ Fase B: desain v2 + animasi Motion (diuji E2E)
- ✅ Fase C: karakter Bu Sari (SVG, 6 ekspresi, 7 pose)
- ✅ Fase D: kelas bersegmen + papan tulis + kontrol (vitest + E2E)
- 🟡 Fase E: suara Web Speech API — diuji dengan mikrofon tiruan; ⬜ uji di HP fisik
- ✅ Fase F: tutor curated + Claude opsional (pytest; Claude hanya dengan client tiruan)
- 🟡 Fase G: integrasi & dokumentasi selesai; ⬜ push branch + deploy pratinjau; ⬜ gabung ke `main` setelah disetujui

## Versi 3 — Redesign mengikuti papan desain (branch `redesign-v3`)
- ✅ Audit + pemetaan panel ([redesign-v3-audit.md](redesign-v3-audit.md)); cadangan tag `v2.1-guru-virtual`
- ✅ Halaman awal, beranda (6 menu, poin), laci menu, navigasi bawah
- ✅ Materi per slide + guru; Video Pembelajaran (baru); Interaksi guru (foto + mikrofon besar)
- ✅ Visualisasi (Putar/Jaring-jaring/Mode 2D/layar penuh), Latihan, Evaluasi, Hasil, Petunjuk
- ✅ Profil & lencana (baru), Pengaturan (baru: suara, kecepatan, tampilan guru, 2D, kurangi animasi)
- ✅ Karakter guru (2 tampilan) & siswa sebagai aset terpisah
- ✅ Tes: pytest 71, vitest 49, E2E 36 + 33 + 32
- ⬜ Uji HP Android fisik · ⬜ gabung ke `main` & deploy setelah disetujui

## Versi 3.1 — Aset karakter baru
- ✅ Hapus total aset karakter lama; guru & siswa digambar ulang dari nol (`features/characters/`)
- ✅ Galeri karakter `/karakter`; semua halaman memakai aset baru
- ⬜ Uji HP Android fisik · ⬜ gabung ke `main` & deploy setelah disetujui
