# Aset Karakter Bu Sari (raster berlapis) — Spesifikasi & Panduan Pembuatan

Status: **aset terpasang & diuji (15 November 2026)** — 25 gambar di `frontend/public/characters/bu-sari/`. Karakter SVG cadangan (`features/characters/Teacher.jsx`) tetap ada sebagai cadangan bila manifest/aset gagal dimuat.

Acuan desain (*model sheet*): gambar karakter guru buatan pengembang (rambut cokelat panjang bergelombang, blazer krem, kemeja putih, rok biru tua, sepatu hitam). Asal: dibuat sendiri oleh pengembang dengan alat AI — **periksa syarat layanan alat AI tersebut** untuk pemakaian publik/pendidikan dan catat nama alatnya di bagian akhir dokumen ini.

## 1. Cara kerja rig (ringkas)
- Setiap **pose** = satu **gambar dasar** (PNG transparan, ukuran sama).
- Untuk animasi wajah, setiap pose punya **varian** gambar yang **identik** dengan gambar dasar kecuali area mata atau mulut (dibuat dengan *inpainting/edit sebagian*).
- Rig menampilkan gambar dasar, lalu menempelkan **area mata/mulut** dari varian (tepi dihaluskan) sesuai keadaan: berkedip, berbicara, ekspresi.
- Gerakan tubuh: napas & ayunan halus (transform), perpindahan pose dengan *cross-fade*.

## 2. Format file
| Ketentuan | Nilai |
|---|---|
| Format | PNG 32-bit dengan **latar transparan** |
| Ukuran kanvas | **1024 × 1536 px** untuk SEMUA file (setengah ke bawah boleh terpotong pinggang bila memakai versi setengah badan, tetapi ukuran kanvas tetap sama) |
| Posisi | Karakter di tengah, kaki/batas bawah menempel tepi bawah, posisi & skala **sama di semua pose** |
| Gaya | Sama persis dengan model sheet: garis halus, pewarnaan anime lembut, palet krem `#d9b48f`, putih `#f5f2ee`, biru tua `#1f2440`, cokelat rambut `#5a3420`, biru muda `#93b8f5` |
| Lokasi | `frontend/public/characters/bu-sari/` |

## 3. Daftar file (wajib = ★)
Folder per pose. Varian dibuat dari gambar dasar pose yang sama dengan inpainting area mata atau mulut saja.

| Pose (folder) | Dipakai untuk | base.png | eyes-closed | eyes-half | eyes-happy | eyes-up | mouth-open | mouth-wide | mouth-o | mouth-smile |
|---|---|---|---|---|---|---|---|---|---|---|
| `explain` | diam, menjelaskan, berbicara | ★ | ★ | ○ | ★ | ○ | ★ | ★ | ★ | ★ |
| `point` | menunjuk papan (tongkat) | ★ | ★ | | | | ★ | | | |
| `wave` | menyambut | ★ | ★ | | | | ★ | | | ★ |
| `listen` | mendengarkan (tangan dekat telinga / kepala sedikit miring) | ★ | ★ | | | | | | | |
| `think` | berpikir (jari di dagu) | ★ | ★ | | | ★ | | | | |
| `appreciate` | mengapresiasi (jempol) | ★ | | | ★ | | ★ | | | ★ |
| `book` (opsional) | membaca buku | ○ | ○ | | | | | | | |

★ wajib · ○ opsional. Total wajib: **23 file**.

## 4. Alur pembuatan dengan alat AI (disarankan)
1. **Gambar dasar pose `explain`** — unggah model sheet sebagai referensi, lalu gunakan perintah (bahasa Inggris biasanya lebih akurat):
   > *Full body 2D anime illustration of the same female teacher as the reference sheet: long wavy dark-brown hair, beige blazer, white blouse, long navy pleated skirt, black loafers. Standing front view, friendly closed-mouth smile, eyes open looking at the viewer, left arm relaxed, right hand open gesturing to the side. Clean soft cel shading, same proportions and line style as reference. Transparent background, centered, 1024x1536, no text, no shadow on background.*
2. **Varian mata tertutup** — buka gambar dasar di fitur *edit/inpaint*, seleksi **hanya kedua mata**:
   > *Same character, same everything, only the eyes gently closed (blinking), keep eyebrows, eyelashes and skin identical.*
3. **Varian mulut** — seleksi **hanya mulut**, buat beberapa versi: *mouth slightly open as if speaking*, *mouth wide open saying "a"*, *rounded mouth saying "o"*, *open happy smile showing teeth*.
4. **Mata senang / melirik ke atas** — seleksi mata: *eyes closed in a happy upward arc (^ ^)*, *eyes looking up while thinking*.
5. **Pose lain** — buat gambar dasar baru dengan perintah pose (mis. *pointing at a whiteboard with a thin pointer stick in her right hand*), **posisi kepala & skala dibuat sama**; lalu ulangi langkah 2–4 seperlunya.
6. Ekspor semua sebagai PNG transparan 1024 × 1536 dengan nama sesuai tabel.

Tips: jangan mengubah ukuran/posisi saat inpainting; jika alat tidak bisa transparan, gunakan latar putih polos lalu hapus latar dengan alat penghapus latar (pastikan tepi rambut rapi).

## 5. Pemeriksaan & pemasangan
Cara cepat (otomatis): simpan gambar mentah sebagai `<folder>/<pose>/base.png|jpg` dan `<folder>/<pose>/<eyes|mouth>-<nama>.png|jpg`, lalu
```bash
pip install pillow numpy scipy
python scripts/build_character_assets.py <folder> public/characters/bu-sari
```
Skrip menghapus latar putih (JPG), membuat topeng per piksel untuk varian (`"mask": "baked"`, hanya piksel yang berubah), menghitung kotak area, dan menulis `manifest.json` (termasuk `frame` kepala–pinggang agar proporsi sama dengan tata letak halaman).

Cara manual:
```bash
# salin file ke frontend/public/characters/bu-sari/<pose>/...
cd frontend
node scripts/check-character-assets.mjs     # cek nama, ukuran 1024x1536, transparansi
npm run dev                                  # buka http://localhost:5173/karakter/rig
```
Di halaman **Penyetel Rig** (`/karakter/rig`): pilih pose, atur kotak area mata & mulut sampai pas, uji kedip/bicara, lalu salin JSON ke `manifest.json`. Setelah galeri `/karakter` dan semua tes lulus, karakter SVG lama baru dihapus.

## 6. Animasi yang disediakan rig
| Keadaan | Implementasi |
|---|---|
| Idle | napas (skala vertikal ±0,8%) + ayunan badan halus |
| Berkedip | acak tiap 2,8–6 dtk: setengah → tertutup → setengah (±160 ms) |
| Berbicara | mulut berganti bentuk tiap kata (*boundary event* Web Speech API); vokal kata menentukan bentuk: a → `wide`, o/u → `o`, e/i → `open`; tanpa event → ritme 140 ms |
| Mendengarkan | pose `listen` |
| Berpikir | pose `think` + mata `eyes-up` |
| Menunjuk papan | pose `point` |
| Mengapresiasi | pose `appreciate` + mata `eyes-happy` + mulut `mouth-smile` |
| Perpindahan pose | *cross-fade* 250 ms |

## 7. Keterbatasan (jujur)
- Rambut, kepala, dan lengan tidak dapat digerakkan terpisah karena gambar AI tidak berlapis; gerakannya berupa perpindahan pose. Jika kelak tersedia PSD berlapis dari ilustrator, manifest mendukung lapisan tambahan (titik putar) tanpa mengubah halaman.
- Sinkron bibir per kata, bukan per fonem; browser tidak memberi data volume suara.

## 8. Catatan sumber aset
- Alat AI yang dipakai: _(isi oleh pengembang)_
- Pemetaan file: `explain` (base, eyes-closed/half/happy, mouth-open/wide/o/smile), `point` (base, eyes-closed, mouth-open/smile), `wave` (base, eyes-closed, mouth-open/smile), `listen` (base, eyes-closed), `think` (base, eyes-closed, eyes-up), `appreciate` (base, eyes-happy, mouth-open/smile).
- Catatan: varian `think/eyes-up` hanya sedikit berbeda dari base (mata menatap lurus), belum benar-benar melirik ke atas.
- Tanggal pembuatan: _(isi)_
- Syarat layanan sudah diperiksa: ☐

## 9. Status implementasi (15 November 2026)
| Bagian | Status |
|---|---|
| Spesifikasi aset & panduan AI (dokumen ini) | ✅ |
| Mesin rig `features/characters/rig/` (CharacterRig, rigLogic, rig.css) | ✅ diuji: vitest 5 tes + E2E `e2e/rig.e2e.mjs` 9/9 memakai gambar uji kanvas |
| Pembungkus `features/characters/BuSari.jsx` (rig raster bila aset valid, cadangan SVG bila tidak) | ✅ semua halaman sudah memakainya |
| Sinkron bibir per kata (`kb:speech` dari `voice/speech.js`) | ✅ diuji dengan sinyal tiruan & aset asli; ⬜ belum diuji dengan suara id-ID sungguhan |
| Penyetel Rig `/karakter/rig` & pemeriksa `scripts/check-character-assets.mjs` | ✅ |
| Aset Bu Sari dari model sheet | ✅ 25 file (6 pose), lolos pemeriksa 35/0; E2E rig 10/10 |
| Penghapusan karakter SVG lama | ⬜ menunggu keputusan pengembang (aset raster sudah lolos semua tes; SVG kini hanya cadangan) |
