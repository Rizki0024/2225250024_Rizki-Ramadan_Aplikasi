# Panduan Animasi

Pustaka: **Motion** (`motion/react`, sebelumnya Framer Motion) + CSS keyframes untuk karakter.

## Prinsip
1. Animasi harus **membantu pemahaman** (fokus perhatian, umpan balik), bukan dekorasi.
2. Hanya `transform` dan `opacity` agar ringan di HP.
3. Durasi pendek: transisi 0,2–0,35 dtk; progres 0,7 dtk.
4. Tidak ada efek berkedip atau gerakan terus-menerus di area teks.
5. **Kurangi gerakan** dihormati: `<MotionConfig reducedMotion="user">` di `App.jsx` dan media query `prefers-reduced-motion` di CSS (karakter berhenti bergerak). Diuji otomatis (B4).

## Komponen (`src/components/motion.jsx`)
| Komponen | Dipakai di | Efek |
|---|---|---|
| `PageMotion` | semua halaman | masuk: naik 10 px + memudar; keluar: memudar (`AnimatePresence mode="wait"`) |
| `Stagger` / `StaggerItem` | beranda, daftar | anak muncul berurutan (jeda 40 ms) |
| `CardLink` | kartu menu & daftar | hover naik 3 px, tap mengecil 3% (pegas) |
| `FeedbackMotion` | latihan, cek pemahaman | benar: "pop" lembut; salah: goyang kecil 0,35 dtk |
| `AnimatedStars` | akhir latihan, hasil | bintang muncul satu per satu dengan pegas |
| `AnimatedBar` | progres beranda & kelas | bilah terisi 0,7 dtk |
| Tab bar `layoutId` | navigasi bawah | latar tab aktif berpindah halus |

## Karakter & papan tulis
- `teacher.css`: napas 3,2 dtk, kedip 4,2 dtk, mulut 0,22 dtk saat berbicara, lambaian, gerak tangan menjelaskan, titik berpikir, gelombang mendengar.
- Perubahan pose memakai transisi `transform` 0,45 dtk.
- Papan tulis: butir baru muncul (naik + memudar 0,3 dtk); butir aktif diberi sorotan dan ikon 👉.

## Loader
Kubus kecil berputar dan berubah warna (`.loader-cube`), menggantikan spinner biasa.
