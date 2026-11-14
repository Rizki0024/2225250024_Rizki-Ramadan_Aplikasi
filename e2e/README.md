# Uji ujung-ke-ujung (Playwright)

Prasyarat: backend **mode lokal dengan data bersih** di `http://localhost:8000` dan frontend di `http://localhost:5173`.

```bash
# terminal 1 (folder backend) — data bersih, tanpa Supabase/AI
SUPABASE_URL= SUPABASE_SECRET_KEY= ANTHROPIC_API_KEY= LOCAL_DATA_DIR=.localdata-e2e uvicorn app.main:app --port 8000
# terminal 2 (folder frontend)
npm run dev
# terminal 3 (folder e2e)
npm install && npx playwright install chromium
mkdir -p shots && npm run legacy   # 36 cek fitur v1 (jalankan pertama pada data bersih)
npm run v2                          # 33 cek fitur v2 (kelas guru, suara tiruan, animasi)
npm run v3                          # 33 cek fitur v3 (menu, profil, pengaturan, slide materi, video)
npm run rig                         # 9 cek mesin rig karakter raster (gambar uji dibangkitkan kanvas)
```

`v2.e2e.mjs` memakai **SpeechRecognition tiruan**, karena browser otomatis tidak memiliki mikrofon. Uji dengan mikrofon sungguhan dilakukan manual di HP (lihat `docs/testing.md`).
