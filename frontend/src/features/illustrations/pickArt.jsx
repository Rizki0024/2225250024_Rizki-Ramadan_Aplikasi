// Memilih ilustrasi sesuai konteks soal (hadiah, kotak, akuarium, cat, kubus, balok, bangun datar).
import { BookArt, ClockArt, CubeArt, GiftArt, PencilArt } from './Illustrations.jsx';

export default function pickArt(prompt = '', size = 76) {
  const t = prompt.toLowerCase();
  if (/kado|hadiah/.test(t)) return <GiftArt size={size} />;
  if (/akuarium|kolam/.test(t)) return <CubeArt size={size} colors={['#bae6fd', '#7dd3fc', '#38bdf8']} />;
  if (/cat|kaleng|dinding|kamar/.test(t)) return <PencilArt size={size} />;
  if (/kotak|karton|sepatu|tisu|lemari/.test(t)) return <GiftArt size={size} />;
  if (/kubus/.test(t)) return <CubeArt size={size} colors={['#93c5fd', '#3b82f6', '#a78bfa']} />;
  if (/balok/.test(t)) return <CubeArt size={size} colors={['#fde68a', '#fb923c', '#f97316']} />;
  if (/persegi|luas/.test(t)) return <BookArt size={size} />;
  return <ClockArt size={size} />;
}
