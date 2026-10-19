let ctx;

function tone(freq, dur, type = 'sine', delay = 0, vol = 0.15) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  tap: () => tone(520, 0.08, 'triangle'),
  add: () => tone(660, 0.1, 'triangle'),
  remove: () => tone(330, 0.1, 'triangle'),
  ok: () => {
    tone(523, 0.12, 'triangle');
    tone(659, 0.12, 'triangle', 0.1);
    tone(784, 0.2, 'triangle', 0.2);
  },
  bad: () => {
    tone(220, 0.18, 'sawtooth', 0, 0.08);
    tone(180, 0.25, 'sawtooth', 0.15, 0.08);
  },
  honk: () => {
    tone(349, 0.25, 'square', 0, 0.07);
    tone(440, 0.25, 'square', 0, 0.07);
  },
  coin: () => {
    tone(988, 0.08, 'square', 0, 0.06);
    tone(1319, 0.25, 'square', 0.08, 0.06);
  },
};
