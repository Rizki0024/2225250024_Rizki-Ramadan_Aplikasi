// Soal bertahap (kisi-kisi Mathematical Literacy): satu soal cerita, dikerjakan tahap demi tahap.
// Setiap tahap punya skor sendiri; jawaban tiap isian disimpan sebagai objek { inputId: nilai }.
import { ProcessBadge } from '../../components/common.jsx';
import { parseNumber } from '../../utils/number.js';

export function stagedInputs(question) {
  return (question.stages || []).flatMap((s) => s.inputs);
}

/** Banyak isian yang sudah diisi. */
export function stagedFilled(question, value) {
  const v = value && typeof value === 'object' ? value : {};
  return stagedInputs(question).filter((i) => v[i.id] !== undefined && String(v[i.id]).trim() !== '').length;
}

/** Banyak isian angka yang formatnya belum benar. */
export function stagedInvalid(question, value) {
  const v = value && typeof value === 'object' ? value : {};
  return stagedInputs(question).filter((i) => i.kind === 'number' && v[i.id] && parseNumber(v[i.id]) === null).length;
}

export default function StagedQuestion({ question, value, onChange, idPrefix = 'st' }) {
  const v = value && typeof value === 'object' ? value : {};
  const set = (id, val) => onChange({ ...v, [id]: val });
  return (
    <div className="stack staged">
      <div className="row" style={{ gap: 8 }}>
        <ProcessBadge process={question.process} />
        <span className="badge points">Skor maksimum {question.max_points}</span>
      </div>
      {question.title ? <h2 className="staged-title">{question.title}</h2> : null}
      <p className="staged-prompt">{question.prompt}</p>
      <ol className="stage-list">
        {question.stages.map((stage) => (
          <li key={stage.id} className="stage-card">
            <div className="stage-head">
              <strong>{stage.title}</strong>
              <span className="badge points">{stage.points} poin</span>
            </div>
            {stage.inputs.map((inp) => {
              const fid = `${idPrefix}-${question.id}-${inp.id}`;
              if (inp.kind === 'choice') {
                return (
                  <fieldset key={inp.id} className="stage-field">
                    <legend>{inp.label}</legend>
                    <div className="options" role="radiogroup" aria-label={inp.label}>
                      {inp.options.map((opt) => {
                        const selected = v[inp.id] === opt.id;
                        return (
                          <button key={opt.id} type="button" role="radio" aria-checked={selected}
                            className={`option${selected ? ' selected' : ''}`} onClick={() => set(inp.id, opt.id)}>
                            <span className="letter">{opt.id}</span><span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              }
              const bad = v[inp.id] && parseNumber(v[inp.id]) === null;
              return (
                <div key={inp.id} className="field stage-field">
                  <label htmlFor={fid}>{inp.label}</label>
                  <div className="input-unit">
                    <input id={fid} className={`input${bad ? ' invalid' : ''}`} type="text" inputMode="decimal" autoComplete="off"
                      maxLength={20} placeholder="Tulis angka…" value={v[inp.id] ?? ''} aria-invalid={!!bad}
                      onChange={(e) => set(inp.id, e.target.value)} />
                    {inp.unit ? <strong>{inp.unit}</strong> : null}
                  </div>
                  {bad ? <p className="error-text" role="alert">Tulis angka saja, contoh: 1.264 atau 4,5.</p> : null}
                </div>
              );
            })}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Pembahasan per tahap setelah dikumpulkan (dari server). */
export function StagedReview({ item }) {
  return (
    <div className="stack staged">
      <div className="row" style={{ gap: 8 }}>
        <ProcessBadge process={item.process} />
        <span className="badge points">Skor {item.points} / {item.max_points}</span>
      </div>
      {item.title ? <h3 className="staged-title">{item.title}</h3> : null}
      <p className="staged-prompt">{item.prompt}</p>
      <ol className="stage-list">
        {item.stages.map((s) => (
          <li key={s.id} className={`stage-card ${s.points === s.max_points ? 'ok' : s.points > 0 ? 'part' : 'no'}`}>
            <div className="stage-head"><strong>{s.title}</strong><span className="badge points">{s.points} / {s.max_points} poin</span></div>
            <ul className="stage-answers">
              {s.inputs.map((i) => {
                const mine = i.kind === 'choice' ? (i.options?.find((o) => o.id === i.student_answer)?.label ?? i.student_answer) : i.student_answer;
                return (
                  <li key={i.id}>
                    <span className="muted small">{i.label}</span><br />
                    <span className={i.is_correct ? 'ans-ok' : 'ans-no'}>{i.is_correct ? '✓' : '✗'} Jawabanmu: {mine ? `${mine}${i.kind === 'number' && i.unit ? ` ${i.unit}` : ''}` : '(kosong)'}</span>
                    {!i.is_correct ? <><br /><span className="small">Kunci: {i.correct_label}{i.kind === 'number' && i.unit ? ` ${i.unit}` : ''}</span></> : null}
                  </li>
                );
              })}
            </ul>
            {s.explanation ? <p className="small stage-expl"><strong>Pembahasan:</strong> {s.explanation}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
