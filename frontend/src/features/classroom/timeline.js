// Garis waktu "video pembelajaran": setiap baris naskah guru menjadi potongan waktu (perkiraan durasi bicara).

/** Perkiraan durasi mengucapkan teks (ms). Sama dengan pemutar mode teks. */
export function estimateMs(text, rate = 1) {
  const words = String(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1800, (words * 400) / rate);
}

export function buildTimeline(lesson, rate = 1) {
  const entries = [];
  let t = 0;
  lesson.segments.forEach((seg, si) => {
    seg.script.forEach((line, li) => {
      const dur = estimateMs(line.say, rate);
      entries.push({ seg: si, line: li, start: t, dur });
      t += dur;
    });
  });
  return { entries, total: t };
}

export function timeOf(timeline, seg, line) {
  return timeline.entries.find((e) => e.seg === seg && e.line === line)?.start ?? 0;
}

/** Posisi (bagian & baris) pada waktu t (ms). */
export function positionAt(timeline, t) {
  const clamped = Math.min(Math.max(0, t), Math.max(0, timeline.total - 1));
  let found = timeline.entries[0];
  for (const e of timeline.entries) {
    if (e.start <= clamped) found = e;
    else break;
  }
  return { seg: found.seg, line: found.line };
}

export function segmentStarts(timeline) {
  const starts = [];
  for (const e of timeline.entries) if (e.line === 0) starts.push({ seg: e.seg, start: e.start });
  return starts;
}

export function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
