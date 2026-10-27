import { load, save, goodCount } from './core/state.js';
import { dayOf } from './core/clock.js';
import * as A from './sim/actions.js';
import { refreshOrders } from './sim/orders.js';
import { growthFactors } from './sim/farm.js';
import { QUESTS, dailyReward, collect } from './sim/progress.js';
import { score } from './sim/skills.js';
import { CROPS, cropIds } from './data/crops.js';
import { ANIMALS, SHOP, GOODS } from './data/items.js';
import { createScene } from './view/scene.js';
import { updateHud, toast, flyCoins } from './ui/hud.js';
import { createPanels } from './ui/panels.js';
import { sfx, setSound } from './ui/audio.js';

const $ = (id) => document.getElementById(id);
const state = load();
const now = () => Date.now();
const day = () => dayOf(state, now());

A.tick(state, now());
refreshOrders(state, day());
let shownLevel = state.level;
let tool = 'plant';
let crop = 'wheat';
let scene;
let panels;

// ---------- results of any action ----------
function run(res, opts = {}) {
  if (!res) return;
  if (!res.ok) { toast(res.msg); sfx.err(); return; }
  if (opts.coinsFrom === 'center') flyCoins({ x: innerWidth / 2, y: innerHeight / 2 }, 6);
  afterAction();
}
function afterAction() {
  scene && scene.refresh();
  const q = A.checkQuest(state);
  if (q) { sfx.level(); toast(`⭐ Quest done! +$${q.quest.coins}`, 2800); }
  checkLevel();
  renderTools();
  updateHud(state, day());
  save(state);
}
function checkLevel() {
  if (state.level <= shownLevel) return;
  const lv = state.level;
  shownLevel = lv;
  const items = [
    ...cropIds.filter((c) => CROPS[c].unlock === lv).map((c) => `${CROPS[c].icon} ${CROPS[c].name}`),
    ...Object.values(ANIMALS).filter((a) => a.unlock === lv).map((a) => `${a.icon} ${a.name}`),
    ...Object.values(SHOP).filter((i) => i.unlock === lv).map((i) => `${i.icon} ${i.name}`),
  ];
  // challenge goes up when the child is consistently making good choices
  const scores = ['season', 'nutrient', 'market', 'unitprice', 'mechanics', 'area'].map((k) => score(state, k)).filter((x) => x != null);
  let extra = '';
  if (state.tier < 3 && scores.length >= 3 && scores.reduce((a, b) => a + b, 0) / scores.length >= 0.8) { state.tier++; extra = '<p class="center">🚀 You are doing great — harder challenges unlocked!</p>'; }
  sfx.level();
  panels.info(`<div class="big">🎉</div><h2>Level ${lv}!</h2>${items.length ? `<p class="center">New: <b>${items.join(', ')}</b></p>` : ''}${extra}`, 'Awesome!');
}

// ---------- toolbar ----------
const TOOLS = [['plant', '🌱', 'Plant'], ['water', '💧', 'Water'], ['harvest', '✋', 'Harvest'], ['soil', '🔍', 'Soil'], ['market', '🏪', 'Market'], ['barn', '🏠', 'Barn'], ['menu', '☰', 'Menu']];
const QUEST_TOOL = ['plant', 'water', 'harvest', 'market', 'barn', 'barn', 'plant', 'market', 'market', 'barn', 'barn', 'market', 'market', 'market'];
function renderTools() {
  const hint = QUEST_TOOL[state.quest];
  $('toolbar').innerHTML = TOOLS.map(([id, ic, label]) => `<button class="tool ${tool === id ? 'sel' : ''} ${hint === id && state.quest < 6 ? 'pulse' : ''}" data-t="${id}"><b>${id === 'plant' ? CROPS[crop].icon : ic}</b>${label}</button>`).join('');
  const bar = $('seedbar');
  bar.classList.toggle('hidden', tool !== 'plant');
  bar.innerHTML = cropIds.map((id) => `<button class="chip ${crop === id ? 'sel' : ''} ${CROPS[id].unlock > state.level ? 'off' : ''}" data-c="${id}">${CROPS[id].icon} ${state.seeds[id] || 0}</button>`).join('');
}
$('toolbar').addEventListener('click', (e) => {
  const b = e.target.closest('.tool'); if (!b) return;
  sfx.click();
  const t = b.dataset.t;
  if (t === 'market') return panels.market();
  if (t === 'barn') return panels.barn();
  if (t === 'menu') return panels.menu();
  tool = t; renderTools();
});
$('seedbar').addEventListener('click', (e) => {
  const c = e.target.closest('.chip'); if (!c) return;
  if (CROPS[c.dataset.c].unlock > state.level) return toast(`🔒 Unlocks at level ${CROPS[c.dataset.c].unlock}`);
  crop = c.dataset.c; renderTools();
});
$('soilbtn').addEventListener('click', () => { scene.setSoilView(!scene.soilView); $('soilbtn').style.background = scene.soilView ? '#ffe27a' : ''; });
$('sndbtn').addEventListener('click', () => {
  state.settings.sound = !state.settings.sound; setSound(state.settings.sound);
  $('sndbtn').textContent = state.settings.sound ? '🔊' : '🔇'; sfx.click(); save(state);
});

// ---------- scene hooks ----------
const hooks = {
  onTile(gx, gy) {
    if (panels.isOpen()) return;
    if (gx >= state.land.cols || gy >= state.land.rows) return panels.barn('land');
    const d = day();
    if (tool === 'soil') return panels.soilInfo(gx, gy);
    let r;
    if (tool === 'plant') {
      if (!(state.seeds[crop] > 0) && CROPS[crop].unlock <= state.level) { toast(`No ${CROPS[crop].name} seeds — buy some at the Market`); sfx.err(); return; }
      r = A.plant(state, gx, gy, crop, d);
      if (r.ok) { sfx.plant(); scene.floatText('-1 seed', gx + 0.5, gy + 0.5); scene.burst(gx + 0.5, gy + 0.5, 0x9ccc65); if (r.fit < 0.7) toast('🍂 Wrong season — it will grow slowly'); }
    } else if (tool === 'water') {
      r = A.water(state, gx, gy);
      if (r.ok) { sfx.water(); scene.burst(gx + 0.5, gy + 0.5, 0x4aa3df); }
    } else if (tool === 'harvest') {
      r = A.harvest(state, gx, gy, d);
      if (r.ok) { sfx.pop(); scene.floatText(`+${r.n} ${CROPS[r.crop].icon}${r.n > 1 ? ' 🐝' : ''}`, gx + 0.5, gy + 0.5); scene.burst(gx + 0.5, gy + 0.5); }
    }
    run(r);
  },
  onObject(id) {
    if (panels.isOpen()) return;
    sfx.click();
    if (id === 'market') panels.market('sell');
    else if (id === 'orders') panels.market('orders');
    else if (id === 'city') panels.market('city');
    else if (id === 'well') panels.barn('well');
    else if (id === 'power') panels.barn('power');
    else if (id === 'compost') panels.barn('compost');
    else if (id === 'hive') toast(`🐝 ${state.owned.hive} hive(s): bees help crops give more${(state.hiveSick || 0) > 0 ? ' — they are away because of spray!' : ''}`);
  },
  onAnimal(id) {
    if (panels.isOpen()) return;
    const a = state.animals.find((x) => x.id === id);
    const r = A.collectProduct(state, id);
    if (r.ok) { sfx.pop(); const v = a; scene.floatText(`+1 ${GOODS[r.item].icon}`, 8, 3); run(r); }
    else if (a && a.fed < 0.15) { toast('Hungry! Feed in Barn › Pen 🌾'); sfx.err(); }
    else toast(a && a.age < 1 ? 'Still a baby' : 'Nothing to collect yet');
  },
  onFrame: (() => {
    let last = 0, hudLast = 0, saveLast = 0;
    return () => {
      const t = now();
      if (t - last > 250) {
        last = t;
        const ev = A.tick(state, t);
        for (const e of ev) {
          if (e.type === 'orders') toast('📋 New orders on the board!');
          if (e.type === 'compost') toast(`♻️ ${e.n} compost ready`);
          if (e.type === 'bailout') toast('🌾 A neighbour gave you 3 wheat seeds!');
          if (e.type === 'trip') { flyCoins({ x: innerWidth / 2, y: innerHeight / 2 }, 6); panels.info(`<div class="big">🚚</div><h2>Delivered!</h2><p class="center">${e.onTime ? '⭐ On time — bonus paid!' : '⏰ Too late for the bonus.'}<br>You earned <b>$${e.pay}</b> (fuel $${e.fuel}).</p>`, 'Great'); }
        }
        if (ev.length) { scene.syncPlots(); scene.syncAnimals(); }
        checkLevel();
      }
      if (t - hudLast > 500) { hudLast = t; updateHud(state, day()); renderToolsIfNeeded(); }
      if (t - saveLast > 5000) { saveLast = t; save(state); }
    };
  })(),
};
let lastSeedSig = '';
function renderToolsIfNeeded() {
  const sig = JSON.stringify([state.seeds, state.level, state.quest, tool, crop]);
  if (sig !== lastSeedSig) { lastSeedSig = sig; renderTools(); }
}

// ---------- boot ----------
scene = await createScene(state, hooks);
panels = createPanels({
  s: state, now, day, run, refreshAll: () => afterAction(),
  growth: (k, d) => growthFactors(state, k, d),
  trades: (d) => A.tradeOffers(state, d),
  doTrade: (d, i) => A.doTrade(state, d, i, day()),
  reset: () => { try { localStorage.clear(); } catch {} location.reload(); },
});
setSound(state.settings.sound);
$('sndbtn').textContent = state.settings.sound ? '🔊' : '🔇';
renderTools(); updateHud(state, day());
window.__game = { state, A, scene, panels, day, run };

const today = new Date().toISOString().slice(0, 10);
const start = () => {
  const gift = dailyReward(state, today);
  if (gift && state.stats.intro) panels.info(`<div class="big">🎁</div><h2>Daily gift!</h2><p class="center">Welcome back! Here is <b>$${gift.coins}</b> for your farm.</p>`, 'Thanks!', afterAction);
  else if (gift) state.daily.last = today;
};
if (!state.stats.intro) panels.agePicker(() => { state.stats.intro = 1; state.daily.last = today; afterAction(); });
else start();

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('./sw.js').catch(() => {});
