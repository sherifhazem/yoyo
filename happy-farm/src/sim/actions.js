import { CROPS } from '../data/crops.js';
import { ANIMALS, SHOP, GOODS, BARN_LIMIT, PEN_LIMIT } from '../data/items.js';
import { key, soilAt, isRipe, advance, seasonFit, clamp } from './farm.js';
import { sellGood, priceOf, decayPressure, isGoodDay } from './market.js';
import { refreshOrders, fulfil, bulkIsGood } from './orders.js';
import { newAnimal, breed, canBreed, stepAnimals } from './breeding.js';
import { record } from './skills.js';
import { gainXp, checkQuest, collect } from './progress.js';
import { drawWater, finishTrip, PULLEY_COST, GEAR_COST, MAX_PULLEYS, MAX_GEARS, BUCKETS } from './machines.js';
import { dayOf } from '../core/clock.js';
import { stat, goodCount, addGood, MAX_COLS, MAX_ROWS } from '../core/state.js';
import { weatherOf } from './weather.js';
import { TANK_MAX } from './power.js';

const NO = (msg) => ({ ok: false, msg });
const OK = (extra = {}) => ({ ok: true, ...extra });

export const income = (s, day, n) => { const l = s.ledger[Math.floor(day)] || (s.ledger[Math.floor(day)] = { in: 0, out: 0 }); l.in += n; };
export const expense = (s, day, n) => { const l = s.ledger[Math.floor(day)] || (s.ledger[Math.floor(day)] = { in: 0, out: 0 }); l.out += n; };
const pay = (s, day, n) => { if (s.coins < n) return false; s.coins -= n; expense(s, day, n); return true; };
export const inLand = (s, x, y) => x >= 0 && y >= 0 && x < s.land.cols && y < s.land.rows;

// ---------- world clock ----------
export function tick(s, now = Date.now()) {
  const events = [];
  const from = dayOf(s, s.lastTick);
  const to = dayOf(s, now);
  if (to <= from) return events;
  const dt = to - from;
  advance(s, to, from);
  stepAnimals(s, Math.min(dt, 3));
  decayPressure(s, dt);
  // compost matures
  const ready = s.compost.brewing.filter((c) => c <= now).length;
  if (ready) { s.compost.brewing = s.compost.brewing.filter((c) => c > now); s.extras.compost += ready; events.push({ type: 'compost', n: ready }); }
  const trip = finishTrip(s, now);
  if (trip) { income(s, to, trip.pay); events.push({ type: 'trip', ...trip }); }
  if (Math.floor(to) !== Math.floor(from)) {
    if (refreshOrders(s, to)) events.push({ type: 'orders' });
    // gentle bailout so the game can never dead-end
    const poor = s.coins < 2 && !Object.values(s.seeds).some((n) => n > 0) && !Object.values(s.goods).some((n) => n > 0) && !Object.keys(s.plots).length;
    if (poor && s.bailoutDay !== Math.floor(to)) { s.bailoutDay = Math.floor(to); s.seeds.wheat = (s.seeds.wheat || 0) + 3; events.push({ type: 'bailout' }); }
    // bees make honey if there are flowers (any planted crop)
    if (s.owned.hive && (s.hiveSick || 0) <= 0 && Object.keys(s.plots).length) { addGood(s, 'honey', Math.min(s.owned.hive, 2)); }
    events.push({ type: 'day', day: Math.floor(to) });
  }
  s.lastTick = now;
  return events;
}

// ---------- farming ----------
export function plant(s, x, y, crop, day) {
  if (!inLand(s, x, y)) return NO('Buy this land first');
  const k = key(x, y);
  if (s.plots[k]) return NO('Something is already growing here');
  if (CROPS[crop].unlock > s.level) return NO(`Unlocks at level ${CROPS[crop].unlock}`);
  if ((s.seeds[crop] || 0) < 1) return NO(`No ${CROPS[crop].name} seeds — buy some at the market`);
  s.seeds[crop]--;
  const so = soilAt(s, k);
  s.plots[k] = { crop, growth: 0, boost: !s.stats.planted ? 6 : 1 };   // first plant grows fast (tutorial)
  stat(s, 'planted'); stat(s, 'planted' + crop);
  record(s, 'season', seasonFit(crop, day) >= 0.7);
  if (!CROPS[crop].legume) record(s, 'nutrient', so.n >= 25);
  gainXp(s, 1);
  return OK({ fit: seasonFit(crop, day), n: so.n });
}

export function water(s, x, y) {
  const k = key(x, y);
  if (!inLand(s, x, y)) return NO('Not your land yet');
  if (s.tank < 5) return NO('The water tank is empty — draw water at the well');
  const so = soilAt(s, k);
  if (so.w >= 95) return NO('Already soaked');
  s.tank -= 5;
  so.w = clamp(so.w + 40, 0, 100);
  stat(s, 'watered');
  gainXp(s, 1);
  return OK();
}

export function harvest(s, x, y, day) {
  const k = key(x, y);
  const p = s.plots[k];
  if (!p) return NO('Nothing planted here');
  if (!isRipe(s, k)) return NO('Not ready yet');
  const def = CROPS[p.crop];
  const room = BARN_LIMIT - goodCount(s);
  let n = 1;
  const pollChance = (s.hiveSick || 0) > 0 ? 0 : Math.min(0.6, 0.2 * s.owned.hive);
  if (s.owned.hive && Math.random() < pollChance) n++;
  if (room < n) return NO('Barn is full — sell something first');
  addGood(s, p.crop, n);
  const wasLegume = !!def.legume;
  delete s.plots[k];
  stat(s, 'harvested', n);
  collect(s, p.crop);
  gainXp(s, 3);
  // rotation evidence: harvesting beans on low-nitrogen soil is the "refill" move
  if (wasLegume) record(s, 'rotation', soilAt(s, k).n < 60);
  return OK({ crop: p.crop, n });
}

export function applyFertilizer(s, x, y, day) {
  if (!inLand(s, x, y)) return NO('Not your land yet');
  if (s.extras.fertilizer < 1) return NO('No fertilizer — buy some at the market');
  const so = soilAt(s, key(x, y));
  record(s, 'nutrient', so.n < 60);
  s.extras.fertilizer--; so.n = clamp(so.n + 30, 0, 100);
  return OK();
}
export function applyCompost(s, x, y) {
  if (!inLand(s, x, y)) return NO('Not your land yet');
  if (s.extras.compost < 1) return NO('No compost yet');
  const so = soilAt(s, key(x, y));
  s.extras.compost--; so.n = clamp(so.n + 35, 0, 100);
  return OK();
}
export function brewCompost(s, id, now) {
  if ((s.goods[id] || 0) < 3) return NO('Needs 3 of the same item');
  if (s.compost.brewing.length >= 4) return NO('The compost bin is full');
  s.goods[id] -= 3;
  s.compost.brewing.push(now + 90000);
  return OK();
}
export function ladybugs(s, x, y) {
  const p = s.plots[key(x, y)];
  if (!p || !p.pest) return NO('No pests here');
  if (s.extras.ladybugs < 1) return NO('No ladybugs — buy some at the market');
  s.extras.ladybugs--; delete p.pest; record(s, 'ecology', true); gainXp(s, 3);
  return OK();
}
export function spray(s, x, y) {
  const p = s.plots[key(x, y)];
  if (!p || !p.pest) return NO('No pests here');
  delete p.pest;
  if (s.owned.hive) { s.hiveSick = 2; record(s, 'ecology', false); }
  return OK({ hurtBees: !!s.owned.hive });
}

// ---------- land: area and fence ----------
export const area = (c, r) => c * r;
export const perimeter = (c, r) => 2 * (c + r);
export const TILE_COST = 10;
export const FENCE_COST = 2;
export function landOffer(s, dc, dr) {
  const c = s.land.cols + dc, r = s.land.rows + dr;
  if (c > MAX_COLS || r > MAX_ROWS) return null;
  const tiles = area(c, r) - area(s.land.cols, s.land.rows);
  const fence = perimeter(c, r) - perimeter(s.land.cols, s.land.rows);
  return { cols: c, rows: r, tiles, fence, cost: tiles * TILE_COST + fence * FENCE_COST };
}
export function buyLand(s, dc, dr, day) {
  const o = landOffer(s, dc, dr);
  if (!o) return NO('That is the biggest field');
  if (!pay(s, day, o.cost)) return NO(`You need $${o.cost}`);
  s.land.cols = o.cols; s.land.rows = o.rows;
  // cheapest way to add tiles is a squarer field (smaller perimeter): evidence for area planning
  const alt = [landOffer(s, 1, 0), landOffer(s, 0, 1)].filter(Boolean);
  if (alt.length === 2) record(s, 'area', o.cost <= Math.min(alt[0].cost, alt[1].cost) + 1e-9);
  return OK(o);
}

// ---------- market ----------
export function sell(s, id, n, day) {
  const r = sellGood(s, id, n, day);
  if (!r) return NO('Nothing to sell');
  record(s, 'market', isGoodDay(s, id, day));
  income(s, day, r.total);
  stat(s, 'sold', r.n);
  gainXp(s, r.n);
  return OK(r);
}
export function buySeed(s, crop, n, day) {
  const def = CROPS[crop];
  if (def.unlock > s.level) return NO(`Unlocks at level ${def.unlock}`);
  if (!pay(s, day, def.seed * n)) return NO(`You need $${def.seed * n}`);
  s.seeds[crop] = (s.seeds[crop] || 0) + n;
  return OK();
}
export function buyShop(s, id, day) {
  const it = SHOP[id];
  if (it.unlock > s.level) return NO(`Unlocks at level ${it.unlock}`);
  if (it.max && (s.owned[id] || 0) >= it.max) return NO('You have the most you can use');
  if (id === 'battery' && !s.owned.pump) { /* allowed any time */ }
  if (!pay(s, day, it.price)) return NO(`You need $${it.price}`);
  if (it.consumable) s.extras[id] = (s.extras[id] || 0) + 1;
  else s.owned[id] = (s.owned[id] || 0) + 1;
  gainXp(s, 5);
  return OK();
}
export function buyAnimal(s, type, day) {
  const a = ANIMALS[type];
  if (a.unlock > s.level) return NO(`Unlocks at level ${a.unlock}`);
  if (s.animals.length >= PEN_LIMIT) return NO('The pen is full');
  if (!pay(s, day, a.price)) return NO(`You need $${a.price}`);
  s.animals.push(newAnimal(s, type));
  gainXp(s, 8);
  return OK();
}
export function sellAnimal(s, id, day) {
  const i = s.animals.findIndex((a) => a.id === id);
  if (i < 0) return NO('No such animal');
  const a = s.animals[i];
  const v = Math.round(ANIMALS[a.type].price * (a.genes.includes('H') ? 0.8 : 0.5));
  s.animals.splice(i, 1);
  s.coins += v; income(s, day, v);
  return OK({ v });
}
export function feedAnimals(s) {
  let used = 0, need = 0;
  for (const a of s.animals) if (a.fed < 0.5) need += ANIMALS[a.type].feed;
  if (!need) return NO('Everyone is full');
  if ((s.goods.wheat || 0) < need) return NO(`Feed costs ${need} wheat 🌾`);
  s.goods.wheat -= need;
  for (const a of s.animals) a.fed = 1;
  return OK({ need });
}
export function collectProduct(s, id) {
  const a = s.animals.find((x) => x.id === id);
  if (!a || a.ready < 1) return NO('Nothing to collect yet');
  const def = ANIMALS[a.type];
  if (goodCount(s) >= BARN_LIMIT) return NO('Barn is full — sell something first');
  a.ready--;
  addGood(s, def.product, 1);
  stat(s, def.product);
  collect(s, def.product);
  gainXp(s, 2);
  return OK({ item: def.product });
}
export function breedPair(s, idA, idB) {
  const a = s.animals.find((x) => x.id === idA), b = s.animals.find((x) => x.id === idB);
  if (!canBreed(s, a, b)) return NO('Pick two different adults of the same kind (and keep room in the pen)');
  const kid = breed(s, a, b);
  kid.age = 0;           // babies cannot breed or produce until grown
  kid.fed = 0;
  kid.parents = [a.id, b.id];
  s.animals.push(kid);
  stat(s, 'bred');
  gainXp(s, 10);
  record(s, 'genetics', true);
  return OK({ kid });
}

// ---------- orders ----------
export function fillOrder(s, orderId, day) {
  const o = s.orders.find((x) => x.id === orderId);
  if (!o) return NO('Order gone');
  if (o.done) return NO('Already done');
  if (o.type === 'bulk') record(s, 'unitprice', bulkIsGood(s, o, day));
  if ((s.goods[o.item] || 0) < o.need) return NO(`You need ${o.need} ${GOODS[o.item].name}`);
  fulfil(s, o, day);
  income(s, day, o.reward);
  stat(s, 'orders');
  if (o.type === 'crate') record(s, 'fractions', true);
  gainXp(s, 10);
  return OK(o);
}
export function skipOrder(s, orderId, day) {
  const o = s.orders.find((x) => x.id === orderId);
  if (!o || o.done) return NO('No such order');
  if (o.type === 'bulk') record(s, 'unitprice', !bulkIsGood(s, o, day));
  o.done = true; o.skipped = true;
  return OK();
}

// ---------- well and gear ----------
export const buyPulley = (s, day) => {
  if (s.well.pulleys >= MAX_PULLEYS) return NO('Maximum pulleys');
  if (!pay(s, day, PULLEY_COST)) return NO(`You need $${PULLEY_COST}`);
  s.well.pulleys++; return OK();
};
export const buyGear = (s, day) => {
  if (s.well.gears >= MAX_GEARS) return NO('Maximum gears');
  if (!pay(s, day, GEAR_COST)) return NO(`You need $${GEAR_COST}`);
  s.well.gears++; return OK();
};
export const setBucket = (s, id) => { s.well.bucket = id; return OK(); };
export const resetRig = (s) => { s.well.pulleys = 1; s.well.gears = 1; return OK(); };
export const draw = (s, now) => drawWater(s, now);

export { checkQuest, TANK_MAX, weatherOf, priceOf };

// ---------- neighbour swaps: is the ratio fair? ----------
import { availableGoods } from './orders.js';
import { basePrice as _bp } from './market.js';
import { rand01 as _r } from '../core/rng.js';
export function tradeOffers(s, d) {
  const goods = availableGoods(s);
  if (goods.length < 2) return [];
  const done = (s.neighbor && s.neighbor[d]) || [];
  return [0, 1, 2].map((i) => {
    const r = (x) => _r('trade', d, i, x);
    const give = goods[Math.floor(r('g') * goods.length)];
    let get = goods[Math.floor(r('t') * goods.length)];
    if (get === give) get = goods[(goods.indexOf(give) + 1) % goods.length];
    const giveN = 2 + Math.floor(r('gn') * 4);
    const worth = giveN * _bp(give, d) * (0.7 + 0.6 * r('f'));
    const getN = Math.max(1, Math.round(worth / _bp(get, d)));
    return { give, get, giveN, getN, done: done.includes(i) };
  });
}
export function doTrade(s, d, i, day) {
  const o = tradeOffers(s, d)[i];
  if (!o || o.done) return NO('Already swapped');
  if ((s.goods[o.give] || 0) < o.giveN) return NO('Not enough to swap');
  if (goodCount(s) - o.giveN + o.getN > BARN_LIMIT) return NO('Barn is full');
  s.goods[o.give] -= o.giveN; addGood(s, o.get, o.getN);
  (s.neighbor || (s.neighbor = {}))[d] = [...((s.neighbor[d]) || []), i];
  record(s, 'unitprice', o.getN * _bp(o.get, d) >= o.giveN * _bp(o.give, d) * 0.97);
  collect(s, o.get);
  gainXp(s, 3);
  return OK();
}
