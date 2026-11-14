import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Teacher from '../features/characters/Teacher.jsx';
import { speak } from '../features/voice/speech.js';
import { useSettings } from '../hooks/useSettings.jsx';
import { Link, useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import { ErrorBox, Loading } from '../components/common.jsx';
import MaterialBlocks from '../features/materials/MaterialBlocks.jsx';
import { api } from '../services/api.js';
import { load, save } from '../utils/storage.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { markMaterialRead, readMaterials } from '../features/progress/progress.js';
import { CardLink, Stagger } from '../components/motion.jsx';
import Icon from '../components/Icon.jsx';

/** Mengambil data dengan cadangan cache lokal agar materi tetap terbaca saat offline. */
function useCached(key, fetcher) {
  const [data, setData] = useState(() => load(key));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!data);
  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => { setData(d); save(key, d); })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [key, fetcher]);
  useEffect(() => { run(); }, [run]);
  return { data, error, loading, retry: run };
}

export function MaterialList() {
  const { data, error, loading, retry } = useCached('kb_materials', api.materials);
  const { student } = useAuth();
  const read = new Set(readMaterials(student.code));
  return (
    <Page title="Materi">
      <p className="muted">Pelajari berurutan dari nomor 1.</p>
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorBox error={error} onRetry={retry} /> : null}
      {data ? (
        <Stagger className="stack">
          {data.map((m) => (
            <CardLink key={m.slug} to={`/materi/${m.slug}`} className="list-link">
              <span className="num">{m.order_no}</span>
              <span className="grow"><strong>{m.title}</strong><span>{m.summary}</span></span>
              {read.has(m.slug) ? <span className="check-badge" title="Sudah dibuka"><Icon name="check" size={16} /></span> : <span aria-hidden="true">›</span>}
            </CardLink>
          ))}
        </Stagger>
      ) : null}
    </Page>
  );
}

/** Membagi blok materi menjadi slide per subjudul (satu konsep per layar). */
export function toSlides(title, blocks) {
  const slides = [];
  let cur = { title, blocks: [] };
  for (const b of blocks) {
    if (b.type === 'heading') {
      if (cur.blocks.length) slides.push(cur);
      cur = { title: b.text, blocks: [] };
    } else {
      cur.blocks.push(b);
    }
  }
  if (cur.blocks.length) slides.push(cur);
  return slides;
}

function slideSpeech(slide) {
  const parts = [slide.title];
  for (const b of slide.blocks) {
    if (b.type === 'text' || b.type === 'tip') parts.push(b.text);
    else if (b.type === 'list' || b.type === 'steps') parts.push(...b.items);
    else if (b.type === 'formula') parts.push(`${b.label}: ${b.expr}`);
    else if (b.type === 'pairs') parts.push(...b.items.map((x) => `${x.name}: ${x.expr}`));
    else if (b.type === 'example') parts.push(`${b.title}. ${b.soal}`);
  }
  return parts.join('. ').replace(/×/g, ' kali ');
}

export function MaterialDetail() {
  const { slug } = useParams();
  const fetcher = useCallback(() => api.material(slug), [slug]);
  const { data, error, loading, retry } = useCached(`kb_material_${slug}`, fetcher);
  const { student } = useAuth();
  const { settings } = useSettings();
  const [idx, setIdx] = useState(0);
  const [all, setAll] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speech = useRef(null);
  useEffect(() => { if (data) markMaterialRead(student.code, slug); }, [data, slug, student.code]);
  useEffect(() => () => speech.current?.cancel(), []);
  useEffect(() => { speech.current?.cancel(); setSpeaking(false); }, [idx, all]);
  const list = load('kb_materials') || [];
  const pos = list.findIndex((m) => m.slug === slug);
  const next = pos >= 0 ? list[pos + 1] : null;
  const slides = data ? toSlides(data.title, data.content) : [];
  const slide = slides[Math.min(idx, slides.length - 1)];
  const last = idx >= slides.length - 1;

  const readAloud = () => {
    if (speaking) { speech.current?.cancel(); setSpeaking(false); return; }
    speech.current = speak(slideSpeech(slide), { muted: settings.muted, rate: settings.rate, onStart: () => setSpeaking(true) });
    setSpeaking(true);
    speech.current.done.then(() => setSpeaking(false));
  };

  return (
    <Page title="Materi Pembelajaran" back="/materi">
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorBox error={error} onRetry={retry} /> : null}
      {data ? (
        <>
          <div className="row between">
            <h1 className="slide-title">{data.title}</h1>
            <button type="button" className="btn secondary small" onClick={() => setAll((a) => !a)} aria-pressed={all}>
              {all ? 'Mode slide' : 'Lihat semua'}
            </button>
          </div>
          {all ? (
            <div className="card"><MaterialBlocks blocks={data.content} /></div>
          ) : (
            <>
              <div className="slide-stage">
                <Teacher size={220} expression={speaking ? 'explaining' : 'happy'} pose={speaking ? 'talk' : 'point'} speaking={speaking} />
                <AnimatePresence mode="wait">
                  <motion.div key={idx} className="slide-board stack" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                    <h2 style={{ marginBottom: 0 }}>{slide.title}</h2>
                    <MaterialBlocks blocks={slide.blocks} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="slide-nav">
                <button type="button" className="btn secondary" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}><Icon name="back" size={18} /> Kembali</button>
                <div className="center">
                  <button type="button" className="round-play" onClick={readAloud} aria-label={speaking ? 'Hentikan bacaan' : 'Bacakan slide ini'}><Icon name={speaking ? 'pause' : 'play'} size={22} /></button>
                  <div className="slide-dots" aria-label={`Slide ${idx + 1} dari ${slides.length}`}>
                    {slides.map((sl, i) => <button key={i} type="button" className={i === idx ? 'on' : ''} aria-label={`Slide ${i + 1}: ${sl.title}`} onClick={() => setIdx(i)} />)}
                  </div>
                </div>
                {last
                  ? (next ? <Link className="btn" to={`/materi/${next.slug}`}>Lanjut</Link> : <Link className="btn" to="/latihan">Latihan</Link>)
                  : <button type="button" className="btn" onClick={() => setIdx((i) => i + 1)}>Lanjut <Icon name="arrow" size={18} /></button>}
              </div>
              <p className="small" style={{ textAlign: 'center' }}>Slide {idx + 1} dari {slides.length}</p>
            </>
          )}
          <div className="btn-row">
            <Link className="btn yellow" to={`/video/${slug}`}><Icon name="video" size={20} /> Tonton video</Link>
            <Link className="btn secondary" to="/kelas">Belajar bersama guru</Link>
            {next ? <Link className="btn secondary" to={`/materi/${next.slug}`}>Lanjut: {next.title}</Link> : <Link className="btn secondary" to="/latihan">Lanjut ke Latihan</Link>}
          </div>
        </>
      ) : null}
    </Page>
  );
}
