// Klien REST ke backend FastAPI. Frontend TIDAK mengakses Supabase secara langsung.
import { load } from '../utils/storage.js';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
export const SESSION_KEY = 'kb_session';
const TIMEOUT_MS = 25000;

export class ApiError extends Error {
  constructor(message, { status = 0, kind = 'server' } = {}) {
    super(message);
    this.status = status;
    this.kind = kind; // 'offline' | 'unreachable' | 'auth' | 'client' | 'server'
  }
}

export const MESSAGES = {
  offline: 'Kamu sedang offline. Periksa koneksi internet, lalu coba lagi.',
  unreachable: 'Server belum bisa dihubungi. Server gratis mungkin sedang dinyalakan — tunggu ±30 detik lalu coba lagi.',
};

async function request(path, { method = 'GET', body, auth = true, timeout = TIMEOUT_MS } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError(MESSAGES.offline, { kind: 'offline' });
  }
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = load(SESSION_KEY)?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal,
    });
  } catch {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    throw new ApiError(offline ? MESSAGES.offline : MESSAGES.unreachable, { kind: offline ? 'offline' : 'unreachable' });
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respons kosong / bukan JSON */
  }
  if (res.ok) return data;

  const detail = typeof data?.detail === 'string' ? data.detail : null;
  if (res.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent('kb:auth-expired'));
    throw new ApiError(detail || 'Sesi berakhir. Silakan masuk lagi.', { status: 401, kind: 'auth' });
  }
  if (res.status >= 500) {
    throw new ApiError(detail || 'Server sedang bermasalah. Coba lagi sebentar.', { status: res.status, kind: 'server' });
  }
  throw new ApiError(detail || 'Permintaan tidak dapat diproses.', { status: res.status, kind: 'client' });
}

export const api = {
  health: () => request('/api/health', { auth: false, timeout: 60000 }),
  login: (code, pin) => request('/api/auth/login', { method: 'POST', body: { code, pin }, auth: false, timeout: 60000 }),
  me: () => request('/api/auth/me'),
  materials: () => request('/api/materials', { auth: false }),
  material: (slug) => request(`/api/materials/${encodeURIComponent(slug)}`, { auth: false }),
  startEvaluation: () => request('/api/evaluations/start', { method: 'POST' }),
  submitEvaluation: (attemptId, answers) =>
    request(`/api/evaluations/${encodeURIComponent(attemptId)}/submit`, { method: 'POST', body: { answers } }),
  savePractice: (payload) => request('/api/practice/attempts', { method: 'POST', body: payload }),
  attempts: () => request('/api/attempts'),
  attempt: (id) => request(`/api/attempts/${encodeURIComponent(id)}`),
};
