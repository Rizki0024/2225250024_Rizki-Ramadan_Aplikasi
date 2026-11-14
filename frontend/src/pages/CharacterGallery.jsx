// Galeri aset karakter v3: semua pose & ekspresi guru, serta pose siswa (untuk pemeriksaan visual & presentasi).
import Page from '../components/Layout.jsx';
import Teacher, { EXPRESSIONS, POSES } from '../features/characters/Teacher.jsx';
import Student from '../features/characters/Student.jsx';

export default function CharacterGallery() {
  return (
    <Page title="Galeri Karakter" back="/">
      <h1>Karakter Bu Sari & siswa</h1>
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
      <div className="card"><strong>Siswa</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {['thumb', 'wave', 'idle'].map((p) => <figure key={p} className="figure center"><Student size={140} pose={p} /><figcaption>{p}</figcaption></figure>)}
        </div>
      </div>
    </Page>
  );
}
