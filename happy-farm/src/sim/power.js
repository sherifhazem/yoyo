import { weatherOf, daylight, gust } from './weather.js';

export const WIND_W = 80;     // per windmill at wind=2 -> wind cubed law scaled
export const SOLAR_W = 60;
export const PUMP_W = 50;
export const BATTERY_WH = 200;
export const PUMP_UNITS_PER_HOUR = 4;
export const TANK_MAX = 100;

export const windWatts = (wind) => Math.min(120, WIND_W * Math.pow(wind / 2, 3));
export function supply(s, day) {
  const wx = weatherOf(day);
  const hour = (day - Math.floor(day)) * 24;
  const wind = wx.wind * gust(day);
  return {
    wind: s.owned.windmill * windWatts(wind),
    solar: s.owned.solar * SOLAR_W * wx.sun * daylight(hour),
    windSpeed: wind,
  };
}
export const demand = (s) => (s.owned.pump ? PUMP_W : 0);

// dt in days -> hours = dt*24. Surplus charges the battery; pump runs by what is available.
export function stepPower(s, day, dt) {
  if (!s.owned.pump) return;
  const hours = dt * 24;
  const sp = supply(s, day);
  const gen = sp.wind + sp.solar;
  let need = demand(s);
  const cap = s.owned.battery * BATTERY_WH;
  let ran = 0;
  // direct use first
  const direct = Math.min(gen, need);
  ran += direct / need;
  let surplus = (gen - direct) * hours;
  let deficit = (need - direct) * hours;
  if (surplus > 0) s.battery = Math.min(cap, s.battery + surplus);
  if (deficit > 0 && s.battery > 0) {
    const draw = Math.min(s.battery, deficit);
    s.battery -= draw;
    ran += (draw / hours) / need;
  }
  ran = Math.min(1, ran);
  s.pumpRun = ran;
  if (s.tank < TANK_MAX) s.tank = Math.min(TANK_MAX, s.tank + ran * PUMP_UNITS_PER_HOUR * hours);
}
