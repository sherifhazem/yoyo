let ctx = null;
let on = false;
export const setSound = (v) => { on = v; if (v && !ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } };
function tone(f, t0, dur, type = 'sine', vol = 0.08) {
  if (!on || !ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  const t = ctx.currentTime + t0;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
export const sfx = {
  plant: () => { tone(300, 0, 0.1, 'triangle'); tone(420, 0.06, 0.1, 'triangle'); },
  water: () => { tone(500, 0, 0.08); tone(420, 0.07, 0.08); tone(360, 0.14, 0.1); },
  pop: () => { tone(520, 0, 0.1, 'square', 0.05); tone(780, 0.07, 0.14, 'square', 0.05); },
  coin: () => { tone(880, 0, 0.08, 'square', 0.05); tone(1320, 0.07, 0.2, 'square', 0.05); },
  err: () => { tone(180, 0, 0.18, 'sawtooth', 0.06); },
  level: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle', 0.09)); },
  click: () => tone(600, 0, 0.04, 'triangle', 0.04),
};
