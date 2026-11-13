import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { OfflineBanner } from './components/common.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import { MaterialDetail, MaterialList } from './pages/Materials.jsx';
import Visualization from './pages/Visualization.jsx';
import { PracticeMenu, PracticeRoute } from './pages/Practice.jsx';
import { EvaluationIntro, EvaluationSession } from './pages/Evaluation.jsx';
import { ResultDetail, ResultList } from './pages/Results.jsx';
import Guide from './pages/Guide.jsx';

const guard = (el) => <RequireAuth>{el}</RequireAuth>;

function NotFound() {
  return (
    <main className="landing">
      <h1>Halaman tidak ditemukan</h1>
      <Link className="btn" to="/">Kembali ke awal</Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <OfflineBanner />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/masuk" element={<Login />} />
            <Route path="/beranda" element={guard(<Home />)} />
            <Route path="/materi" element={guard(<MaterialList />)} />
            <Route path="/materi/:slug" element={guard(<MaterialDetail />)} />
            <Route path="/visualisasi" element={guard(<Visualization />)} />
            <Route path="/latihan" element={guard(<PracticeMenu />)} />
            <Route path="/latihan/:level" element={guard(<PracticeRoute />)} />
            <Route path="/evaluasi" element={guard(<EvaluationIntro />)} />
            <Route path="/evaluasi/kerjakan" element={guard(<EvaluationSession />)} />
            <Route path="/hasil" element={guard(<ResultList />)} />
            <Route path="/hasil/:id" element={guard(<ResultDetail />)} />
            <Route path="/petunjuk" element={guard(<Guide />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
