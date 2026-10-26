import { AISLES, ITEMS, BILLS, EQUIPMENT, SUPPLIES, START_SUPPLIES, byId, makePlan, orderCost, recipeById, saleFor, paidPacks, saving } from './data.js';
import { createRestaurant } from './restaurant.js';
import { newRoom } from './room.js';
import { MODES, billMode, recordBill, newBill, billSubmit, billBubble, billHtml } from './billing.js';
import { sfx } from './sound.js';
import { startDrive } from './drive.js';
import { drawCar, CAR_COLORS } from './sprites.js';

const KEY = 'roadChef.v1';
const $app = document.getElementById('app');

const fresh = () => ({ money: 50, trips: 0, stars: 0, car: 'red', owned: ['red'], magnet: false, pantry: {}, served: 0, kitchen: { owned: ['fridge', 'stove', 'board', 'sink', 'counter'] }, room: newRoom(), supplies: { ...START_SUPPLIES }, billPref: 'auto', billStreak: 0 });
const S = (() => {
  try {
    return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return fresh();
  }
})();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {
    /* storage unavailable */
  }
};

// Old saves: the Appliance Shop's extra table became a table for the dining room.
if (S.kitchen.owned.includes('table2')) {
  S.kitchen.owned = S.kitchen.owned.filter((x) => x !== 'table2');
  S.room.stock.table2 = (S.room.stock.table2 || 0) + 1;
  save();
}

// Transient state for the current trip.
let ui = { screen: 'home' };
const level = () => Math.min(S.trips + 1, 6);
const fmt = (n) => `$${n}`;

/* ---------- shared bits ---------- */

const car = `
<svg class="car" viewBox="0 0 220 120" aria-hidden="true">
  <g class="car-body">
    <path d="M14 78 Q14 58 38 56 L68 30 Q74 24 84 24 H140 Q152 24 160 34 L178 56 Q206 58 206 80 V90 H14Z" fill="#ff5a4e"/>
    <path d="M78 34 H138 Q146 34 152 42 L164 56 H70Z" fill="#bfe9ff"/>
    <path d="M110 34 V56" stroke="#ff5a4e" stroke-width="5"/>
    <text x="84" y="53" font-size="22">👨‍🍳</text>
    <rect x="14" y="76" width="192" height="8" fill="#e23f34"/>
    <rect x="192" y="66" width="14" height="10" rx="3" fill="#ffe066"/>
    <rect x="14" y="68" width="10" height="10" rx="3" fill="#ffb3a8"/>
  </g>
  <g class="wheel" style="transform-origin:58px 94px"><circle cx="58" cy="94" r="20" fill="#333"/><circle cx="58" cy="94" r="9" fill="#ccc"/><path d="M58 76V112M40 94H76" stroke="#888" stroke-width="3"/></g>
  <g class="wheel" style="transform-origin:162px 94px"><circle cx="162" cy="94" r="20" fill="#333"/><circle cx="162" cy="94" r="9" fill="#ccc"/><path d="M162 76V112M144 94H180" stroke="#888" stroke-width="3"/></g>
</svg>`;

const topbar = (title) => `
<div class="topbar">
  <button class="chip" data-act="home" aria-label="Home">🏠</button>
  <div class="title">${title}</div>
  <div class="chip wallet" id="wallet">💵 ${fmt(S.money)}</div>
</div>`;

const pad = (val) => `
<div class="display" id="display">${val ? '$' + val : '$ ?'}</div>
<div class="pad">
  ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-act="d" data-v="${n}">${n}</button>`).join('')}
  <button class="alt" data-act="back">⌫</button>
  <button data-act="d" data-v="0">0</button>
  <button class="ok" data-act="ok">✓</button>
</div>`;

function sceneHtml(withCar = true) {
  return `
<div class="scene">
  <div class="sun"></div>
  <div class="cloud c1">☁️</div><div class="cloud c2">☁️</div><div class="cloud c3">☁️</div>
  <div class="layer hills"></div>
  <div class="layer town"></div>
  <div class="road"><div class="lane"></div></div>
  ${withCar ? `<div class="car-wrap" data-act="honk">${car}</div>` : ''}
</div>`;
}

/* ---------- screens ---------- */

function home() {
  $app.innerHTML = `
<section class="screen home">
  ${sceneHtml()}
  <div class="logo"><span>Road</span><span>Chef</span></div>
  <div class="home-stats">
    <div class="chip">💵 ${fmt(S.money)}</div>
    <div class="chip">⭐ ${S.stars}</div>
    <div class="chip">🚗 ${S.trips}</div>
  </div>
  <button class="btn big" data-act="map">Let's Drive! 🚗</button>
  <button class="chip mathmode" data-act="mathmode">🧮 Math steps: ${{ auto: 'Auto', guided: 'Guided', combined: 'Combined' }[S.billPref]}</button>
  <button class="link" data-act="reset">Start over</button>
</section>`;
}

function goalChip() {
  const e = S.goal && EQUIPMENT.find((x) => x.id === S.goal);
  if (!e) return '';
  const pct = Math.min(100, Math.round((S.money / e.price) * 100));
  return `<div class="goalchip"><span>🎯 ${e.emoji} ${e.name}</span><div class="gbar"><i style="width:${pct}%"></i></div><b>${fmt(Math.min(S.money, e.price))} / ${fmt(e.price)}</b></div>`;
}

function map() {
  $app.innerHTML = `
<section class="screen map">
  ${topbar('Pick a shop')}
  <button class="chip garage-btn" data-act="garage">🔧 Garage</button>
  ${goalChip()}
  <div class="mapboard">
    <svg viewBox="0 0 300 420" class="roadsvg" aria-hidden="true">
      <path d="M150 400 C 40 340, 260 300, 150 230 S 60 130, 150 40" fill="none" stroke="#6b6f7a" stroke-width="30" stroke-linecap="round"/>
      <path d="M150 400 C 40 340, 260 300, 150 230 S 60 130, 150 40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 12" stroke-linecap="round"/>
    </svg>
    <button class="pin p1" data-act="go-grocery"><span class="pin-ico">🏪</span><b>Fresh Grocery</b><small>Fruit · Veggies · Meat</small></button>
    <button class="pin p2" data-act="go-supply"><span class="pin-ico">🛒</span><b>Supply Store</b><small>Plates · Napkins</small></button>
    <button class="pin p3" data-act="go-appliance"><span class="pin-ico">🏬</span><b>Appliance Shop</b><small>Oven · Blender · Sign</small></button>
    <button class="restaurant" data-act="restaurant">🍽️ Your restaurant</button>
  </div>
</section>`;
}

const DEST = {
  grocery: { emoji: '🏪', name: 'FRESH GROCERY', title: 'Arrived at the grocery!', btn: 'Go shopping 🛒' },
  appliance: { emoji: '🏬', name: 'APPLIANCE SHOP', title: 'Arrived at the appliance shop!', btn: 'Go inside 🛠️' },
  supply: { emoji: '🛒', name: 'SUPPLY STORE', title: 'Arrived at the supply store!', btn: 'Go inside 🛒' },
};

function drive(dest) {
  $app.innerHTML = '<section class="screen drive"><canvas id="road"></canvas></section>';
  const host = $app.firstElementChild;
  ui.stop = startDrive(host.querySelector('canvas'), {
    level: level(),
    theme: ['day', 'sunset', 'rain'][S.trips % 3],
    color: S.car,
    magnet: S.magnet,
    host,
    dest: DEST[dest],
    onDone: (res) => { ui.stop = null; arrive(res, dest); },
  });
}

function arrive(res, dest) {
  ui.dest = dest;
  S.money += res.money;
  save();
  const row = (icon, label, val) => `<div class="rrow"><span>${icon} ${label}</span><b>${val}</b></div>`;
  $app.innerHTML = `
<section class="screen done">
  <div class="trophy">${DEST[dest].emoji}</div>
  <h2>${DEST[dest].title}</h2>
  <div class="card summary">
    ${row('🪙', '5 coins = $1', `${res.coins} → ${fmt(Math.floor(res.coins / 5))}`)}
    ${res.gifts ? row('🎁', 'Gift boxes', `${res.gifts} × $3`) : ''}
    ${res.gateTotal ? row('🧮', 'Math gates', `${res.gateRight}/${res.gateTotal} × $3`) : ''}
    ${res.bestCombo >= 3 ? row('🔥', 'Best combo', `x${res.bestCombo}`) : ''}
    <hr><div class="rrow big"><span>Driving bonus</span><b>+${fmt(res.money)}</b></div>
  </div>
  <button class="btn big" data-act="shop-start">${DEST[dest].btn}</button>
</section>`;
  sfx.ok();
}

function garage() {
  const swatches = Object.entries(CAR_COLORS)
    .map(([id, c]) => {
      const owned = S.owned.includes(id);
      const on = S.car === id;
      return `<button class="swatch ${on ? 'on' : ''}" data-act="car-pick" data-v="${id}" style="--c:${c.hex}"><i></i><b>${c.name}</b><small>${on ? '✔ Using' : owned ? 'Use' : fmt(c.price)}</small></button>`;
    })
    .join('');
  $app.innerHTML = `
<section class="screen garage">
  ${topbar('Garage')}
  <div class="card preview"><canvas id="prev" width="300" height="190"></canvas></div>
  <div class="swatches">${swatches}</div>
  <button class="card upg" data-act="buy-magnet" ${S.magnet ? 'disabled' : ''}>
    <span class="e">🧲</span><span><b>Coin magnet</b><small>Grab coins from a wider area</small></span><b class="pr">${S.magnet ? 'Owned ✔' : fmt(25)}</b>
  </button>
  <button class="btn" data-act="map">Back to map</button>
</section>`;
  const g = document.getElementById('prev').getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 190);
  grd.addColorStop(0, '#d9f4ff'); grd.addColorStop(1, '#bfe9ff');
  g.fillStyle = grd; g.fillRect(0, 0, 300, 190);
  g.fillStyle = '#5d6270'; g.fillRect(0, 140, 300, 50);
  drawCar(g, 150, 172, 150, CAR_COLORS[S.car].hex, {});
}

function startShop() {
  const { order, dishes } = makePlan(level(), S.kitchen.owned);
  const cost = orderCost(order);
  let topUp = 0;
  if (S.money < cost) {
    topUp = Math.ceil((cost - S.money) / 5) * 5;
    S.money += topUp;
    save();
  }
  ui = { screen: 'shop', order, dishes, cart: {}, tab: 'fruit', tries: 0, stars: 1, topUp, input: '' };
  shop();
}

const cartCount = (id) => ui.cart[id] || 0;
const due = () => (ui.equip ? ui.equip.price : ui.supply ? ui.supply.total : cartTotal());
const cartTotal = () => Object.entries(ui.cart).reduce((s, [id, q]) => s + q * byId[id].price, 0);
const listDone = () =>
  ui.order.every((l) => cartCount(l.id) === l.qty) &&
  Object.keys(ui.cart).every((id) => ui.cart[id] === 0 || ui.order.some((l) => l.id === id));

function shop() {
  const list = ui.order
    .map((l) => {
      const have = cartCount(l.id);
      const st = have === l.qty ? 'done' : have > l.qty ? 'over' : '';
      return `<li class="${st}"><span class="e">${byId[l.id].emoji}</span><span>${byId[l.id].name} × ${l.qty}</span><span class="tick">${st === 'done' ? '✅' : st === 'over' ? '⚠️' : `${have}/${l.qty}`}</span></li>`;
    })
    .join('');
  const tabs = AISLES.map(
    (a) => `<button class="tab ${ui.tab === a.id ? 'on' : ''}" data-act="tab" data-v="${a.id}">${a.icon}<small>${a.label}</small></button>`,
  ).join('');
  const items = ITEMS.filter((i) => i.aisle === ui.tab)
    .map(
      (i) => `
<div class="item" data-id="${i.id}">
  <div class="emoji">${i.emoji}</div>
  <div class="name">${i.name}</div>
  <div class="price">${fmt(i.price)}</div>
  <div class="qty"><button data-act="minus" data-v="${i.id}">−</button><b>${cartCount(i.id)}</b><button data-act="plus" data-v="${i.id}">+</button></div>
</div>`,
    )
    .join('');
  const ready = listDone();
  $app.innerHTML = `
<section class="screen shop">
  ${topbar('Fresh Grocery')}
  ${ui.topUp ? `<div class="toast">Mom gave you ${fmt(ui.topUp)} for shopping 💝</div>` : ''}
  <div class="card list"><h3>📝 Chef's list</h3><small class="plan">For: ${ui.dishes.map((d) => `${recipeById[d.id].emoji} ${recipeById[d.id].name} ×${d.qty}`).join(' · ')}</small><ul>${list}</ul></div>
  <div class="tabs">${tabs}</div>
  <div class="shelf">${items}</div>
  <div class="cartbar">
    <div>🛒 ${Object.values(ui.cart).reduce((a, b) => a + b, 0)} items</div>
    <button class="btn ${ready ? '' : 'dim'}" data-act="checkout">Checkout</button>
  </div>
</section>`;
}

function totalStep() {
  $app.innerHTML = `
<section class="screen pay">
  ${topbar('Cashier')}
  <div class="cashier">🧑‍💼 <div class="bubble">${billBubble(ui.bill)}</div></div>
  ${billHtml(ui.bill, fmt)}
  ${pad(ui.input)}
</section>`;
}

function payStep() {
  const total = due();
  const bills = BILLS.map(
    (b) => `<button class="bill b${b}" data-act="bill" data-v="${b}"><span>${fmt(b)}</span></button>`,
  ).join('');
  $app.innerHTML = `
<section class="screen pay">
  ${topbar('Pay')}
  <div class="cashier">🧑‍💼 <div class="bubble">${ui.equip ? `${ui.equip.emoji} ${ui.equip.name}: ` : 'Total: '}<b>${fmt(total)}</b>. Pay with your cash!</div></div>
  <div class="card tray"><div>You are paying</div><div class="paid" id="paid">${fmt(ui.paid || 0)}</div>
    <div class="stack" id="stack">${(ui.paidBills || []).map((b) => `<i class="bill b${b}">${fmt(b)}</i>`).join('')}</div></div>
  <div class="bills">${bills}</div>
  <div class="row"><button class="btn alt" data-act="clear">Clear</button><button class="btn" data-act="paynow">Pay ✓</button></div>
</section>`;
}

function changeStep() {
  const total = due();
  $app.innerHTML = `
<section class="screen pay">
  ${topbar('Change')}
  <div class="cashier">🧑‍💼 <div class="bubble">Bill ${fmt(total)}, you paid ${fmt(ui.paid)}. How much change?</div></div>
  <div class="card receipt"><div class="sum"><b>${fmt(ui.paid)}</b> − <b>${fmt(total)}</b> = ?</div>
  ${ui.tries >= 2 ? `<small>Count up from ${fmt(total)} to ${fmt(ui.paid)} 👆</small>` : ''}</div>
  ${pad(ui.input)}
</section>`;
}

function finishPurchase() {
  if (ui.equip) installed();
  else if (ui.supply) stockedUp();
  else done();
}

const sale = () => saleFor(S.trips);
const supplyLines = () =>
  SUPPLIES.flatMap((s) => s.packs.map((p) => ({ s, p, n: ui.cart[p.id] || 0 })))
    .filter((x) => x.n > 0)
    .map(({ s, p, n }) => ({ emoji: s.emoji, qty: paidPacks(p, n, sale()), price: p.price, tag: p.qty > 1 ? `(${p.qty}-pack)` : '' }))
    .filter((l) => l.qty > 0);

function stockedUp() {
  const got = [];
  for (const s of SUPPLIES) {
    const add = s.packs.reduce((sum, p) => sum + (ui.cart[p.id] || 0) * p.qty, 0);
    if (add) { S.supplies[s.id] = (S.supplies[s.id] || 0) + add; got.push(`${s.emoji} +${add} ${s.name.toLowerCase()}`); }
  }
  save();
  $app.innerHTML = `
<section class="screen done">
  <div class="trophy">📦</div>
  <h2>Stocked up!</h2>
  <div class="card">${got.join('<br>')}<br><br>Plates: <b>${S.supplies.plate}</b> · Napkins: <b>${S.supplies.napkin}</b><br>Wallet: <b>${fmt(S.money)}</b></div>
  <button class="btn big" data-act="restaurant">Open the restaurant 🍽️</button>
  <button class="btn alt" data-act="map">Back to map</button>
</section>`;
  sfx.ok();
}

function supplyShop() {
  if (!ui.cart || ui.screen !== 'supply') ui = { screen: 'supply', cart: {}, dest: 'supply', stars: 0 };
  const sp = sale();
  const cards = SUPPLIES.map((s) => {
    const rows = s.packs.map((p) => {
      const n = ui.cart[p.id] || 0;
      const sv = saving(s, p);
      const isSale = sp === p.id;
      return `<div class="pack ${isSale ? 'onsale' : ''}">
        <div class="pinfo"><b>${p.qty === 1 ? '1 ' + s.name.toLowerCase().replace(/s$/, '') : `${p.qty}-pack`}</b> <span class="pprice">${fmt(p.price)}</span>${sv > 0 ? `<small class="save">Save ${fmt(sv)}</small>` : ''}${isSale ? '<small class="ribbon">🔥 Buy 2, get 1 FREE</small>' : ''}</div>
        <div class="qty"><button data-act="sup-minus" data-v="${p.id}">−</button><b>${n}</b><button data-act="sup-plus" data-v="${p.id}">+</button></div>
      </div>`;
    }).join('');
    return `<div class="card supcard"><div class="suphead"><span class="supico">${s.emoji}</span><div><b>${s.name}</b><small>${s.use}</small></div><span class="pchip">You have <b>${S.supplies[s.id] || 0}</b></span></div>${rows}</div>`;
  }).join('');
  const lines = supplyLines();
  $app.innerHTML = `
<section class="screen supshop">
  ${topbar('Supply Store')}
  <div class="shopfront sup"><span>🛒</span><div><b>Stock up the café!</b><small>Bigger packs cost less per piece.</small></div></div>
  <div class="suplist">${cards}</div>
  <div class="cartbar"><div>🧾 ${lines.length ? `${SUPPLIES.flatMap((s) => s.packs).reduce((a, p) => a + (ui.cart[p.id] || 0), 0)} packs · pay for ${lines.reduce((a, l) => a + l.qty, 0)}` : 'Cart is empty'}</div><button class="btn ${lines.length ? '' : 'dim'}" data-act="sup-checkout">Checkout</button></div>
</section>`;
}

function installed() {
  const e = ui.equip;
  S.kitchen.owned.push(e.id);
  if (S.goal === e.id) S.goal = null;
  save();
  const confetti = Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.2}s;--c:${['#ff5a4e', '#ffd23f', '#3ec6ff', '#7bdc6b', '#c58bff'][i % 5]}"></i>`).join('');
  $app.innerHTML = `
<section class="screen done">
  <div class="confetti">${confetti}</div>
  <div class="trophy">${e.emoji}</div>
  <h2>${e.name} installed!</h2>
  <div class="card">${e.benefit}<br>Wallet: <b>${fmt(S.money)}</b></div>
  <button class="btn big" data-act="restaurant">See it in the kitchen 🍽️</button>
  <button class="btn alt" data-act="map">Back to map</button>
</section>`;
  sfx.ok();
}

function applianceShop(msg) {
  const cards = EQUIPMENT.filter((e) => e.price > 0)
    .map((e) => {
      const own = S.kitchen.owned.includes(e.id);
      const pct = Math.min(100, Math.round((S.money / e.price) * 100));
      const act = own
        ? '<span class="own">Owned ✔</span>'
        : `<b class="eprice">${fmt(e.price)}</b><button class="btn sm ${S.money >= e.price ? '' : 'dim'}" data-act="equip-buy" data-v="${e.id}">${S.money >= e.price ? 'Buy' : `Need ${fmt(e.price - S.money)}`}</button><button class="goalbtn" data-act="equip-goal" data-v="${e.id}">${S.goal === e.id ? '🎯 Saving' : '🎯 Save for it'}</button>`;
      return `<div class="card equip ${own ? 'owned' : ''}"><div class="eico">${e.emoji}</div><div class="einfo"><b>${e.name}</b><small>${e.benefit}</small>${own ? '' : `<div class="gbar"><i style="width:${pct}%"></i></div>`}</div><div class="eact">${act}</div></div>`;
    })
    .join('');
  $app.innerHTML = `
<section class="screen appshop">
  ${topbar('Appliance Shop')}
  <div class="shopfront"><span>🏬</span><div><b>Upgrade your café!</b><small>Save up, then invest in the best deal.</small></div></div>
  ${msg ? `<div class="toast">${msg}</div>` : ''}
  <div class="equiplist">${cards}</div>
  <button class="btn alt" data-act="map">Back to map</button>
</section>`;
}

function done() {
  const reward = 4 + ui.stars * 2;
  S.money += reward;
  S.trips += 1;
  S.stars += ui.stars;
  for (const l of ui.order) S.pantry[l.id] = (S.pantry[l.id] || 0) + l.qty;
  save();
  const confetti = Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.2}s;--c:${['#ff5a4e', '#ffd23f', '#3ec6ff', '#7bdc6b', '#c58bff'][i % 5]}"></i>`).join('');
  $app.innerHTML = `
<section class="screen done">
  <div class="confetti">${confetti}</div>
  <div class="trophy">🧺</div>
  <h2>Ingredients delivered!</h2>
  <div class="stars">${[1, 2, 3].map((n) => `<span class="${n <= ui.stars ? 'on' : ''}" style="--i:${n}">⭐</span>`).join('')}</div>
  <div class="card">The restaurant paid you <b>${fmt(reward)}</b> 🎉<br>Wallet: <b>${fmt(S.money)}</b></div>
  <button class="btn big" data-act="restaurant">Open the restaurant 🍽️</button>
  <button class="btn alt" data-act="map">Next trip 🚗</button>
</section>`;
  sfx.ok();
}

/* ---------- actions ---------- */

function shake(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

function submitNumber(expected, onOk) {
  const val = Number(ui.input);
  if (ui.input === '') return;
  if (val === expected) {
    sfx.ok();
    if (ui.tries === 0) ui.stars += 1;
    ui.tries = 0;
    ui.input = '';
    onOk();
  } else {
    sfx.bad();
    ui.tries += 1;
    ui.input = '';
    ui.screen === 'total' ? totalStep() : changeStep();
    shake('.display');
  }
}

const R = createRestaurant({ S, save, $app, topbar, pad, fmt, shake, getUi: () => ui, setUi: (u) => { ui = u; } });

const acts = {
  ...R.acts,
  home: () => { ui.stop?.(); R.stop(); ui = { screen: 'home' }; home(); },
  'shop-start': () => (ui.dest === 'appliance' ? applianceShop() : ui.dest === 'supply' ? supplyShop() : startShop()),
  garage: () => { ui = { screen: 'garage' }; garage(); },
  'car-pick': (v) => {
    const c = CAR_COLORS[v];
    if (!S.owned.includes(v)) {
      if (S.money < c.price) { sfx.bad(); shake('.swatches'); return; }
      S.money -= c.price; S.owned.push(v); sfx.coin();
    }
    S.car = v; save(); garage();
  },
  'buy-magnet': () => {
    if (S.magnet) return;
    if (S.money < 25) { sfx.bad(); shake('.upg'); return; }
    S.money -= 25; S.magnet = true; save(); sfx.coin(); garage();
  },
  mathmode: () => { S.billPref = MODES[(MODES.indexOf(S.billPref) + 1) % MODES.length]; save(); home(); },
  map: () => { R.stop(); ui = { screen: 'map' }; map(); },
  reset: () => {
    if (confirm('Erase all progress?')) {
      Object.assign(S, fresh());
      save();
      home();
    }
  },
  'go-grocery': () => { ui = { screen: 'drive' }; drive('grocery'); },
  'go-appliance': () => { ui = { screen: 'drive' }; drive('appliance'); },
  'go-supply': () => { ui = { screen: 'drive' }; drive('supply'); },
  'sup-plus': (id) => { ui.cart[id] = (ui.cart[id] || 0) + 1; sfx.add(); supplyShop(); },
  'sup-minus': (id) => { if (ui.cart[id] > 0) { ui.cart[id] -= 1; sfx.remove(); supplyShop(); } },
  'sup-checkout': () => {
    const lines = supplyLines();
    if (!lines.length) { sfx.bad(); shake('.suplist'); return; }
    ui.supply = { total: lines.reduce((s, l) => s + l.qty * l.price, 0) };
    ui.screen = 'total'; ui.tries = 0; ui.input = '';
    ui.bill = newBill(lines, billMode(S));
    totalStep();
  },
  'equip-goal': (id) => { S.goal = id; save(); sfx.coin(); applianceShop(); },
  'equip-buy': (id) => {
    const e = EQUIPMENT.find((x) => x.id === id);
    if (S.kitchen.owned.includes(id)) return;
    if (S.money < e.price) { S.goal = id; save(); sfx.bad(); applianceShop(`Not enough yet! You need ${fmt(e.price - S.money)} more. Goal set 🎯`); return; }
    ui = { screen: 'pay', equip: e, paid: 0, paidBills: [], stars: 0, tries: 0, input: '', dest: 'appliance' };
    payStep();
  },
  honk: () => sfx.honk(),
  tab: (v) => { ui.tab = v; shop(); },
  plus: (v) => { ui.cart[v] = cartCount(v) + 1; sfx.add(); shop(); bump(v); },
  minus: (v) => { if (cartCount(v) > 0) { ui.cart[v] -= 1; sfx.remove(); shop(); } },
  checkout: () => {
    if (!listDone()) { sfx.bad(); shake('.list'); return; }
    ui.screen = 'total'; ui.tries = 0; ui.input = '';
    ui.bill = newBill(ui.order.map((l) => ({ emoji: byId[l.id].emoji, qty: l.qty, price: byId[l.id].price })), billMode(S));
    totalStep();
  },
  d: (v) => {
    if (ui.input.length >= 3) return;
    ui.input = (ui.input + v).replace(/^0+(?=\d)/, '');
    sfx.tap();
    document.getElementById('display').textContent = '$' + ui.input;
  },
  back: () => {
    ui.input = ui.input.slice(0, -1);
    document.getElementById('display').textContent = ui.input ? '$' + ui.input : '$ ?';
  },
  ok: () => {
    if (ui.screen === 'r-bill' || ui.screen === 'r-change') R.ok();
    else if (ui.screen === 'total') {
      if (ui.input === '') return;
      const res = billSubmit(ui.bill, Number(ui.input));
      ui.input = '';
      if (res === 'wrong') { sfx.bad(); totalStep(); shake('.display'); return; }
      sfx.ok();
      if (res === 'next') { totalStep(); return; }
      if (ui.bill.mistakes === 0) ui.stars += 1;
      recordBill(S, ui.bill, save);
      ui.screen = 'pay'; ui.paid = 0; ui.paidBills = []; payStep();
    } else if (ui.screen === 'change') {
      submitNumber(ui.paid - due(), () => {
        S.money -= due();
        sfx.coin();
        finishPurchase();
      });
    }
  },
  bill: (v) => {
    const b = Number(v);
    if (ui.paid + b > S.money) { sfx.bad(); shake('.tray'); return; }
    ui.paid += b;
    ui.paidBills.push(b);
    sfx.coin();
    payStep();
  },
  clear: () => { ui.paid = 0; ui.paidBills = []; payStep(); },
  paynow: () => {
    if (ui.paid < due()) { sfx.bad(); shake('.tray'); return; }
    ui.screen = 'change'; ui.tries = 0; ui.input = '';
    if (ui.paid === due()) { // exact payment: no change to compute
      S.money -= due();
      finishPurchase();
      return;
    }
    changeStep();
  },
};

function bump(id) {
  const el = document.querySelector(`.item[data-id="${id}"] .emoji`);
  if (el) el.classList.add('pop');
}

$app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const fn = acts[t.dataset.act];
  if (fn) fn(t.dataset.v, e);
});

home();
