# Desain Antarmuka

## 1. Prinsip

1. **Langsung ke inti** — setiap layar punya satu tujuan dan satu tombol utama.
2. **Teks sedikit** — kalimat pendek, poin, rumus dalam kotak tersendiri.
3. **Gambar dekat penjelasan** — di HP gambar berada tepat di atas teksnya; di laptop gambar dan teks berdampingan (menghindari *split-attention*).
4. **Warna bermakna** — warna pastel hanya dipakai untuk membedakan pasangan sisi dan status (benar/salah), bukan dekorasi.
5. **Tanpa animasi berlebihan** — animasi hanya pada jaring-jaring (dikendalikan siswa) dan transisi singkat ≤ 200 ms.

## 2. Token desain

| Token | Nilai | Penggunaan |
|---|---|---|
| `--blue-700` | `#1d4ed8` | Tombol utama, judul |
| `--blue-600` | `#2563eb` | Tautan, fokus |
| `--blue-50` | `#eff6ff` | Latar kartu ringan |
| `--bg` | `#f7f9fc` | Latar halaman |
| `--surface` | `#ffffff` | Kartu |
| `--ink` | `#1e293b` | Teks utama |
| `--muted` | `#64748b` | Teks sekunder |
| `--face-a` | `#93c5fd` (biru pastel) | Sisi p × l (alas & tutup) |
| `--face-b` | `#f9a8d4` (merah muda pastel) | Sisi p × t (depan & belakang) |
| `--face-c` | `#86efac` (hijau pastel) | Sisi l × t (kiri & kanan) |
| `--ok` / `--ok-bg` | `#15803d` / `#dcfce7` | Jawaban benar |
| `--bad` / `--bad-bg` | `#b91c1c` / `#fee2e2` | Jawaban salah |
| `--warn-bg` | `#fef3c7` | Banner offline, tips |
| Radius | 14 px kartu, 10 px tombol | |
| Huruf | `"Nunito", system-ui, sans-serif`; dasar 16 px (HP) – 17 px (laptop) | Bulat, ramah, mudah dibaca |
| Target sentuh | ≥ 44 × 44 px | Semua tombol & opsi |

Warna sisi **selalu disertai teks** ("alas & tutup: p × l") sehingga tetap dapat dipahami oleh siswa dengan buta warna.

## 3. Tata letak

- Lebar konten maksimum 960 px, padding samping 16 px.
- **Header** tetap: tombol kembali (←), judul halaman, nama samaran + tombol keluar.
- **Beranda**: grid kartu menu — 2 kolom di HP, 3 kolom di laptop.
- Breakpoint: `< 640 px` (HP), `≥ 640 px` (tablet), `≥ 960 px` (laptop: gambar dan teks berdampingan).

## 4. Wireframe

### Halaman awal
```
┌─────────────────────────────┐
│      [ilustrasi kubus+balok]│
│   Belajar Kubus dan Balok   │
│ Luas permukaan · Kelas VIII │
│      [   Mulai Belajar   ]  │
│ oleh Rizki Ramadan (…0024)  │
└─────────────────────────────┘
```

### Login
```
┌─────────────────────────────┐
│ ← Masuk                     │
│ Kode siswa  [ KB-001      ] │
│ PIN         [ ••••        ] │
│ (pesan galat merah di sini) │
│      [      Masuk       ]   │
│ Belum punya kode? Tanya guru│
└─────────────────────────────┘
```

### Beranda
```
┌─────────────────────────────┐
│ Halo, Elang 👋     [Keluar] │
│ Lanjutkan: Materi Kubus  →  │
│ ┌──────────┐ ┌──────────┐   │
│ │📘 Materi  │ │🧊 3D      │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │✏️ Latihan │ │📝 Evaluasi│   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │📊 Hasil   │ │❓ Petunjuk│   │
│ └──────────┘ └──────────┘   │
└─────────────────────────────┘
```
(Ikon digambar sebagai SVG sederhana, emoji di atas hanya ilustrasi wireframe.)

### Soal (latihan & evaluasi)
```
┌─────────────────────────────┐
│ Soal 3 dari 5   ▓▓▓░░  ⏱29:10│
│ [Formulate]                 │
│ Teks soal singkat…          │
│ ( ) A. …                    │
│ ( ) B. …     atau [ 216 ] cm²│
│ [   Periksa / Berikutnya  ] │
│ ✔ Benar! / ✘ pesan diagnosa │
│ ▸ Pembahasan langkah demi…  │
└─────────────────────────────┘
```

### Visualisasi
```
┌───────────────┬─────────────┐
│               │ Kubus | Balok│
│   kanvas 3D   │ p [—●—] 8   │
│ (seret=putar) │ l [—●—] 5   │
│               │ t [—●—] 3   │
│               │ ■ p×l = 40 ×2│
│               │ ■ p×t = 24 ×2│
│               │ ■ l×t = 15 ×2│
│ [Buka jaring] │ L = 158 cm² │
└───────────────┴─────────────┘
   (HP: kanvas di atas, panel di bawah)
```

## 5. Komponen

| Komponen | Keadaan |
|---|---|
| Tombol | utama (biru), sekunder (garis), nonaktif, memuat (teks "Memproses…") |
| Opsi PG | normal, dipilih, benar (hijau + ✔), salah (merah + ✘) |
| Input angka | `inputMode="decimal"` → keyboard angka di Android; satuan di sebelah kanan |
| Banner | offline (kuning), galat server (merah muda + "Coba lagi") |
| Kartu menu | ikon, judul, keterangan 1 baris, status (mis. ★★☆) |

## 6. Ikon

SVG garis sederhana (stroke 2 px) dibuat sendiri: buku (materi), kubus (3D), pensil (latihan), clipboard (evaluasi), grafik batang (hasil), tanda tanya (petunjuk).

## 7. Desain v2

Token baru di `global.css`: `--pastel-blue #dce8ff`, `--pastel-lilac #ebe5ff`, `--pastel-mint #d7f5e8`, `--pastel-peach #ffe6d5`, `--pastel-yellow #fff1bf`, `--pastel-pink #ffe0ef`; radius 26/18/12 px; tombol berbentuk pil.

- **Navigasi**: tab bar mengambang (Beranda, Materi, Guru, Latihan, Hasil). Disembunyikan pada halaman fokus (latihan, evaluasi, kelas) untuk menekan beban kognitif.
- **Beranda**: sapaan + avatar inisial → kartu hero "Belajar Bersama Guru" → progres belajar → kartu aktivitas berwarna → menu lainnya.
- **Kelas**: papan tulis (kiri) + Bu Sari dan gelembung subtitle (kanan) di laptop; di HP papan di atas dan Bu Sari di sampingnya dengan subtitle. Kontrol berupa bilah pil gelap; tombol **Tanya** berwarna merah muda agar mudah ditemukan.
- Animasi: lihat [animation-guide.md](animation-guide.md).

## 8. Desain v2.1 — mengikuti gambar referensi (14 November 2026)
Keputusan pengembang: **warna utama tetap biru**, aksen ungu (`--violet-*`) dan stabilo kuning (`--hl-yellow`). Ilustrasi berupa **SVG bergaya kartun-3D buatan sendiri** (gradasi, kilau, bayangan); ilustrasi pada gambar referensi tidak disalin.

| Elemen referensi | Implementasi |
|---|---|
| Layar sambutan dengan judul miring + stabilo, karakter besar, tombol geser | `Landing.jsx` (`.welcome`, `.swipe-btn`), ilustrasi kubus/buku/pensil melayang |
| Kartu hero ungu dengan ilustrasi | Beranda: "Belajar Bersama Guru Virtual" + Bu Sari bersorak + piala |
| Kartu aktivitas berilustrasi besar + angka besar + tombol panah | Materi (buku), Latihan (pensil), Evaluasi (papan klip) |
| Tab bar hitam dengan ikon bulat | Tab aktif melebar menampilkan label |
| "Learning Plan": kartu statistik, slider progres, grafik batang mingguan | Hasil Belajar → "Rencana belajar" (`WeekChart.jsx`) |

Grafik mingguan: satu seri (aktivitas latihan + evaluasi per hari), satu warna `#2563eb` (kontras ≥ 3:1). Hari ini ditandai **label tebal + angka**, bukan warna berbeda, karena dua biru yang diuji gagal batas pembeda penglihatan normal (ΔE 13,9 < 15). Grafik dilengkapi tooltip sentuh/fokus dan tabel tersembunyi untuk pembaca layar.

Ilustrasi: `frontend/src/features/illustrations/Illustrations.jsx` (`BookArt`, `ClockArt`, `TrophyArt`, `CubeArt`, `ClipboardArt`, `PencilArt`). Bisa diganti dengan gambar berlisensi milik pengembang kapan saja.

## 9. Desain v3 — mengikuti papan desain referensi (14 November 2026)
Sumber visual: papan desain 14 panel dari pengembang (Halaman Awal, Beranda, Materi, Video, Interaksi Guru, Visualisasi 3D, Latihan, Evaluasi, Hasil, Petunjuk, Profil, Menu Utama). Gambar dipakai sebagai **panduan**, bukan latar; setiap panel dibangun dari komponen React.

- **Latar**: gradasi biru (`#2f62f2 → #7cabff`) dengan cahaya pastel; konten di kartu putih radius 24 px. File gaya: `frontend/src/styles/v3.css` (dimuat setelah `global.css`).
- **Logo**: "Belajar" putih + "Kubus dan Balok" kuning, bertepi biru tua (`.logo-title`).
- **Tombol 3D**: biru (aksi utama), kuning (`.btn.yellow`, ajakan besar: Mulai Belajar, Ajukan Pertanyaan, Tonton video), putih (sekunder).
- **Navigasi**: navigasi bawah putih (Beranda · Profil · Pengaturan) + laci menu berisi semua menu; disembunyikan di halaman fokus (materi, latihan, evaluasi, kelas, video).
- **Karakter** (aset terpisah): `TeacherAvatar` dengan tampilan `rambut` (bawaan, sesuai referensi) dan `kerudung`; `StudentAvatar` untuk halaman awal, laci, dan profil.
- **Ilustrasi** tambahan: hadiah, jam pasir, bintang maskot, lencana, stik permainan, grafik, lampu (`Illustrations.jsx`); `pickArt()` memilih ilustrasi sesuai konteks soal.

## 10. Aset karakter v3.1 — digambar ulang dari nol (15 November 2026)
Atas permintaan pengembang, **seluruh kode/aset karakter lama dihapus** (`features/teacher/`, `features/student/`, termasuk pilihan "berkerudung") dan diganti aset baru yang ditulis dari baris pertama di `frontend/src/features/characters/`:

| File | Isi |
|---|---|
| `parts.jsx` | Tangan berjari (terbuka, menunjuk, santai, jempol), lengan bersendi bahu–siku–pergelangan, mata ilustrasi (iris bergradasi, dua kilau, garis kelopak, bulu mata) |
| `Teacher.jsx` | Bu Sari setengah badan: wajah oval, leher tersambung, rambut cokelat panjang bergelombang (lapisan belakang, poni menyamping, helai di depan bahu), blazer cokelat muda berkerah + kemeja putih. 6 ekspresi × 7 pose, `facing="left"` untuk dicerminkan |
| `Student.jsx` | Siswa laki-laki: rambut berjambul, kemeja putih berkerah, dasi biru, tali ransel; pose jempol/melambai/diam |
| `characters.css` | Napas, kedip, mulut berbicara, lambaian, gerak tangan, ayunan rambut; dimatikan oleh "kurangi animasi" |

Galeri semua pose & ekspresi: rute `/karakter` (untuk pemeriksaan visual dan presentasi).
Catatan jujur: karakter berupa vektor SVG dari kode agar dapat dianimasikan (berkedip, berbicara, berganti pose); gayanya mengikuti referensi, tetapi tidak identik dengan ilustrasi raster pada papan desain.
