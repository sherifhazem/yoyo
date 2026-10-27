// Long-term progress: restaurant reputation levels (earned from customer stars)
// and a board of milestone goals the child claims for a cash reward.
export const LEVELS = [
  { name: 'Street Cart', icon: '🛒', at: 0, bonus: 0 },
  { name: 'Cozy Café', icon: '☕', at: 10, bonus: 10 },
  { name: 'Bistro', icon: '🥐', at: 30, bonus: 20 },
  { name: 'Restaurant', icon: '🍽️', at: 70, bonus: 30 },
  { name: 'Grand Restaurant', icon: '🏰', at: 130, bonus: 50 },
];

export const freshProgress = () => ({ rep: 0, stats: { earned: 0, perfect: 0, specials: 0, dishes: {} }, claimed: [] });

// Old saves lack these fields; top-level merge in game.js would otherwise leave them undefined.
export function ensure(S) {
  const f = freshProgress();
  if (typeof S.rep !== 'number') S.rep = f.rep;
  S.stats = { ...f.stats, ...(S.stats || {}) };
  if (!Array.isArray(S.claimed)) S.claimed = f.claimed;
}

export function levelIdx(rep) {
  let i = 0;
  LEVELS.forEach((l, n) => { if (rep >= l.at) i = n; });
  return i;
}

export function levelInfo(S) {
  const i = levelIdx(S.rep);
  const cur = LEVELS[i];
  const next = LEVELS[i + 1] || null;
  const pct = next ? Math.round(((S.rep - cur.at) / (next.at - cur.at)) * 100) : 100;
  return { i, cur, next, pct, toNext: next ? next.at - S.rep : 0 };
}

/** Called when a customer has paid. Returns the new level if the restaurant just levelled up. */
export function record(S, cust, perfect, earned) {
  ensure(S);
  const before = levelIdx(S.rep);
  S.rep += cust.stars;
  S.stats.earned += earned;
  if (perfect) S.stats.perfect += 1;
  for (const l of cust.order) if (l.id === cust.special) S.stats.specials += l.qty;
  for (const l of cust.order) S.stats.dishes[l.id] = (S.stats.dishes[l.id] || 0) + l.qty;
  const after = levelIdx(S.rep);
  if (after > before) {
    let bonus = 0;
    for (let i = before + 1; i <= after; i++) bonus += LEVELS[i].bonus;
    S.money += bonus;
    return { ...LEVELS[after], bonus };
  }
  return null;
}

// value(S) is progress, goal is reached at `target`.
export const GOALS = [
  { id: 'serve10', icon: '👥', text: 'Serve 10 customers', target: 10, reward: 10, value: (S) => S.served },
  { id: 'perfect5', icon: '🧮', text: 'Get 5 bills exactly right', target: 5, reward: 10, value: (S) => S.stats.perfect },
  { id: 'dishes4', icon: '🍳', text: 'Cook 4 different dishes', target: 4, reward: 15, value: (S) => Object.keys(S.stats.dishes).length },
  { id: 'special8', icon: '⭐', text: 'Sell 8 daily specials', target: 8, reward: 15, value: (S) => S.stats.specials },
  { id: 'earn200', icon: '💵', text: 'Earn $200 from customers', target: 200, reward: 20, value: (S) => S.stats.earned },
  { id: 'oven', icon: '♨️', text: 'Buy an oven', target: 1, reward: 15, value: (S) => (S.kitchen.owned.includes('oven') ? 1 : 0) },
  { id: 'lvl3', icon: '🥐', text: 'Become a Bistro', target: 2, reward: 20, value: (S) => levelIdx(S.rep), shown: (v) => (v >= 2 ? 'Done' : `Level ${v + 1} of 3`) },
  { id: 'serve50', icon: '🏃', text: 'Serve 50 customers', target: 50, reward: 30, value: (S) => S.served },
  { id: 'dishes8', icon: '👨‍🍳', text: 'Cook 8 different dishes', target: 8, reward: 30, value: (S) => Object.keys(S.stats.dishes).length },
  { id: 'big', icon: '🏰', text: 'Reach Grand Restaurant', target: 4, reward: 50, value: (S) => levelIdx(S.rep), shown: (v) => `Level ${v + 1} of 5` },
];

export const goalState = (S, g) => {
  const v = Math.min(g.value(S), g.target);
  return { v, done: v >= g.target, claimed: S.claimed.includes(g.id) };
};

export const claimable = (S) => GOALS.filter((g) => { const s = goalState(S, g); return s.done && !s.claimed; });

export function claim(S, id) {
  const g = GOALS.find((x) => x.id === id);
  if (!g || S.claimed.includes(id) || !goalState(S, g).done) return 0;
  S.claimed.push(id);
  S.money += g.reward;
  return g.reward;
}

/** Compact level card used on the home screen and the goals board. */
export function levelCard(S) {
  const L = levelInfo(S);
  return `<div class="lvlcard"><div class="lvlico">${L.cur.icon}</div><div class="lvlbody"><b>${L.cur.name}</b><div class="gbar"><i style="width:${L.pct}%"></i></div><small>${L.next ? `${L.toNext} ⭐ to ${L.next.icon} ${L.next.name} (+$${L.next.bonus})` : 'Top level reached! 🎉'}</small></div></div>`;
}

export function goalsHtml(S, fmt) {
  const rows = GOALS.map((g) => {
    const s = goalState(S, g);
    const pct = Math.round((s.v / g.target) * 100);
    const label = g.shown ? g.shown(g.value(S)) : `${g.id.startsWith('earn') ? fmt(s.v) : s.v} / ${g.id.startsWith('earn') ? fmt(g.target) : g.target}`;
    const right = s.claimed ? '<b class="gdone">✅</b>' : s.done ? `<button class="btn sm" data-act="goal-claim" data-v="${g.id}">+${fmt(g.reward)}</button>` : `<b class="greward">${fmt(g.reward)}</b>`;
    return `<li class="grow ${s.claimed ? 'claimed' : ''} ${s.done && !s.claimed ? 'ready' : ''}"><span class="gico">${g.icon}</span><div class="gtext"><b>${g.text}</b><div class="gbar"><i style="width:${pct}%"></i></div><small>${label}</small></div>${right}</li>`;
  }).join('');
  return `${levelCard(S)}<ul class="glist">${rows}</ul>`;
}
