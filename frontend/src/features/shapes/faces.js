// Warna pasangan sisi — konsisten di 3D, 2D, materi, dan legenda.
export const FACE_COLORS = { a: '#93c5fd', b: '#f9a8d4', c: '#86efac' };
export const EDGE_COLOR = '#1e3a8a';

export function faceAreas(p, l, t) {
  return { a: p * l, b: p * t, c: l * t };
}

export function surfaceArea(p, l, t) {
  const { a, b, c } = faceAreas(p, l, t);
  return 2 * (a + b + c);
}

let cached;
export function hasWebGL() {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    cached = false;
  }
  return cached;
}
