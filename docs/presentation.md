# Panduan Presentasi (± 10–15 menit)

## Persiapan (H-1 dan 10 menit sebelum)
- [ ] Buka https://kubus-balok-api.vercel.app/api/health → harus `"storage":"supabase"`.
- [ ] Buka dashboard Supabase (proyek gratis dijeda bila 7 hari tidak aktif).
- [ ] Login sekali dengan akun demo (mis. KB-001) di laptop dan HP.
- [ ] Siapkan tab: aplikasi (https://belajar-kubus-balok.vercel.app), Supabase Table Editor (`quiz_attempts`), GitHub repo, `docs/`.
- [ ] Cadangan bila internet bermasalah: jalankan versi lokal (lihat README) dan siapkan screenshot.
- [ ] Hubungkan HP ke proyektor / gunakan *screen mirroring*, atau tunjukkan HP langsung.

## Alur presentasi

| Menit | Bagian | Yang ditunjukkan / dikatakan |
|---|---|---|
| 0–2 | Latar belakang | Hasil wawancara 1 siswa kelas IX (bukan generalisasi): sulit mengingat/memilih rumus, salah hitung, soal cerita sulit, butuh langkah demi langkah, tampilan sederhana |
| 2–3 | Tujuan & pendekatan | Mathematical Literacy (Formulate–Employ–Interpret) + Cognitive Load (intrinsik, ekstrinsik, germane) |
| 3–4 | Arsitektur | Diagram di `docs/architecture.md`: React/Vercel → FastAPI/Vercel → Supabase; tidak ada kunci di frontend |
| 4–6 | Demo login & materi | Login KB-001 + PIN salah (pesan galat) → materi Kubus: penurunan rumus, contoh soal dibuka bertahap |
| 6–8 | Demo visualisasi | Putar balok, ubah p/l/t → luas tiap warna berubah, buka jaring-jaring; tunjukkan mode 2D |
| 8–10 | Demo latihan | Jawab salah dengan sengaja (pilih volume) → umpan balik "Itu rumus volume", pembahasan; isi "abc" → validasi |
| 10–12 | Demo evaluasi | Timer, pindah soal, muat ulang halaman (jawaban tetap), kumpulkan → nilai + pembahasan |
| 12–13 | Data online | Supabase: baris baru di `quiz_attempts` / view `rekap_nilai`; jelaskan RLS |
| 13–15 | Pengujian & penutup | `docs/testing.md`: hasil uji otomatis & manual; keterbatasan & rencana pengembangan |

## Menghubungkan desain dengan teori (contoh kalimat)
- **Intrinsic load**: "Materi diurutkan prasyarat → kubus → balok → soal cerita; kubus dulu karena semua sisinya sama."
- **Extraneous load**: "Gambar diletakkan di samping penjelasan, warnanya hanya 3 dan bermakna: biru p×l, merah muda p×t, hijau l×t."
- **Germane load**: "Pembahasan dibuka langkah demi langkah dan umpan balik menjelaskan *mengapa* jawaban salah."
- **Formulate/Employ/Interpret**: "Setiap soal evaluasi diberi label prosesnya; soal akuarium tanpa tutup dan kaleng cat melatih Interpret."

## Pertanyaan yang mungkin muncul
| Pertanyaan | Jawaban singkat |
|---|---|
| Mengapa login tanpa email? | Siswa SMP belum tentu punya email; guru membagikan kode + PIN. PIN di-hash bcrypt dan dibatasi 5 percobaan. |
| Bagaimana siswa tidak bisa melihat kunci jawaban? | Kunci hanya di server/database (tabel `questions` tertutup RLS); browser baru menerima pembahasan setelah mengumpulkan. |
| Mengapa soal latihan berbeda tiap kali? | Angka dibangkitkan acak sehingga siswa berlatih prosedur, bukan menghafal jawaban. |
| Bagaimana jika internet putus saat evaluasi? | Jawaban tersimpan di perangkat; muncul tombol *Kirim ulang*. Timer dihitung server sehingga tidak bisa di-reset. |
| Apakah sudah diuji ke siswa? | Sebutkan status sebenarnya dari `docs/testing.md`. Uji coba ke siswa adalah langkah berikutnya. |

## Keterbatasan (sampaikan jujur)
- Kebutuhan disusun dari wawancara 1 siswa — perlu uji coba lebih luas.
- Belum ada halaman guru (rekap dilihat di Supabase).
- Server gratis Render perlu waktu menyala setelah tidak aktif.
