// Uji E2E fitur v3: halaman awal, laci menu, profil & lencana, pengaturan, slide materi, video pembelajaran, visualisasi.
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = process.argv[2] || '.';
const CODE = process.env.CODE_A || 'KB-001';
const PIN = process.env.PIN_A || '1234';
const NAME = process.env.NAME_A || 'Elang';
const results = [];
const errors = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };
const MOCK_STT = () => {
  class R { start() { setTimeout(() => { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }, 100); } stop() { this.onend?.(); } abort() {} }
  window.SpeechRecognition = R; window.webkitSpeechRecognition = R;
};

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
await ctx.addInitScript(MOCK_STT);
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// --- halaman awal
await page.goto(BASE);
await page.getByRole('heading', { name: 'Belajar Kubus dan Balok' }).waitFor();
ok('H1 Halaman awal: logo, karakter siswa, tombol Mulai Belajar', await page.locator('svg.student').isVisible() && await page.getByRole('link', { name: 'Mulai Belajar' }).isVisible());
ok('H2 Halaman awal tanpa scroll horizontal', await noHScroll());

await page.getByRole('link', { name: 'Mulai Belajar' }).click();
await page.fill('#code', CODE); await page.fill('#pin', PIN);
await page.getByRole('button', { name: 'Masuk' }).click();
await page.getByRole('heading', { name: `Halo, ${NAME}!` }).waitFor();

// --- beranda
ok('H3 Beranda: 6 menu utama', (await page.locator('.tile-grid .tile').count()) === 6);
ok('H4 Beranda: poin bintang', /\d+/.test(await page.locator('.points-pill').innerText()));
ok('H5 Navigasi bawah Beranda/Profil/Pengaturan', (await page.locator('nav.tabbar a').count()) === 3);
ok('H6 Beranda tanpa scroll horizontal', await noHScroll());

// --- laci menu
await page.getByRole('button', { name: 'Buka menu' }).click();
await page.getByRole('dialog', { name: 'Menu utama' }).waitFor();
ok('H7 Laci menu berisi 7 menu', (await page.locator('.drawer-list a').count()) === 7);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
ok('H8 Laci menu tertutup dengan Escape', !(await page.getByRole('dialog', { name: 'Menu utama' }).isVisible()));
await page.getByRole('button', { name: 'Buka menu' }).click();
await page.locator('.drawer-list a', { hasText: 'Visualisasi 3D' }).click();
await page.locator('.viz-stage').waitFor();
ok('H9 Menu laci membuka halaman yang benar', page.url().endsWith('/visualisasi'));

// --- visualisasi
await page.locator('.canvas-box canvas').waitFor({ timeout: 20000 });
await page.getByRole('button', { name: 'Putar' }).click();
ok('V1 Tombol Putar (rotasi otomatis) aktif', (await page.getByRole('button', { name: 'Putar' }).getAttribute('aria-pressed')) === 'true');
await page.getByRole('button', { name: 'Jaring-jaring' }).click();
await page.getByRole('button', { name: 'Mode 2D' }).click();
await page.locator('svg[aria-label*="Jaring-jaring kubus"]').waitFor();
ok('V2 Jaring-jaring + Mode 2D', true);
await page.getByRole('button', { name: 'Mode 2D' }).click();

// --- slide materi
await page.goto(`${BASE}/materi/balok`);
await page.getByText(/Slide 1 dari \d+/).waitFor();
ok('M1 Materi per slide dengan guru di samping papan', await page.locator('.slide-stage svg.teacher').isVisible());
ok('M2 Navigasi bawah disembunyikan saat belajar materi', !(await page.locator('nav.tabbar').isVisible()));
await page.getByRole('button', { name: /^Lanjut/ }).first().click();
await page.getByText(/Slide 2 dari \d+/).waitFor();
ok('M3 Tombol Lanjut berpindah slide', true);
await page.getByRole('button', { name: 'Kembali' }).click();
await page.getByText(/Slide 1 dari \d+/).waitFor();
await page.getByRole('button', { name: 'Bacakan slide ini' }).click();
ok('M4 Tombol bacakan (guru berbicara)', (await page.locator('.slide-stage svg.teacher').getAttribute('data-expression')) === 'explaining');
await page.getByRole('button', { name: 'Lihat semua' }).click();
await page.getByText('L = 2 × (p × l + p × t + l × t)').first().waitFor();
ok('M5 "Lihat semua" menampilkan materi lengkap', true);
await page.screenshot({ path: `${OUT}/v3-materi.png` });

// --- video pembelajaran
await page.getByRole('link', { name: 'Tonton video' }).click();
await page.getByRole('toolbar', { name: 'Kontrol video' }).waitFor();
const t0 = await page.getByLabel('Waktu video').innerText();
ok('VD1 Pemutar video: waktu awal & durasi', /^0:00 \/ \d+:\d\d$/.test(t0), `(${t0})`);
await page.getByRole('button', { name: 'Putar video' }).click();
await page.waitForTimeout(2600);
const t1 = await page.getByLabel('Waktu video').innerText();
ok('VD2 Video berjalan (waktu bertambah)', t1 !== t0, `(${t1})`);
ok('VD3 Teks penjelasan (CC) tampil', await page.locator('.video-cc').isVisible());
await page.getByRole('button', { name: 'Teks penjelasan' }).click();
ok('VD4 CC dapat dimatikan', !(await page.locator('.video-cc').isVisible()));
await page.locator('.summary-list button').nth(2).click();
await page.waitForTimeout(400);
const t2 = Number((await page.getByLabel('Waktu video').innerText()).split(' / ')[0].replace(':', '.'));
ok('VD5 Ringkasan Materi: lompat ke bagian 3', (await page.locator('.summary-list button.on').innerText()).includes('Rumus') && t2 > 0);
await page.getByRole('button', { name: 'Ajukan Pertanyaan' }).click();
await page.getByText('Izin mikrofon ditolak').waitFor();
await page.getByLabel('Pertanyaan untuk Bu Sari').fill('apa bedanya luas dan volume');
await page.getByRole('button', { name: 'Kirim' }).click();
await page.locator('.bubble.teacher', { hasText: 'volume' }).waitFor({ timeout: 15000 });
ok('VD6 Ajukan pertanyaan dari video (gelembung berfoto guru)', await page.locator('.bubble-row.teacher .bubble-face').first().isVisible());
await page.getByRole('button', { name: 'Kembali ke pelajaran' }).click();
await page.getByRole('button', { name: 'Ajukan Pertanyaan' }).waitFor();
ok('VD7 Kembali ke video setelah bertanya', true);
await page.screenshot({ path: `${OUT}/v3-video.png`, fullPage: true });

// --- pengaturan
// v3.1: aset karakter lama (termasuk pilihan "berkerudung") dihapus; guru & siswa digambar ulang dari nol.
await page.goto(`${BASE}/karakter`);
await page.locator('svg[data-character="teacher"]').first().waitFor();
const poses = await page.locator('svg[data-character="teacher"]').evaluateAll((els) => [...new Set(els.map((e) => e.dataset.pose))]);
ok('S1 Aset guru baru: 7 pose + siswa tersedia di galeri', poses.length === 7 && (await page.locator('svg[data-character="student"]').count()) === 3, `(${poses.join(',')})`);
await page.goto(`${BASE}/pengaturan`);
ok('S1b Tidak ada sisa pilihan tampilan guru lama', (await page.getByRole('radio', { name: /Berkerudung/ }).count()) === 0);
await page.getByRole('switch', { name: 'Kurangi animasi' }).click();
ok('S2 Kurangi animasi menambahkan kelas reduce-motion', await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')));
await page.getByRole('switch', { name: 'Kurangi animasi' }).click();
await page.getByRole('switch', { name: 'Suara guru' }).click();
await page.reload();
ok('S3 Pengaturan tersimpan setelah muat ulang', (await page.getByRole('switch', { name: 'Suara guru' }).getAttribute('aria-checked')) === 'false');
await page.getByRole('switch', { name: 'Suara guru' }).click();

// --- profil (buka keempat materi dulu agar lencana Penjelajah Materi terbuka)
for (const slug of ['prasyarat', 'kubus', 'balok', 'soal-cerita']) {
  await page.goto(`${BASE}/materi/${slug}`);
  await page.getByText(/Slide 1 dari \d+/).waitFor();
}
await page.goto(`${BASE}/beranda`);
await page.locator('nav.tabbar').getByRole('link', { name: 'Profil' }).click();
await page.getByText('Lencana Prestasi').waitFor();
ok('P1 Profil: identitas & progres keseluruhan', await page.getByRole('heading', { name: NAME }).isVisible() && await page.getByText('Progres Keseluruhan').isVisible());
ok('P2 Profil: 4 lencana', (await page.locator('.badge-item').count()) === 4);
await page.locator('.badge-item').first().click();
ok('P3 Ketuk lencana menampilkan syarat', await page.getByRole('status').filter({ hasText: 'Penjelajah Materi' }).isVisible());
ok('P4 Lencana "Penjelajah Materi" terbuka setelah 4 materi dibuka', (await page.locator('.badge-item').first().getAttribute('class')).indexOf('locked') === -1);
await page.screenshot({ path: `${OUT}/v3-profil.png` });

// --- keluar dari pengaturan
await page.locator('nav.tabbar').getByRole('link', { name: 'Pengaturan' }).click();
await page.getByRole('button', { name: 'Keluar' }).last().click();
await page.getByRole('heading', { name: 'Masuk dengan kode siswa' }).waitFor();
ok('S4 Keluar dari halaman Pengaturan', true);

await browser.close();
ok('Tidak ada galat JavaScript', errors.length === 0, errors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} lulus`);
process.exit(failed ? 1 : 0);
