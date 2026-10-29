import { SEASONS, seasonIndex, hourOf, DAYS_PER_SEASON } from '../core/clock.js';
import { weatherOf, WEATHER_ICON } from '../sim/weather.js';
import { LEVEL_XP, QUESTS } from '../sim/progress.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);
let toastTimer;
export function toast(msg, ms = 2200) {
  const el = $('toast');
  el.textContent = msg; el.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), ms);
}

export function updateHud(s, day) {
  $('coins').textContent = `💰 $${s.coins}`;
  const lo = LEVEL_XP[s.level - 1] || 0, hi = LEVEL_XP[s.level] ?? lo + 1000;
  $('lvltxt').textContent = `Lv ${s.level}`;
  $('xpbar').style.width = `${Math.min(100, ((s.xp - lo) / (hi - lo)) * 100)}%`;
  const wx = weatherOf(day);
  const h = Math.floor(hourOf(day));
  const si = seasonIndex(day);
  $('clock').textContent = `${WEATHER_ICON[wx.kind]} ${SEASONS[si]} · D${Math.floor(day % (DAYS_PER_SEASON * 4)) + 1} · ${String(h).padStart(2, '0')}:00 · ${wx.temp}°`;
  $('tank').textContent = `💧 ${Math.round(s.tank)}`;
  const q = QUESTS[s.quest];
  $('quest').innerHTML = q ? `<div>⭐ ${q.text} <small>(+$${q.coins})</small></div>` : '';
}

export function flyCoins(from, n = 5) {
  const to = $('coins').getBoundingClientRect();
  for (let i = 0; i < Math.min(8, n); i++) {
    const el = document.createElement('div');
    el.className = 'fly'; el.textContent = '🪙';
    el.style.left = `${from.x + (Math.random() - 0.5) * 40}px`; el.style.top = `${from.y + (Math.random() - 0.5) * 40}px`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.transform = `translate(${to.left + 20 - from.x}px, ${to.top + 10 - from.y}px) scale(.6)`;
      el.style.opacity = '0.4';
    }, 30 + i * 60);
    setTimeout(() => el.remove(), 900 + i * 60);
  }
  sfx.coin();
}
