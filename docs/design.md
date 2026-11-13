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
