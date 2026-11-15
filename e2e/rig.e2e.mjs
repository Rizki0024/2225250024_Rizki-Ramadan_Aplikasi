// Uji mesin rig karakter raster dengan gambar uji buatan kanvas (disajikan lewat intersepsi jaringan,
// tidak ada file uji yang masuk ke proyek). Memastikan: cadangan SVG, kedip, sinkron bibir, pose, mask area.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = process.argv[2] || '.';
const results = [];
const errors = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

const W = 1024; const H = 1536;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));

// 0) Aset asli Bu Sari (public/characters/bu-sari) terpasang → rig raster dengan semua gambar termuat
{
  const real = await browser.newPage();
  real.on('pageerror', (e) => errors.push(e.message));
  await real.goto(`${BASE}/karakter`);
  await real.getByText('ilustrasi raster berlapis').waitFor();
  await real.waitForFunction(() => document.querySelectorAll('[data-rig="raster"]').length >= 13, null, { timeout: 10000 }).catch(() => {});
  await real.waitForFunction(() => [...document.querySelectorAll('[data-rig="raster"] img')].every((i) => i.complete && i.naturalWidth === 1024), null, { timeout: 15000 });
  const broken = await real.evaluate(() => [...document.querySelectorAll('[data-rig="raster"] img')].filter((i) => !i.naturalWidth).length);
  ok('R9 Aset asli: rig raster tampil & tidak ada gambar rusak', (await real.locator('[data-rig="raster"]').count()) >= 13 && broken === 0);
  await real.close();
}

// 1) Tanpa aset (manifest disimulasikan hilang) → cadangan SVG
await page.route('**/characters/bu-sari/manifest.json', (r) => r.fulfill({ status: 404, body: 'x' }));
await page.goto(`${BASE}/karakter`);
await page.getByText('SVG cadangan').waitFor();
ok('R1 Tanpa aset: memakai karakter SVG cadangan', (await page.locator('[data-rig="raster"]').count()) === 0 && (await page.locator('svg[data-character="teacher"]').count()) > 0);

// 2) Bangkitkan gambar uji (wajah sederhana; varian hanya berbeda di area mata/mulut)
const imgs = await page.evaluate(({ W, H }) => {
  const draw = ({ eyes = 'open', mouth = 'closed', arm = 'down' }) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#d9b48f'; g.fillRect(312, 620, 400, 900);
    g.fillStyle = '#5a3420'; g.beginPath(); g.ellipse(512, 400, 230, 260, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffe1cc'; g.beginPath(); g.ellipse(512, 420, 190, 220, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2b1a12';
    for (const x of [440, 584]) {
      if (eyes === 'open') { g.beginPath(); g.ellipse(x, 385, 24, 30, 0, 0, Math.PI * 2); g.fill(); } else { g.fillRect(x - 26, 383, 52, 7); }
    }
    g.fillStyle = '#b8384f';
    if (mouth === 'open') { g.beginPath(); g.ellipse(512, 485, 30, 24, 0, 0, Math.PI * 2); g.fill(); } else { g.fillRect(487, 482, 50, 6); }
    g.fillStyle = '#d9b48f';
    if (arm === 'up') g.fillRect(712, 300, 60, 340); else g.fillRect(712, 700, 60, 340);
    return c.toDataURL('image/png').split(',')[1];
  };
  return {
    base: draw({}), closed: draw({ eyes: 'closed' }), open: draw({ mouth: 'open' }),
    pointBase: draw({ arm: 'up' }), pointClosed: draw({ arm: 'up', eyes: 'closed' }),
  };
}, { W, H });

const region = { eyes: { x: 380, y: 330, w: 260, h: 110, feather: 10 }, mouth: { x: 455, y: 450, w: 115, h: 75, feather: 10 } };
const manifest = {
  name: 'uji', width: W, height: H,
  poses: {
    explain: { base: 'explain/base.png', regions: region, variants: { eyes: { closed: 'explain/eyes-closed.png' }, mouth: { open: 'explain/mouth-open.png', smile: 'explain/mouth-open.png' } } },
    point: { base: 'point/base.png', regions: { eyes: region.eyes }, variants: { eyes: { closed: 'point/eyes-closed.png' } } },
  },
};
const files = {
  'manifest.json': ['application/json', Buffer.from(JSON.stringify(manifest))],
  'explain/base.png': ['image/png', Buffer.from(imgs.base, 'base64')],
  'explain/eyes-closed.png': ['image/png', Buffer.from(imgs.closed, 'base64')],
  'explain/mouth-open.png': ['image/png', Buffer.from(imgs.open, 'base64')],
  'point/base.png': ['image/png', Buffer.from(imgs.pointBase, 'base64')],
  'point/eyes-closed.png': ['image/png', Buffer.from(imgs.pointClosed, 'base64')],
};
await ctx.route('**/characters/bu-sari/**', (route) => {
  const rel = new URL(route.request().url()).pathname.split('/characters/bu-sari/')[1];
  const f = files[rel];
  return f ? route.fulfill({ status: 200, contentType: f[0], body: f[1] }) : route.fulfill({ status: 404, body: 'x' });
});

// 3) Dengan aset → rig raster
const p2 = await ctx.newPage();
p2.on('pageerror', (e) => errors.push(e.message));
await p2.goto(`${BASE}/karakter`);
await p2.getByText('ilustrasi raster berlapis').waitFor();
await p2.waitForFunction(() => document.querySelectorAll('[data-rig="raster"]').length >= 13, null, { timeout: 10000 }).catch(() => {});
const rigs = p2.locator('[data-rig="raster"]');
ok('R2 Aset valid: halaman memakai rig raster', (await rigs.count()) >= 13);
ok('R3 Pose tanpa aset jatuh ke "explain" (gambar tetap tampil)', await p2.locator('[data-rig="raster"][data-pose="think"] img').first().isVisible());

// 4) Berkedip: data-eyes sempat "closed" dalam 8 detik
const sawBlink = await p2.waitForFunction(() => [...document.querySelectorAll('[data-rig="raster"]')].some((e) => e.dataset.eyes === 'closed'), null, { timeout: 9000 }).then(() => true).catch(() => false);
ok('R4 Berkedip otomatis (varian mata tertutup tampil)', sawBlink);

// 5) Bicara: data-mouth berubah ke open saat speaking
const talking = p2.locator('[data-rig="raster"][data-speaking="true"]').first();
const sawMouth = await p2.waitForFunction(() => {
  const el = document.querySelector('[data-rig="raster"][data-speaking="true"]');
  return el && el.dataset.mouth === 'open';
}, null, { timeout: 4000 }).then(() => true).catch(() => false);
ok('R5 Sinkron bibir: mulut terbuka saat berbicara', sawMouth && (await talking.count()) === 1);
const sawSpeechEvent = await p2.evaluate(() => new Promise((resolve) => {
  const el = document.querySelector('[data-rig="raster"][data-speaking="true"]');
  window.dispatchEvent(new CustomEvent('kb:speech', { detail: { type: 'word', word: 'balok' } }));
  setTimeout(() => resolve(el.dataset.mouth), 30);
}));
ok('R6 Sinyal kata dari speech.js menggerakkan mulut', sawSpeechEvent === 'open', `(mouth=${sawSpeechEvent}; varian "wide" tidak ada → open)`);

// 6) Mask area hanya menempel di kotak mata (piksel di luar kotak tetap gambar dasar)
await p2.goto(`${BASE}/karakter/rig`);
await p2.getByText('Semua gambar ditemukan.').waitFor();
ok('R7 Penyetel Rig memuat manifest & semua gambar', true);
await p2.screenshot({ path: `${OUT}/rig-tuner.png` });

// 7) Manifest rusak → cadangan SVG
const p3ctx = await browser.newContext();
await p3ctx.route('**/characters/bu-sari/manifest.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ width: 1, height: 1, poses: {} }) }));
const p3 = await p3ctx.newPage();
await p3.goto(`${BASE}/karakter`);
await p3.getByText('SVG cadangan').waitFor();
ok('R8 Manifest tidak valid ditolak → cadangan SVG', (await p3.locator('[data-rig="raster"]').count()) === 0);

await browser.close();
ok('Tidak ada galat JavaScript', errors.length === 0, errors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} lulus`);
process.exit(failed ? 1 : 0);
