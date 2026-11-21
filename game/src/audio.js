// Kembar Beda: all sounds are synthesized with WebAudio, no audio files.
// A tiny synth: short oscillator blips with an envelope, nothing fetched.
let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

function tone(freq, startAt, duration, type, volume) {
  if (muted) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

/** Bright two-note chime when a difference is found. */
export function playFind(combo) {
  const lift = Math.min(combo, 8) * 24;
  tone(660 + lift, 0, 0.16, 'sine', 0.22);
  tone(990 + lift, 0.09, 0.24, 'sine', 0.2);
}

/** Low buzz for a wrong click. */
export function playMiss() {
  tone(160, 0, 0.18, 'square', 0.1);
  tone(120, 0.05, 0.2, 'square', 0.08);
}

/** Soft ping for a hint. */
export function playHint() {
  tone(520, 0, 0.12, 'triangle', 0.16);
  tone(780, 0.08, 0.18, 'triangle', 0.14);
}

/** Little click for buttons. */
export function playClick() {
  tone(440, 0, 0.07, 'triangle', 0.12);
}

/** Rising arpeggio for a completed level. */
export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => tone(freq, i * 0.11, 0.26, 'sine', 0.2));
}

/** Gentle descending notes for time up. */
export function playLose() {
  const notes = [392, 330, 262];
  notes.forEach((freq, i) => tone(freq, i * 0.14, 0.3, 'triangle', 0.16));
}
