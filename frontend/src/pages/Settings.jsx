import { useNavigate } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { Stagger, StaggerItem } from '../components/motion.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSettings } from '../hooks/useSettings.jsx';
import TeacherAvatar, { LOOKS } from '../features/teacher/TeacherAvatar.jsx';
import { speak } from '../features/voice/speech.js';

function Switch({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />;
}

export default function Settings() {
  const { settings, update } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Page title="Pengaturan" back="/beranda">
      <Stagger className="stack">
        <StaggerItem className="card">
          <strong>Suara & guru virtual</strong>
          <div className="setting-row">
            <span className="label"><strong>Suara guru</strong><span>Bu Sari membacakan penjelasan</span></span>
            <Switch checked={!settings.muted} onChange={(v) => update({ muted: !v })} label="Suara guru" />
          </div>
          <div className="setting-row">
            <span className="label"><strong>Kecepatan bicara</strong><span>Pilih yang paling nyaman didengar</span></span>
            <div className="segmented" role="radiogroup" aria-label="Kecepatan bicara">
              {[[0.85, 'Pelan'], [1, 'Normal'], [1.15, 'Cepat']].map(([r, l]) => (
                <button key={r} type="button" role="radio" aria-checked={settings.rate === r} className={settings.rate === r ? 'active' : ''}
                  onClick={() => { update({ rate: r }); speak('Halo, ini kecepatan suara Bu Sari.', { rate: r, muted: settings.muted }); }}>{l}</button>
              ))}
            </div>
          </div>
          <div className="setting-row" style={{ alignItems: 'flex-start' }}>
            <span className="label"><strong>Tampilan guru</strong><span>Karakter yang mengajar di kelas</span></span>
          </div>
          <div className="row" role="radiogroup" aria-label="Tampilan guru" style={{ justifyContent: 'center', gap: 16 }}>
            {Object.entries(LOOKS).map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={settings.teacherLook === key} onClick={() => update({ teacherLook: key })}
                className="card" style={{ border: settings.teacherLook === key ? '3px solid var(--blue-600)' : '3px solid transparent', cursor: 'pointer', padding: 8, display: 'grid', justifyItems: 'center', gap: 4, font: 'inherit', fontWeight: 800 }}>
                <TeacherAvatar size={90} look={key} expression="happy" />
                {label}
              </button>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem className="card">
          <strong>Tampilan</strong>
          <div className="setting-row">
            <span className="label"><strong>Mode 2D</strong><span>Lebih ringan untuk HP yang lambat</span></span>
            <Switch checked={settings.prefer2D} onChange={(v) => update({ prefer2D: v })} label="Mode 2D" />
          </div>
          <div className="setting-row">
            <span className="label"><strong>Kurangi animasi</strong><span>Mematikan gerakan yang tidak perlu</span></span>
            <Switch checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} label="Kurangi animasi" />
          </div>
        </StaggerItem>

        <StaggerItem className="card stack">
          <strong>Privasi</strong>
          <p className="small muted" style={{ margin: 0 }}>Bu Sari adalah guru virtual (program komputer). Suaramu diubah menjadi teks oleh browser dan tidak direkam atau disimpan oleh aplikasi.</p>
        </StaggerItem>

        <StaggerItem>
          <button type="button" className="btn secondary block" onClick={() => { logout(); navigate('/masuk'); }}>
            <Icon name="logout" size={20} /> Keluar
          </button>
        </StaggerItem>
      </Stagger>
    </Page>
  );
}
