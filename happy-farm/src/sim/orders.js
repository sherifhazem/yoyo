import { CROPS, cropIds } from '../data/crops.js';
import { PRODUCTS, GOODS } from '../data/items.js';
import { rand01 } from '../core/rng.js';
import { basePrice, priceOf } from './market.js';

const NAMES = ['Mia', 'Omar', 'Lina', 'Sam', 'Noor', 'Ben', 'Hana', 'Leo'];
const FACES = ['👧', '👨‍🌾', '👩‍🍳', '🧑‍🦱', '👵', '🧔'];
export const CRATE = 8;                 // slots per crate

// unlocked goods for orders at this level
export const availableGoods = (s) => [
  ...cropIds.filter((c) => CROPS[c].unlock <= s.level),
  ...(s.animals.some((a) => a.type === 'chicken') ? ['egg'] : []),
  ...(s.animals.some((a) => a.type === 'cow') ? ['milk'] : []),
  ...(s.owned.hive ? ['honey'] : []),
];

export function makeOrders(s, day) {
  const d = Math.floor(day);
  const goods = availableGoods(s);
  const out = [];
  const count = 3;
  for (let i = 0; i < count; i++) {
    const r = (x) => rand01('order', d, i, x);
    const item = goods[Math.floor(r('item') * goods.length)];
    const type = r('type') < 0.65 || s.tier === 1 ? 'crate' : 'bulk';
    const who = NAMES[Math.floor(r('who') * NAMES.length)];
    const face = FACES[Math.floor(r('face') * FACES.length)];
    if (type === 'crate') {
      // fraction of a crate: 1/4, 1/2, 3/4, or the full crate for older players
      const fr = s.tier >= 2 ? [2, 4, 6, 8][Math.floor(r('fr') * 4)] : [2, 4][Math.floor(r('fr') * 2)];
      const reward = Math.round(fr * basePrice(item, d) * 1.35);
      out.push({ id: `${d}-${i}`, type, who, face, item, need: fr, reward, done: false });
    } else {
      // bulk offer: n items for a flat price, sometimes better and sometimes worse than market
      const n = 3 + Math.floor(r('n') * 4);
      const f = 0.75 + 0.5 * r('f');                   // 0.75 .. 1.25 of market
      const offer = Math.round(n * basePrice(item, d) * f);
      out.push({ id: `${d}-${i}`, type, who, face, item, need: n, reward: offer, done: false });
    }
  }
  return out;
}

export function refreshOrders(s, day) {
  const d = Math.floor(day);
  if (s.ordersDay === d) return false;
  s.orders = makeOrders(s, d);
  s.ordersDay = d;
  return true;
}

// unit price of a bulk offer vs market (what the child compares)
export const offerUnit = (o) => o.reward / o.need;
export const marketUnit = (s, o, day) => priceOf(s, o.item, day);
export const bulkIsGood = (s, o, day) => offerUnit(o) >= marketUnit(s, o, day);

export function fulfil(s, o, day) {
  if (o.done || (s.goods[o.item] || 0) < o.need) return false;
  s.goods[o.item] -= o.need;
  s.coins += o.reward;
  o.done = true;
  return true;
}
