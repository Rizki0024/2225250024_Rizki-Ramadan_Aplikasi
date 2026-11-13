import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import { ErrorBox, Loading } from '../components/common.jsx';
import MaterialBlocks from '../features/materials/MaterialBlocks.jsx';
import { api } from '../services/api.js';
import { load, save } from '../utils/storage.js';

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
  return (
    <Page title="Materi">
      <p className="muted">Pelajari berurutan dari nomor 1.</p>
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorBox error={error} onRetry={retry} /> : null}
      {data ? (
        <div className="stack">
          {data.map((m) => (
            <Link key={m.slug} to={`/materi/${m.slug}`} className="list-link">
              <span className="num">{m.order_no}</span>
              <span className="grow"><strong>{m.title}</strong><span>{m.summary}</span></span>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      ) : null}
    </Page>
  );
}

export function MaterialDetail() {
  const { slug } = useParams();
  const fetcher = useCallback(() => api.material(slug), [slug]);
  const { data, error, loading, retry } = useCached(`kb_material_${slug}`, fetcher);
  const list = load('kb_materials') || [];
  const idx = list.findIndex((m) => m.slug === slug);
  const next = idx >= 0 ? list[idx + 1] : null;

  return (
    <Page title={data?.title || 'Materi'} back="/materi">
      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorBox error={error} onRetry={retry} /> : null}
      {data ? (
        <>
          <h1>{data.title}</h1>
          <MaterialBlocks blocks={data.content} />
          <div className="btn-row">
            {next ? <Link className="btn" to={`/materi/${next.slug}`}>Lanjut: {next.title}</Link>
              : <Link className="btn" to="/latihan">Lanjut ke Latihan</Link>}
            <Link className="btn secondary" to="/visualisasi">Lihat Visualisasi 3D</Link>
          </div>
        </>
      ) : null}
    </Page>
  );
}
