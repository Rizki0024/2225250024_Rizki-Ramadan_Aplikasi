import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AuthProvider } from './hooks/useAuth.jsx';
import { SettingsProvider, useSettings } from './hooks/useSettings.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import TabBar from './components/TabBar.jsx';
import { OfflineBanner } from './components/common.jsx';
import { PageMotion } from './components/motion.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import { MaterialDetail, MaterialList } from './pages/Materials.jsx';
import Visualization from './pages/Visualization.jsx';
import { PracticeMenu, PracticeRoute } from './pages/Practice.jsx';
import { EvaluationIntro, EvaluationSession } from './pages/Evaluation.jsx';
import { ResultDetail, ResultList } from './pages/Results.jsx';
import Guide from './pages/Guide.jsx';
import { ClassroomList, ClassroomRoute } from './pages/Classroom.jsx';
import VideoLesson from './pages/VideoLesson.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import CharacterGallery from './pages/CharacterGallery.jsx';
import RigTuner from './pages/RigTuner.jsx';

const guard = (el) => <RequireAuth>{el}</RequireAuth>;

function NotFound() {
  return (
    <PageMotion className="splash">
      <h1 className="on-blue">Halaman tidak ditemukan</h1>
      <Link className="btn yellow" to="/">Kembali ke awal</Link>
    </PageMotion>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/beranda" element={guard(<Home />)} />
        <Route path="/profil" element={guard(<Profile />)} />
        <Route path="/pengaturan" element={guard(<Settings />)} />
        <Route path="/kelas" element={guard(<ClassroomList />)} />
        <Route path="/kelas/:slug" element={guard(<ClassroomRoute />)} />
        <Route path="/video/:slug" element={guard(<VideoLesson />)} />
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
        <Route path="/karakter" element={<CharacterGallery />} />
        <Route path="/karakter/rig" element={<RigTuner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function Shell() {
  const { settings } = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
  }, [settings.reduceMotion]);
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      <div className="app">
        <OfflineBanner />
        <AnimatedRoutes />
        <TabBar />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
