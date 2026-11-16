import { useNavigate } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import Teacher from '../features/characters/BuSari.jsx';
import { BulbArt } from '../features/illustrations/Illustrations.jsx';

const QUICK = [
  'Pelajari materi secara bertahap',
  'Tonton video dan ajukan pertanyaan',
  'Kerjakan latihan dan evaluasi',
  'Lihat hasil belajar',
];

const STEPS = [
  ['Belajar Bersama Guru', 'Pilih pelajaran, lalu tekan Mulai (kelas interaktif) atau Video. Tekan Tanya / Ajukan Pertanyaan kapan saja; setelah terjawab, Bu Sari melanjutkan dari bagian terakhir.'],
  ['Materi', 'Materi tampil per slide. Tekan Lanjut untuk konsep berikutnya, tombol ▶ untuk dibacakan, atau "Lihat semua" untuk membaca seluruhnya.'],
  ['Visualisasi 3D', 'Geser untuk memutar, tekan Putar untuk rotasi otomatis, dan Jaring-jaring untuk membuka bangun. Jika HP berat, pilih Mode 2D.'],
  ['Latihan', 'Jawab soal, tekan Periksa Jawaban, lalu baca pembahasan. Dapatkan ★★★ dengan menjawab 5 soal benar.'],
  ['Evaluasi', '4 soal cerita bertahap (Formulate, Employ, Interpret, Reasoning) dalam 30 menit. Setiap tahap punya skor, total 24. Jawaban baru dinilai setelah dikumpulkan dan tersimpan otomatis di perangkat.'],
  ['Profil & Pengaturan', 'Lihat progres dan lencana di Profil. Atur suara, kecepatan bicara, tampilan guru, dan animasi di Pengaturan.'],
];

export default function Guide() {
  const navigate = useNavigate();
  return (
    <Page title="Petunjuk">
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="row between" style={{ flexWrap: 'nowrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Cara Menggunakan Aplikasi</h1>
          <span className="float-y"><BulbArt size={52} /></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
          <ol className="steps" style={{ margin: '8px 0' }}>
            {QUICK.map((q) => <li key={q}><strong>{q}</strong></li>)}
          </ol>
          <Teacher size={130} expression="happy" pose="point" />
        </div>
        <button type="button" className="btn block" onClick={() => navigate('/beranda')}>Mengerti <Icon name="check" size={18} /></button>
      </div>

      <div className="card stack">
        <h2>Penjelasan setiap menu</h2>
        <ol className="steps">
          {STEPS.map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}
        </ol>
      </div>
      <div className="card soft stack">
        <h2>Menulis jawaban angka</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li>Tulis angkanya saja, satuan sudah tertulis di samping kotak.</li>
          <li>Desimal memakai koma: <strong>4,5</strong></li>
          <li>Ribuan boleh dengan titik: <strong>1.800</strong> atau tanpa titik: <strong>1800</strong></li>
        </ul>
      </div>
      <div className="card soft stack">
        <h2>Tentang suara & Bu Sari</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li>Bu Sari adalah <strong>guru virtual (program komputer)</strong>, bukan manusia.</li>
          <li>Suaramu diubah menjadi teks oleh fitur pengenalan suara browser. Aplikasi <strong>tidak merekam atau menyimpan suara</strong>.</li>
          <li>Teks yang didengar Bu Sari selalu ditampilkan dulu, jadi kamu bisa mengubahnya sebelum terkirim.</li>
          <li>Jika mikrofon tidak diizinkan atau suara Indonesia tidak tersedia, kamu tetap bisa mengetik dan membaca teks penjelasan.</li>
        </ul>
      </div>
      <div className="card soft stack">
        <h2>Jika ada masalah</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li><strong>"Server belum bisa dihubungi"</strong>: tunggu sebentar lalu tekan Coba lagi.</li>
          <li><strong>Lupa PIN</strong>: minta guru untuk mengatur ulang.</li>
          <li><strong>Gambar 3D tidak muncul</strong>: pilih Mode 2D di Visualisasi atau Pengaturan.</li>
        </ul>
      </div>
    </Page>
  );
}
