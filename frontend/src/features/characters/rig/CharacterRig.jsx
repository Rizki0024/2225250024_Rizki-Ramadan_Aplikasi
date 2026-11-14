// Rig karakter raster berlapis: gambar dasar per pose + varian area mata/mulut (inpainting), berkedip,
// sinkron bibir per kata, napas idle, dan cross-fade antar-pose. Lihat docs/character-assets.md.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { faceState, REGIONS, regionMask, resolvePose, visemeForWord } from './rigLogic.js';
import './rig.css';

/** Berkedip acak setiap 2,8–6 detik: setengah → tertutup → setengah. */
function useBlink(enabled) {
  const [blink, setBlink] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const timers = [];
    const schedule = () => {
      timers.push(setTimeout(() => {
        if (!alive) return;
        setBlink('half');
        timers.push(setTimeout(() => setBlink('closed'), 50));
        timers.push(setTimeout(() => setBlink('half'), 130));
        timers.push(setTimeout(() => { setBlink(null); schedule(); }, 180));
      }, 2800 + Math.random() * 3200));
    };
    schedule();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [enabled]);
  return blink;
}

/** Sinkron bibir: mengikuti sinyal kata dari speech.js; tanpa sinyal → ritme 140 ms. */
function useLipSync(speaking) {
  const [viseme, setViseme] = useState(null);
  useEffect(() => {
    if (!speaking) { setViseme(null); return undefined; }
    let lastWord = 0;
    let closeTimer;
    const onSpeech = (e) => {
      if (e.detail.type !== 'word') return;
      lastWord = Date.now();
      setViseme(visemeForWord(e.detail.word));
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => setViseme(null), 150);
    };
    window.addEventListener('kb:speech', onSpeech);
    const flap = setInterval(() => {
      if (Date.now() - lastWord > 500) setViseme((v) => (v ? null : 'open'));
    }, 140);
    return () => { window.removeEventListener('kb:speech', onSpeech); clearInterval(flap); clearTimeout(closeTimer); };
  }, [speaking]);
  return viseme;
}

function PoseLayer({ manifest, base, poseName, face }) {
  const pose = manifest.poses[poseName];
  return (
    <div className="rig-pose">
      <img className="rig-img" src={base + pose.base} alt="" draggable="false" />
      {REGIONS.map((region) => {
        const key = face[region];
        const src = key ? pose.variants?.[region]?.[key] : null;
        if (!src) return null;
        return <img key={region} className="rig-img" src={base + src} alt="" draggable="false" style={regionMask(pose.regions[region], manifest.width, manifest.height)} />;
      })}
    </div>
  );
}

export default function CharacterRig({ manifest, base, expression = 'neutral', pose = 'idle', speaking = false, size = 220, facing = 'right', title = 'Bu Sari, guru virtual' }) {
  const poseName = resolvePose(manifest, pose);
  const blink = useBlink(true);
  const viseme = useLipSync(speaking);
  const face = faceState(manifest, poseName, { expression, blink, viseme });
  const preloaded = useRef(false);

  // Muat semua varian lebih dulu agar kedipan/bicara tidak berkedip kosong.
  const sources = useMemo(() => {
    const out = [];
    for (const p of Object.values(manifest.poses)) for (const v of Object.values(p.variants || {})) out.push(...Object.values(v));
    return out;
  }, [manifest]);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    sources.forEach((src) => { const i = new Image(); i.src = base + src; });
  }, [sources, base]);

  return (
    <div className={`rig teacher${speaking ? ' is-speaking' : ''}`} role="img" aria-label={title}
      style={{ width: size, aspectRatio: `${manifest.width} / ${manifest.height}`, transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
      data-expression={expression} data-pose={pose} data-speaking={speaking ? 'true' : 'false'} data-character="teacher" data-rig="raster"
      data-eyes={face.eyes || 'base'} data-mouth={face.mouth || 'base'}>
      <div className="rig-body">
        <AnimatePresence initial={false}>
          <motion.div key={poseName} className="rig-fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <PoseLayer manifest={manifest} base={base} poseName={poseName} face={face} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
