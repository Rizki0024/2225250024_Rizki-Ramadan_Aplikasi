import { Link } from 'react-router-dom';
import Page from '../components/Layout.jsx';

const STEPS = [
  ['Belajar Bersama Guru', 'Buka menu Guru, pilih pelajaran, lalu tekan Mulai. Bu Sari menjelaskan di papan tulis. Tekan Tanya (mikrofon) kapan saja untuk menyela; setelah pertanyaanmu terjawab, Bu Sari melanjutkan dari bagian terakhir.'],
  ['Materi', 'Baca materi berurutan: Prasyarat → Kubus → Balok → Soal Cerita. Tekan "Mulai pembahasan" pada contoh soal untuk melihat langkahnya satu per satu.'],
  ['Visualisasi 3D', 'Geser gambar dengan jari atau mouse untuk memutar. Ubah ukuran dengan penggeser, lalu tekan "Buka jaring-jaring". Jika HP terasa berat, pilih tampilan 2D.'],
  ['Latihan', 'Pilih level. Jawab soal, tekan "Periksa jawaban", lalu baca pembahasan. Dapatkan ★★★ dengan menjawab 5 soal benar.'],
  ['Evaluasi', '10 soal dalam 30 menit. Jawaban baru dinilai setelah kamu menekan "Kumpulkan". Jawaban tersimpan otomatis, jadi aman jika halaman tertutup.'],
  ['Hasil Belajar', 'Lihat nilai, jumlah benar dan salah, serta pembahasan evaluasi kapan saja.'],
];

export default function Guide() {
  return (
    <Page title="Petunjuk">
      <h1>Cara memakai aplikasi</h1>
      <ol className="steps">
        {STEPS.map(([title, text]) => (
          <li key={title}><strong>{title}.</strong> {text}</li>
        ))}
      </ol>
      <div className="card soft stack">
        <h2>Menulis jawaban angka</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li>Tulis angkanya saja, satuan sudah tertulis di samping kotak.</li>
          <li>Desimal memakai koma: <strong>4,5</strong></li>
          <li>Ribuan boleh dengan titik: <strong>1.800</strong> atau tanpa titik: <strong>1800</strong></li>
        </ul>
      </div>
      <div className="card soft stack">
        <h2>Jika ada masalah</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li><strong>"Server belum bisa dihubungi"</strong>: tunggu ±30 detik lalu tekan Coba lagi.</li>
          <li><strong>Lupa PIN</strong>: minta guru untuk mengatur ulang.</li>
          <li><strong>Gambar 3D tidak muncul</strong>: pilih tombol 2D di halaman Visualisasi.</li>
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
      <Link className="btn" to="/kelas">Mulai belajar bersama Bu Sari</Link>
    </Page>
  );
}
