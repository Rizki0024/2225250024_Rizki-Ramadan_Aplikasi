// Memilih tampilan 3D atau 2D. Three.js dimuat lazy; galat WebGL otomatis jatuh ke 2D.
import { Component, lazy, Suspense } from 'react';
import { load, save } from '../../utils/storage.js';
import { hasWebGL } from './faces.js';
import { BoxFigure, NetFigure, RectFigure, SquareFigure } from './Shape2D.jsx';

const ShapeViewer3D = lazy(() => import('./ShapeViewer3D.jsx'));

const PREF_KEY = 'kb_view2d';
export const prefers2D = () => load(PREF_KEY, false) === true;
export const setPrefers2D = (v) => save(PREF_KEY, !!v);
export const can3D = () => hasWebGL() && !prefers2D();

class ThreeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Kanvas 3D dengan cadangan 2D. */
export function Viewer({ p, l, t, cube, unfolded, showValues, use3D = true }) {
  const fallback = unfolded
    ? <NetFigure p={p} l={l} t={t} cube={cube} showArea={showValues} />
    : <BoxFigure p={p} l={l} t={t} cube={cube} />;
  if (!use3D) return <div style={{ padding: 12 }}>{fallback}</div>;
  return (
    <ThreeBoundary fallback={<div style={{ padding: 12 }}>{fallback}</div>}>
      <Suspense fallback={<div style={{ padding: 12 }}>{fallback}</div>}>
        <ShapeViewer3D p={p} l={l} t={t} cube={cube} unfolded={unfolded} showValues={showValues} />
      </Suspense>
    </ThreeBoundary>
  );
}

/** Gambar di dalam materi (blok `figure`). */
export default function ShapeFigure({ figure, dims = {}, caption }) {
  let body;
  if (figure === 'square') body = <SquareFigure s={dims.s} />;
  else if (figure === 'rectangle') body = <RectFigure p={dims.p} l={dims.l} />;
  else if (figure === 'cube-net') body = <NetFigure p={dims.s} l={dims.s} t={dims.s} cube />;
  else if (figure === 'cuboid-net') body = <NetFigure p={dims.p} l={dims.l} t={dims.t} />;
  else {
    const cube = figure === 'cube';
    const p = cube ? dims.s : dims.p; const l = cube ? dims.s : dims.l; const t = cube ? dims.s : dims.t;
    const use3D = can3D();
    body = use3D ? (
      <div className="canvas-box" style={{ height: 260 }}>
        <Viewer p={p} l={l} t={t} cube={cube} use3D />
        <span className="canvas-hint">Geser untuk memutar</span>
      </div>
    ) : <Viewer p={p} l={l} t={t} cube={cube} use3D={false} />;
  }
  return (
    <figure className="figure">
      <div className="figure-box">{body}</div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
