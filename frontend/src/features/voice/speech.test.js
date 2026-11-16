import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseVoice, isIndonesianLang, speak, voiceStatus } from './speech.js';

describe('pemilihan suara Indonesia', () => {
  it('mengenali kode id-ID, id_ID, dan kode Android lama in-ID/in_ID', () => {
    for (const l of ['id-ID', 'id_ID', 'in-ID', 'in_ID', 'id', 'IN_id']) expect(isIndonesianLang(l)).toBe(true);
    for (const l of ['en-US', 'ms-MY', 'it-IT', 'ind', '']) expect(isIndonesianLang(l)).toBe(false);
  });
  it('memilih suara Indonesia, utamakan suara lokal', () => {
    const voices = [
      { name: 'English', lang: 'en-US', localService: true },
      { name: 'Google Bahasa Indonesia', lang: 'id-ID', localService: false },
      { name: 'Android Indonesian', lang: 'in_ID', localService: true },
    ];
    expect(chooseVoice(voices).name).toBe('Android Indonesian');
    expect(chooseVoice([{ name: 'English', lang: 'en-US' }])).toBeNull();
  });
});

describe('speak()', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  function fakeSynth({ failWith } = {}) {
    const spoken = [];
    const synth = {
      speaking: false, pending: false, getVoices: () => [{ name: 'Indo', lang: 'in-ID', localService: true }],
      addEventListener() {}, removeEventListener() {}, resume() {}, cancel() {},
      speak(u) {
        spoken.push(u);
        setTimeout(() => {
          if (failWith) { u.onerror?.({ error: failWith }); return; }
          u.onstart?.(); u.onend?.();
        }, 5);
      },
    };
    vi.stubGlobal('window', {
      speechSynthesis: synth,
      SpeechSynthesisUtterance: function U(text) { this.text = text; },
      dispatchEvent() {},
    });
    return spoken;
  }

  it('memakai suara Android in-ID (bukan mode teks)', async () => {
    const spoken = fakeSynth();
    const why = await speak('Halo semua').done;
    expect(why).toBe('end');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice.lang).toBe('in-ID');
    expect(voiceStatus.mode).toBe('voice');
  });

  it('galat suara dicatat lalu dilanjutkan dengan mode teks', async () => {
    vi.useFakeTimers();
    fakeSynth({ failWith: 'not-allowed' });
    const p = speak('Halo semua').done;
    await vi.runAllTimersAsync();
    expect(await p).toBe('end');
    expect(voiceStatus.error).toBe('not-allowed');
    expect(voiceStatus.mode).toBe('text');
  });
});

describe('voicesReady', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules(); });

  it('perangkat tanpa suara hanya ditunggu sekali, kalimat berikutnya tidak tertunda', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.stubGlobal('window', {
      speechSynthesis: { getVoices: () => [], addEventListener() {}, removeEventListener() {} },
      SpeechSynthesisUtterance: function U() {}, dispatchEvent() {},
    });
    const mod = await import('./speech.js');
    let first = false;
    mod.voicesReady().then(() => { first = true; });
    await vi.advanceTimersByTimeAsync(1999);
    expect(first).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(first).toBe(true);
    let second = false;
    mod.voicesReady().then(() => { second = true; });
    await Promise.resolve();
    expect(second).toBe(true);
  });
});
