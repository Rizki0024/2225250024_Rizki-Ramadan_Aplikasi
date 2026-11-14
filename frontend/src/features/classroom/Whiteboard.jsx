// Papan tulis digital: butir muncul bertahap sesuai penjelasan; butir yang sedang dibahas disorot (ditunjuk guru).
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BoxFigure, NetFigure, RectFigure, SquareFigure } from '../shapes/Shape2D.jsx';
import { EASE } from '../../components/motion.jsx';

function Figure({ item }) {
  const d = item.dims || {};
  switch (item.figure) {
    case 'square': return <SquareFigure s={d.s} />;
    case 'rectangle': return <RectFigure p={d.p} l={d.l} />;
    case 'cube': return <BoxFigure p={d.s} l={d.s} t={d.s} cube />;
    case 'cuboid': return <BoxFigure p={d.p} l={d.l} t={d.t} />;
    case 'cube-net': return <NetFigure p={d.s} l={d.s} t={d.s} cube />;
    case 'cuboid-net': return <NetFigure p={d.p} l={d.l} t={d.t} />;
    default: return null;
  }
}

function Item({ item }) {
  switch (item.type) {
    case 'title': return <div className="wb-title">{item.text}</div>;
    case 'formula': return <div className="wb-formula">{item.text}</div>;
    case 'tip': return <div className="wb-tip">{item.text}</div>;
    case 'pair': return <div className="wb-line"><span className={`swatch ${item.color}`} aria-hidden="true" /> {item.text}</div>;
    case 'figure': return <div className="wb-figure"><Figure item={item} /></div>;
    default: return <div className="wb-line">{item.text}</div>;
  }
}

export default function Whiteboard({ board, revealed, active, segmentKey, autoScroll = true, maxItems = null }) {
  const refs = useRef({});
  useEffect(() => {
    if (!autoScroll || active === null || active === undefined) return;
    refs.current[active]?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [active, autoScroll]);

  const figure = board.findIndex((b) => b.type === 'figure');
  return (
    <div className="whiteboard" aria-label="Papan tulis" aria-live="polite">
      <div className={`wb-grid${figure >= 0 ? ' has-figure' : ''}`}>
        <AnimatePresence initial={false}>
          {board.slice(0, revealed).map((item, i) => ({ item, i }))
            // Mode video: judul + beberapa butir terakhir saja agar muat di papan kecil.
            .filter(({ i }) => maxItems === null || i === 0 || i >= revealed - maxItems)
            .map(({ item, i }) => (
            <motion.div key={`${segmentKey}-${i}`} ref={(el) => { refs.current[i] = el; }}
              className={`wb-item wb-${item.type}${i === active ? ' is-active' : ''}`}
              data-board-index={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}>
              {i === active ? <span className="wb-pointer" aria-hidden="true">👉</span> : null}
              <Item item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
