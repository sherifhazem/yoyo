import { addGood } from '../core/state.js';

export const LEVEL_XP = [0, 30, 80, 150, 250, 380, 540, 740, 1000, 1300, 1700, 2200];
export const levelFor = (xp) => LEVEL_XP.reduce((lv, t, i) => (xp >= t ? i + 1 : lv), 1);

export function gainXp(s, n) {
  s.xp += n;
  const lv = levelFor(s.xp);
  if (lv > s.level) { const up = lv - s.level; s.level = lv; return up; }
  return 0;
}

export const QUESTS = [
  { text: 'Plant 3 wheat seeds', check: (s) => (s.stats.planted || 0) >= 3, coins: 5, xp: 5 },
  { text: 'Water a plant with the can 💧', check: (s) => (s.stats.watered || 0) >= 1, coins: 3, xp: 5 },
  { text: 'Harvest 3 crops', check: (s) => (s.stats.harvested || 0) >= 3, coins: 5, xp: 8 },
  { text: 'Sell something at the barn 🏪', check: (s) => (s.stats.sold || 0) >= 1, coins: 8, xp: 10 },
  { text: 'Draw water at the well 🪣', check: (s) => (s.stats.draws || 0) >= 2, coins: 6, xp: 10 },
  { text: 'Buy more land in the Barn', check: (s) => s.land.cols * s.land.rows > 9, coins: 10, xp: 15 },
  { text: 'Plant beans — they refill the soil', check: (s) => (s.stats.plantedbean || 0) >= 1, coins: 8, xp: 15 },
  { text: 'Fill a customer order 📋', check: (s) => (s.stats.orders || 0) >= 1, coins: 15, xp: 20 },
  { text: 'Buy a chicken 🐔', check: (s) => s.animals.some((a) => a.type === 'chicken'), coins: 10, xp: 20 },
  { text: 'Collect 5 eggs', check: (s) => (s.stats.egg || 0) >= 5, coins: 15, xp: 25 },
  { text: 'Breed two chickens', check: (s) => (s.stats.bred || 0) >= 1, coins: 20, xp: 30 },
  { text: 'Get a beehive 🐝', check: (s) => s.owned.hive >= 1, coins: 20, xp: 30 },
  { text: 'Build a windmill 🌬️', check: (s) => s.owned.windmill >= 1, coins: 25, xp: 35 },
  { text: 'Deliver goods to the city 🚚', check: (s) => (s.stats.deliveries || 0) >= 1, coins: 40, xp: 50 },
];

export function checkQuest(s) {
  const q = QUESTS[s.quest];
  if (!q || !q.check(s)) return null;
  s.coins += q.coins;
  s.quest++;
  const lvUp = gainXp(s, q.xp);
  return { quest: q, lvUp };
}

// sticker book: first time you own a good
export const STICKERS = ['wheat', 'carrot', 'bean', 'corn', 'pumpkin', 'egg', 'milk', 'honey'];
export function collect(s, id) {
  if (!s.stickers.includes(id)) { s.stickers.push(id); return true; }
  return false;
}

export function dailyReward(s, dateStr) {
  if (s.daily.last === dateStr) return null;
  s.daily.last = dateStr;
  const streak = 1;
  const coins = 10 + 2 * s.level;
  s.coins += coins;
  addGood(s, 'wheat', 0);
  return { coins };
}

export const ACHIEVEMENTS = [
  { icon: '🌱', text: 'Plant 20 seeds', check: (s) => (s.stats.planted || 0) >= 20 },
  { icon: '🧺', text: 'Harvest 50 crops', check: (s) => (s.stats.harvested || 0) >= 50 },
  { icon: '💰', text: 'Have $500', check: (s) => s.coins >= 500 },
  { icon: '📋', text: 'Fill 10 orders', check: (s) => (s.stats.orders || 0) >= 10 },
  { icon: '🗺️', text: 'Own 30 tiles of land', check: (s) => s.land.cols * s.land.rows >= 30 },
  { icon: '✨', text: 'Breed a golden animal', check: (s) => s.animals.some((a) => a.genes.includes('H') && a.parents) },
  { icon: '🔋', text: 'Run the pump on wind and sun', check: (s) => s.owned.pump > 0 && s.owned.windmill > 0 && s.owned.solar > 0 },
  { icon: '🚚', text: 'Make 5 city deliveries', check: (s) => (s.stats.deliveries || 0) >= 5 },
];
