// Pembahasan langkah demi langkah: Diketahui → Ditanyakan → Rumus → Substitusi → Perhitungan → Jawaban → Interpretasi.
export const SOLUTION_PARTS = [
  ['diketahui', 'Diketahui'],
  ['ditanyakan', 'Ditanyakan'],
  ['rumus', 'Rumus'],
  ['substitusi', 'Substitusi'],
  ['perhitungan', 'Perhitungan'],
  ['jawaban', 'Jawaban'],
  ['interpretasi', 'Interpretasi'],
];

export function availableParts(solution) {
  return SOLUTION_PARTS.filter(([key]) => {
    const v = solution?.[key];
    return Array.isArray(v) ? v.length > 0 : v && v !== '—';
  });
}

/** `limit` membatasi jumlah bagian yang ditampilkan (untuk pembahasan bertahap). */
export default function SolutionSteps({ solution, limit }) {
  if (!solution) return null;
  const parts = availableParts(solution).slice(0, limit ?? undefined);
  return (
    <dl className="solution">
      {parts.map(([key, label]) => {
        const v = solution[key];
        const cls = key === 'jawaban' ? 'part answer' : key === 'interpretasi' ? 'part interpret' : 'part';
        return (
          <div className={cls} key={key}>
            <dt>{label}</dt>
            <dd>
              {Array.isArray(v) ? (
                key === 'perhitungan' && v.length > 1 ? (
                  <ol style={{ margin: 0, paddingLeft: 18 }}>{v.map((x, i) => <li key={i}>{x}</li>)}</ol>
                ) : (
                  <ul>{v.map((x, i) => <li key={i}>{x}</li>)}</ul>
                )
              ) : v}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
