# Dokumentasi REST API

Base URL: lokal `http://localhost:8000`, produksi `https://<nama-layanan>.onrender.com`. Dokumentasi interaktif otomatis tersedia di `/docs` (Swagger UI).

- Format: JSON, UTF-8.
- Autentikasi: header `Authorization: Bearer <token>` untuk semua endpoint bertanda 🔒.
- Pesan galat selalu berbentuk `{"detail": "<pesan Bahasa Indonesia>"}`.

| Kode | Arti |
|---|---|
| 200/201 | Berhasil |
| 400 | Permintaan tidak sesuai aturan (mis. attempt sudah dikumpulkan) |
| 401 | Token tidak ada/kedaluwarsa, atau kode/PIN salah |
| 404 | Data tidak ditemukan **atau bukan milik siswa tersebut** |
| 422 | Validasi input gagal |
| 429 | Terlalu banyak percobaan login |
| 503 | Database tidak dapat dihubungi |

## Kesehatan

### `GET /api/health`
```json
{ "status": "ok", "storage": "supabase", "time": "2026-11-13T04:00:00Z" }
```
Dipakai frontend untuk "membangunkan" server Render sebelum login.

## Autentikasi

### `POST /api/auth/login`
Request:
```json
{ "code": "kb-001", "pin": "1234" }
```
Validasi: `code` 3–20 karakter `A-Z 0-9 -` (huruf kecil diubah ke besar), `pin` 4–6 digit.

Response 200:
```json
{
  "token": "eyJhbGciOi...",
  "expires_at": "2026-11-13T12:00:00Z",
  "student": { "id": "8f0c…", "code": "KB-001", "nickname": "Elang", "class_name": "VIII-A" }
}
```
Galat: 401 `Kode siswa atau PIN salah.` · 429 `Terlalu banyak percobaan. Coba lagi dalam 5 menit.`

### `GET /api/auth/me` 🔒
Response: objek `student` seperti di atas.

## Materi

### `GET /api/materials`
Daftar ringkas, terurut `order_no`:
```json
[{ "slug": "kubus", "title": "Luas Permukaan Kubus", "shape": "kubus", "order_no": 2, "summary": "…" }]
```

### `GET /api/materials/{slug}`
Satu materi lengkap dengan `content` (daftar blok, lihat [content.md](content.md#format-blok)). 404 jika tidak ada.

## Evaluasi

### `POST /api/evaluations/start` 🔒
Membuat attempt baru atau melanjutkan attempt yang masih berjalan.

Response 200:
```json
{
  "attempt_id": "c1d2…",
  "resumed": false,
  "started_at": "2026-11-13T04:00:00Z",
  "expires_at": "2026-11-13T04:30:00Z",
  "server_time": "2026-11-13T04:00:00Z",
  "questions": [
    {
      "id": "a9…", "position": 1, "type": "mc", "process": "employ",
      "prompt": "Sebuah kubus memiliki panjang rusuk 6 cm…",
      "options": [{ "id": "B", "label": "216 cm²" }, { "id": "A", "label": "36 cm²" }],
      "unit": null
    }
  ]
}
```
**Tidak ada** `answer_key` maupun `explanation` di respons ini.

### `POST /api/evaluations/{attempt_id}/submit` 🔒
Request (soal yang tidak dijawab boleh dikirim dengan `answer: null`):
```json
{ "answers": [ { "question_id": "a9…", "answer": "B" }, { "question_id": "b7…", "answer": "1.800" } ] }
```
Aturan:
- `question_id` harus termasuk dalam attempt tersebut; duplikat ditolak (422).
- Jawaban angka diurai dengan aturan Indonesia: `4,5` → 4.5; `1.800` → 1800; `1800` → 1800. Format lain dinilai salah.
- Attempt milik siswa lain → 404. Attempt sudah dikumpulkan → 400.
- Dikirim > 2 menit setelah `expires_at` → tetap dinilai, `timed_out = true`.

Response 200:
```json
{
  "attempt_id": "c1d2…", "score": 80.0, "correct_count": 8, "wrong_count": 2,
  "total_questions": 10, "duration_seconds": 754, "timed_out": false,
  "review": [
    {
      "position": 1, "question_id": "a9…", "prompt": "…", "type": "mc", "process": "employ",
      "options": [{ "id": "B", "label": "216 cm²" }],
      "student_answer": "B", "correct_answer": "B", "correct_label": "216 cm²",
      "is_correct": true,
      "explanation": { "diketahui": ["s = 6 cm"], "ditanyakan": "…", "rumus": "L = 6 × s × s",
                       "substitusi": "L = 6 × 6 × 6", "perhitungan": ["6 × 6 = 36", "6 × 36 = 216"],
                       "jawaban": "216 cm²", "interpretasi": null }
    }
  ]
}
```

## Latihan

### `POST /api/practice/attempts` 🔒
```json
{
  "level": "kubus", "total_questions": 5, "correct_count": 4, "stars": 2, "duration_seconds": 210,
  "answers": [ { "position": 1, "prompt": "…", "answer": "216", "correct_answer": "216", "is_correct": true } ]
}
```
Validasi: `level` ∈ {`prasyarat`,`kubus`,`balok`,`soal-cerita`}; `correct_count ≤ total_questions`; jumlah `answers` = `total_questions`; jumlah `is_correct` = `correct_count`; `stars` harus sesuai aturan bintang ([question-blueprint.md](question-blueprint.md#aturan-bintang)).

Response 201: `{ "attempt_id": "…", "score": 80.0 }`

## Riwayat

### `GET /api/attempts` 🔒
Riwayat milik siswa yang login (yang sudah selesai), terbaru dahulu:
```json
[{ "id": "…", "mode": "evaluasi", "level": null, "score": 80.0, "correct_count": 8, "wrong_count": 2,
   "total_questions": 10, "stars": null, "duration_seconds": 754,
   "started_at": "…", "submitted_at": "…", "timed_out": false }]
```

### `GET /api/attempts/{attempt_id}` 🔒
Ringkasan + `review` (format sama dengan respons submit). Hanya attempt milik sendiri yang berstatus `submitted`; selain itu 404.
