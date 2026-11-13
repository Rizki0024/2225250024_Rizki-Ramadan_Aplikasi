import { useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import { faceAreas, hasWebGL, surfaceArea } from '../features/shapes/faces.js';
import { prefers2D, setPrefers2D, Viewer } from '../features/shapes/ShapeFigure.jsx';
import { formatNumber as n } from '../utils/number.js';

function Slider({ label, value, onChange }) {
  const id = `dim-${label}`;
  return (
    <div className="slider-row">
      <label htmlFor={id}><strong>{label}</strong></label>
      <input id={id} type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <strong>{value}</strong>
    </div>
  );
}

export default function Visualization() {
  const webgl = hasWebGL();
  const [shape, setShape] = useState('balok');
  const [dims, setDims] = useState({ s: 4, p: 8, l: 5, t: 3 });
  const [unfolded, setUnfolded] = useState(false);
  const [mode2D, setMode2D] = useState(() => !webgl || prefers2D());

  const cube = shape === 'kubus';
  const p = cube ? dims.s : dims.p;
  const l = cube ? dims.s : dims.l;
  const t = cube ? dims.s : dims.t;
  const area = faceAreas(p, l, t);
  const total = surfaceArea(p, l, t);
  const set = (k) => (v) => setDims((d) => ({ ...d, [k]: v }));

  const rows = cube
    ? [{ c: 'a', name: '6 sisi persegi', expr: `${p} × ${p}`, val: area.a, times: 6 }]
    : [
      { c: 'a', name: 'Alas & tutup', expr: `p × l = ${p} × ${l}`, val: area.a, times: 2 },
      { c: 'b', name: 'Depan & belakang', expr: `p × t = ${p} × ${t}`, val: area.b, times: 2 },
      { c: 'c', name: 'Kiri & kanan', expr: `l × t = ${l} × ${t}`, val: area.c, times: 2 },
    ];

  return (
    <Page title="Visualisasi 3D">
      <div className="row between">
        <div className="segmented" role="tablist" aria-label="Pilih bangun">
          {['kubus', 'balok'].map((s) => (
            <button key={s} type="button" role="tab" aria-selected={shape === s} className={shape === s ? 'active' : ''}
              onClick={() => setShape(s)}>{s === 'kubus' ? 'Kubus' : 'Balok'}</button>
          ))}
        </div>
        <div className="segmented" aria-label="Mode tampilan">
          <button type="button" className={!mode2D ? 'active' : ''} disabled={!webgl}
            onClick={() => { setMode2D(false); setPrefers2D(false); }}>3D</button>
          <button type="button" className={mode2D ? 'active' : ''}
            onClick={() => { setMode2D(true); setPrefers2D(true); }}>2D</button>
        </div>
      </div>
      {!webgl ? <div className="alert warn small">Perangkat ini tidak mendukung 3D, jadi gambar ditampilkan dalam 2D.</div> : null}

      <div className="viz">
        <div className="stack">
          <div className={mode2D ? 'figure-box' : 'canvas-box'}>
            <Viewer p={p} l={l} t={t} cube={cube} unfolded={unfolded} showValues use3D={!mode2D} />
            {!mode2D ? <span className="canvas-hint">Geser untuk memutar · cubit untuk zoom</span> : null}
          </div>
          <button type="button" className="btn block" onClick={() => setUnfolded((u) => !u)}>
            {unfolded ? 'Tutup jaring-jaring' : 'Buka jaring-jaring'}
          </button>
        </div>

        <div className="stack">
          <div className="card stack">
            <h2>Ukuran (cm)</h2>
            {cube ? <Slider label="s" value={dims.s} onChange={set('s')} /> : (
              <>
                <Slider label="p" value={dims.p} onChange={set('p')} />
                <Slider label="l" value={dims.l} onChange={set('l')} />
                <Slider label="t" value={dims.t} onChange={set('t')} />
              </>
            )}
          </div>
          <div className="card stack">
            <h2>Luas tiap warna</h2>
            <div className="pairs">
              {rows.map((r) => (
                <div className="pair" key={r.c}>
                  <span className={`swatch ${r.c}`} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{r.name}<br /><span className="small muted">{r.expr} = {n(r.val)} cm²</span></span>
                  <strong>× {r.times}</strong>
                </div>
              ))}
            </div>
            <div className="formula">
              <div className="label">Luas permukaan</div>
              <div className="expr" style={{ fontSize: '1.1rem' }}>
                {cube ? `L = 6 × ${n(area.a)} = ${n(total)} cm²`
                  : `L = 2 × (${n(area.a)} + ${n(area.b)} + ${n(area.c)}) = ${n(total)} cm²`}
              </div>
            </div>
            <p className="small muted" style={{ margin: 0 }}>
              Warna yang sama = sisi berhadapan yang luasnya sama. Buka jaring-jaring untuk melihat keenam sisi sekaligus.
            </p>
          </div>
          <Link className="btn secondary" to="/latihan">Coba latihan</Link>
        </div>
      </div>
    </Page>
  );
}
