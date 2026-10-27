export const COLS = 6;
export const ROWS = 6;
export const PEN_COLS = 2;
export const MAX_CHICKENS = 4;

export const CROPS = {
  wheat: { name: 'Wheat', icon: '🌾', seed: 2, sell: 3, growMs: 15000 },
  carrot: { name: 'Carrot', icon: '🥕', seed: 4, sell: 7, growMs: 30000 },
};
export const EGG = { name: 'Egg', icon: '🥚', sell: 3, everyMs: 25000 };
export const CHICKEN = { name: 'Chicken', icon: '🐔', price: 20 };

const KEY = 'happyFarm.v1';

const fresh = () => ({
  coins: 20,
  seeds: { wheat: 4, carrot: 0 },
  goods: { wheat: 0, carrot: 0, egg: 0 },
  plots: {},      // "x,y" -> { crop, plantedAt }
  chickens: [],   // { eggAt }
});

export function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s.coins === 'number') return { ...fresh(), ...s };
  } catch {}
  return fresh();
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const progress = (plot, now = Date.now()) =>
  Math.min(1, (now - plot.plantedAt) / CROPS[plot.crop].growMs);
