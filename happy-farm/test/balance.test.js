import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh } from '../src/core/state.js';
import { DAY_MS, dayOf, seasonIndex } from '../src/core/clock.js';
import * as A from '../src/sim/actions.js';
import { CROPS, cropIds } from '../src/data/crops.js';
import { isGoodDay, basePrice, average, history } from '../src/sim/market.js';
import { seasonFit } from '../src/sim/farm.js';

const T0 = 1_700_000_000_000;

// A scripted player. policy.smartSell: hold goods on poor-price days. policy.seasonal: weigh each crop by how well it suits the season.
function play(offsetDays, days, policy) {
  const s = fresh(T0);
  s.startedAt -= offsetDays * DAY_MS;
  let now = T0;
  const step = 0.1 * DAY_MS;
  let stuck = 0;
  for (let t = 0; t < days * 10; t++) {
    now += step;
    A.tick(s, now);
    const day = dayOf(s, now);
    // water source: draw at the well whenever the tank is low (medium bucket needs MA 2)
    if (s.tank < 30) { if (s.well.bucket === 1 && s.coins > 40) { s.well.bucket = 2; } if (s.well.bucket === 2 && s.well.pulleys < 2 && s.coins >= 15) A.buyPulley(s, day); A.draw(s, now); }
    // harvest ripe
    for (let x = 0; x < s.land.cols; x++) for (let y = 0; y < s.land.rows; y++) A.harvest(s, x, y, day);
    // sell
    for (const id of Object.keys(s.goods)) {
      if (!s.goods[id]) continue;
      const full = Object.values(s.goods).reduce((a, b) => a + b, 0) > 30;
      if (!policy.smartSell || isGoodDay(s, id, day) || full) A.sell(s, id, s.goods[id], day);
    }
    // grow land when rich
    if (s.coins > 120) A.buyLand(s, 1, 0, day);
    // choose crop
    const opts = cropIds.filter((c) => CROPS[c].unlock <= s.level);
    const value = (c) => (CROPS[c].sell / CROPS[c].growDays) * (policy.seasonal ? seasonFit(c, day) : 1);
    const best = opts.sort((a, b) => value(b) - value(a))[0];
    // plant
    for (let x = 0; x < s.land.cols; x++) for (let y = 0; y < s.land.rows; y++) {
      if (s.plots[`${x},${y}`] || !best) continue;
      if ((s.seeds[best] || 0) < 1 && s.coins >= CROPS[best].seed + 5) A.buySeed(s, best, 1, day);
      if ((s.seeds[best] || 0) > 0) { A.plant(s, x, y, best, day); A.water(s, x, y); }
    }
    if (s.coins < 2 && !Object.keys(s.plots).length && !Object.values(s.seeds).some((n) => n) && !Object.values(s.goods).some((n) => n)) stuck++;
  }
  // net worth counts unsold goods, so holding for a better price is not punished by the end of the run
  const day = dayOf(s, now);
  const worth = s.coins + Object.entries(s.goods).reduce((a, [id, n]) => a + n * basePrice(id, day), 0);
  return { s, stuck, worth };
}

test('a basic player never dead-ends and grows over 30 days', () => {
  const { s, stuck } = play(0, 30, { smartSell: false, seasonal: false });
  assert.equal(stuck, 0);
  assert.ok(s.level >= 3, `level ${s.level}`);
  assert.ok(s.coins + Object.keys(s.plots).length > 25, `coins ${s.coins}`);
});

// Dominant-strategy checks: a child who reads the graph / the season must come out clearly ahead.
test('market timing: waiting for a good-price day beats selling at once by >= 15%', () => {
  let now = 0, wait = 0;
  for (const id of ['wheat', 'carrot', 'corn', 'pumpkin', 'egg', 'milk']) for (let d = 8; d < 200; d++) {
    now += basePrice(id, d);
    let sd = d + 4;
    for (let k = 0; k <= 4; k++) {
      const avg = [...Array(7)].map((_, i) => basePrice(id, d + k - i)).reduce((a, b) => a + b) / 7;
      if (basePrice(id, d + k) >= avg) { sd = d + k; break; }
    }
    wait += basePrice(id, sd);
  }
  assert.ok(wait / now >= 1.15, `ratio ${(wait / now).toFixed(3)}`);
});

test('crop choice: matching the crop to the season beats the nominal best by >= 15%', () => {
  const rate = (c, d) => (CROPS[c].sell / CROPS[c].growDays) * seasonFit(c, d);
  let nominal = 0, seasonal = 0;
  const nom = [...cropIds].sort((x, y) => CROPS[y].sell / CROPS[y].growDays - CROPS[x].sell / CROPS[x].growDays)[0];
  for (let d = 0; d < 24; d++) {
    nominal += rate(nom, d);
    seasonal += Math.max(...cropIds.map((c) => rate(c, d)));
  }
  assert.ok(seasonal / nominal >= 1.15, `ratio ${(seasonal / nominal).toFixed(3)}`);
});
