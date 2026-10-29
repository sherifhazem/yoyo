import { rand01, smooth } from '../core/rng.js';
import { seasonIndex } from '../core/clock.js';

// chance of [sunny, cloudy, rain, windy] by season
const ODDS = [
  [0.35, 0.2, 0.35, 0.1],
  [0.6, 0.15, 0.1, 0.15],
  [0.3, 0.25, 0.25, 0.2],
  [0.25, 0.35, 0.15, 0.25],
];
export const TEMP = [16, 28, 14, 3];
export const WEATHER_ICON = { sunny: '☀️', cloudy: '⛅', rain: '🌧️', windy: '🌬️' };

export function weatherOf(day) {
  const d = Math.floor(day);
  const si = seasonIndex(d);
  const r = rand01('weather', d);
  let acc = 0, kind = 'sunny';
  ['sunny', 'cloudy', 'rain', 'windy'].forEach((k, i) => {
    acc += ODDS[si][i];
    if (r >= acc - ODDS[si][i] && r < acc) kind = k;
  });
  const sun = { sunny: 1, cloudy: 0.55, rain: 0.25, windy: 0.8 }[kind];
  const wind = (kind === 'windy' ? 2.2 : kind === 'rain' ? 1.2 : 0.8) * (0.8 + 0.4 * rand01('wind', d)); // m/s-ish scale 0..3
  return { kind, sun, wind, temp: TEMP[si] + Math.round(rand01('temp', d) * 6 - 3) };
}

// daylight 0..1 across the day (0 at night). hour 0..24
export const daylight = (hour) => Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
export const gust = (day) => 0.85 + 0.3 * smooth(day * 6, 'gust');
