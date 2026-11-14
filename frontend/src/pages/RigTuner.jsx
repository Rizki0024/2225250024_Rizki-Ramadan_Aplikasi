// Penyetel Rig: mengatur kotak area mata/mulut per pose, mencoba kedip & bicara, lalu menyalin manifest JSON.
import { useEffect, useMemo, useState } from 'react';
import Page from '../components/Layout.jsx';
import CharacterRig from '../features/characters/rig/CharacterRig.jsx';
import { RIG_BASE } from '../features/characters/BuSari.jsx';
import { allImages, validateManifest } from '../features/characters/rig/rigLogic.js';
import { POSES, EXPRESSIONS } from '../features/characters/Teacher.jsx';

function useManifestDraft() {
  const [draft, setDraft] = useState(null);
  const [source, setSource] = useState('');
  useEffect(() => {
    const tryLoad = (name) => fetch(RIG_BASE + name, { cache: 'no-cache' })
      .then((r) => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : Promise.reject()));
    tryLoad('manifest.json').then((m) => { setDraft(m); setSource('manifest.json'); })
      .catch(() => tryLoad('manifest.example.json').then((m) => { setDraft(m); setSource('manifest.example.json (contoh)'); }).catch(() => setSource('tidak ditemukan')));
  }, []);
  return [draft, setDraft, source];
}

export default function RigTuner() {
  const [draft, setDraft, source] = useManifestDraft();
  const [poseName, setPoseName] = useState('explain');
  const [appPose, setAppPose] = useState('idle');
  const [expression, setExpression] = useState('neutral');
  const [speaking, setSpeaking] = useState(false);
  const [missing, setMissing] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!draft) return;
    Promise.all(allImages(draft, RIG_BASE).map((src) => new Promise((res) => {
      const img = new Image();
      img.onload = () => res(null);
      img.onerror = () => res(src.replace(RIG_BASE, ''));
      img.src = src;
    }))).then((r) => setMissing(r.filter(Boolean)));
  }, [draft]);

  const problems = useMemo(() => (draft ? validateManifest(draft) : []), [draft]);
  if (!draft) return <Page title="Penyetel Rig" back="/karakter"><p>Memuat manifest… ({source || 'mencari'})</p></Page>;

  const pose = draft.poses[poseName];
  const setRegion = (region, key, value) => setDraft((d) => ({
    ...d, poses: { ...d.poses, [poseName]: { ...d.poses[poseName], regions: { ...d.poses[poseName].regions, [region]: { ...d.poses[poseName].regions?.[region], [key]: Number(value) } } } },
  }));
  const json = JSON.stringify(draft, null, 2);

  return (
    <Page title="Penyetel Rig" back="/karakter">
      <div className="card stack">
        <strong>Manifest: {source}</strong>
        {missing.length ? <div className="alert warn small">{missing.length} gambar belum ada (contoh: {missing.slice(0, 3).join(', ')}). Ikuti docs/character-assets.md, lalu muat ulang.</div> : <div className="alert ok small">Semua gambar ditemukan.</div>}
        {problems.length ? <div className="alert error small">{problems.join(' · ')}</div> : null}
      </div>

      <div className="viz">
        <div className="card stack">
          <div className="row">
            <label>Pose manifest <select value={poseName} onChange={(e) => setPoseName(e.target.value)}>{Object.keys(draft.poses).map((p) => <option key={p}>{p}</option>)}</select></label>
          </div>
          <div style={{ position: 'relative', width: '100%', maxWidth: 420, aspectRatio: `${draft.width} / ${draft.height}`, background: 'repeating-conic-gradient(#eef2ff 0 25%, #fff 0 50%) 0 0/20px 20px' }}>
            <img src={RIG_BASE + pose.base} alt="Gambar dasar" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            {Object.entries(pose.regions || {}).map(([region, r]) => (
              <div key={region} title={region} style={{
                position: 'absolute', left: `${(r.x / draft.width) * 100}%`, top: `${(r.y / draft.height) * 100}%`,
                width: `${(r.w / draft.width) * 100}%`, height: `${(r.h / draft.height) * 100}%`,
                border: `2px dashed ${region === 'eyes' ? '#2563eb' : '#e11d48'}`, borderRadius: 8,
              }} />
            ))}
          </div>
          {['eyes', 'mouth'].map((region) => (pose.variants?.[region] ? (
            <div key={region} className="row small" style={{ gap: 6 }}>
              <strong style={{ width: 52 }}>{region === 'eyes' ? 'Mata' : 'Mulut'}</strong>
              {['x', 'y', 'w', 'h', 'feather'].map((k) => (
                <label key={k}>{k} <input type="number" style={{ width: 64 }} value={pose.regions?.[region]?.[k] ?? (k === 'feather' ? 14 : 0)} onChange={(e) => setRegion(region, k, e.target.value)} /></label>
              ))}
            </div>
          ) : null))}
        </div>

        <div className="card stack">
          <strong>Pratinjau rig</strong>
          <div className="row small" style={{ gap: 6 }}>
            <label>Pose <select value={appPose} onChange={(e) => setAppPose(e.target.value)}>{POSES.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label>Ekspresi <select value={expression} onChange={(e) => setExpression(e.target.value)}>{EXPRESSIONS.map((p) => <option key={p}>{p}</option>)}</select></label>
            <button type="button" className="btn small secondary" aria-pressed={speaking} onClick={() => setSpeaking((s) => !s)}>{speaking ? 'Berhenti bicara' : 'Coba bicara'}</button>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <CharacterRig manifest={draft} base={RIG_BASE} pose={appPose} expression={expression} speaking={speaking} size={260} />
          </div>
          <label className="small"><strong>Manifest JSON</strong> — simpan sebagai <code>frontend/public/characters/bu-sari/manifest.json</code>
            <textarea readOnly value={json} rows={10} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }} />
          </label>
          <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(json).then(() => setCopied(true))}>{copied ? 'Tersalin ✓' : 'Salin JSON'}</button>
        </div>
      </div>
    </Page>
  );
}
