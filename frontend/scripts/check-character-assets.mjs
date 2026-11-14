// Pemeriksa aset karakter raster: nama file, PNG, ukuran kanvas sama, latar transparan (RGBA).
// Pemakaian: node scripts/check-character-assets.mjs [manifest.json|manifest.example.json]
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'characters', 'bu-sari');
const file = process.argv[2] || (existsSync(join(dir, 'manifest.json')) ? 'manifest.json' : 'manifest.example.json');
const manifest = JSON.parse(readFileSync(join(dir, file), 'utf8'));
let ok = 0; let bad = 0;
const report = (good, msg) => { (good ? ok++ : bad++); console.log(`${good ? 'OK  ' : 'GAGAL'} ${msg}`); };

for (const [name, pose] of Object.entries(manifest.poses)) {
  const files = [pose.base, ...Object.values(pose.variants || {}).flatMap((v) => Object.values(v))];
  for (const rel of files) {
    const path = join(dir, rel);
    if (!existsSync(path)) { report(false, `${rel}: file tidak ada`); continue; }
    const buf = readFileSync(path);
    if (buf.toString('ascii', 1, 4) !== 'PNG') { report(false, `${rel}: bukan PNG`); continue; }
    const w = buf.readUInt32BE(16); const h = buf.readUInt32BE(20); const colorType = buf[25];
    const sizeOk = w === manifest.width && h === manifest.height;
    const alphaOk = colorType === 6 || colorType === 4;
    report(sizeOk && alphaOk, `${rel}: ${w}x${h}${sizeOk ? '' : ` (harus ${manifest.width}x${manifest.height})`}, ${alphaOk ? 'transparan' : 'TIDAK transparan (simpan sebagai PNG RGBA)'}`);
  }
  for (const region of Object.keys(pose.variants || {})) {
    const r = pose.regions?.[region];
    report(!!(r && r.w > 0 && r.h > 0 && r.x >= 0 && r.y >= 0 && r.x + r.w <= manifest.width && r.y + r.h <= manifest.height), `${name}: kotak area ${region}`);
  }
}
console.log(`\n${ok} OK, ${bad} gagal (manifest: ${file})`);
process.exit(bad ? 1 : 0);
