import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, SESSION_KEY } from '../services/api.js';
import { load, remove, save } from '../utils/storage.js';

const AuthContext = createContext(null);

function readSession() {
  const s = load(SESSION_KEY);
  if (!s?.token || !s?.student) return null;
  if (s.expires_at && new Date(s.expires_at).getTime() <= Date.now()) {
    remove(SESSION_KEY);
    return null;
  }
  return s;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [notice, setNotice] = useState('');

  const logout = useCallback((message = '') => {
    remove(SESSION_KEY);
    setSession(null);
    setNotice(message);
  }, []);

  useEffect(() => {
    const onExpired = () => logout('Sesi berakhir. Silakan masuk lagi.');
    window.addEventListener('kb:auth-expired', onExpired);
    return () => window.removeEventListener('kb:auth-expired', onExpired);
  }, [logout]);

  const login = useCallback(async (code, pin) => {
    const data = await api.login(code, pin);
    const next = { token: data.token, expires_at: data.expires_at, student: data.student };
    save(SESSION_KEY, next);
    setSession(next);
    setNotice('');
    return data.student;
  }, []);

  const value = useMemo(
    () => ({ student: session?.student ?? null, isLoggedIn: !!session, login, logout, notice, clearNotice: () => setNotice('') }),
    [session, login, logout, notice],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
