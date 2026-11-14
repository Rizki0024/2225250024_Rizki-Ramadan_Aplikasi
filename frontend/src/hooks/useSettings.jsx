// Pengaturan per perangkat: suara guru, kecepatan bicara, tampilan guru, mode 2D, kurangi animasi.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { load, save } from '../utils/storage.js';

const KEY = 'kb_settings';
export const DEFAULT_SETTINGS = { muted: false, rate: 1, prefer2D: false, reduceMotion: false };

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, update: () => {} });

function initial() {
  const s = { ...DEFAULT_SETTINGS, ...(load(KEY, {}) || {}) };
  delete s.teacherLook; // pilihan tampilan guru lama dihapus pada v3.1
  // kompatibel dengan kunci lama v2
  if (load('kb_muted', null) === true) s.muted = true;
  if (load('kb_view2d', null) === true) s.prefer2D = true;
  return s;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(initial);
  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save(KEY, next);
      save('kb_muted', next.muted);
      save('kb_view2d', next.prefer2D);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
