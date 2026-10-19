let ctx;

function tone(freq, dur, type = 'sine', delay = 0, vol = 0.15) {
  if (muted) return;
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

/* ---------- driving audio: engine hum, music loop, mute ---------- */
let muted = false;
try {
  muted = localStorage.getItem('roadChef.mute') === '1';
} catch {
  /* storage unavailable */
}

export const audio = {
  get muted() {
    return muted;
  },
  toggle() {
    muted = !muted;
    try {
      localStorage.setItem('roadChef.mute', muted ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    if (muted) {
      engine.stop();
      music.stop();
    }
    return muted;
  },
};

export const engine = {
  o: null,
  start() {
    if (muted || this.o) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      f.type = 'lowpass';
      f.frequency.value = 380;
      g.gain.value = 0.02;
      o.connect(f).connect(g).connect(ctx.destination);
      o.start();
      this.o = o;
    } catch {
      /* audio unavailable */
    }
  },
  set(v) {
    if (this.o) this.o.frequency.setTargetAtTime(52 + v * 70, ctx.currentTime, 0.12);
  },
  stop() {
    try {
      this.o && this.o.stop();
    } catch {
      /* already stopped */
    }
    this.o = null;
  },
};

const SCALE = [262, 294, 330, 392, 440, 523, 587, 659];
const MELODY = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 5, 4, 2, 3];
export const music = {
  id: null,
  step: 0,
  start() {
    if (muted || this.id) return;
    this.id = setInterval(() => {
      const n = MELODY[this.step % MELODY.length];
      tone(SCALE[n], 0.18, 'triangle', 0, 0.035);
      if (this.step % 4 === 0) tone(SCALE[n] / 2, 0.4, 'sine', 0, 0.05);
      this.step += 1;
    }, 230);
  },
  stop() {
    clearInterval(this.id);
    this.id = null;
  },
};

function noise(dur, freq, vol) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    f.type = 'lowpass';
    f.frequency.value = freq;
    g.gain.value = vol;
    s.buffer = buf;
    s.connect(f).connect(g).connect(ctx.destination);
    s.start();
  } catch {
    /* audio unavailable */
  }
}

sfx.coinN = (n) => {
  tone(660 + Math.min(n, 8) * 60, 0.08, 'square', 0, 0.045);
  tone(990 + Math.min(n, 8) * 60, 0.16, 'square', 0.06, 0.045);
};
sfx.crash = () => {
  noise(0.35, 500, 0.25);
  tone(120, 0.25, 'sawtooth', 0, 0.1);
};
sfx.boost = () => {
  noise(0.7, 2500, 0.12);
  tone(300, 0.5, 'sawtooth', 0, 0.05);
  tone(600, 0.4, 'sawtooth', 0.1, 0.04);
};
sfx.count = (go) => tone(go ? 880 : 440, go ? 0.35 : 0.15, 'square', 0, 0.06);
