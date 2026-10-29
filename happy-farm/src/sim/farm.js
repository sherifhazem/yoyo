import { CROPS } from '../data/crops.js';
import { weatherOf, daylight } from './weather.js';
import { seasonIndex } from '../core/clock.js';
import { OFFLINE_CAP_DAYS } from '../core/clock.js';
import { rand01 } from '../core/rng.js';
import { stepPower } from './power.js';

export const key = (x, y) => `${x},${y}`;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const soilAt = (s, k) => s.soil[k] || (s.soil[k] = { n: 60, w: 30 });

export function waterFactor(w) { return w >= 30 ? 1 : 0.2 + 0.8 * (w / 30); }
export function nitrogenFactor(n) { return n >= 25 ? 1 : 0.4 + 0.6 * (n / 25); }
export const seasonFit = (crop, day) => CROPS[crop].fit[seasonIndex(day)];

// growth speed (fraction of a full-speed day) with every factor shown, so the UI can explain it
export function growthFactors(s, k, day) {
  const p = s.plots[k];
  if (!p) return null;
  const so = soilAt(s, k);
  const wx = weatherOf(day);
  return {
    season: seasonFit(p.crop, day),
    water: waterFactor(so.w),
    nitrogen: nitrogenFactor(so.n),
    sun: 0.7 + 0.3 * wx.sun,
    pest: p.pest ? 0 : 1,
  };
}
export const growthRate = (f) => f ? f.season * f.water * f.nitrogen * f.sun * f.pest : 0;

// advance the whole farm by dt days starting at game day `day`
export function stepFarm(s, day, dt, { offline = false } = {}) {
  const wx = weatherOf(day);
  for (const k in s.soil) {
    const so = s.soil[k];
    const p = s.plots[k];
    // water: crops drink, sun dries, rain refills
    let dw = -(p ? CROPS[p.crop].thirst : 8) * (wx.kind === 'sunny' ? 1.3 : 1) * dt;
    if (wx.kind === 'rain') dw = 70 * dt;
    so.w = clamp(so.w + dw, offline ? 25 : 0, 100);
    // nitrogen: crops use it (beans add it), soil slowly recovers
    const use = p ? CROPS[p.crop].nUse : 0;
    so.n = clamp(so.n - use * dt * (p ? growthRate(growthFactors(s, k, day)) || 0.3 : 0) + 1 * dt, 0, 100);
  }
  for (const k in s.plots) {
    const p = s.plots[k];
    const f = growthFactors(s, k, day);
    p.growth = Math.min(CROPS[p.crop].growDays, (p.growth || 0) + growthRate(f) * dt * (p.boost || 1));
    if (!offline && !p.pest && s.level >= 5 && !s.scarecrow) {
      // pests visit now and then (about once per 2 days per farm in summer)
      const chance = (seasonIndex(day) === 1 ? 0.012 : 0.006) * dt * 24;
      if (rand01('pest', k, Math.floor(day * 24)) < chance) p.pest = true;
    }
  }
  s.hiveSick = Math.max(0, (s.hiveSick || 0) - dt);
  stepPower(s, day, dt);
}

// catch up from state.lastTick to now (in small steps so factors change realistically)
export function advance(s, nowDay, startDay) {
  let day = startDay;
  let left = Math.min(nowDay - startDay, OFFLINE_CAP_DAYS);
  const offline = left > 0.5;
  const step = offline ? 0.25 : left;
  while (left > 1e-6) {
    const dt = Math.min(step, left);
    stepFarm(s, day, dt, { offline });
    day += dt; left -= dt;
  }
}

export const isRipe = (s, k) => { const p = s.plots[k]; return !!p && p.growth >= CROPS[p.crop].growDays - 1e-6; };
export const progress = (s, k) => { const p = s.plots[k]; return p ? p.growth / CROPS[p.crop].growDays : 0; };
