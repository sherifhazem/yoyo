import { getSprites, drawCar, CAR_COLORS } from './sprites.js';
import { sfx, engine, music, audio } from './sound.js';

const ZS = 6; // perspective depth scale (metres)
const LANES = [-0.62, 0, 0.62];
const MAX_SECONDS = 55; // whole drive stays under the 60 s cap (incl. countdown excluded, finish ~3 s)
const FONT = '"Baloo 2","Chalkboard SE","Comic Sans MS",ui-rounded,system-ui,sans-serif';

const THEMES = {
  day: { sky: ['#4fc3ff', '#d9f4ff'], sun: ['#fff6a8', '#ffd23f'], sunY: 0.16, grass: ['#7fd957', '#6bc948'], road: ['#636978', '#5a6070'], hills: ['#8bdc72', '#63c07a'], rain: false },
  sunset: { sky: ['#ff6f91', '#ffd29a'], sun: ['#fffbd5', '#ff9a3c'], sunY: 0.3, grass: ['#74c04c', '#69b444'], road: ['#5d5770', '#554f68'], hills: ['#b277c0', '#8a62b0'], rain: false },
  rain: { sky: ['#7f93ad', '#c8d4df'], sun: null, sunY: 0, grass: ['#62b259', '#58a350'], road: ['#4d5463', '#454c5b'], hills: ['#7da590', '#628f86'], rain: true },
};

const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (n) => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const curveAt = (z) => 0.9 * Math.sin(z * 0.005) + 0.7 * Math.sin(z * 0.0021 + 1.3);

function makeQuestion(level) {
  let a;
  let b;
  let text;
  let ans;
  if (level <= 2) {
    a = 1 + ri(6); b = 1 + ri(5); text = `${a} + ${b}`; ans = a + b;
  } else if (level <= 4) {
    if (Math.random() < 0.5) { a = 5 + ri(10); b = 1 + ri(9); text = `${a} + ${b}`; ans = a + b; }
    else { a = 8 + ri(12); b = 1 + ri(9); text = `${a} − ${b}`; ans = a - b; }
  } else {
    a = 2 + ri(4); b = 2 + ri(4); text = `${a} × ${b}`; ans = a * b;
  }
  const wrong = new Set();
  while (wrong.size < 2) {
    const w = ans + [-2, -1, 1, 2, 3, 10, -10][ri(7)];
    if (w > 0 && w !== ans) wrong.add(w);
  }
  const opts = [ans, ...wrong].sort(() => Math.random() - 0.5);
  return { text, ans, opts };
}

/**
 * Starts the driving mini-game on `canvas`. Returns a stop() function.
 * opts: { level, theme, color, magnet, host, onDone(result) }
 */
export function startDrive(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const S = getSprites();
  const th = THEMES[opts.theme] || THEMES.day;
  const carColor = (CAR_COLORS[opts.color] || CAR_COLORS.red).hex;
  const level = opts.level;
  const dest = opts.dest || { emoji: '🏪', name: 'FRESH GROCERY' };
  const runSeconds = Math.min(MAX_SECONDS, 40 + 3 * (level - 1));
  const vBase = 24 + level * 1.5;

  let W = 0;
  let H = 0;
  let hy = 0;
  let hillsA;
  let hillsB;
  let rowCx;
  let raf = 0;
  let stopped = false;

  /* ---- state ---- */
  let phase = 'count';
  let phaseT = 0;
  let elapsed = 0;
  let pos = 0;
  let speed = 0;
  let px = 0;
  let target = 0;
  let keyDir = 0;
  let pressed = false;
  let coins = 0;
  let gifts = 0;
  let combo = 0;
  let bestCombo = 0;
  let boostT = 0;
  let stunT = 0;
  let shake = 0;
  let bgx = 0;
  let nextCountBeep = 3;
  const gates = { right: 0, total: 0 };
  let activeGate = null;
  let objects = [];
  let particles = [];
  let floaters = [];
  let genZ = 40;
  let gateIdx = 0;
  let finishZ = null;
  const clouds = Array.from({ length: 5 }, () => ({ x: rnd(0, 1), y: rnd(0.04, 0.26), s: rnd(0.6, 1.4), v: rnd(0.003, 0.01) }));
  const plannedGates = (level < 3 ? [0.42, 0.8] : [0.28, 0.56, 0.84]).map((f) => f * vBase * runSeconds);

  /* ---- layout ---- */
  function buildHills() {
    const mkHill = (col, amp, base, f1, f2, ph) => {
      const c = document.createElement('canvas');
      c.width = W; c.height = Math.ceil(hy);
      const g = c.getContext('2d');
      g.fillStyle = col;
      g.beginPath(); g.moveTo(0, hy);
      for (let x = 0; x <= W; x += 4) {
        const k = (x / W) * Math.PI * 2;
        g.lineTo(x, hy - base - amp * (0.6 * Math.sin(k * f1 + ph) + 0.4 * Math.sin(k * f2 + ph * 2)));
      }
      g.lineTo(W, hy); g.closePath(); g.fill();
      return c;
    };
    hillsA = mkHill(th.hills[1], 44, 52, 2, 5, 1);
    hillsB = mkHill(th.hills[0], 30, 20, 3, 7, 2);
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hy = Math.round(H * 0.36);
    rowCx = new Float32Array(Math.ceil(H) + 4);
    buildHills();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const carY = () => H * 0.8;
  const tCar = () => (carY() - hy) / (H - hy);
  const dCar = () => ZS * (1 / tCar() - 1);

  /* ---- spawning ---- */
  const lanePick = () => LANES[ri(3)];
  const add = (o) => objects.push(o);

  function decoRun(z0, z1) {
    for (let z = z0; z < z1; z += rnd(7, 12)) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const r = Math.random();
      let kind;
      let x;
      if (r < 0.28) { kind = 'tree'; x = side * rnd(1.45, 2.4); }
      else if (r < 0.46) { kind = 'pine'; x = side * rnd(1.5, 2.5); }
      else if (r < 0.64) { kind = ['houseA', 'houseB', 'houseC'][ri(3)]; x = side * rnd(2.2, 3.0); }
      else if (r < 0.8) { kind = 'bush'; x = side * rnd(1.3, 1.8); }
      else { kind = 'lamp'; x = side * 1.2; }
      add({ type: 'deco', kind, z, x, done: true });
    }
  }

  function spawnPattern(z) {
    const r = Math.random();
    const obstP = 0.4 + level * 0.04;
    if (r < 0.3) {
      const x = lanePick();
      for (let i = 0; i < 5; i++) add({ type: 'coin', z: z + i * 3.6, x });
    } else if (r < 0.45) {
      let li = ri(3);
      for (let i = 0; i < 7; i++) { add({ type: 'coin', z: z + i * 3.6, x: LANES[li] }); if (i % 2) li = clamp(li + (Math.random() < 0.5 ? -1 : 1), 0, 2); }
    } else if (r < 0.45 + obstP * 0.55) {
      const kinds = ['cone', 'rock', 'crate', 'cow'];
      const free = ri(3);
      LANES.forEach((x, i) => {
        if (i !== free && (i !== (free + 1) % 3 || Math.random() < level * 0.12)) {
          const kind = kinds[ri(kinds.length)];
          add({ type: 'obst', kind, z: z + rnd(-1, 1), x, hw: { cone: 0.2, rock: 0.28, crate: 0.25, cow: 0.3 }[kind] });
        }
      });
      if (Math.random() < 0.7) for (let i = 0; i < 4; i++) add({ type: 'coin', z: z - 6 + i * 3, x: LANES[free] });
    } else if (r < 0.92) {
      const x = lanePick();
      for (let i = 0; i < 4; i++) add({ type: 'coin', z: z + i * 3.6, x });
    } else {
      add({ type: 'gift', z, x: lanePick() });
    }
  }

  function spawnGate(z) {
    const q = makeQuestion(level);
    add({ type: 'gate', z, q, done: false });
  }

  function generate(upTo) {
    const limit = finishZ != null ? finishZ - 30 : Infinity;
    while (genZ < Math.min(upTo, limit)) {
      const next = plannedGates[gateIdx];
      if (next != null && genZ >= next - 6) {
        spawnGate(genZ);
        gateIdx += 1;
        decoRun(genZ, genZ + 36);
        genZ += 40;
        continue;
      }
      if (next == null || next - genZ >= 34) spawnPattern(genZ);
      decoRun(genZ, genZ + 18);
      genZ += rnd(22, 34);
    }
  }

  /* ---- effects ---- */
  function burst(x, y, n, colors, spd = 220, grav = 380, life = 0.7) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      const v = rnd(spd * 0.3, spd);
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, life: rnd(life * 0.5, life), t: 0, g: grav, c: colors[ri(colors.length)], s: rnd(3, 7) });
    }
  }
  const floatText = (x, y, text, color = '#fff') => floaters.push({ x, y, text, color, t: 0, life: 1 });

  /* ---- input ---- */
  const steerFrom = (e) => {
    const r = canvas.getBoundingClientRect();
    target = clamp(((e.clientX - r.left) / r.width - 0.5) * 2.4, -1.05, 1.05);
  };
  const onDown = (e) => { pressed = true; try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ } steerFrom(e); };
  const onMove = (e) => { if (pressed || e.pointerType === 'mouse') steerFrom(e); };
  const onUp = () => { pressed = false; };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keyDir = e.type === 'keydown' ? -1 : 0;
    if (e.key === 'ArrowRight' || e.key === 'd') keyDir = e.type === 'keydown' ? 1 : 0;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'drive-btn skip';
  skipBtn.textContent = 'Skip ⏭';
  skipBtn.onclick = () => { if (phase === 'run' || phase === 'count') endRun(true); };
  const muteBtn = document.createElement('button');
  muteBtn.className = 'drive-btn mute';
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
  muteBtn.onclick = () => {
    const m = audio.toggle();
    muteBtn.textContent = m ? '🔇' : '🔊';
    if (!m) { engine.start(); music.start(); }
  };
  opts.host.append(skipBtn, muteBtn);

  engine.start();
  music.start();

  /* ---- flow ---- */
  function endRun(skipped) {
    if (phase === 'finish' || phase === 'done') return;
    phase = 'finish';
    phaseT = skipped ? 1.7 : 0;
    burst(W / 2, H * 0.5, 60, ['#ff5a4e', '#ffd23f', '#3ec6ff', '#7bdc6b', '#c58bff'], 420, 500, 1.4);
    sfx.ok();
  }

  function finishNow() {
    phase = 'done';
    stop();
    opts.onDone({ coins, gifts, gateRight: gates.right, gateTotal: gates.total, bestCombo, money: Math.floor(coins / 5) + gifts * 3 + gates.right * 3 });
  }

  /* ---- update ---- */
  function update(dt) {
    phaseT += dt;
    if (phase === 'count') {
      const left = 3.2 - phaseT;
      if (left < nextCountBeep - 0.0 && nextCountBeep > 0) { sfx.count(false); nextCountBeep -= 1; }
      speed = 0;
      if (phaseT >= 3.2) { phase = 'run'; phaseT = 0; sfx.count(true); sfx.honk(); }
    }
    px += (target - px) * Math.min(1, dt * 9);
    if (keyDir) target = clamp(target + keyDir * dt * 2.4, -1.05, 1.05);
    px = clamp(px, -1.08, 1.08);

    if (phase === 'run') {
      elapsed += dt;
      const want = vBase * (boostT > 0 ? 1.55 : 1) * (stunT > 0 ? 0.45 : 1);
      speed += (want - speed) * Math.min(1, dt * 2.5);
      if (finishZ == null && elapsed >= runSeconds - 4) {
        finishZ = pos + vBase * 4.5 + 20;
        add({ type: 'finish', z: finishZ, done: false });
        objects = objects.filter((o) => o.type === 'finish' || o.z < finishZ - 25);
      }
      if (elapsed > runSeconds + 4) endRun(false);
    } else if (phase === 'finish') {
      speed += (0 - speed) * Math.min(1, dt * 2.2);
      if (phaseT > 1.9) finishNow();
    }
    pos += speed * dt;
    bgx = (bgx + curveAt(pos + 30) * speed * dt * 0.45 + W) % W;
    boostT = Math.max(0, boostT - dt);
    stunT = Math.max(0, stunT - dt);
    shake = Math.max(0, shake - dt * 2.2);
    engine.set(speed / (vBase * 1.55));

    if (phase === 'run' || phase === 'finish') generate(pos + 250);

    const dc = dCar();
    activeGate = null;
    for (const o of objects) {
      const d = o.z - pos;
      if (o.type === 'gate' && !o.done && d > dc && d < 150) activeGate = o;
      if (o.done || phase === 'finish') continue;
      if (o.type === 'coin' || o.type === 'gift') {
        const reach = (opts.magnet ? 0.52 : 0.3);
        if (Math.abs(d - dc) < 1.8 && Math.abs(px - o.x) < reach) {
          o.done = true;
          const t = tCar();
          const sx = rowCx[clamp(Math.round(carY() / 2) * 2, 0, rowCx.length - 1)] + o.x * t * W * 0.56;
          if (o.type === 'coin') {
            coins += 1; combo += 1; bestCombo = Math.max(bestCombo, combo);
            sfx.coinN(combo);
            floatText(sx, carY() - 70, '+1', '#ffe066');
            burst(sx, carY() - 40, 8, ['#ffe066', '#fff3a0', '#ffc531'], 200, 300, 0.5);
            if (combo > 0 && combo % 12 === 0) { boostT = 2; sfx.boost(); floatText(W / 2, H * 0.34, '🔥 TURBO!', '#ff9f43'); }
          } else {
            gifts += 1; sfx.ok();
            floatText(sx, carY() - 90, '🎁 +$3', '#ff7aa8');
            burst(sx, carY() - 50, 26, ['#ff7aa8', '#ffd23f', '#7bdc6b', '#3ec6ff'], 320, 420, 0.9);
          }
        }
      } else if (o.type === 'obst') {
        if (Math.abs(d - dc) < 1.2 && Math.abs(px - o.x) < o.hw + 0.14) {
          o.done = true;
          if (boostT > 0) {
            burst(W / 2, carY() - 50, 20, ['#fff', '#ffd23f', '#ff9f43'], 360, 420, 0.7);
            floatText(W / 2, carY() - 100, 'SMASH!', '#ff9f43'); sfx.crash();
          } else {
            stunT = 0.9; shake = 1; combo = 0; sfx.crash();
            burst(W / 2, carY() - 30, 18, ['#bbb', '#ddd', '#999'], 260, 200, 0.8);
            floatText(W / 2, carY() - 100, 'Ouch!', '#fff');
          }
        }
      } else if (o.type === 'gate') {
        if (d <= dc) {
          o.done = true;
          gates.total += 1;
          const lane = px < -0.31 ? 0 : px > 0.31 ? 2 : 1;
          if (o.q.opts[lane] === o.q.ans) {
            gates.right += 1; sfx.ok();
            floatText(W / 2, H * 0.4, `${o.q.text} = ${o.q.ans} ✅ +$3`, '#7bffb0');
            burst(W / 2, H * 0.5, 40, ['#7bffb0', '#ffe066', '#3ec6ff'], 380, 420, 1);
          } else {
            sfx.bad(); stunT = 0.6; combo = 0;
            floatText(W / 2, H * 0.4, `${o.q.text} = ${o.q.ans}`, '#ffd0cc');
          }
        }
      } else if (o.type === 'finish' && d <= dc) {
        o.done = true;
        endRun(false);
      }
    }
    objects = objects.filter((o) => o.z - pos > dc - 4);

    if (boostT > 0 && Math.random() < 0.8) {
      const t = tCar();
      const cx = rowCx[clamp(Math.round(carY() / 2) * 2, 0, rowCx.length - 1)] + px * t * W * 0.56;
      particles.push({ x: cx + rnd(-14, 14), y: carY() - 8, vx: rnd(-30, 30), vy: rnd(120, 260), life: 0.35, t: 0, g: 0, c: ['#ffd23f', '#ff9f43', '#ff5a4e'][ri(3)], s: rnd(5, 10) });
    }
    particles = particles.filter((p) => { p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; return p.t < p.life; });
    floaters = floaters.filter((f) => { f.t += dt; f.y -= 46 * dt; return f.t < f.life; });
    clouds.forEach((c) => { c.x = (c.x + c.v * dt) % 1.3; });
  }

  /* ---- render ---- */
  function renderSky() {
    const sg = ctx.createLinearGradient(0, 0, 0, hy);
    sg.addColorStop(0, th.sky[0]); sg.addColorStop(1, th.sky[1]);
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hy + 2);
    if (th.sun) {
      const sx = W * 0.74; const sy = hy * (0.25 + th.sunY * 2);
      ctx.fillStyle = 'rgba(255,230,120,.22)'; ctx.beginPath(); ctx.arc(sx, sy, 62, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 38);
      g.addColorStop(0, th.sun[0]); g.addColorStop(1, th.sun[1]);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 38, 0, 7); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (const c of clouds) {
      const x = (c.x - 0.15) * W; const y = c.y * H; const s = 22 * c.s;
      ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.arc(x + s * 1.1, y - s * 0.4, s * 1.2, 0, 7); ctx.arc(x + s * 2.3, y, s, 0, 7); ctx.fill();
    }
    ctx.drawImage(hillsA, -bgx * 0.5, 0); ctx.drawImage(hillsA, W - bgx * 0.5, 0);
    ctx.drawImage(hillsB, -bgx, 0); ctx.drawImage(hillsB, W - bgx, 0);
  }

  function renderGround() {
    const c1 = curveAt(pos + 30) * 0.2; const c2 = curveAt(pos + 120) * 0.22;
    for (let y = Math.ceil(H / 2) * 2; y > hy; y -= 2) {
      const t = (y - hy) / (H - hy);
      const d = ZS * (1 / t - 1);
      const wz = pos + d;
      const u = 1 - t;
      const cx = W / 2 + clamp(W * (u * u * c1 + u * u * u * c2), -W * 0.5, W * 0.5);
      rowCx[y] = cx;
      const hw = t * W * 0.56;
      const band = Math.floor(wz / 7) % 2;
      ctx.fillStyle = th.grass[band]; ctx.fillRect(0, y, W, 3);
      const rw = hw * 0.12;
      ctx.fillStyle = Math.floor(wz / 3.5) % 2 ? '#ff5a4e' : '#fff';
      ctx.fillRect(cx - hw - rw, y, rw, 3); ctx.fillRect(cx + hw, y, rw, 3);
      ctx.fillStyle = th.road[band]; ctx.fillRect(cx - hw, y, hw * 2, 3);
      if (Math.floor(wz / 5) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        const lw = Math.max(1, hw * 0.035);
        ctx.fillRect(cx - hw / 3 - lw / 2, y, lw, 3); ctx.fillRect(cx + hw / 3 - lw / 2, y, lw, 3);
      }
    }
    const fg = ctx.createLinearGradient(0, hy, 0, hy + 70);
    fg.addColorStop(0, th.sky[1]); fg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fg; ctx.globalAlpha = 0.75; ctx.fillRect(0, hy, W, 70); ctx.globalAlpha = 1;
  }

  const proj = (o) => {
    const d = o.z - pos;
    const t = 1 / (1 + d / ZS);
    const y = hy + t * (H - hy);
    const i = clamp(Math.round(y / 2) * 2, 0, rowCx.length - 1);
    return { d, t, y, sx: (rowCx[i] || W / 2) + (o.x || 0) * t * W * 0.56 };
  };

  const SIZE = { tree: 0.5, pine: 0.42, bush: 0.2, lamp: 0.12, houseA: 0.62, houseB: 0.62, houseC: 0.62, cone: 0.18, rock: 0.27, crate: 0.23, cow: 0.38, gift: 0.2, coin: 0.125 };

  function drawObject(o) {
    const { d, t, y, sx } = proj(o);
    if (d < -2 || t < 0.025) return;
    ctx.globalAlpha = Math.min(1, (t - 0.025) / 0.07);
    if (o.type === 'gate') return drawGate(o, t, y);
    if (o.type === 'finish') return drawFinish(t, y);
    const spr = o.type === 'coin' ? S.coin : S[o.kind || o.type];
    const w = SIZE[o.kind || o.type] * W * t;
    const h = w * (spr.logicalH / spr.logicalW);
    if (o.type === 'coin') {
      const spin = Math.abs(Math.cos(elapsed * 4 + o.z * 0.7));
      const hov = Math.sin(elapsed * 5 + o.z) * 4 * t;
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(sx, y, w * 0.4, w * 0.12, 0, 0, 7); ctx.fill();
      ctx.drawImage(spr, sx - (w * Math.max(0.15, spin)) / 2, y - h * 1.4 - hov, w * Math.max(0.15, spin), h);
    } else if (o.type === 'gift') {
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(sx, y, w * 0.4, w * 0.12, 0, 0, 7); ctx.fill();
      const bob = Math.sin(elapsed * 4) * 5 * t;
      ctx.drawImage(spr, sx - w / 2, y - h * 1.15 - bob, w, h);
    } else {
      if (o.type === 'obst') { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(sx, y, w * 0.5, w * 0.1, 0, 0, 7); ctx.fill(); }
      ctx.drawImage(spr, sx - w / 2, y - h, w, h);
    }
    ctx.globalAlpha = 1;
  }

  function drawGate(o, t, y) {
    const hw = t * W * 0.56;
    const pw = hw * 0.5;
    const cx = rowCx[clamp(Math.round(y / 2) * 2, 0, rowCx.length - 1)] || W / 2;
    const cols = ['#3a8dff', '#ff9f43', '#a96bff'];
    o.q.opts.forEach((n, i) => {
      const x = cx + LANES[i] * hw;
      ctx.fillStyle = '#5b3a1f'; ctx.fillRect(x - pw * 0.4, y - pw * 0.5, pw * 0.1, pw * 0.5); ctx.fillRect(x + pw * 0.3, y - pw * 0.5, pw * 0.1, pw * 0.5);
      ctx.fillStyle = cols[i]; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, pw * 0.05);
      const r = pw * 0.14; const px0 = x - pw / 2; const py0 = y - pw * 1.25;
      ctx.beginPath(); ctx.roundRect(px0, py0, pw, pw * 0.85, r); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `900 ${pw * 0.55}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(n), x, py0 + pw * 0.45);
    });
    ctx.globalAlpha = 1;
  }

  function drawFinish(t, y) {
    const hw = t * W * 0.56;
    const cx = rowCx[clamp(Math.round(y / 2) * 2, 0, rowCx.length - 1)] || W / 2;
    const ph = hw * 1.15;
    ctx.fillStyle = '#e8505b'; ctx.fillRect(cx - hw * 1.05, y - ph, hw * 0.12, ph); ctx.fillRect(cx + hw * 0.93, y - ph, hw * 0.12, ph);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(cx - hw * 1.1, y - ph * 1.3, hw * 2.2, ph * 0.34, hw * 0.08); ctx.fill();
    ctx.fillStyle = '#e8505b'; ctx.font = `900 ${hw * 0.2}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${dest.emoji} ${dest.name}`, cx, y - ph * 1.13);
    const sq = hw * 0.11;
    for (let i = 0; i < 20; i++) { ctx.fillStyle = i % 2 ? '#222' : '#fff'; ctx.fillRect(cx - hw + i * sq * 1.0, y - sq * 1.2, sq, sq * 0.6); }
    ctx.globalAlpha = 1;
  }

  function renderCar() {
    const t = tCar();
    const y = carY();
    const cx = rowCx[clamp(Math.round(y / 2) * 2, 0, rowCx.length - 1)] + px * t * W * 0.56;
    const w = W * 0.3;
    const bob = Math.sin(elapsed * 22) * (speed > 1 ? 1.6 : 0);
    if (stunT > 0 && Math.floor(stunT * 14) % 2) ctx.globalAlpha = 0.45;
    if (boostT > 0) { ctx.shadowColor = '#ffb020'; ctx.shadowBlur = 28; }
    drawCar(ctx, cx, y + bob, w, carColor, { tilt: (target - px) * 1.4, brake: speed < vBase * 0.6 && phase === 'run' });
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  function renderHud() {
    ctx.textBaseline = 'middle';
    // progress
    const bx = 16; const bw = W - 32; const by = 16;
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, 16, 8); ctx.fill();
    const p = clamp(elapsed / runSeconds, 0, 1);
    ctx.fillStyle = '#4cc96b'; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(16, bw * p), 16, 8); ctx.fill();
    ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🚗', bx + Math.max(8, bw * p), by + 8);
    ctx.fillText(dest.emoji, bx + bw - 4, by + 8);
    // pills
    const pill = (x, text, bg) => {
      ctx.font = `900 22px ${FONT}`; const tw = ctx.measureText(text).width + 24;
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, 44, tw, 36, 18); ctx.fill();
      ctx.fillStyle = '#2b2d42'; ctx.textAlign = 'left'; ctx.fillText(text, x + 12, 63);
      return tw;
    };
    const w1 = pill(16, `🪙 ${coins}`, '#fff3b0');
    if (combo >= 2) pill(16 + w1 + 8, `🔥 x${combo}`, '#ffd0a8');
    if (boostT > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + elapsed * 0.7; const r0 = W * 0.55; const r1 = W * (0.72 + Math.random() * 0.1); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H * 0.45 + Math.sin(a) * r0 * 1.2); ctx.lineTo(W / 2 + Math.cos(a) * r1, H * 0.45 + Math.sin(a) * r1 * 1.2); ctx.stroke(); }
    }
    // math question banner
    if (activeGate && phase === 'run') {
      const txt = `${activeGate.q.text} = ?`;
      ctx.font = `900 40px ${FONT}`; const tw = ctx.measureText(txt).width + 48;
      ctx.fillStyle = 'rgba(31,42,68,.92)'; ctx.beginPath(); ctx.roundRect(W / 2 - Math.max(tw, 270) / 2, 96, Math.max(tw, 270), 92, 20); ctx.fill();
      ctx.fillStyle = '#7bffb0'; ctx.textAlign = 'center'; ctx.fillText(txt, W / 2, 128);
      ctx.fillStyle = '#fff'; ctx.font = `800 15px ${FONT}`; ctx.fillText('Drive through the right answer!', W / 2, 170);
    }
    // countdown
    if (phase === 'count') {
      const n = Math.ceil(3.2 - phaseT);
      const f = (3.2 - phaseT) % 1;
      const txt = n > 3 ? '' : n >= 1 ? String(n) : 'GO!';
      ctx.save(); ctx.translate(W / 2, H * 0.38); ctx.scale(0.8 + f * 0.7, 0.8 + f * 0.7);
      ctx.font = `900 120px ${FONT}`; ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = '#fff'; ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = '#ff5a4e'; ctx.fillText(txt, 0, 0); ctx.restore();
      ctx.fillStyle = 'rgba(31,42,68,.85)'; ctx.beginPath(); ctx.roundRect(W / 2 - 150, H * 0.5, 300, 54, 18); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `800 20px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('👆 Drag to steer · grab coins!', W / 2, H * 0.5 + 28);
    }
    if (phase === 'finish') {
      ctx.font = `900 54px ${FONT}`; ctx.textAlign = 'center'; ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.strokeText('Arrived!', W / 2, H * 0.3);
      ctx.fillStyle = '#4cc96b'; ctx.fillText('Arrived!', W / 2, H * 0.3);
    }
  }

  function render() {
    ctx.save();
    if (shake > 0) ctx.translate(rnd(-1, 1) * shake * 7, rnd(-1, 1) * shake * 5);
    renderSky();
    renderGround();
    const dc = dCar();
    const sorted = objects.filter((o) => o.z - pos > dc - 3).sort((a, b) => b.z - a.z);
    for (const o of sorted) if (o.z - pos > dc) drawObject(o);
    renderCar();
    for (const o of sorted) if (o.z - pos <= dc) drawObject(o);
    if (th.rain) {
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < 70; i++) { const x = rnd(0, W); const y = rnd(0, H); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16); }
      ctx.stroke();
    }
    for (const p of particles) {
      ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 - p.t / p.life * 0.5), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of floaters) {
      ctx.globalAlpha = 1 - f.t / f.life; ctx.font = `900 30px ${FONT}`;
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(31,42,68,.8)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    renderHud();
  }

  let last = performance.now();
  function frame(now) {
    if (stopped) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // Test hooks (harmless in production).
  canvas.__drive = { get state() { return { phase, elapsed, pos, px, coins, gifts, gates: { ...gates }, runSeconds, objects: objects.length }; }, steer: (v) => { target = v; }, objects: () => objects, pos: () => pos, dCar };

  function stop() {
    stopped = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    engine.stop();
    music.stop();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKey);
    skipBtn.remove();
    muteBtn.remove();
  }
  return stop;
}
