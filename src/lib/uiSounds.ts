
/**
 * UI Sounds System menggunakan Web Audio API
 * Menghasilkan suara digital yang jernih tanpa perlu file MP3.
 */

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/** Suara 'Pop' saat klik tombol */
export function playClickSfx() {
  const c = getCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(600, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(0.01, c.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.1);
    o.start(); o.stop(c.currentTime + 0.1);
  } catch (e) {}
}

/** Suara 'Tada' saat jawaban benar */
export function playSuccessSfx() {
  const c = getCtx();
  if (!c) return;
  try {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine';
      const t = c.currentTime + (i * 0.1);
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      o.start(t); o.stop(t + 0.4);
    });
  } catch (e) {}
}

/** Suara 'Boing' saat jawaban salah */
export function playErrorSfx() {
  const c = getCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(150, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.3);
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3);
    o.start(); o.stop(c.currentTime + 0.3);
  } catch (e) {}
}

/** Wrapper untuk kompatibilitas */
export const playUISound = (type: 'success' | 'click' | 'wrong' | 'pop') => {
  switch (type) {
    case 'success': playSuccessSfx(); break;
    case 'click': playClickSfx(); break;
    case 'wrong': playErrorSfx(); break;
    case 'pop': playClickSfx(); break;
  }
};
