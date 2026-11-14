// Galeri aset karakter: semua pose & ekspresi Bu Sari (untuk pemeriksaan visual & presentasi).
import Page from '../components/Layout.jsx';
import { Link } from 'react-router-dom';
import { EXPRESSIONS, POSES } from '../features/characters/Teacher.jsx';
import Teacher, { useRigManifest } from '../features/characters/BuSari.jsx';

function GalleryStatus() {
  const manifest = useRigManifest();
  return (
    <div className="card row between">
      <span>Sumber karakter guru: <strong>{manifest ? 'ilustrasi raster berlapis (rig)' : 'SVG cadangan — aset raster belum dipasang'}</strong></span>
      <Link className="btn small" to="/karakter/rig">Penyetel Rig</Link>
    </div>
  );
}

export default function CharacterGallery() {
  return (
    <Page title="Galeri Karakter" back="/">
      <h1>Karakter Bu Sari</h1>
      <GalleryStatus />
      <div className="card"><strong>Pose guru</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {POSES.map((p) => <figure key={p} className="figure center"><Teacher size={140} pose={p} expression="happy" /><figcaption>{p}</figcaption></figure>)}
        </div>
      </div>
      <div className="card"><strong>Ekspresi guru</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {EXPRESSIONS.map((e) => <figure key={e} className="figure center"><Teacher size={140} expression={e} /><figcaption>{e}</figcaption></figure>)}
          <figure className="figure center"><Teacher size={140} expression="explaining" pose="talk" speaking /><figcaption>berbicara</figcaption></figure>
        </div>
      </div>
    </Page>
  );
}
