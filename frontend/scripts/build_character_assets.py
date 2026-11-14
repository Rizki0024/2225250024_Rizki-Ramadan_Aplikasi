# Memproses aset mentah Bu Sari menjadi aset rig: hapus latar putih (JPG), topeng per piksel untuk varian
# mata/mulut (hanya bagian yang berubah), hitung kotak area, tulis manifest.json.
# Pemakaian (Python + pillow numpy scipy):
#   python scripts/build_character_assets.py <folder-mentah> public/characters/bu-sari
# Folder mentah: <pose>/base.(png|jpg) dan <pose>/<area>-<nama>.(png|jpg), mis. explain/eyes-closed.png,
# explain/mouth-wide.png. Semua file 1024x1536 dan varian identik dengan base kecuali area mata/mulut.
import sys, glob, json, os, numpy as np
from PIL import Image
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]
POSES = {}
for pose in ('explain', 'point', 'wave', 'listen', 'think', 'appreciate', 'book'):
    files = glob.glob(f"{src}/{pose}/*.png") + glob.glob(f"{src}/{pose}/*.jpg")
    if not files: continue
    spec = {}
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        if name == 'base': spec['base'] = f
        elif '-' in name:
            region, key = name.split('-', 1)
            if region in ('eyes', 'mouth'): spec.setdefault(region, {})[key] = f
    if 'base' in spec: POSES[pose] = spec
def load(f):
    return np.asarray(Image.open(f).convert('RGBA')).astype(np.float64), f.endswith('.jpg')

def matte_white(rgb):
    """Alpha dari latar putih yang terhubung ke tepi kanvas; tepi dihaluskan & warna di-unpremultiply."""
    mn = rgb.min(-1); sat = rgb.max(-1) - mn
    white = (mn > 232) & (sat < 18)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # area putih/abu tertutup yang dikelilingi rambut (bukan kemeja) juga latar
    pale = (mn > 150) & (sat < 30)
    lab2, k2 = ndimage.label(pale & ~bg)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hair = (r < 140) & (r > g) & (g >= b - 5) & (rgb.max(-1) < 150)
    for i, sl in enumerate(ndimage.find_objects(lab2), 1):
        comp = lab2[sl] == i
        if comp.sum() < 40: continue
        ys, xs = sl
        y0, y1, x0, x1 = max(ys.start - 4, 0), ys.stop + 4, max(xs.start - 4, 0), xs.stop + 4
        big = np.zeros(rgb.shape[:2], bool); big[sl] = comp
        ring = ndimage.binary_dilation(big[y0:y1, x0:x1], iterations=3) & ~big[y0:y1, x0:x1]
        if ring.sum() and hair[y0:y1, x0:x1][ring].mean() > 0.6: bg |= big
    bg = ndimage.binary_opening(bg, iterations=1) | (bg & ~ndimage.binary_erosion(~bg, iterations=1))
    alpha = np.where(bg, 0.0, 1.0)
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
    soft = np.clip((255 - mn) / (255 - 170), 0, 1)
    alpha[edge] = soft[edge]
    a = alpha[..., None]
    col = np.where(a > 0.02, (rgb - 255 * (1 - a)) / np.maximum(a, 1e-3), 0)
    return np.dstack([np.clip(col, 0, 255), alpha * 255])

manifest = {'name': 'Bu Sari', 'version': 2, 'width': 1024, 'height': 1536,
  'frame': {'x': 200, 'y': 0, 'w': 744, 'h': 830},
  'poseMap': {'idle': 'explain', 'talk': 'explain', 'point': 'point', 'wave': 'wave', 'listen': 'listen', 'think': 'think', 'cheer': 'appreciate'},
  'expressions': {'neutral': {}, 'happy': {'mouth': 'smile'}, 'explaining': {'mouth': 'open'}, 'thinking': {'eyes': 'up'}, 'listening': {}, 'proud': {'eyes': 'happy', 'mouth': 'smile'}},
  'poses': {}}
total = 0
for pose, spec in POSES.items():
    os.makedirs(f"{out}/{pose}", exist_ok=True)
    base, isjpg = load(spec['base'])
    if isjpg: base = matte_white(base[..., :3])
    alpha = base[..., 3:]
    def save(arr, rel):
        global total
        Image.fromarray(arr.round().astype(np.uint8), 'RGBA').save(f"{out}/{rel}", optimize=True)
        total += os.path.getsize(f"{out}/{rel}"); return rel
    entry = {'base': save(base, f"{pose}/base.png"), 'regions': {}, 'variants': {}}
    for region in ('eyes', 'mouth'):
        if region not in spec: continue
        union = np.zeros(base.shape[:2], bool); imgs = {}
        for key, n in spec[region].items():
            v, _ = load(n)
            if isjpg: v = np.dstack([v[..., :3], alpha[..., 0]])
            imgs[key] = v
            union |= np.abs(v[..., :3] - base[..., :3]).max(-1) * (alpha[..., 0] / 255) > 40
        # topeng per piksel: hanya gumpalan perubahan utama (mata kiri/kanan atau mulut), tepi halus
        core = ndimage.binary_opening(union, iterations=2)
        lab, k = ndimage.label(ndimage.binary_closing(core, iterations=4))
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1))
        keep = np.argsort(sizes)[::-1][:(2 if region == 'eyes' else 1)] + 1
        blob = np.isin(lab, keep)
        blob = ndimage.binary_fill_holes(ndimage.binary_dilation(blob, iterations=4))
        soft = ndimage.gaussian_filter(blob.astype(float), 1.6)
        soft = np.clip(soft * 1.6, 0, 1)
        ys, xs = np.where(soft > 0.01)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        r = {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'mask': 'baked'}
        entry['regions'][region] = r; entry['variants'][region] = {}
        for key, v in imgs.items():
            crop = v.copy(); crop[..., 3] = v[..., 3] * soft; crop[crop[..., 3] < 1] = 0
            entry['variants'][region][key] = save(crop, f"{pose}/{region}-{key}.png")
    manifest['poses'][pose] = entry
    print(pose, entry['regions'])
json.dump(manifest, open(f"{out}/manifest.json", 'w'), indent=2)
print('total bytes', total)
