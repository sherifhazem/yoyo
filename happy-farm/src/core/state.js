import { DAY_MS } from './clock.js';
export const VERSION = 2;
export const KEY = 'happyFarm.v2';
const OLD_KEY = 'happyFarm.v1';
export const MAX_COLS = 7;
export const MAX_ROWS = 6;
export const START_LAND = { cols: 3, rows: 3 };

export const fresh = (now = Date.now()) => ({
  v: VERSION,
  startedAt: now - 0.3 * DAY_MS,   // the game starts in the morning
  lastTick: now,
  tier: 1,
  coins: 20,
  xp: 0,
  level: 1,
  seeds: { wheat: 4 },
  goods: {},
  extras: { fertilizer: 0, ladybugs: 0, compost: 0 },
  land: { ...START_LAND },
  plots: {},      // "x,y" -> { crop, growth, pest }
  soil: {},       // "x,y" -> { n, w }
  animals: [],    // { id, type, genes:[a,b], fed, progress, ready, age }
  nextId: 1,
  owned: { hive: 0, windmill: 0, solar: 0, battery: 0, pump: 0, truck: 0 },
  well: { bucket: 1, pulleys: 1, gears: 1, readyAt: 0 },
  tank: 20,
  battery: 0,
  compost: { brewing: [] },
  market: { pressure: {} },
  orders: [],
  ordersDay: -1,
  ledger: {},     // day -> { in, out }
  stats: {},
  evidence: {},   // skill -> [0|1,...] last 10
  quest: 0,
  tutorial: 0,
  daily: { last: '' },
  stickers: [],
  settings: { sound: false },
  bailoutDay: -1,
});

export function migrate(raw, now = Date.now()) {
  const s = fresh(now);
  if (!raw) return s;
  if (raw.v === VERSION) return { ...s, ...raw };
  // v1 prototype: coins, seeds, goods, chickens
  if (typeof raw.coins === 'number') {
    s.coins = Math.max(raw.coins, 20);
    s.seeds = { wheat: raw.seeds?.wheat || 0, carrot: raw.seeds?.carrot || 0 };
    s.goods = Object.fromEntries(Object.entries(raw.goods || {}).filter(([, n]) => n > 0));
  }
  return s;
}

export function load() {
  try {
    const cur = localStorage.getItem(KEY);
    if (cur) return migrate(JSON.parse(cur));
    const old = localStorage.getItem(OLD_KEY);
    if (old) return migrate(JSON.parse(old));
  } catch {}
  return fresh();
}

export function save(state) {
  if (typeof window !== 'undefined' && window.__noSave) return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const stat = (s, k, n = 1) => { s.stats[k] = (s.stats[k] || 0) + n; };
export const goodCount = (s) => Object.values(s.goods).reduce((a, b) => a + b, 0);
export const addGood = (s, id, n = 1) => { s.goods[id] = (s.goods[id] || 0) + n; };
