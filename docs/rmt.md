# Metode Pembelajaran: Rigorous Mathematical Thinking (RMT)

Acuan: Kinard, J. T., & Kozulin, A. *Rigorous Mathematical Thinking: Conceptual Formation in the Mathematics Classroom* (ringkasan Bab 1–6 dari pengembang).
RMT memadukan **alat psikologis** (Vygotsky) dengan **pengalaman belajar termediasi / MLE** (Feuerstein). Tabel di bawah menunjukkan di mana setiap unsur RMT diterapkan dalam aplikasi.

## 1. Pemetaan teori → fitur

| Unsur RMT | Penerapan di aplikasi | Lokasi |
|---|---|---|
| **MLE: Intensionalitas & resiprositas** | Setiap pelajaran dibuka dengan tujuan; Bu Sari mengajak siswa menjawab (cek pemahaman, tombol Tanya, "sudah paham?") | Baris pembuka `pra-1`, `kub-1`, `bal-1`, `cer-1`; `check` per segmen; `AskPanel` |
| **MLE: Makna** | Manfaat nyata disebut di awal (kertas kado, kardus, cat) | Blok "Tujuan & manfaat" di awal setiap materi; baris pembuka kelas |
| **MLE: Transendensi** | Rumus digeneralisasi ke semua kubus/balok; kaitan kubus = balok dengan p = l = t | Baris penutup `kub-3`, `bal-3`; tip materi |
| **Fungsi kognitif — Input** | Mengamati dan menulis yang diketahui dengan teliti (p, l, t, s, satuan) | Segmen ber-label **Fase Input**; tahap 1 soal evaluasi |
| **Fungsi kognitif — Elaborasi** | Membandingkan, hubungan bagian–keseluruhan (6 sisi, 3 pasang), memilih rumus | Segmen **Fase Elaborasi**: jaring-jaring, pasangan sisi, membandingkan kotak |
| **Fungsi kognitif — Output** | Menyatakan jawaban dengan bahasa & satuan tepat, menghindari coba-coba | Segmen **Fase Output**; tahap "menyatakan jawaban sesuai konteks" |
| **Alat psikologis** | Jaring-jaring, tabel pasangan sisi berwarna (biru p×l, merah muda p×t, hijau l×t), rumus, bahasa matematika, visual 3D | Papan tulis, `Visualisasi 3D`, materi |
| **Konsep sehari-hari → konsep ilmiah** | Dadu/kotak kado → kubus; kardus → balok; luas kertas → luas permukaan | `kub-1`, `bal-1`, contoh soal |
| **Pertanyaan termediasi & ZPD** | Bu Sari bertanya sebelum memberi tahu ("Coba pikirkan dulu …"); petunjuk bertahap; tombol "jelaskan lebih sederhana" | Baris berpose *think* di `kub-2`, `kub-3`, `bal-2`, `bal-3`, `cer-5`, `cer-6`; *system prompt* AI |
| **Learning Activity: analisis tugas → perencanaan → refleksi** | Empat kemampuan soal cerita; tahap-tahap evaluasi; "Refleksi: apa saja langkah kita tadi?" | `cer-1`, penutup `kub-4`/`bal-4`, blok "Periksa dirimu (refleksi)" di akhir materi |
| **Validasi (siklus Representasi–Manipulasi–Validasi)** | Memeriksa kewajaran hasil dan pekerjaan teman | Segmen baru `cer-6`, contoh materi, level latihan Literasi, evaluasi ML-4 |
| **Asesmen dinamis (petunjuk bertahap)** | Latihan memberi umpan balik diagnostik per jawaban; Tanya Bu Sari saat belajar | Level latihan, `feedbackFor` |
| **Rigor: ketepatan & presisi** | Penilaian per tahap (proses, bukan hanya jawaban akhir), carry-forward untuk menghargai proses yang benar | `services/staged.py` |

## 2. Fase pada setiap segmen kelas
Setiap segmen di `lessons.json` punya `rmt: {phase, focus}` dan ditampilkan sebagai label kecil "Fase … · …" di halaman Kelas dan daftar segmen Video.

| Pelajaran | Segmen → fase |
|---|---|
| Prasyarat | pra-1 Input · pra-2 Elaborasi |
| Kubus | kub-1 Input · kub-2 Elaborasi · kub-3 Elaborasi · kub-4 Output |
| Balok | bal-1 Input · bal-2 Elaborasi · bal-3 Elaborasi · bal-4 Output |
| Soal cerita | cer-1 Input · cer-2 Elaborasi · cer-3 Output · cer-4 Elaborasi · **cer-5 Elaborasi (Reasoning)** · **cer-6 Refleksi (validasi)** |

## 3. Guru virtual (AI)
*System prompt* `backend/app/services/tutor/claude_provider.py` menuliskan prinsip di atas sebagai cara mengajar Bu Sari: satu pertanyaan pemandu lebih baik daripada langsung memberi jawaban, petunjuk bertahap, ajakan memeriksa satuan dan kewajaran hasil, serta kaitan ke empat indikator literasi. Tes `test_rmt_pedagogy_in_system_prompt` menjaga agar unsur-unsur ini tidak hilang.

## 4. Batasan (jujur)
- Ini adalah adaptasi prinsip RMT ke aplikasi mandiri, bukan intervensi RMT penuh dengan guru terlatih seperti pada studi kasus buku (Bab 6).
- Efektivitasnya belum diukur dengan pra-tes/pasca-tes pada siswa nyata.
- Tanpa kunci AI, Bu Sari menjawab dari bank tanya-jawab yang terbatas; dialog termediasi paling terasa saat AI aktif.
