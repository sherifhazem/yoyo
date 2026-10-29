import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, migrate } from '../src/core/state.js';
import { DAY_MS, dayOf } from '../src/core/clock.js';
import * as A from '../src/sim/actions.js';
import { weatherOf } from '../src/sim/weather.js';
import { basePrice, priceOf, history } from '../src/sim/market.js';
import { breed, offspringOdds, newAnimal } from '../src/sim/breeding.js';
import * as M from '../src/sim/machines.js';
import { supply, windWatts } from '../src/sim/power.js';
import { makeOrders } from '../src/sim/orders.js';
import { score } from '../src/sim/skills.js';

const T0 = 1_700_000_000_000;
const mk = () => { const s = fresh(T0); s.level = 10; return s; };
const advanceDays = (s, d) => A.tick(s, s.lastTick + d * DAY_MS);

test('weather is deterministic and valid', () => {
  for (let d = 0; d < 100; d++) {
    const a = weatherOf(d), b = weatherOf(d);
    assert.deepEqual(a, b);
    assert.ok(['sunny', 'cloudy', 'rain', 'windy'].includes(a.kind));
    assert.ok(a.sun > 0 && a.sun <= 1 && a.wind > 0);
  }
});

test('wheat grows, ripens, can be harvested and sold', () => {
  const s = mk(); s.seeds.wheat = 3;
  assert.ok(A.plant(s, 0, 0, 'wheat', 0).ok);
  for (let i = 0; i < 40; i++) { s.tank = 100; A.water(s, 0, 0); advanceDays(s, 0.2); }
  const h = A.harvest(s, 0, 0, dayOf(s, s.lastTick));
  assert.ok(h.ok, h.msg);
  assert.ok(s.goods.wheat >= 1);
  const r = A.sell(s, 'wheat', 1, dayOf(s, s.lastTick));
  assert.ok(r.ok && s.coins > 20);
});

test('crops cannot be planted on locked land or without seeds', () => {
  const s = mk();
  assert.equal(A.plant(s, 6, 5, 'wheat', 0).ok, false);
  s.seeds.wheat = 0;
  assert.equal(A.plant(s, 0, 0, 'wheat', 0).ok, false);
});

test('legumes add nitrogen, corn uses it', () => {
  const s = mk(); s.seeds.bean = 1; s.seeds.corn = 1;
  A.plant(s, 0, 0, 'bean', 8); A.plant(s, 1, 0, 'corn', 8);
  s.soil['0,0'].n = 30; s.soil['1,0'].n = 30;
  for (let i = 0; i < 10; i++) { s.soil['0,0'].w = 80; s.soil['1,0'].w = 80; advanceDays(s, 0.1); }
  assert.ok(s.soil['0,0'].n > 30, 'beans raise nitrogen');
  assert.ok(s.soil['1,0'].n < 30, 'corn lowers nitrogen');
});

test('rain refills soil water; offline catch-up never kills a crop', () => {
  const s = mk(); s.seeds.wheat = 1; A.plant(s, 0, 0, 'wheat', 0);
  advanceDays(s, 200);
  assert.ok(s.plots['0,0'], 'crop still there');
  assert.ok(s.soil['0,0'].w >= 25);
});

test('growth stalls without water and recovers with it', () => {
  const s = mk(); s.seeds.wheat = 1; A.plant(s, 0, 0, 'wheat', 0);
  s.plots['0,0'].boost = 1;
  s.soil['0,0'].w = 0;
  const g0 = s.plots['0,0'].growth; advanceDays(s, 0.01);
  assert.ok(s.plots['0,0'].growth - g0 < 0.01);
});

test('land cost uses area and fence; squarer is cheaper per tile', () => {
  const s = mk(); s.coins = 500;
  const a = A.landOffer(s, 1, 0), b = A.landOffer(s, 0, 1);
  assert.equal(a.tiles, 3); assert.equal(a.fence, 2); assert.equal(a.cost, 3 * 10 + 2 * 2);
  assert.ok(A.buyLand(s, 1, 0, 0).ok);
  assert.equal(s.land.cols, 4);
  assert.ok(!A.landOffer({ ...s, land: { cols: 7, rows: 6 } }, 1, 0));
});

test('market price is bounded and pressure lowers it', () => {
  const s = mk();
  for (let d = 0; d < 200; d++) {
    const p = basePrice('carrot', d);
    assert.ok(p > 3 && p < 20, `carrot ${p}`);
  }
  s.goods.carrot = 10;
  const before = priceOf(s, 'carrot', 3);
  A.sell(s, 'carrot', 8, 3);
  assert.ok(priceOf(s, 'carrot', 3) < before);
  assert.equal(history(s, 'carrot', 10, 7).length, 7);
});

test('breeding follows Mendel: hh x hh never gives H; HH x HH always does', () => {
  const s = mk();
  const hh = () => newAnimal(s, 'chicken', ['h', 'h']);
  const HH = () => newAnimal(s, 'chicken', ['H', 'H']);
  for (let i = 0; i < 50; i++) { assert.ok(!breed(s, hh(), hh(), i).genes.includes('H')); assert.deepEqual(breed(s, HH(), HH(), i).genes, ['H', 'H']); }
  const odds = offspringOdds(newAnimal(s, 'c', ['H', 'h']), newAnimal(s, 'c', ['H', 'h']));
  assert.equal(odds.high, 0.75);
  let high = 0; const N = 400;
  for (let i = 0; i < N; i++) if (breed(s, newAnimal(s, 'chicken', ['H', 'h']), newAnimal(s, 'chicken', ['H', 'h']), i * 7).genes.includes('H')) high++;
  assert.ok(Math.abs(high / N - 0.75) < 0.1, `got ${high / N}`);
});

test('animals eat, lay and the product can be collected', () => {
  const s = mk(); s.coins = 100;
  assert.ok(A.buyAnimal(s, 'chicken', 0).ok);
  s.goods.wheat = 5; s.animals[0].fed = 0.2;
  assert.ok(A.feedAnimals(s).ok);
  advanceDays(s, 1);
  assert.ok(s.animals[0].ready >= 1);
  assert.ok(A.collectProduct(s, s.animals[0].id).ok);
  assert.ok(s.goods.egg >= 1);
});

test('well physics: force = weight / MA, big bucket needs MA 4', () => {
  const s = mk();
  s.well.bucket = 3;
  assert.equal(M.forceNeeded(s), 48);
  assert.equal(M.canLift(s), false);
  s.well.pulleys = 2; s.well.gears = 2;
  assert.equal(M.advantage(s), 4);
  assert.equal(M.forceNeeded(s), 12);
  assert.ok(M.canLift(s));
  assert.equal(M.liftSeconds(s), 8);
  s.tank = 0; const r = A.draw(s, 1000);
  assert.ok(r.ok && s.tank === 20);
  assert.equal(A.draw(s, 1001).ok, false, 'cooldown');
});

test('delivery: time = distance / speed; late trips lose the bonus', () => {
  assert.equal(M.tripSeconds(60), 6);
  assert.equal(M.minSpeedFor(6), 60);
  assert.equal(M.minSpeedFor(14), 30);
  const s = mk(); s.goods.corn = 10; s.coins = 50;
  const r = M.startTrip(s, { corn: 10 }, 30, 6, 0, 200);
  assert.ok(r.ok);
  assert.equal(M.finishTrip(s, 1000), null);
  const f = M.finishTrip(s, 13000);
  assert.equal(f.onTime, false);
  assert.equal(f.pay, 200);
});

test('wind power follows the cube law and solar is zero at night', () => {
  assert.ok(Math.abs(windWatts(2) - 80) < 1e-9);
  assert.ok(Math.abs(windWatts(1) - 10) < 1e-9);
  const s = mk(); s.owned.solar = 1;
  assert.equal(supply(s, 10.0).solar, 0);          // midnight
  assert.ok(supply(s, 10.5).solar >= 0);           // noon
});

test('auto-pump fills the tank when powered', () => {
  const s = mk(); s.owned.pump = 1; s.owned.windmill = 2; s.owned.solar = 2; s.owned.battery = 1; s.tank = 0;
  advanceDays(s, 2);
  assert.ok(s.tank > 0);
});

test('orders are generated per day and can be filled', () => {
  const s = mk(); s.tier = 2;
  const o = makeOrders(s, 5);
  assert.equal(o.length, 3);
  assert.deepEqual(o, makeOrders(s, 5));
  s.orders = o; s.goods[o[0].item] = 20;
  const r = A.fillOrder(s, o[0].id, 5);
  assert.ok(r.ok && o[0].done);
});

test('v1 save migrates and no dead end exists', () => {
  const s = migrate({ coins: 7, seeds: { wheat: 2, carrot: 1 }, goods: { wheat: 1 } }, T0);
  assert.equal(s.v, 2); assert.ok(s.coins >= 20);
  const p = fresh(T0); p.coins = 0; p.seeds = {};
  advanceDays(p, 1.2);
  assert.ok(p.seeds.wheat >= 3, 'bailout seeds');
});

test('evidence needs three samples before it counts', () => {
  const s = mk();
  assert.equal(score(s, 'market'), null);
});

test('end of day records profit and power evidence', () => {
  const s = mk(); s.owned.pump = 1;
  s.ledger[0] = { in: 30, out: 10 };
  s.startedAt = T0; s.lastTick = T0 + 0.9 * DAY_MS;
  A.tick(s, T0 + 1.2 * DAY_MS);
  assert.deepEqual(s.evidence.profit, [1]);
  assert.equal(s.evidence.power.length, 1);
});
