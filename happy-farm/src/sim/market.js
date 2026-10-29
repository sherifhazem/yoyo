import { GOODS } from '../data/items.js';
import { smooth, rand01 } from '../core/rng.js';
import { seasonIndex } from '../core/clock.js';
import { CROPS } from '../data/crops.js';

// how much each season changes demand
const SEASON_DEMAND = {
  wheat: [1, 0.95, 1.05, 1.15], carrot: [1, 0.9, 1.1, 1.2], bean: [1.05, 1, 1, 1.1],
  corn: [0.95, 1.1, 1, 1.0], pumpkin: [0.9, 0.9, 1.3, 1.1],
  egg: [1.1, 0.95, 1, 1], milk: [1, 1.1, 1, 0.95], honey: [1, 1, 1.05, 1.2],
};
export const PRESSURE_DECAY_PER_DAY = 0.7;   // sold-units pressure fades 30%/day
export const PRESSURE_STEP = 0.025;          // each unit sold lowers the price 2.5%

export function basePrice(id, day) {
  const d = Math.floor(day);
  const noise = 0.55 + 1.0 * smooth(d, 'price-' + id);                  // 0.55 .. 1.55
  const demand = (SEASON_DEMAND[id] || [1, 1, 1, 1])[seasonIndex(d)];
  return GOODS[id].sell * noise * demand;
}
export function priceOf(s, id, day) {
  const p = (s.market.pressure[id] || 0) * PRESSURE_STEP;
  return Math.max(1, Math.round(basePrice(id, day) * Math.max(0.5, 1 - p)));
}
export function history(s, id, day, n = 7) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(Math.max(1, Math.round(basePrice(id, day - i))));
  return out;
}
export const average = (a) => a.reduce((x, y) => x + y, 0) / a.length;
// is today above the recent average?
export const isGoodDay = (s, id, day) => basePrice(id, day) >= average(history(s, id, day, 7));

export function decayPressure(s, dt) {
  for (const k in s.market.pressure) {
    s.market.pressure[k] *= Math.pow(PRESSURE_DECAY_PER_DAY, dt);
    if (s.market.pressure[k] < 0.05) delete s.market.pressure[k];
  }
}

export function sellGood(s, id, n, day) {
  const price = priceOf(s, id, day);
  n = Math.min(n, s.goods[id] || 0);
  if (n <= 0) return null;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.max(1, Math.round(basePrice(id, day) * Math.max(0.5, 1 - ((s.market.pressure[id] || 0) + i) * PRESSURE_STEP)));
  }
  s.goods[id] -= n;
  s.market.pressure[id] = (s.market.pressure[id] || 0) + n;
  s.coins += total;
  return { n, total, price };
}

// what selling n units now would pay (each unit lowers the next price)
export function quote(s, id, n, day) {
  n = Math.min(n, s.goods[id] || 0);
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.max(1, Math.round(basePrice(id, day) * Math.max(0.5, 1 - ((s.market.pressure[id] || 0) + i) * PRESSURE_STEP)));
  return { n, total };
}
