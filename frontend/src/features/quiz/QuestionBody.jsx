// Tampilan satu soal (pilihan ganda atau isian angka) — dipakai latihan & evaluasi.
import { ProcessBadge } from '../../components/common.jsx';

/**
 * props:
 *  question  { type, prompt, options, unit, process }
 *  value     jawaban saat ini (id opsi / teks angka)
 *  onChange  (value) => void
 *  locked    true setelah jawaban diperiksa (latihan)
 *  correctId id opsi benar untuk diwarnai saat locked (latihan)
 *  error     pesan validasi input
 */
export default function QuestionBody({ question, value, onChange, locked = false, correctId, error, inputId = 'jawaban', onEnter, art = null }) {
  const grid = question.type === 'mc' && question.options.every((o) => o.label.length <= 22);
  return (
    <div className="stack">
      <div><ProcessBadge process={question.process} /></div>
      {art ? (
        <div className="q-art-row"><span aria-hidden="true">{art}</span><p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{question.prompt}</p></div>
      ) : <p style={{ fontSize: '1.08rem', fontWeight: 600 }}>{question.prompt}</p>}

      {question.type === 'mc' ? (
        <div className={`options${grid ? ' grid2' : ''}`} role="radiogroup" aria-label="Pilihan jawaban">
          {question.options.map((opt, i) => {
            let cls = 'option';
            if (locked && opt.id === correctId) cls += ' correct';
            else if (locked && opt.id === value) cls += ' wrong';
            else if (opt.id === value) cls += ' selected';
            return (
              <button key={opt.id} type="button" className={cls} role="radio" aria-checked={opt.id === value}
                disabled={locked} onClick={() => onChange(opt.id)}>
                <span className="letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="field">
          <label htmlFor={inputId}>Jawabanmu</label>
          <div className="input-unit">
            <input id={inputId} className={`input${error ? ' invalid' : ''}`} type="text" inputMode="decimal"
              autoComplete="off" placeholder={`Masukkan jawaban…${question.unit ? ` ${question.unit}` : ''}`} value={value ?? ''} disabled={locked} maxLength={20}
              aria-invalid={!!error} aria-describedby={error ? `${inputId}-err` : undefined}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }} />
            {question.unit ? <strong>{question.unit}</strong> : null}
          </div>
          <span className="muted small">Gunakan koma untuk desimal, contoh: 4,5</span>
        </div>
      )}
      {error ? <p id={`${inputId}-err`} className="error-text" role="alert">{error}</p> : null}
    </div>
  );
}
