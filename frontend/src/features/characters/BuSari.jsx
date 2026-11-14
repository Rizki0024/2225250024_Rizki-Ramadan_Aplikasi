// Bu Sari: memakai rig raster bila aset di public/characters/bu-sari/manifest.json tersedia & valid;
// bila belum, otomatis memakai karakter SVG cadangan (Teacher.jsx). API sama untuk semua halaman.
import { useEffect, useState } from 'react';
import Teacher from './Teacher.jsx';
import CharacterRig from './rig/CharacterRig.jsx';
import { validateManifest } from './rig/rigLogic.js';

export const RIG_BASE = '/characters/bu-sari/';
let cache; // undefined = belum dimuat, null = tidak tersedia

export function loadRigManifest() {
  if (cache !== undefined) return Promise.resolve(cache);
  return fetch(`${RIG_BASE}manifest.json`, { cache: 'no-cache' })
    .then((r) => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : null))
    .then((m) => {
      const problems = m ? validateManifest(m) : ['tidak ada'];
      if (m && problems.length) console.warn('Manifest karakter tidak valid, memakai cadangan SVG:', problems);
      cache = m && !problems.length ? m : null;
      return cache;
    })
    .catch(() => { cache = null; return null; });
}

export function useRigManifest() {
  const [manifest, setManifest] = useState(cache ?? null);
  useEffect(() => {
    let alive = true;
    loadRigManifest().then((m) => { if (alive) setManifest(m); });
    return () => { alive = false; };
  }, []);
  return manifest;
}

export default function BuSari(props) {
  const manifest = useRigManifest();
  if (manifest) return <CharacterRig manifest={manifest} base={RIG_BASE} {...props} />;
  return <Teacher {...props} />;
}
