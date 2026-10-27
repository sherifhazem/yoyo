import { Application, Container, Graphics, Polygon, Text } from 'pixi.js';
import { COLS, ROWS, PEN_COLS, MAX_CHICKENS, CROPS, EGG, CHICKEN, load, save, progress } from './data.js';
import { TW, TH, toScreen, drawTile, drawCrop, drawChicken, drawEgg } from './art.js';

const state = load();
let tool = 'wheat';
const $ = (id) => document.getElementById(id);

// ---------- HUD ----------
const toastEl = $('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 1800);
}

function refresh() {
  $('coins').textContent = `💰 $${state.coins}`;
  const g = state.goods;
  $('stock').textContent = `🌾${g.wheat}  🥕${g.carrot}  🥚${g.egg}`;
  const tools = [
    ['wheat', '🌾', `Seeds ×${state.seeds.wheat}`],
    ['carrot', '🥕', `Seeds ×${state.seeds.carrot}`],
    ['hand', '✋', 'Harvest'],
    ['market', '🏪', 'Market'],
  ];
  $('toolbar').innerHTML = tools.map(([id, ic, label]) =>
    `<button class="tool ${tool === id ? 'sel' : ''}" data-t="${id}"><b>${ic}</b>${label}</button>`).join('');
  save(state);
}
$('toolbar').addEventListener('click', (e) => {
  const b = e.target.closest('.tool');
  if (!b) return;
  if (b.dataset.t === 'market') return openMarket('buy');
  tool = b.dataset.t;
  refresh();
});

// ---------- Pixi scene ----------
const app = new Application();
await app.init({ resizeTo: window, background: 0x9fd66b, antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
document.body.prepend(app.canvas);

const world = new Container();
const field = new Container();
field.sortableChildren = true;
world.addChild(field);
app.stage.addChild(world);

function layout() {
  const { width: w, height: h } = app.screen;
  const availH = h - 60 - 90;
  const s = Math.max(0.3, Math.min(w / 800, availH / 420, 1.3));
  world.scale.set(s);
  world.position.set(w / 2 - 55 * s, 60 + (availH - 410 * s) / 2);
}
window.addEventListener('resize', layout);
app.renderer.on('resize', layout);
layout();

const cropGfx = new Map(); // "x,y" -> { g, stage }

function floatText(text, gx, gy, color = '#fff') {
  const p = toScreen(gx, gy);
  const t = new Text({ text, style: { fontSize: 26, fontWeight: '800', fill: color, stroke: { color: '#5a3b12', width: 5 } } });
  t.anchor.set(0.5);
  t.position.set(p.x, p.y - 30);
  t.zIndex = 9999;
  field.addChild(t);
  let age = 0;
  const tick = (tk) => {
    age += tk.deltaMS;
    t.y -= 0.06 * tk.deltaMS;
    t.alpha = 1 - age / 900;
    if (age >= 900) { app.ticker.remove(tick); t.destroy(); }
  };
  app.ticker.add(tick);
}

for (let gx = 0; gx < COLS + PEN_COLS; gx++) {
  for (let gy = 0; gy < ROWS; gy++) {
    const isField = gx < COLS;
    const tile = drawTile(isField ? 'soil' : 'pen');
    const p = toScreen(gx + 0.5, gy + 0.5);
    tile.position.set(p.x, p.y);
    tile.zIndex = gx + gy;
    if (isField) {
      tile.eventMode = 'static';
      tile.cursor = 'pointer';
      tile.hitArea = new Polygon([0, -TH / 2, TW / 2, 0, 0, TH / 2, -TW / 2, 0]);
      tile.on('pointertap', () => onTile(gx, gy));
    }
    field.addChild(tile);
  }
}

function syncCrop(key, plot) {
  let entry = cropGfx.get(key);
  if (!plot) {
    if (entry) { entry.g.destroy(); cropGfx.delete(key); }
    return;
  }
  const [gx, gy] = key.split(',').map(Number);
  if (!entry) {
    const g = drawCrop(new Graphics(), plot.crop, 0);
    const p = toScreen(gx + 0.5, gy + 0.5);
    g.position.set(p.x, p.y);
    g.zIndex = gx + gy + 0.5;
    field.addChild(g);
    entry = { g, stage: -1 };
    cropGfx.set(key, entry);
  }
  const pr = progress(plot);
  const stage = pr >= 1 ? 3 : Math.floor(pr * 3);
  if (stage !== entry.stage) {
    entry.stage = stage;
    drawCrop(entry.g, plot.crop, pr);
  }
}

Object.keys(state.plots).forEach((k) => syncCrop(k, state.plots[k]));

function onTile(gx, gy) {
  const key = `${gx},${gy}`;
  const plot = state.plots[key];
  if (tool === 'hand') {
    if (!plot) return toast('Nothing planted here');
    const pr = progress(plot);
    if (pr < 1) {
      const left = Math.ceil((1 - pr) * CROPS[plot.crop].growMs / 1000);
      return toast(`Not ready yet — ${left}s left`);
    }
    state.goods[plot.crop]++;
    delete state.plots[key];
    syncCrop(key, null);
    floatText(`+1 ${CROPS[plot.crop].icon}`, gx + 0.5, gy + 0.5);
    return refresh();
  }
  if (plot) return toast('Already planted');
  if (state.seeds[tool] < 1) return toast(`No ${CROPS[tool].name} seeds — visit the Market`);
  state.seeds[tool]--;
  state.plots[key] = { crop: tool, plantedAt: Date.now() };
  syncCrop(key, state.plots[key]);
  floatText('-1 seed', gx + 0.5, gy + 0.5);
  refresh();
}

// ---------- Chickens ----------
const chickenViews = [];
function addChickenView(data) {
  const c = new Container();
  const body = drawChicken();
  const egg = drawEgg();
  egg.position.set(-16, -4);
  egg.visible = false;
  c.addChild(body, egg);
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.hitArea = new Polygon([-18, -34, 22, -34, 22, 6, -18, 6]);
  const v = { c, body, egg, data, gx: COLS + 0.3 + Math.random() * (PEN_COLS - 0.6), gy: 0.5 + Math.random() * (ROWS - 1), tx: 0, ty: 0, wait: 0 };
  v.tx = v.gx; v.ty = v.gy;
  c.on('pointertap', () => {
    if (Date.now() < data.eggAt) return toast(`Egg in ${Math.ceil((data.eggAt - Date.now()) / 1000)}s`);
    data.eggAt = Date.now() + EGG.everyMs;
    state.goods.egg++;
    floatText('+1 🥚', v.gx, v.gy);
    refresh();
  });
  field.addChild(c);
  chickenViews.push(v);
}
state.chickens.forEach(addChickenView);

app.ticker.add((tk) => {
  const now = Date.now();
  const t = now / 1000;
  for (const [key, entry] of cropGfx) {
    const plot = state.plots[key];
    if (!plot) continue;
    syncCrop(key, plot);
    entry.g.rotation = Math.sin(t * 2 + key.length * 3 + key.charCodeAt(0)) * 0.05;
    if (entry.stage === 3) entry.g.scale.set(1 + Math.sin(t * 5) * 0.04);
  }
  for (const v of chickenViews) {
    if (v.wait > 0) v.wait -= tk.deltaMS;
    else {
      const dx = v.tx - v.gx, dy = v.ty - v.gy;
      const d = Math.hypot(dx, dy);
      if (d < 0.05) {
        v.wait = 800 + Math.random() * 2500;
        v.tx = COLS + 0.3 + Math.random() * (PEN_COLS - 0.6);
        v.ty = 0.4 + Math.random() * (ROWS - 0.8);
      } else {
        const sp = 0.0009 * tk.deltaMS;
        v.gx += (dx / d) * sp; v.gy += (dy / d) * sp;
        v.body.scale.x = (dx - dy) < 0 ? -1 : 1;
        v.body.y = -Math.abs(Math.sin(t * 12)) * 2;
      }
    }
    const p = toScreen(v.gx, v.gy);
    v.c.position.set(p.x, p.y);
    v.c.zIndex = v.gx + v.gy + 0.6;
    v.egg.visible = now >= v.data.eggAt;
  }
});

// ---------- Market + bill math ----------
const modal = $('modal'), card = $('card');
const closeModal = () => modal.classList.add('hidden');
const openCard = (html) => { card.innerHTML = html; modal.classList.remove('hidden'); };

const BUY = [
  { id: 'wheat', icon: '🌾', name: 'Wheat seed', price: CROPS.wheat.seed, note: `grows in ${CROPS.wheat.growMs / 1000}s, sells $${CROPS.wheat.sell}` },
  { id: 'carrot', icon: '🥕', name: 'Carrot seed', price: CROPS.carrot.seed, note: `grows in ${CROPS.carrot.growMs / 1000}s, sells $${CROPS.carrot.sell}` },
  { id: 'chicken', icon: '🐔', name: 'Chicken', price: CHICKEN.price, note: `lays an egg every ${EGG.everyMs / 1000}s` },
];
const SELL = [
  { id: 'wheat', icon: '🌾', name: 'Wheat', price: CROPS.wheat.sell },
  { id: 'carrot', icon: '🥕', name: 'Carrot', price: CROPS.carrot.sell },
  { id: 'egg', icon: '🥚', name: 'Egg', price: EGG.sell },
];

function openMarket(mode, qty = {}) {
  const items = mode === 'buy' ? BUY : SELL;
  const have = (it) => mode === 'sell' ? state.goods[it.id]
    : it.id === 'chicken' ? MAX_CHICKENS - state.chickens.length : 99;
  const rows = items.map((it) => `
    <div class="row">
      <span style="font-size:26px">${it.icon}</span>
      <span class="nm">${it.name} — $${it.price}<small>${mode === 'sell' ? `you have ${have(it)}` : it.note}</small></span>
      <button class="step" data-d="-1" data-id="${it.id}">−</button>
      <span class="qty">${qty[it.id] || 0}</span>
      <button class="step" data-d="1" data-id="${it.id}">+</button>
    </div>`).join('');
  openCard(`
    <h2>🏪 Market</h2>
    <div class="btns" style="margin:0 0 8px">
      <button class="btn ${mode === 'buy' ? '' : 'gray'}" data-m="buy">Buy</button>
      <button class="btn ${mode === 'sell' ? '' : 'gray'}" data-m="sell">Sell</button>
    </div>
    ${rows}
    <div class="msg" id="msg"></div>
    <div class="btns"><button class="btn gray" id="x">Close</button><button class="btn alt" id="go">Check out</button></div>`);
  card.onclick = (e) => {
    const t = e.target;
    if (t.dataset.m) return openMarket(t.dataset.m);
    if (t.id === 'x') return closeModal();
    if (t.dataset.d) {
      const it = items.find((i) => i.id === t.dataset.id);
      const n = Math.max(0, Math.min(have(it), (qty[it.id] || 0) + Number(t.dataset.d)));
      return openMarket(mode, { ...qty, [it.id]: n });
    }
    if (t.id === 'go') {
      const lines = items.filter((i) => qty[i.id] > 0).map((i) => ({ ...i, n: qty[i.id] }));
      if (!lines.length) return ($('msg').textContent = 'Pick something first');
      const total = lines.reduce((s, l) => s + l.n * l.price, 0);
      if (mode === 'buy' && total > state.coins) return ($('msg').textContent = `You only have $${state.coins}`);
      askTotal(mode, lines, total, qty);
    }
  };
}

function options(total, lines) {
  const set = new Set([total]);
  const cands = [total + lines[0].price, total - lines[0].price, total + 10, total - 1, total + 1, total + 2];
  for (const c of cands) if (c > 0 && set.size < 3) set.add(c);
  return [...set].sort(() => Math.random() - 0.5);
}

function askTotal(mode, lines, total, qty) {
  const bill = lines.map((l) => `<div>${l.icon} ${l.n} × $${l.price}</div>`).join('');
  openCard(`
    <h2>${mode === 'buy' ? 'Your bill' : 'Your sale'}</h2>
    <div class="q">${bill}<div style="margin-top:6px">Total = ?</div></div>
    <div class="opts">${options(total, lines).map((o) => `<button class="btn" data-a="${o}">$${o}</button>`).join('')}</div>
    <div class="msg" id="msg"></div>
    <div class="btns"><button class="btn gray" id="back">Back</button></div>`);
  card.onclick = (e) => {
    const t = e.target;
    if (t.id === 'back') return openMarket(mode, qty);
    if (!t.dataset.a) return;
    if (Number(t.dataset.a) !== total) {
      t.disabled = true;
      t.classList.add('gray');
      return ($('msg').textContent = 'Not quite — try again!');
    }
    apply(mode, lines, total);
    closeModal();
  };
}

function apply(mode, lines, total) {
  if (mode === 'buy') {
    state.coins -= total;
    for (const l of lines) {
      if (l.id === 'chicken') {
        for (let i = 0; i < l.n; i++) {
          const data = { eggAt: Date.now() + EGG.everyMs };
          state.chickens.push(data);
          addChickenView(data);
        }
      } else state.seeds[l.id] += l.n;
    }
    toast(`Paid $${total}`);
  } else {
    state.coins += total;
    for (const l of lines) state.goods[l.id] -= l.n;
    toast(`Sold for $${total}!`);
  }
  refresh();
}

modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
refresh();
