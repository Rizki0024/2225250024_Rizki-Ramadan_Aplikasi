// Perender blok materi (format: docs/content.md §4).
import { useState } from 'react';
import ShapeFigure from '../shapes/ShapeFigure.jsx';
import SolutionSteps, { availableParts } from '../../components/SolutionSteps.jsx';

function Example({ block }) {
  const total = availableParts(block).length;
  const [shown, setShown] = useState(0);
  return (
    <section className="card stack" aria-label={block.title}>
      <h3>{block.title}</h3>
      <p><strong>Soal:</strong> {block.soal}</p>
      {shown > 0 ? <SolutionSteps solution={block} limit={shown} /> : null}
      <div className="btn-row">
        {shown < total ? (
          <>
            <button type="button" className="btn" onClick={() => setShown((n) => n + 1)}>
              {shown === 0 ? 'Mulai pembahasan' : 'Langkah berikutnya'}
            </button>
            <button type="button" className="btn ghost" onClick={() => setShown(total)}>Tampilkan semua</button>
          </>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setShown(0)}>Tutup pembahasan</button>
        )}
      </div>
    </section>
  );
}

function Block({ block }) {
  switch (block.type) {
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'text':
      return <p>{block.text}</p>;
    case 'list':
      return <ul style={{ margin: 0, paddingLeft: 22 }}>{block.items.map((x) => <li key={x}>{x}</li>)}</ul>;
    case 'formula':
      return (
        <div className="formula">
          <div className="label">{block.label}</div>
          <div className="expr">{block.expr}</div>
          {block.note ? <div className="small muted">{block.note}</div> : null}
        </div>
      );
    case 'figure':
      return <ShapeFigure figure={block.figure} dims={block.dims} caption={block.caption} />;
    case 'steps':
      return (
        <div className="card soft">
          <h3>{block.title}</h3>
          <ol className="steps">{block.items.map((x) => <li key={x}>{x}</li>)}</ol>
        </div>
      );
    case 'pairs':
      return (
        <div className="pairs">
          {block.items.map((it) => (
            <div className="pair" key={it.name}>
              <span className={`swatch ${it.color}`} aria-hidden="true" />
              <span style={{ flex: 1 }}>{it.name}</span>
              <strong>{it.expr}</strong>
            </div>
          ))}
        </div>
      );
    case 'compare':
      return (
        <div className="table-wrap">
          <table className="compare">
            <thead><tr><th>Aspek</th><th>Kubus</th><th>Balok</th></tr></thead>
            <tbody>{block.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'example':
      return <Example block={block} />;
    case 'tip':
      return <div className="tip">{block.text}</div>;
    default:
      return null;
  }
}

/**
 * Gambar (figure) dipasangkan dengan blok-blok sesudahnya sampai heading berikutnya,
 * sehingga di laptop tampil berdampingan dan di HP gambar tepat di atas penjelasannya.
 */
function groupBlocks(blocks) {
  const groups = [];
  let current = null;
  for (const b of blocks) {
    if (b.type === 'figure') {
      current = { figure: b, rest: [] };
      groups.push(current);
    } else if (b.type === 'heading' || b.type === 'example') {
      current = null;
      groups.push({ single: b });
    } else if (current) {
      current.rest.push(b);
    } else {
      groups.push({ single: b });
    }
  }
  return groups;
}

export default function MaterialBlocks({ blocks }) {
  return (
    <div className="stack">
      {groupBlocks(blocks).map((g, i) =>
        g.single ? (
          <Block key={i} block={g.single} />
        ) : (
          <div className="with-figure" key={i}>
            <Block block={g.figure} />
            {g.rest.length ? <div className="stack">{g.rest.map((b, j) => <Block key={j} block={b} />)}</div> : null}
          </div>
        ),
      )}
    </div>
  );
}
