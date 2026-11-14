import { describe, expect, it } from 'vitest';
import { allImages, faceState, regionMask, resolvePose, validateManifest, visemeForWord } from './rigLogic.js';

const manifest = {
  width: 1024, height: 1536,
  poses: {
    explain: {
      base: 'explain/base.png',
      regions: { eyes: { x: 400, y: 300, w: 220, h: 90 }, mouth: { x: 460, y: 420, w: 100, h: 70 } },
      variants: { eyes: { closed: 'explain/eyes-closed.png', happy: 'explain/eyes-happy.png' }, mouth: { open: 'explain/mouth-open.png', wide: 'explain/mouth-wide.png', smile: 'explain/mouth-smile.png' } },
    },
    point: { base: 'point/base.png', regions: { eyes: { x: 1, y: 1, w: 10, h: 10 } }, variants: { eyes: { closed: 'point/eyes-closed.png' } } },
  },
};

describe('rig karakter raster', () => {
  it('validasi manifest', () => {
    expect(validateManifest(manifest)).toEqual([]);
    expect(validateManifest(null)).toHaveLength(1);
    const bad = { width: 1, height: 1, poses: { explain: { base: 'a.png', variants: { mouth: { open: 'b.png' } } } } };
    expect(validateManifest(bad)[0]).toMatch(/kotak area "mouth"/);
  });

  it('pemetaan pose dengan cadangan ke explain', () => {
    expect(resolvePose(manifest, 'point')).toBe('point');
    expect(resolvePose(manifest, 'think')).toBe('explain'); // belum ada aset think
    expect(resolvePose(manifest, 'idle')).toBe('explain');
  });

  it('bentuk mulut dari vokal kata', () => {
    expect(visemeForWord('kubus')).toBe('o');
    expect(visemeForWord('balok')).toBe('wide');
    expect(visemeForWord('sisi')).toBe('open');
    expect(visemeForWord('6')).toBe('open');
  });

  it('kedipan, ekspresi, dan bicara memilih varian yang tersedia', () => {
    expect(faceState(manifest, 'explain', {})).toEqual({ eyes: null, mouth: null });
    expect(faceState(manifest, 'explain', { blink: 'closed' }).eyes).toBe('closed');
    expect(faceState(manifest, 'explain', { blink: 'half' }).eyes).toBe('closed'); // tak ada half → closed
    expect(faceState(manifest, 'explain', { expression: 'proud' })).toEqual({ eyes: 'happy', mouth: 'smile' });
    expect(faceState(manifest, 'explain', { viseme: 'o' }).mouth).toBe('open'); // tak ada o → open
    expect(faceState(manifest, 'explain', { viseme: 'wide', expression: 'happy' }).mouth).toBe('wide');
    expect(faceState(manifest, 'point', { viseme: 'open' }).mouth).toBe(null); // pose tanpa varian mulut
  });

  it('mask area dan daftar gambar', () => {
    const m = regionMask(manifest.poses.explain.regions.mouth, 1024, 1536);
    expect(m.maskSize).toBe(`${(100 / 1024) * 100}% ${(70 / 1536) * 100}%`);
    expect(allImages(manifest, '/c/')).toContain('/c/point/eyes-closed.png');
    expect(allImages(manifest)).toHaveLength(8); // explain: 1 + 2 + 3, point: 1 + 1
  });
});
