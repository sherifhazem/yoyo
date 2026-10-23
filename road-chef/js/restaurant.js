import { RECIPES, CUSTOMER_BILLS, byId, recipeById, makeCustomerOrder, dishTotal, portionsLeft } from './data.js';
import { sfx } from './sound.js';

const CUSTOMERS = ['👧', '👦', '👩', '👨', '🧓', '👵', '👩‍🦰', '👨‍🦱', '🧑‍🎤', '👩‍🔬'];
const PER_SHIFT = 3;

/**
 * The restaurant stage: customers order, the chef cooks from the pantry,
 * then bills the customer (total) and gives change.
 * `host` supplies shared UI bits from game.js.
 */
export function createRestaurant(host) {
  const { S, save, $app, topbar, pad, fmt, shake, getUi, setUi } = host;
  let r;
  let timer = 0;

  const level = () => Math.min(1 + Math.floor(S.served / 4), 6);
  const pantryTotal = () => Object.values(S.pantry).reduce((a, b) => a + b, 0);
  const canCook = () => RECIPES.some((d) => portionsLeft(d, S.pantry) > 0);
  const lines = () => r.cust.order;
  const total = () => dishTotal(lines());

  const newShift = () => ({ served: 0, sales: 0, cost: 0, stars: 0, cust: null, step: 'idle', tray: [] });

  function open() {
    clearTimeout(timer);
    setUi({ screen: 'r-idle', input: '', tries: 0 });
    r = newShift();
    render();
  }
  function stop() {
    clearTimeout(timer);
  }

  /* ---------- pieces ---------- */
  const pantryChips = () => {
    const items = Object.entries(S.pantry).filter(([, q]) => q > 0);
    return `<div class="pantry">${items.length ? items.map(([id, q]) => `<span class="pchip">${byId[id].emoji}<b>${q}</b></span>`).join('') : '<small>Pantry is empty</small>'}</div>`;
  };

  const scene = (bubble) => `
<div class="rscene">
  <div class="rsign">Chef's Café</div>
  <div class="rwin">🌤️</div><div class="rpic">🖼️</div>
  ${r.cust ? `<div class="customer ${r.step === 'paid' ? 'happy' : 'in'}">${r.cust.face}${r.step === 'paid' ? '<span class="hearts">❤️</span>' : ''}</div>` : ''}
  ${bubble ? `<div class="bubble rb">${bubble}</div>` : ''}
  <div class="counter"></div>
  <div class="trayrow">${r.tray.map((e) => `<span>${e}</span>`).join('')}</div>
  <div class="chef ${r.cooking ? 'busy' : ''}">👨‍🍳</div>
</div>`;

  const bill = (v) => `<i class="bill b${v}">${fmt(v)}</i>`;

  /* ---------- steps ---------- */
  function render() {
    const U = getUi();
    U.screen = `r-${r.step}`;
    let body = '';
    let bubble = '';
    if (r.step === 'idle') {
      if (r.served >= PER_SHIFT || (r.served > 0 && !canCook())) return summary();
      if (!canCook()) {
        body = `<div class="card center"><h3>Your pantry can't make a dish 🥲</h3><p>Drive to the grocery and buy ingredients!</p><button class="btn big" data-act="map">Go shopping 🚗</button></div>`;
      } else {
        body = `<button class="btn big" data-act="r-open">Open the door 🚪</button>
        <div class="card"><h3>📋 Menu</h3><ul class="menu">${RECIPES.map((d) => `<li class="${portionsLeft(d, S.pantry) > 0 ? '' : 'out'}"><span>${d.emoji} ${d.name}</span><b>${fmt(d.price)}</b></li>`).join('')}</ul></div>`;
      }
    } else if (r.step === 'order') {
      bubble = `Hello! I'd like<br>${lines().map((l) => `${recipeById[l.id].emoji} ${recipeById[l.id].name} × ${l.qty}`).join('<br>')}`;
      body = `<button class="btn big" data-act="r-cook">Start cooking 👨‍🍳</button>`;
    } else if (r.step === 'cook') {
      body = cookBody();
    } else if (r.step === 'serve') {
      bubble = 'Yum, that smells great! 😋';
      body = `<button class="btn big" data-act="r-serve">Serve & bill 🧾</button>`;
    } else if (r.step === 'bill') {
      bubble = 'How much do I owe you?';
      const rows = lines().map((l) => `<li><span>${recipeById[l.id].emoji} ${l.qty} × ${fmt(recipeById[l.id].price)}</span><span class="hintv">${U.tries >= 2 ? fmt(l.qty * recipeById[l.id].price) : '?'}</span></li>`).join('');
      body = `<div class="card receipt"><ul>${rows}</ul>${U.tries >= 2 ? '<small>Add them all up! ➕</small>' : ''}</div>${pad(U.input)}`;
    } else if (r.step === 'change') {
      bubble = `Here is ${fmt(r.cust.pay)}. What's my change?`;
      body = `<div class="card receipt"><div class="sum">${bill(r.cust.pay)} − <b>${fmt(total())}</b> = ?</div>${U.tries >= 2 ? `<small>Count up from ${fmt(total())} to ${fmt(r.cust.pay)} 👆</small>` : ''}</div>${pad(U.input)}`;
    } else if (r.step === 'paid') {
      bubble = 'Thank you! Bye! 👋';
      body = `<div class="card center"><h3>+${fmt(r.cust.earned)} 🎉</h3><div class="stars small">${[1, 2, 3].map((n) => `<span class="${n <= r.cust.stars ? 'on' : ''}">⭐</span>`).join('')}</div>${r.cust.tip ? `<p>Tip: ${fmt(r.cust.tip)} 💝</p>` : ''}</div>
      <button class="btn big" data-act="r-next">${r.served >= PER_SHIFT || !canCook() ? 'Close shop 🔒' : 'Next customer ➡️'}</button>`;
    }
    $app.innerHTML = `<section class="screen rest">${topbar("Chef's Café")}${scene(bubble)}${r.step === 'cook' ? '' : pantryChips()}${body}</section>`;
  }

  function cookBody() {
    const p = r.portions[r.pi];
    const d = recipeById[p];
    const need = Object.entries(d.ing);
    const slots = need.flatMap(([id, q]) => Array.from({ length: q }, (_, i) => `<span class="slot ${(r.added[id] || 0) > i ? 'full' : ''}">${(r.added[id] || 0) > i ? byId[id].emoji : '?'}</span>`)).join('');
    const stock = Object.entries(S.pantry).filter(([, q]) => q > 0);
    return `
<div class="card recipe">
  <h3>${d.emoji} ${d.name} <small>(${r.pi + 1} of ${r.portions.length})</small></h3>
  <div class="slots">${slots}</div>
  <div class="pan ${r.cooking ? 'cooking' : ''}">🍳<span class="steam">♨️</span></div>
  <small>${r.cooking ? 'Sizzling…' : 'Tap the right ingredients from the fridge 👇'}</small>
</div>
<div class="fridge">${stock.map(([id, q]) => `<button class="fcard" data-act="r-add" data-v="${id}"><span>${byId[id].emoji}</span><b>${q}</b></button>`).join('')}</div>`;
  }

  function summary() {
    const profit = r.sales - r.cost;
    $app.innerHTML = `
<section class="screen done">
  <div class="trophy">🍽️</div>
  <h2>Shift complete!</h2>
  <div class="card summary">
    <div class="rrow"><span>👥 Customers</span><b>${r.served}</b></div>
    <div class="rrow"><span>💵 Sales</span><b>${fmt(r.sales)}</b></div>
    <div class="rrow"><span>🥕 Ingredients used</span><b>− ${fmt(r.cost)}</b></div>
    <hr><div class="rrow big"><span>Profit</span><b class="${profit < 0 ? 'neg' : ''}">${fmt(profit)}</b></div>
  </div>
  <small class="cap">Profit = Sales − Ingredients</small>
  ${canCook() ? '' : '<small class="cap">You ran out of ingredients — time to shop! 🛒</small>'}
  <div class="row"><button class="btn alt" data-act="map">Go shopping 🚗</button>${canCook() ? '<button class="btn" data-act="r-new">New shift</button>' : ''}</div>
</section>`;
    getUi().screen = 'r-summary';
    sfx.bell();
  }

  /* ---------- number entry ---------- */
  function submit(expected, onOk) {
    const U = getUi();
    if (U.input === '') return;
    if (Number(U.input) === expected) {
      sfx.ok();
      if (U.tries === 0) r.cust.stars += 1;
      U.tries = 0;
      U.input = '';
      onOk();
    } else {
      sfx.bad();
      U.tries += 1;
      U.input = '';
      render();
      shake('.display');
    }
  }

  function ok() {
    if (r.step === 'bill') {
      submit(total(), () => {
        if (r.cust.pay === total()) pay();
        else { r.step = 'change'; render(); }
      });
    } else if (r.step === 'change') {
      submit(r.cust.pay - total(), pay);
    }
  }

  function pay() {
    const t = total();
    const tip = r.cust.stars >= 2 ? 1 : 0;
    r.cust.tip = tip;
    r.cust.earned = t + tip;
    S.money += t + tip;
    S.served += 1;
    r.served += 1;
    r.sales += t + tip;
    r.stars += r.cust.stars;
    save();
    sfx.coin();
    sfx.bell();
    r.step = 'paid';
    render();
  }

  /* ---------- actions ---------- */
  const acts = {
    restaurant: open,
    'r-new': () => { r = newShift(); render(); },
    'r-open': () => {
      const order = makeCustomerOrder(level(), S.pantry);
      if (!order.length) { render(); return; }
      const t = dishTotal(order);
      let pay = CUSTOMER_BILLS.find((b) => b >= t);
      const next = CUSTOMER_BILLS[CUSTOMER_BILLS.indexOf(pay) + 1];
      if (level() >= 2 && next && Math.random() < 0.4) pay = next;
      r.cust = { face: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)], order, pay, stars: 1 };
      r.tray = [];
      r.step = 'order';
      sfx.bell();
      render();
    },
    'r-cook': () => {
      r.portions = lines().flatMap((l) => Array(l.qty).fill(l.id));
      r.pi = 0;
      r.added = {};
      r.cooking = false;
      r.step = 'cook';
      render();
    },
    'r-add': (id) => {
      if (r.cooking) return;
      const d = recipeById[r.portions[r.pi]];
      if (!d.ing[id] || (r.added[id] || 0) >= d.ing[id]) {
        sfx.bad();
        shake('.recipe');
        return;
      }
      r.added[id] = (r.added[id] || 0) + 1;
      S.pantry[id] -= 1;
      r.cost += byId[id].price;
      sfx.add();
      const done = Object.entries(d.ing).every(([i, q]) => (r.added[i] || 0) >= q);
      if (!done) { render(); return; }
      r.cooking = true;
      sfx.sizzle();
      render();
      timer = setTimeout(() => {
        r.cooking = false;
        r.tray.push(d.emoji);
        r.pi += 1;
        r.added = {};
        sfx.ok();
        save();
        if (r.pi >= r.portions.length) r.step = 'serve';
        render();
      }, 1400);
    },
    'r-serve': () => { r.step = 'bill'; getUi().tries = 0; getUi().input = ''; render(); },
    'r-next': () => { r.cust = null; r.tray = []; r.step = 'idle'; render(); },
  };

  return { open, stop, acts, ok };
}
