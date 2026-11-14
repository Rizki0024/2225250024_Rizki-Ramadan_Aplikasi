// Uji ujung-ke-ujung: frontend (5173) + backend lokal (8000).
import { chromium, devices } from 'playwright';

const BASE = 'http://localhost:5173';
const OUT = process.argv[2] || '.';
const results = [];
const consoleErrors = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

async function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// ---------------- HP Android (Pixel 7) ----------------
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(BASE);
await page.getByRole('heading', { name: 'Belajar Kubus dan Balok' }).waitFor();
ok('M1a Landing tampil', true);
ok('M15 Landing tanpa scroll horizontal (HP)', await noHorizontalScroll(page));
await page.screenshot({ path: `${OUT}/hp-01-landing.png` });

await page.getByRole('link', { name: 'Mulai Belajar' }).click();
await page.getByRole('button', { name: 'Masuk' }).click();
ok('M3 Kode kosong ditolak', await page.getByText('Kode siswa wajib diisi.').isVisible());
await page.fill('#code', 'kb-001');
await page.getByRole('button', { name: 'Masuk' }).click();
ok('M3 PIN kosong ditolak', await page.getByText('PIN wajib diisi.').isVisible());
await page.fill('#pin', '0000');
await page.getByRole('button', { name: 'Masuk' }).click();
await page.getByText('Kode siswa atau PIN salah.').waitFor();
ok('M2 PIN salah ditolak server', true);
await page.screenshot({ path: `${OUT}/hp-02-login-error.png` });
await page.fill('#pin', '1234');
await page.getByRole('button', { name: 'Masuk' }).click();
await page.getByRole('heading', { name: 'Halo, Elang!' }).waitFor();
ok('M1 Login benar → nama samaran tampil', true);
ok('M15 Beranda tanpa scroll horizontal', await noHorizontalScroll(page));
await page.screenshot({ path: `${OUT}/hp-03-beranda.png` });

// Navigasi semua menu
for (const [link, heading] of [['Petunjuk', 'Cara memakai aplikasi'], ['Hasil Belajar', 'Elang'], ['Evaluasi', 'Evaluasi Luas Permukaan']]) {
  await page.goto(`${BASE}/beranda`);
  await page.getByRole('link', { name: new RegExp(link) }).first().click();
  await page.getByRole('heading', { name: heading }).first().waitFor();
}
ok('M5 Navigasi menu Petunjuk/Hasil/Evaluasi', true);

// Materi
await page.goto(`${BASE}/beranda`);
await page.getByRole('link', { name: /Materi/ }).first().click();
await page.getByRole('link', { name: /Luas Permukaan Kubus/ }).click();
await page.getByRole('heading', { name: 'Luas Permukaan Kubus', level: 1 }).waitFor();
await page.getByText('L = 6 × s × s').first().waitFor();
await page.locator('canvas').first().waitFor({ timeout: 20000 });
ok('M6/M7 Materi kubus + kanvas 3D dalam materi', true);
const ex = page.locator('section', { hasText: 'Contoh 1: Kertas kado' });
await ex.getByRole('button', { name: 'Mulai pembahasan' }).click();
ok('Contoh bertahap: langkah 1 = Diketahui', await ex.getByText('Diketahui').isVisible() && !(await ex.getByText('Ditanyakan').isVisible()));
await ex.getByRole('button', { name: 'Tampilkan semua' }).click();
const parts = ['Diketahui', 'Ditanyakan', 'Rumus', 'Substitusi', 'Perhitungan', 'Jawaban', 'Interpretasi'];
let allParts = true;
for (const p of parts) allParts = allParts && await ex.locator('dt', { hasText: p }).isVisible();
ok('F6 Contoh soal memuat 7 bagian', allParts);
ok('M15 Materi tanpa scroll horizontal', await noHorizontalScroll(page));
await page.screenshot({ path: `${OUT}/hp-04-materi-kubus.png`, fullPage: true });
await page.goto(`${BASE}/materi/balok`);
await page.getByText('Alas & tutup').first().waitFor();
await page.goto(`${BASE}/materi/soal-cerita`);
await page.getByText('Formulate – Employ – Interpret').waitFor();
await page.goto(`${BASE}/materi/prasyarat`);
await page.getByText('L = p × l').first().waitFor();
ok('M6 Keempat materi terbuka', true);

// Visualisasi
await page.goto(`${BASE}/visualisasi`);
await page.locator('.canvas-box canvas').waitFor({ timeout: 20000 });
await page.waitForTimeout(800);
ok('M7 Kanvas 3D balok tampil', await page.locator('.canvas-box canvas').isVisible());
ok('M7 Rumus balok di panel', await page.getByText('L = 2 × (40 + 24 + 15) = 158 cm²').isVisible());
await page.screenshot({ path: `${OUT}/hp-05-visual-3d.png`, fullPage: true });
// rotasi dengan seret
const box = await page.locator('.canvas-box').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 30, { steps: 8 });
await page.mouse.up();
await page.locator('#dim-p').fill('10');
ok('M7 Ubah ukuran → luas diperbarui', await page.getByText('L = 2 × (50 + 30 + 15) = 190 cm²').isVisible());
await page.getByRole('button', { name: 'Buka jaring-jaring' }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/hp-06-visual-jaring.png` });
await page.getByRole('tab', { name: 'Kubus' }).click();
ok('Kubus: 6 × luas sisi', await page.getByText('L = 6 × 16 = 96 cm²').isVisible());
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/hp-07-visual-kubus-jaring.png` });
await page.getByRole('button', { name: '2D' }).click();
await page.locator('svg[aria-label*="Jaring-jaring kubus"]').waitFor();
ok('M8 Tampilan 2D tersedia', true);
await page.screenshot({ path: `${OUT}/hp-08-visual-2d.png` });
await page.getByRole('button', { name: '3D' }).click();

// Latihan
await page.goto(`${BASE}/latihan/kubus`);
let sawEmpty = false; let sawFormat = false; let sawFeedback = 0;
for (let i = 0; i < 5; i += 1) {
  await page.getByText(`Soal ${i + 1} dari 5`).waitFor();
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  if (await page.locator('.error-text').isVisible()) sawEmpty = true;
  const numeric = await page.locator('input[inputmode="decimal"]').count();
  if (numeric) {
    await page.locator('input[inputmode="decimal"]').fill('abc');
    await page.getByRole('button', { name: 'Periksa jawaban' }).click();
    if (await page.getByText('Tulis angka saja, contoh: 216 atau 4,5.').isVisible()) sawFormat = true;
    await page.locator('input[inputmode="decimal"]').fill('1.800');
  } else {
    await page.locator('.option').first().click();
  }
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  await page.locator('.feedback').waitFor();
  sawFeedback += 1;
  if (i === 0) await page.screenshot({ path: `${OUT}/hp-09-latihan-umpanbalik.png`, fullPage: true });
  await page.getByRole('button', { name: i === 4 ? 'Lihat skor' : 'Soal berikutnya' }).click();
}
ok('H Input kosong ditolak (latihan)', sawEmpty);
ok('H Format angka salah ditolak (latihan)', sawFormat);
ok('M10 Umpan balik langsung tiap soal', sawFeedback === 5);
await page.getByRole('heading', { name: 'Latihan selesai!' }).waitFor();
await page.getByText('Hasil tersimpan di Hasil Belajar.').waitFor({ timeout: 15000 });
ok('M10 Skor latihan + tersimpan online', true);
await page.screenshot({ path: `${OUT}/hp-10-latihan-skor.png`, fullPage: true });

// Evaluasi
await page.goto(`${BASE}/evaluasi`);
await page.getByRole('link', { name: 'Mulai evaluasi' }).click();
await page.getByText('Soal 1 dari 10').waitFor();
const bodyText = await page.content();
ok('M11 Tidak ada kunci/pembahasan saat mengerjakan', !/Pembahasan|Jawaban benar/.test(await page.locator('main').innerText()) && !bodyText.includes('answer_key'));
ok('F9b Timer tampil', /\d\d:\d\d/.test(await page.locator('.timer').innerText()));
// jawab soal 1 dan 2
for (let i = 0; i < 2; i += 1) {
  if (await page.locator('input[inputmode="decimal"]').count()) await page.locator('input[inputmode="decimal"]').fill('158');
  else await page.locator('.option').nth(1).click();
  await page.getByRole('button', { name: 'Berikutnya' }).click();
}
await page.screenshot({ path: `${OUT}/hp-11-evaluasi.png`, fullPage: true });
const t1 = await page.locator('.timer').innerText();
await page.reload();
await page.getByText('Melanjutkan evaluasi sebelumnya').waitFor();
const answeredAfterReload = await page.locator('.qnav button.answered').count();
ok('M12 Muat ulang: jawaban tetap ada & sesi dilanjutkan', answeredAfterReload === 2, `(terjawab=${answeredAfterReload}, timer sebelum=${t1})`);
// Offline saat mengerjakan → kirim gagal → online → kirim ulang
await page.getByRole('button', { name: 'Kumpulkan sekarang' }).click();
ok('Konfirmasi kumpulkan menyebut soal kosong', await page.getByText(/Masih ada 8 soal/).isVisible());
await ctx.setOffline(true);
await page.locator('.modal').getByRole('button', { name: 'Kumpulkan' }).click();
await page.getByText('Jawaban belum terkirim').waitFor();
ok('M17 Offline: banner + pesan gagal kirim', await page.locator('.banner.offline').isVisible());
await page.screenshot({ path: `${OUT}/hp-12-offline.png`, fullPage: true });
await ctx.setOffline(false);
await page.getByRole('button', { name: 'Kirim ulang' }).click();
await page.getByRole('heading', { name: 'Nilai Evaluasi' }).waitFor({ timeout: 15000 });
ok('M17 Kirim ulang berhasil setelah online', true);
ok('M11 Benar/salah tampil', await page.locator('.stats').innerText().then((t) => /benar/.test(t) && /salah/.test(t)));
ok('M11 Pembahasan tersedia', (await page.locator('.review-item').count()) === 10);
await page.screenshot({ path: `${OUT}/hp-13-hasil-evaluasi.png`, fullPage: true });

// Riwayat
await page.goto(`${BASE}/hasil`);
await page.getByRole('heading', { name: 'Riwayat' }).waitFor();
const rows = await page.locator('.list-link').count();
ok('M14 Riwayat memuat latihan & evaluasi', rows === 2, `(baris=${rows})`);
await page.locator('.list-link', { hasText: 'Evaluasi' }).click();
await page.getByRole('heading', { name: 'Nilai Evaluasi' }).waitFor();
ok('M14 Pembahasan evaluasi dapat dibuka ulang', (await page.locator('.review-item').count()) === 10);
await page.screenshot({ path: `${OUT}/hp-14-riwayat-detail.png` });

// Keluar → rute terlindungi
await page.getByRole('button', { name: 'Keluar' }).click();
await page.goto(`${BASE}/hasil`);
await page.getByRole('heading', { name: 'Masuk dengan kode siswa' }).waitFor();
ok('M5 Rute terlindungi diarahkan ke Login', true);
await ctx.close();

// ---------------- Laptop ----------------
const ctx2 = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const p2 = await ctx2.newPage();
p2.on('pageerror', (e) => consoleErrors.push(`pageerror(laptop): ${e.message}`));
await p2.goto(`${BASE}/masuk`);
await p2.fill('#code', 'KB-002');
await p2.fill('#pin', '2345');
await p2.getByRole('button', { name: 'Masuk' }).click();
await p2.getByRole('heading', { name: 'Halo, Merpati!' }).waitFor();
await p2.screenshot({ path: `${OUT}/laptop-01-beranda.png` });
const histOther = await p2.evaluate(async () => {
  const s = JSON.parse(localStorage.getItem('kb_session'));
  const r = await fetch('http://localhost:8000/api/attempts', { headers: { Authorization: `Bearer ${s.token}` } });
  return (await r.json()).length;
});
ok('M20 Siswa lain tidak melihat riwayat Elang', histOther === 0);
await p2.goto(`${BASE}/materi/balok`);
await p2.locator('canvas').waitFor({ timeout: 20000 });
await p2.waitForTimeout(800);
const twoCol = await p2.evaluate(() => {
  const g = document.querySelector('.with-figure');
  return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0;
});
ok('M16 Laptop: gambar & penjelasan berdampingan', twoCol === 2);
await p2.screenshot({ path: `${OUT}/laptop-02-materi-balok.png` });
await p2.goto(`${BASE}/visualisasi`);
await p2.locator('.canvas-box canvas').waitFor();
await p2.waitForTimeout(800);
await p2.screenshot({ path: `${OUT}/laptop-03-visual.png` });
await p2.goto(`${BASE}/latihan/soal-cerita`);
await p2.getByText('Soal 1 dari 5').waitFor();
await p2.screenshot({ path: `${OUT}/laptop-04-latihan-cerita.png` });
await ctx2.close();

await browser.close();
const relevant = consoleErrors.filter((e) => !/401|Failed to load resource|fonts\.g/.test(e));
ok('Tidak ada galat JavaScript di konsol', relevant.length === 0, relevant.slice(0, 5).join(' | '));
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lulus`);
process.exit(failed.length ? 1 : 0);
