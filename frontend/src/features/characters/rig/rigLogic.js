// Logika rig karakter raster berlapis (murni, tanpa efek samping) — diuji di rigLogic.test.js.
// Manifest: lihat public/characters/bu-sari/manifest.example.json dan docs/character-assets.md.

export const REGIONS = ['eyes', 'mouth'];

const DEFAULT_POSE_MAP = { idle: 'explain', talk: 'explain', point: 'point', wave: 'wave', listen: 'listen', think: 'think', cheer: 'appreciate' };
const DEFAULT_EXPRESSIONS = {
  neutral: {}, happy: { mouth: 'smile' }, explaining: { mouth: 'open' },
  thinking: { eyes: 'up' }, listening: {}, proud: { eyes: 'happy', mouth: 'smile' },
};

/** Validasi ringan manifest; mengembalikan daftar masalah (kosong = valid). */
export function validateManifest(m) {
  const problems = [];
  if (!m || typeof m !== 'object') return ['Manifest tidak terbaca.'];
  if (!(m.width > 0 && m.height > 0)) problems.push('width/height wajib diisi.');
  if (!m.poses || !m.poses.explain) problems.push('Pose "explain" wajib ada.');
  if (m.frame && !(m.frame.w > 0 && m.frame.h > 0)) problems.push('frame harus punya w dan h > 0.');
  for (const [name, p] of Object.entries(m.poses || {})) {
    if (!p.base) problems.push(`Pose ${name}: base wajib diisi.`);
    for (const [region, variants] of Object.entries(p.variants || {})) {
      if (!REGIONS.includes(region)) problems.push(`Pose ${name}: area "${region}" tidak dikenal.`);
      const r = p.regions?.[region];
      if (Object.keys(variants || {}).length && !(r && r.w > 0 && r.h > 0)) problems.push(`Pose ${name}: kotak area "${region}" belum diatur.`);
    }
  }
  return problems;
}

/** Nama pose manifest untuk pose aplikasi; jatuh ke "explain" bila tidak tersedia. */
export function resolvePose(manifest, pose) {
  const map = { ...DEFAULT_POSE_MAP, ...(manifest.poseMap || {}) };
  const name = map[pose] || pose;
  return manifest.poses[name] ? name : 'explain';
}

/** Bentuk mulut dari kata yang sedang diucapkan (vokal pertama). */
export function visemeForWord(word = '') {
  const v = String(word).toLowerCase().match(/[aiueo]/);
  if (!v) return 'open';
  if (v[0] === 'a') return 'wide';
  if (v[0] === 'o' || v[0] === 'u') return 'o';
  return 'open';
}

/**
 * Varian aktif per area.
 *  state: { expression, blink: null|'half'|'closed', viseme: null|'open'|'wide'|'o' }
 *  Mengembalikan { eyes: key|null, mouth: key|null } — null = pakai gambar dasar.
 */
export function faceState(manifest, poseName, { expression = 'neutral', blink = null, viseme = null }) {
  const pose = manifest.poses[poseName];
  const has = (region, key) => !!(key && pose?.variants?.[region]?.[key]);
  const exprMap = { ...DEFAULT_EXPRESSIONS, ...(manifest.expressions || {}) };
  const expr = exprMap[expression] || {};

  let eyes = has('eyes', expr.eyes) ? expr.eyes : null;
  if (blink === 'closed' && has('eyes', 'closed')) eyes = 'closed';
  else if (blink === 'half') eyes = has('eyes', 'half') ? 'half' : has('eyes', 'closed') ? 'closed' : eyes;

  let mouth = has('mouth', expr.mouth) ? expr.mouth : null;
  if (viseme) {
    const order = [viseme, 'open', 'wide', 'o'];
    mouth = order.find((k) => has('mouth', k)) || mouth;
  }
  return { eyes, mouth };
}

/**
 * Gaya CSS mask agar varian hanya tampil di kotak area dengan tepi halus.
 * mask: "baked" = varian sudah membawa topeng per piksel di kanal alfanya → tanpa mask CSS.
 */
export function regionMask(region, width, height) {
  if (region?.mask === 'baked') return {};
  const { x, y, w, h, feather = 14 } = region;
  const fx = Math.min(49, (feather / w) * 100);
  const fy = Math.min(49, (feather / h) * 100);
  const posX = width === w ? 0 : (x / (width - w)) * 100;
  const posY = height === h ? 0 : (y / (height - h)) * 100;
  const img = `radial-gradient(ellipse 50% 50% at 50% 50%, #000 ${100 - Math.max(fx, fy) * 2}%, transparent 100%)`;
  return {
    WebkitMaskImage: img, maskImage: img,
    WebkitMaskSize: `${(w / width) * 100}% ${(h / height) * 100}%`, maskSize: `${(w / width) * 100}% ${(h / height) * 100}%`,
    WebkitMaskPosition: `${posX}% ${posY}%`, maskPosition: `${posX}% ${posY}%`,
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  };
}

/** Semua URL gambar di manifest (untuk preload & pemeriksaan). */
export function allImages(manifest, base = '') {
  const out = [];
  for (const p of Object.values(manifest.poses || {})) {
    if (p.base) out.push(base + p.base);
    for (const variants of Object.values(p.variants || {})) for (const src of Object.values(variants)) out.push(base + src);
  }
  return [...new Set(out)];
}

/** Kotak tampilan (frame) dari manifest; framing "full" = seluruh kanvas. */
export function frameBox(manifest, framing = 'frame') {
  const full = { x: 0, y: 0, w: manifest.width, h: manifest.height };
  const f = manifest.frame;
  if (framing === 'full' || !f || !(f.w > 0 && f.h > 0)) return full;
  return { x: Math.max(0, f.x || 0), y: Math.max(0, f.y || 0), w: Math.min(f.w, manifest.width), h: Math.min(f.h, manifest.height) };
}

/** Posisi panggung gambar agar hanya isi frame yang terlihat (persen relatif terhadap frame). */
export function stageStyle(manifest, frame) {
  return {
    position: 'absolute',
    width: `${(manifest.width / frame.w) * 100}%`, height: `${(manifest.height / frame.h) * 100}%`,
    left: `${(-frame.x / frame.w) * 100}%`, top: `${(-frame.y / frame.h) * 100}%`,
  };
}
