// Visualisasi 3D kubus/balok dengan jaring-jaring yang dapat dibuka (React Three Fiber).
// Render on-demand (frameloop="demand") agar hemat baterai di HP.
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';
import { CanvasTexture, DoubleSide, SRGBColorSpace } from 'three';
import { EDGE_COLOR, FACE_COLORS } from './faces.js';

const HALF_PI = Math.PI / 2;

function Face({ w, h, color, position }) {
  return (
    <mesh position={position} rotation={[-HALF_PI, 0, 0]}>
      <planeGeometry args={[w, h]} />
      <meshLambertMaterial color={color} side={DoubleSide} />
      <Edges color={EDGE_COLOR} />
    </mesh>
  );
}

/** Label dimensi sebagai sprite bertekstur kanvas (tanpa DOM, ringan di HP). */
function Label({ position, children, visible, height }) {
  const text = String(children);
  const { texture, aspect } = useMemo(() => {
    const fontPx = 64;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `800 ${fontPx}px Nunito, system-ui, sans-serif`;
    const w = Math.ceil(ctx.measureText(text).width) + 40;
    const h = fontPx + 28;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(2, 2, w - 4, h - 4, 16);
    ctx.fill();
    ctx.stroke();
    ctx.font = `800 ${fontPx}px Nunito, system-ui, sans-serif`;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 3);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return { texture: tex, aspect: w / h };
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} visible={visible} renderOrder={10}>
      <spriteMaterial map={texture} depthTest={false} transparent />
    </sprite>
  );
}

function Box({ p, l, t, unfolded, labels }) {
  const outer = useRef();
  const inner = useRef();
  const front = useRef();
  const back = useRef();
  const top = useRef();
  const right = useRef();
  const left = useRef();
  const u = useRef(unfolded ? 1 : 0);
  const { invalidate } = useThree();
  const m = Math.max(p, l, t);
  const kFold = 3.3 / m;
  const kNet = 6.4 / Math.max(p + 2 * t, 2 * l + 2 * t);

  useEffect(() => { invalidate(); }, [unfolded, p, l, t, invalidate]);

  useFrame((state, delta) => {
    const target = unfolded ? 1 : 0;
    const diff = target - u.current;
    if (Math.abs(diff) > 0.001) {
      u.current += Math.sign(diff) * Math.min(Math.abs(diff), delta * 0.9);
      state.invalidate();
    } else {
      u.current = target;
    }
    const v = u.current;
    const fold = HALF_PI * (1 - v);
    front.current.rotation.x = -fold;
    back.current.rotation.x = fold;
    top.current.rotation.x = fold;
    right.current.rotation.z = fold;
    left.current.rotation.z = -fold;
    inner.current.position.set(0, (-t / 2) * (1 - v), (l / 2) * v);
    outer.current.scale.setScalar(kFold + (kNet - kFold) * v);
  });

  const o = 0.18 * m; // jarak label dari rusuk
  return (
    <group ref={outer}>
      <group ref={inner}>
        <Face w={p} h={l} color={FACE_COLORS.a} position={[0, 0, 0]} />
        <group ref={front} position={[0, 0, l / 2]}>
          <Face w={p} h={t} color={FACE_COLORS.b} position={[0, 0, t / 2]} />
        </group>
        <group ref={back} position={[0, 0, -l / 2]}>
          <Face w={p} h={t} color={FACE_COLORS.b} position={[0, 0, -t / 2]} />
          <group ref={top} position={[0, 0, -t]}>
            <Face w={p} h={l} color={FACE_COLORS.a} position={[0, 0, -l / 2]} />
          </group>
        </group>
        <group ref={right} position={[p / 2, 0, 0]}>
          <Face w={t} h={l} color={FACE_COLORS.c} position={[t / 2, 0, 0]} />
        </group>
        <group ref={left} position={[-p / 2, 0, 0]}>
          <Face w={t} h={l} color={FACE_COLORS.c} position={[-t / 2, 0, 0]} />
        </group>
        <group>
          <Label height={0.13 * m} visible={!unfolded} position={[0, -o * 0.4, l / 2 + o]}>{labels.p}</Label>
          <Label height={0.13 * m} visible={!unfolded} position={[p / 2 + o, -o * 0.4, 0]}>{labels.l}</Label>
          <Label height={0.13 * m} visible={!unfolded} position={[p / 2 + o * 0.7, t / 2, l / 2 + o * 0.7]}>{labels.t}</Label>
        </group>
      </group>
    </group>
  );
}

export default function ShapeViewer3D({ p, l, t, cube = false, unfolded = false, showValues = false, autoRotate = false }) {
  const labels = cube
    ? { p: showValues ? `s = ${p}` : 's', l: showValues ? `s = ${l}` : 's', t: showValues ? `s = ${t}` : 's' }
    : { p: showValues ? `p = ${p}` : 'p', l: showValues ? `l = ${l}` : 'l', t: showValues ? `t = ${t}` : 't' };
  return (
    <Canvas frameloop={autoRotate ? 'always' : 'demand'} dpr={[1, 1.75]} camera={{ position: [4.6, 4.2, 6.4], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} />
      <Box p={p} l={l} t={t} unfolded={unfolded} labels={labels} />
      <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={14} autoRotate={autoRotate} autoRotateSpeed={2.4} />
    </Canvas>
  );
}
