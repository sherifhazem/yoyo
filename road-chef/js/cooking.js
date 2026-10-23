import { byId } from './data.js';
import { sfx } from './sound.js';

const CONTAINER = { bowl: '🥣', pot: '🍲', pan: '🍳', blender: '🥤', fryer: '🍳', grill: '🍳' };
const APPLIANCE = { pan: 'pan', pot: 'pot', fryer: 'fryer', grill: 'grill' };
const rnd = (a, b) => a + Math.random() * (b - a);

/**
 * Hands-on cooking steps for one portion. The learning (counting, fractions,
 * measuring, skip-counting by 20, timing) is hidden inside the game actions.
 * host: { $app, shake }.  Rendering is done by the caller via `html()` / `afterRender()`.
 */
export function createCooking({ $app, shake }) {
  let c = null;
  let raf = 0;
  let timers = [];

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  function clearAll() {
    cancelAnimationFrame(raf);
    raf = 0;
    timers.forEach(clearTimeout);
    timers = [];
  }
  const stop = () => { clearAll(); c = null; };
  const $ = (id) => document.getElementById(id);
  const step = () => c.dish.steps[c.i];
  const miss = () => { c.mistakes += 1; };

  function init(spec) {
    switch (spec.t) {
      case 'chop': return { phase: 'cut', cuts: [], gone: [], err: '' };
      case 'tap': return { k: 0 };
      case 'pour': return { level: 0, holding: false, last: 0, tol: 0.3 };
      case 'heat': return { temp: spec.target - 20 * (3 + Math.floor(rnd(0, 3))), running: false };
      case 'flip': return { x: 0, dir: 1, last: 0, a: rnd(0.22, 0.55), w: 0.26, busy: false };
      default: return {};
    }
  }

  function begin(dish, { rerender, onDone }) {
    clearAll();
    c = { dish, i: 0, mistakes: 0, rerender, onDone, finished: false };
    c.s = init(step());
    c.rerender();
  }

  function next() {
    clearAll();
    c.i += 1;
    if (c.i >= c.dish.steps.length) {
      c.finished = true;
      sfx.bell();
      c.rerender();
      const { onDone } = c;
      const m = c.mistakes;
      later(() => { c = null; onDone(m); }, 1100);
      return;
    }
    c.s = init(step());
    c.rerender();
  }

  /* ---------- text shown in the scene bubble ---------- */
  function bubble() {
    if (!c) return '';
    if (c.finished) return 'Order up! 🛎️';
    const sp = step();
    const s = c.s;
    switch (sp.t) {
      case 'chop': return s.phase === 'cut' ? `Cut the ${byId[sp.ing].name.toLowerCase()} into <b>${sp.pieces}</b> pieces ✂️` : `Put the pieces in the ${sp.into}!`;
      case 'tap': return sp.label;
      case 'pour': return `Pour the ${sp.name} up to line <b>${sp.target}</b>`;
      case 'heat': return `Set the ${APPLIANCE[sp.what]} to <b>${sp.target}°</b>`;
      case 'flip': return 'Tap FLIP when the marker is in the green!';
      default: return '';
    }
  }

  /* ---------- markup ---------- */
  function body(sp, s) {
    if (sp.t === 'chop') {
      const e = byId[sp.ing].emoji;
      if (s.phase === 'cut') {
        return `
<div class="board" data-act="c-cut">${s.cuts.map((x) => `<i class="cut" style="left:${x * 100}%"></i>`).join('')}<span class="food">${e}</span><span class="knife">🔪</span></div>
${s.err ? `<div class="bhint">${s.err}</div>` : '<small>Tap the board to make cuts</small>'}
<div class="mgrow"><button class="btn alt sm" data-act="c-reset">Reset</button><button class="btn sm" data-act="c-cutok">Done ✂️</button></div>`;
      }
      return `
<div class="board toss">${Array.from({ length: sp.pieces }, (_, i) => `<button class="piece ${s.gone.includes(i) ? 'gone' : ''}" data-act="c-toss" data-v="${i}">${e}</button>`).join('')}</div>
<div class="into">${CONTAINER[sp.into]}<b id="tossn">${s.gone.length}/${sp.pieces}</b></div>`;
    }
    if (sp.t === 'tap') {
      return `
<div class="bigtapwrap"><button class="bigtap" id="bigtap" data-act="c-tap">${sp.emoji}</button><div class="tapcount" id="tapn">${s.k}</div></div>
<div class="pips" id="pips">${Array.from({ length: sp.n }, (_, i) => `<i class="${i < s.k ? 'on' : ''}"></i>`).join('')}</div>`;
    }
    if (sp.t === 'pour') {
      const ticks = [1, 2, 3, 4].map((n) => `<span class="tick" style="bottom:${(n / 4) * 100}%">${n}</span>`).join('');
      return `
<div class="pourwrap">
  <div class="glass"><div class="fill" id="fill" style="height:${(s.level / 4) * 100}%;background:${sp.color}"></div>${ticks}<span class="tmark" style="bottom:${(sp.target / 4) * 100}%">▶ ${sp.target}</span></div>
  <button class="holdbtn" data-hold="pour"><span>${sp.liquid}</span>Hold to pour</button>
</div>
<div class="bhint" id="pmsg" style="visibility:hidden">.</div>`;
    }
    if (sp.t === 'heat') {
      const flames = '🔥'.repeat(Math.max(0, Math.round(s.temp / 50)));
      return `
<div class="stove"><div class="flames" id="flames">${flames || '·'}</div><div class="appl ${s.running ? 'hot' : ''}" id="appl">${CONTAINER[sp.what]}</div></div>
<div class="thermo"><button data-act="c-temp" data-v="-20">▼</button><b id="temp">${s.temp}°</b><button data-act="c-temp" data-v="20">▲</button></div>
<div class="bar"><i id="hbar"></i></div>
<button class="btn" data-act="c-start">Start 🔥</button>`;
    }
    if (sp.t === 'flip') {
      return `
<div class="flipstage"><span class="flipfood" id="flipfood">${sp.food}</span></div>
<div class="fliptrack" id="track"><i class="zone" id="zone" style="left:${s.a * 100}%;width:${s.w * 100}%"></i><b id="marker"></b></div>
<div class="bhint" id="fmsg" style="visibility:hidden">.</div>
<button class="btn big" data-act="c-flip">FLIP! 🔄</button>`;
    }
    return '';
  }

  function html() {
    if (!c) return '';
    if (c.finished) return `<div class="card mg center"><div class="ding">${c.dish.emoji}</div><h3>${c.dish.name} is ready!</h3></div>`;
    const dots = c.dish.steps.map((_, i) => `<i class="${i < c.i ? 'done' : i === c.i ? 'now' : ''}"></i>`).join('');
    return `<div class="card mg"><div class="mgdots">${dots}</div>${body(step(), c.s)}</div>`;
  }

  // Called after the caller placed `html()` in the DOM.
  function afterRender() {
    if (!c || c.finished) return;
    if (step().t === 'flip') {
      c.s.last = performance.now();
      raf = requestAnimationFrame(flipLoop);
    }
  }

  /* ---------- flip: timing bar ---------- */
  function flipLoop(now) {
    if (!c || c.finished || step().t !== 'flip') return;
    const s = c.s;
    const dt = Math.min(0.05, (now - s.last) / 1000);
    s.last = now;
    s.x += s.dir * dt * 0.95;
    if (s.x >= 1) { s.x = 1; s.dir = -1; }
    if (s.x <= 0) { s.x = 0; s.dir = 1; }
    const m = $('marker');
    if (m) m.style.left = `${s.x * 100}%`;
    raf = requestAnimationFrame(flipLoop);
  }

  /* ---------- pour: hold to fill ---------- */
  function pourLoop(now) {
    if (!c || c.finished || step().t !== 'pour' || !c.s.holding) return;
    const s = c.s;
    const dt = Math.min(0.05, (now - s.last) / 1000);
    s.last = now;
    const before = Math.floor(s.level * 4);
    s.level = Math.min(4, s.level + dt * 1.1);
    if (Math.floor(s.level * 4) !== before) sfx.tick();
    const f = $('fill');
    if (f) f.style.height = `${(s.level / 4) * 100}%`;
    raf = requestAnimationFrame(pourLoop);
  }

  function pourStart() {
    if (!c || c.finished || step().t !== 'pour' || c.s.holding) return;
    c.s.holding = true;
    c.s.last = performance.now();
    raf = requestAnimationFrame(pourLoop);
  }

  function pourEnd() {
    if (!c || c.finished || step().t !== 'pour' || !c.s.holding) return;
    const s = c.s;
    const sp = step();
    s.holding = false;
    cancelAnimationFrame(raf);
    const msg = $('pmsg');
    const say = (t) => { if (msg) { msg.textContent = t; msg.style.visibility = 'visible'; } };
    if (s.level < 0.15) return;
    if (Math.abs(s.level - sp.target) <= s.tol) {
      s.level = sp.target;
      const f = $('fill');
      if (f) f.style.height = `${(s.level / 4) * 100}%`;
      sfx.ok();
      say('Perfect! ✨');
      later(next, 700);
    } else if (s.level < sp.target) {
      say('Keep pouring! ⬆️');
    } else {
      miss();
      sfx.bad();
      s.tol = Math.min(0.5, s.tol + 0.1);
      s.level = 0;
      const f = $('fill');
      if (f) f.style.height = '0%';
      say('Too much! Try again 💧');
    }
  }

  window.addEventListener('pointerup', pourEnd);
  window.addEventListener('pointercancel', pourEnd);
  $app.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-hold="pour"]')) pourStart();
  });

  /* ---------- heat: dial to the target, then cook ---------- */
  function heatStart() {
    const s = c.s;
    const sp = step();
    if (s.running) return;
    if (s.temp !== sp.target) {
      miss();
      sfx.bad();
      shake('.thermo');
      return;
    }
    s.running = true;
    sfx.sizzle();
    const a = $('appl');
    if (a) a.classList.add('hot');
    const t0 = performance.now();
    const loop = (now) => {
      if (!c || c.finished || step().t !== 'heat') return;
      const p = Math.min(1, (now - t0) / (sp.secs * 1000));
      const bar = $('hbar');
      if (bar) bar.style.width = `${p * 100}%`;
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  /* ---------- actions ---------- */
  const acts = {
    'c-cut': (_, e) => {
      const s = c.s;
      const board = e.target.closest('.board');
      const r = board.getBoundingClientRect();
      const x = Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width));
      s.cuts.push(x);
      s.err = '';
      sfx.chop();
      const i = document.createElement('i');
      i.className = 'cut';
      i.style.left = `${x * 100}%`;
      board.appendChild(i);
      const k = board.querySelector('.knife');
      if (k) { k.classList.remove('swing'); void k.offsetWidth; k.classList.add('swing'); }
    },
    'c-reset': () => { c.s.cuts = []; c.s.err = ''; c.rerender(); },
    'c-cutok': () => {
      const s = c.s;
      const sp = step();
      const pieces = s.cuts.length + 1;
      if (pieces === sp.pieces) {
        sfx.ok();
        s.phase = 'toss';
        c.rerender();
      } else {
        miss();
        sfx.bad();
        s.err = pieces < sp.pieces ? `That makes ${pieces} piece${pieces > 1 ? 's' : ''}. We need ${sp.pieces}!` : `Oops, that makes ${pieces} pieces. We need ${sp.pieces}!`;
        s.cuts = [];
        c.rerender();
        shake('.board');
      }
    },
    'c-toss': (v) => {
      const s = c.s;
      const i = Number(v);
      if (s.gone.includes(i)) return;
      s.gone.push(i);
      sfx.pop();
      const p = document.querySelector(`.piece[data-v="${i}"]`);
      if (p) p.classList.add('gone');
      const n = $('tossn');
      if (n) n.textContent = `${s.gone.length}/${step().pieces}`;
      if (s.gone.length === step().pieces) later(next, 500);
    },
    'c-tap': () => {
      const s = c.s;
      const sp = step();
      if (s.k >= sp.n) return;
      s.k += 1;
      sfx.pop();
      const n = $('tapn');
      if (n) n.textContent = s.k;
      const pips = $('pips');
      if (pips && pips.children[s.k - 1]) pips.children[s.k - 1].classList.add('on');
      const b = $('bigtap');
      if (b) { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); }
      if (s.k === sp.n) { sfx.ok(); later(next, 600); }
    },
    'c-temp': (v) => {
      const s = c.s;
      if (s.running) return;
      s.temp = Math.max(0, Math.min(260, s.temp + Number(v)));
      sfx.tick();
      const t = $('temp');
      if (t) t.textContent = `${s.temp}°`;
      const f = $('flames');
      if (f) f.textContent = '🔥'.repeat(Math.round(s.temp / 50)) || '·';
    },
    'c-start': () => heatStart(),
    'c-flip': () => {
      const s = c.s;
      if (s.busy) return;
      const inZone = s.x >= s.a && s.x <= s.a + s.w;
      const msg = $('fmsg');
      if (inZone) {
        s.busy = true;
        sfx.flip();
        const f = $('flipfood');
        if (f) f.classList.add('jump');
        if (msg) { msg.textContent = 'Perfect flip! 🎉'; msg.style.visibility = 'visible'; }
        later(next, 900);
      } else {
        miss();
        sfx.bad();
        s.w = Math.min(0.5, s.w + 0.06);
        const z = $('zone');
        if (z) z.style.width = `${s.w * 100}%`;
        if (msg) { msg.textContent = s.x < s.a ? 'Too early! ⏪' : 'Too late! ⏩'; msg.style.visibility = 'visible'; }
      }
    },
  };

  return { begin, stop, html, bubble, afterRender, acts, active: () => !!c };
}
