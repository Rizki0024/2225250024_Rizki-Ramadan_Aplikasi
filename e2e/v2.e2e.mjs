// Uji E2E fitur v2: kelas guru virtual, suara (mikrofon tiruan), tanya-jawab, interupsi & lanjut, animasi.
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = process.argv[2] || '.';
const CODE = process.env.CODE_A || 'KB-001';
const PIN = process.env.PIN_A || '1234';
const NAME = process.env.NAME_A || 'Elang';
const results = [];
const errors = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

// Mikrofon tiruan: SpeechRecognition palsu yang "mendengar" teks dari window.__nextSpeech.
const MOCK_STT = () => {
  class FakeRecognition {
    start() {
      setTimeout(() => {
        if (window.__micDenied) { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); return; }
        const text = window.__nextSpeech || 'kenapa dikali enam';
        this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text.slice(0, 6), confidence: 0.5 }], { isFinal: false })] });
        setTimeout(() => {
          this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal: true })] });
          this.onend?.();
        }, 250);
      }, 250);
    }
    stop() { this.onend?.(); }
    abort() {}
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
};

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
await ctx.addInitScript(MOCK_STT);
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/401|Failed to load resource|fonts\.g|503/.test(m.text())) errors.push(m.text()); });

await page.goto(`${BASE}/masuk`);
await page.fill('#code', CODE); await page.fill('#pin', PIN);
await page.getByRole('button', { name: 'Masuk' }).click();
await page.getByRole('heading', { name: `Halo, ${NAME}!` }).waitFor();
ok('B1 Beranda: menu Belajar Bersama Guru & progres', await page.getByRole('link', { name: /Belajar Bersama Guru/ }).first().isVisible() && await page.getByText('Progres Belajar').isVisible());
ok('B2 Tab bar tampil di beranda', await page.locator('nav.tabbar').isVisible());
ok('C1 Karakter guru tampil', await page.locator('[data-character="teacher"]').first().isVisible());

// --- daftar kelas
await page.getByRole('link', { name: /Belajar Bersama Guru/ }).first().click();
await page.getByRole('heading', { name: 'Halo, aku Bu Sari!' }).waitFor();
await page.locator('.list-link').nth(3).waitFor();
ok('D1 Daftar 4 pelajaran guru', (await page.locator('.list-link').count()) === 4);
await page.screenshot({ path: `${OUT}/v2-hp-kelas-daftar.png`, fullPage: true });

// --- kelas kubus
await page.locator('.list-link', { hasText: 'Luas Permukaan Kubus' }).click();
await page.getByText('Bagian 1/4').waitFor();
ok('D2 Tab bar disembunyikan (mode fokus)', !(await page.locator('nav.tabbar').isVisible()));
ok('D3 Status awal menunggu tombol Mulai', await page.getByRole('button', { name: 'Mulai' }).isVisible());
await page.getByRole('button', { name: 'Mulai' }).click();
await page.locator('.wb-item.is-active').waitFor();
ok('D4 Papan tulis menyorot butir yang dibahas', true);
const firstSub = await page.locator('.speech-bubble').innerText();
await page.waitForFunction((t) => document.querySelector('.speech-bubble')?.innerText !== t, firstSub, { timeout: 15000 });
ok('D5 Penjelasan maju ke baris berikutnya otomatis', true);
await page.waitForFunction(() => document.querySelectorAll('.wb-item').length >= 3, null, { timeout: 45000 });
const revealedBefore = await page.locator('.wb-item').count();
ok('D6 Butir papan muncul bertahap', revealedBefore >= 3 && revealedBefore < 5, `(butir=${revealedBefore})`);
await page.getByRole('button', { name: 'Jeda' }).click();
const pausedSub = await page.locator('.speech-bubble').innerText();
await page.waitForTimeout(2500);
ok('D7 Jeda menghentikan penjelasan', (await page.locator('.speech-bubble').innerText()) === pausedSub);
await page.screenshot({ path: `${OUT}/v2-hp-kelas-papan.png`, fullPage: true });

// --- interupsi dengan suara
await page.getByRole('button', { name: 'Tanya Bu Sari' }).click();
await page.getByText('Mendengarkan…').waitFor();
ok('E1 Indikator mikrofon aktif', true);
const listening = await page.waitForFunction(() => document.querySelector('[data-character="teacher"]')?.dataset.expression === 'listening', null, { timeout: 3000 }).then(() => true).catch(() => false);
ok('E2 Guru berganti ekspresi mendengarkan', listening);
await page.getByText(/Bu Sari mendengar: "kenapa dikali enam"/).waitFor();
ok('E3 Konfirmasi teks hasil pengenalan suara', true);
await page.locator('.bubble.teacher', { hasText: '6 sisi' }).waitFor({ timeout: 15000 });
ok('F1 Guru menjawab sesuai konteks (kenapa dikali 6)', true);
await page.getByRole('button', { name: 'Belum paham' }).waitFor({ timeout: 15000 });
ok('F2 Guru menanyakan apakah sudah paham', await page.getByText(/sudah lebih jelas/i).first().isVisible());
await page.getByRole('button', { name: 'Belum paham' }).click();
await page.locator('.bubble.teacher', { hasText: 'dadu' }).waitFor({ timeout: 15000 });
ok('F3 Belum paham → penjelasan alternatif yang lebih sederhana', true);
await page.screenshot({ path: `${OUT}/v2-hp-tanya-jawab.png`, fullPage: true });
await page.getByRole('button', { name: 'Sudah paham, lanjutkan' }).waitFor({ timeout: 15000 });
await page.getByRole('button', { name: 'Sudah paham, lanjutkan' }).click();
await page.getByRole('toolbar', { name: 'Kontrol pelajaran' }).waitFor({ timeout: 15000 });
await page.waitForFunction(() => document.querySelectorAll('.speech-bubble').length === 1 && !document.querySelector('.speech-bubble').innerText.startsWith('Silakan bertanya'), null, { timeout: 5000 });
const resumedSub = await page.locator('.speech-bubble').innerText();
ok('F4 Lanjut dari posisi terakhir (bukan dari awal)', resumedSub === pausedSub && !resumedSub.startsWith('Ini kubus. Contohnya seperti dadu'), `("${resumedSub.slice(0, 40)}…")`);

// --- pertanyaan ketik di luar topik + jawaban suara "sudah"
await page.getByRole('button', { name: 'Jeda' }).click().catch(() => {});
await page.evaluate(() => { window.__micDenied = true; });
await page.getByRole('button', { name: 'Tanya Bu Sari' }).click();
await page.getByText('Izin mikrofon ditolak').waitFor();
ok('E4 Izin mikrofon ditolak → pesan jelas + tetap bisa mengetik', await page.getByLabel('Pertanyaan untuk Bu Sari').isEnabled());
await page.getByLabel('Pertanyaan untuk Bu Sari').fill('siapa presiden pertama indonesia?');
await page.getByRole('button', { name: 'Kirim' }).click();
await page.locator('.bubble.teacher', { hasText: 'di luar materi' }).waitFor({ timeout: 15000 });
ok('F5 Pertanyaan di luar topik ditolak dengan sopan', true);
await page.getByLabel('Pertanyaan untuk Bu Sari').fill('berapa luas permukaan kubus kalau rusuknya 7 cm');
await page.getByRole('button', { name: 'Kirim' }).click();
await page.locator('.bubble.teacher', { hasText: '7 × 7 = 49' }).waitFor({ timeout: 15000 });
const calcText = await page.locator('.bubble.teacher').last().innerText();
ok('F6 Perhitungan terpandu tanpa langsung memberi jawaban akhir', !calcText.includes('294'));
await page.evaluate(() => { window.__micDenied = false; window.__nextSpeech = 'sudah paham bu'; });
await page.getByRole('button', { name: 'Jawab dengan suara' }).waitFor({ timeout: 15000 });
await page.getByRole('button', { name: 'Jawab dengan suara' }).click();
await page.getByRole('toolbar', { name: 'Kontrol pelajaran' }).waitFor({ timeout: 20000 });
ok('E5 Jawaban suara "sudah paham" melanjutkan pelajaran', true);

// --- layanan tutor tidak tersedia
await page.route('**/api/tutor/ask', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Layanan guru sedang tidak tersedia.' }) }));
await page.getByRole('button', { name: 'Jeda' }).click().catch(() => {});
await page.evaluate(() => { window.__micDenied = true; });
await page.getByRole('button', { name: 'Tanya Bu Sari' }).click();
await page.getByLabel('Pertanyaan untuk Bu Sari').fill('kenapa dikali 6');
await page.getByRole('button', { name: 'Kirim' }).click();
await page.getByText('Layanan guru sedang tidak tersedia.').waitFor();
ok('G1 Layanan tutor gagal → pesan jelas, pelajaran tetap bisa dilanjutkan', await page.getByRole('button', { name: 'Kembali ke pelajaran' }).isVisible());
await page.unroute('**/api/tutor/ask');

// --- offline saat bertanya
await ctx.setOffline(true);
await page.getByLabel('Pertanyaan untuk Bu Sari').fill('apa itu rusuk');
await page.getByRole('button', { name: 'Kirim' }).click();
await page.getByText(/sedang offline/).first().waitFor();
ok('G2 Offline saat bertanya → pesan koneksi', true);
await ctx.setOffline(false);
await page.getByRole('button', { name: 'Kembali ke pelajaran' }).click();

// --- muat ulang: progres tersimpan
await page.getByRole('toolbar', { name: 'Kontrol pelajaran' }).waitFor();
const segBefore = await page.locator('.seg-dots button.active').innerText();
const subBefore = await page.locator('.speech-bubble').innerText();
await page.getByRole('button', { name: 'Jeda' }).click().catch(() => {});
await page.reload();
await page.locator('.seg-dots button.active').waitFor();
ok('G3 Muat ulang: progres pelajaran tidak hilang', (await page.locator('.seg-dots button.active').innerText()) === segBefore
  && (await page.getByRole('button', { name: 'Lanjutkan' }).isVisible()), `(bagian ${segBefore})`);

// --- cek pemahaman (percepat suara untuk uji)
await page.evaluate(() => localStorage.setItem('kb_tts_fast', 'true'));
await page.getByRole('button', { name: 'Lanjutkan' }).click();
await page.getByText('Cek pemahaman').waitFor({ timeout: 20000 });
ok('D8 Cek pemahaman muncul di akhir bagian', true);
await page.locator('.check-card .option').first().click();
await page.locator('.check-card .feedback').waitFor();
ok('D9 Umpan balik cek pemahaman + penjelasan', (await page.locator('.check-card .feedback').innerText()).length > 20);
const segNum = Number(await page.locator('.seg-dots button.active').innerText());
await page.getByRole('button', { name: 'Lanjut ke bagian berikutnya' }).click();
await page.waitForFunction((n) => Number(document.querySelector('.seg-dots button.active')?.innerText) === n + 1 || document.body.innerText.includes('Pelajaran selesai'), segNum, { timeout: 10000 });
ok('D10 Lanjut ke bagian berikutnya', true);
await page.locator('.seg-dots button').last().click();
for (let i = 0; i < 3; i += 1) {
  if (await page.getByText('Pelajaran selesai!').isVisible()) break;
  await page.getByText('Cek pemahaman').waitFor({ timeout: 20000 }).catch(() => {});
  if (await page.locator('.check-card .option').first().isVisible()) {
    await page.locator('.check-card .option').first().click();
    await page.getByRole('button', { name: 'Lanjut ke bagian berikutnya' }).click();
  }
}
await page.getByText('Pelajaran selesai!').waitFor({ timeout: 20000 });
ok('D11 Pelajaran selesai + guru memberi apresiasi', (await page.locator('[data-character="teacher"]').getAttribute('data-expression')) === 'proud');
await page.evaluate(() => localStorage.removeItem('kb_tts_fast'));
await page.goto(`${BASE}/kelas`);
await page.locator('.list-link', { hasText: 'Luas Permukaan Kubus' }).getByText(/Selesai/).waitFor();
ok('D12 Status pelajaran "Selesai" di daftar', true);
await page.goto(`${BASE}/beranda`);
await page.getByText('Progres Belajar').waitFor();
await page.waitForTimeout(800);
const pct = Number(((await page.locator('.progress-hero').innerText()).match(/(\d+)%/) || [0, 0])[1]);
ok('B3 Progres belajar di beranda bertambah', pct > 0, `(${pct}%)`);
await ctx.close();

// --- laptop + kurangi gerakan
const ctx2 = await browser.newContext({ viewport: { width: 1366, height: 860 }, reducedMotion: 'reduce' });
await ctx2.addInitScript(MOCK_STT);
const p2 = await ctx2.newPage();
p2.on('pageerror', (e) => errors.push(`laptop: ${e.message}`));
await p2.goto(`${BASE}/masuk`);
await p2.fill('#code', CODE); await p2.fill('#pin', PIN);
await p2.getByRole('button', { name: 'Masuk' }).click();
await p2.getByRole('heading', { name: `Halo, ${NAME}!` }).waitFor();
const anim = await p2.evaluate(() => getComputedStyle(document.querySelector('[data-character="teacher"] .c-body, [data-character="teacher"] .rig-body')).animationName);
ok('B4 Kurangi gerakan (reduced motion) dihormati', anim === 'none', `(animation=${anim})`);
await p2.goto(`${BASE}/kelas/balok`);
await p2.getByRole('button', { name: 'Mulai' }).click();
await p2.waitForTimeout(2500);
const cols = await p2.evaluate(() => getComputedStyle(document.querySelector('.classroom')).gridTemplateColumns.split(' ').length);
ok('M16 Laptop: papan tulis & guru berdampingan', cols === 2);
await p2.screenshot({ path: `${OUT}/v2-laptop-kelas.png` });
await ctx2.close();

await browser.close();
ok('Tidak ada galat JavaScript', errors.length === 0, errors.slice(0, 4).join(' | '));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} lulus`);
process.exit(failed ? 1 : 0);
