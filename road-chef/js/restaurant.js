import { RECIPES, CUSTOMER_BILLS, quickDish, byId, recipeById, makeCustomerOrder, dishTotal, dishPrice, available, portionsLeft } from './data.js';
import { sfx } from './sound.js';
import { createCooking } from './cooking.js';
import { createKitchen } from './kitchen.js';
import { createRoomDesigner, gridHtml, roomStats } from './room.js';
import { record, levelCard } from './goals.js';
import { person, randomLook, windowSvg, frameSvg, pendantSvg, registerSvg, bellSvg, steamSvg } from './art.js';
import { billMode, recordBill, newBill, billSubmit, billBubble, billHtml } from './billing.js';

/**
 * The restaurant stage: customers order, the chef cooks from the pantry,
 * then bills the customer (total) and gives change.
 * `host` supplies shared UI bits from game.js.
 */
export function createRestaurant(host) {
  const { S, save, $app, topbar, pad, fmt, shake, getUi, setUi } = host;
  let r;
  let timer = 0;
  const K = createCooking({ $app, shake });
  const KT = createKitchen();
  const RD = createRoomDesigner({ S, save, $app, topbar, fmt, shake, onClose: () => { getUi().screen = 'r-idle'; render(); } });

  const level = () => Math.min(1 + Math.floor(S.served / 4), 6);
  const pantryTotal = () => Object.values(S.pantry).reduce((a, b) => a + b, 0);
  const owned = () => S.kitchen.owned;
  const perShift = () => roomStats(S.room).customers;
  const platesOk = () => (S.supplies.plate || 0) > 0;
  const canCook = () => platesOk() && available(owned()).some((d) => portionsLeft(d, S.pantry) > 0);
  const lines = () => r.cust.order;
  const total = () => dishTotal(lines(), owned());

  const newShift = () => ({ served: 0, sales: 0, cost: 0, stars: 0, cust: null, step: 'idle', tray: [], leveled: [] });

  function open() {
    clearTimeout(timer);
    K.stop();
    KT.reset();
    setUi({ screen: 'r-idle', input: '', tries: 0 });
    r = newShift();
    render();
  }
  function stop() {
    clearTimeout(timer);
    K.stop();
  }

  /* ---------- pieces ---------- */
  const pantryChips = () => {
    const items = Object.entries(S.pantry).filter(([, q]) => q > 0);
    const sup = `<span class="pchip sup">🍽️<b>${S.supplies.plate || 0}</b></span><span class="pchip sup">🧻<b>${S.supplies.napkin || 0}</b></span>`;
    return `<div class="pantry">${items.length ? items.map(([id, q]) => `<span class="pchip">${byId[id].emoji}<b>${q}</b></span>`).join('') : '<small>Pantry is empty</small>'}${sup}</div>`;
  };

  const scene = (bubble) => `
<div class="rscene room ${r.step}">
  <div class="rays"><i></i><i></i><b></b><b></b><b></b><b></b></div>
  <div class="rtop">${windowSvg()}${pendantSvg()}<div class="rsign ${owned().includes('sign') ? 'neon' : ''}">Chef's Café</div>${pendantSvg('#3a8dff')}${frameSvg()}</div>
  <div class="rbwrap">${bubble ? `<div class="bubble rb">${bubble}</div>` : ''}</div>
  <div class="rfloor">${gridHtml(S.room, { sitAt: r.cust ? r.seatKey : null, face: r.cust && r.cust.face, happy: r.step === 'paid', talk: ['order', 'bill', 'change'].includes(r.step) })}</div>
  <div class="counter"><span class="creg">${registerSvg()}</span><span class="cbell ${r.step === 'order' ? 'ring' : ''}">${bellSvg()}</span></div>
  <div class="trayrow">${r.tray.length ? steamSvg() : ''}${r.tray.map((e) => `<span>${e}</span>`).join('')}</div>
  <div class="chef ${r.step === 'cook' && r.phase === 'make' ? 'busy' : ''}">${person({ role: 'chef', mood: r.step === 'paid' || r.step === 'serve' ? 'happy' : 'smile', size: 60 })}</div>
</div>`;

  // What the order needs, against the pantry (the child checks stock before sending it).
  const needsHtml = () => {
    const need = {};
    for (const l of lines()) for (const [id, q] of Object.entries(recipeById[l.id].ing)) need[id] = (need[id] || 0) + q * l.qty;
    return `<div class="card needs"><b>📦 Ingredients</b><div class="needrow">${Object.entries(need).map(([id, q]) => `<span class="pchip">${byId[id].emoji}<b>${q}</b><i>/ ${S.pantry[id] || 0}</i></span>`).join('')}</div></div>`;
  };

  const bill = (v) => `<i class="bill b${v}">${fmt(v)}</i>`;

  /* ---------- steps ---------- */
  function render() {
    const U = getUi();
    U.screen = `r-${r.step}`;
    let body = '';
    let bubble = '';
    let kitchen = '';
    if (r.step === 'idle') {
      if (r.served >= perShift() || (r.served > 0 && !canCook())) return summary();
      if (!canCook()) {
        body = `<div class="card center">${platesOk() ? "<h3>Your pantry can't make a dish 🥲</h3><p>Drive to the grocery and buy ingredients!</p>" : '<h3>No clean plates! 🍽️</h3><p>Drive to the Supply Store and stock up on plates.</p>'}<button class="btn big" data-act="map">Go shopping 🚗</button></div><button class="btn alt" data-act="room-open">🏗️ Design your café</button>`;
      } else {
        body = `<button class="btn big" data-act="r-open">Open the door 🚪</button>
        <button class="btn alt" data-act="room-open">🏗️ Design your café <small>(${roomStats(S.room).customers} customers/shift)</small></button>
        <div class="card"><h3>📋 Menu</h3><ul class="menu">${RECIPES.map((d) => { const lock = d.needs && !owned().includes(d.needs); return `<li class="${!lock && portionsLeft(d, S.pantry) > 0 ? '' : 'out'}"><span>${d.emoji} ${d.name}${lock ? ` <small>🔒 needs ${d.needs}</small>` : ''}</span><b>${fmt(dishPrice(d, owned()))}</b></li>`; }).join('')}</ul></div>`;
      }
    } else if (r.step === 'order') {
      bubble = `Hello! I'd like<br>${lines().map((l) => `${recipeById[l.id].emoji} ${recipeById[l.id].name} × ${l.qty}`).join('<br>')}`;
      body = `${needsHtml()}<button class="btn big" data-act="r-send">Send to kitchen 👨‍🍳</button><button class="btn alt" data-act="r-cook">Cook it myself <small>(chop + cook, +$1 tip for a clean job)</small></button>`;
    } else if (r.step === 'making') {
      const m = r.making;
      bubble = m.stages[m.i].msg;
      kitchen = KT.scene({ at: m.stages[m.i].at, doing: true, making: true, owned: owned(), tray: r.tray });
      body = `<div class="card center"><div class="gbar"><i style="width:${Math.round(((m.i + 1) / m.stages.length) * 100)}%"></i></div><small>The chef is on it — ${m.stages[m.i].label}</small></div>`;
    } else if (r.step === 'cook') {
      const make = r.phase === 'make';
      bubble = make ? K.bubble() : 'Pick the ingredients for the chef 🧊';
      kitchen = KT.scene({ at: make ? K.station() : 'fridge', doing: make ? K.entered() : true, stepType: make ? K.stepType() : null, bubble, owned: owned(), tray: r.tray });
      const ticket = ticketHtml();
      body = make ? `${ticket}${K.html()}` : `${ticket}${cookBody()}`;
    } else if (r.step === 'serve') {
      bubble = 'Yum, that smells great! 😋';
      body = `<button class="btn big" data-act="r-serve">Serve & bill 🧾</button>`;
    } else if (r.step === 'bill') {
      bubble = billBubble(r.bill);
      body = `${billHtml(r.bill, fmt)}${pad(U.input)}`;
    } else if (r.step === 'change') {
      bubble = `Here is ${fmt(r.cust.pay)}. What's my change?`;
      body = `<div class="card receipt"><div class="sum">${bill(r.cust.pay)} − <b>${fmt(total())}</b> = ?</div>${U.tries >= 2 ? `<small>Count up from ${fmt(total())} to ${fmt(r.cust.pay)} 👆</small>` : ''}</div>${pad(U.input)}`;
    } else if (r.step === 'paid') {
      bubble = 'Thank you! Bye! 👋';
      body = `<div class="card center"><h3>+${fmt(r.cust.earned)} 🎉</h3><div class="stars small">${[1, 2, 3].map((n) => `<span class="${n <= r.cust.stars ? 'on' : ''}">⭐</span>`).join('')}</div>${r.cust.cookTip ? '<p>👨‍🍳 Great cooking! +$1</p>' : ''}${r.cust.signTip ? '<p>✨ Neon sign tip! +$1</p>' : ''}${r.cust.ambTip ? `<p>🌿 Cozy café tip! +$${r.cust.ambTip}</p>` : ''}${r.cust.napkinTip ? '<p>🧻 Napkin service! +$1</p>' : ''}${r.cust.stars >= 2 ? '<p>🧮 Accurate bill! +$1</p>' : ''}</div>
      <button class="btn big" data-act="r-next">${r.served >= perShift() || !canCook() ? 'Close shop 🔒' : 'Next customer ➡️'}</button>`;
    }
    $app.innerHTML = `<section class="screen rest ${r.step === 'making' ? 'still' : ''}">${topbar("Chef's Café")}${kitchen || scene(bubble)}${r.step === 'cook' ? '' : pantryChips()}${body}</section>`;
    if (r.step === 'cook' && r.phase === 'make') K.afterRender();
  }

  function ticketHtml() {
    const d = recipeById[r.portions[r.pi]];
    const gather = { icon: '🧊', state: r.phase === 'gather' ? 'now' : 'done' };
    const steps = r.phase === 'gather' ? quickDish(d).steps.map((sp) => ({ icon: sp.t === 'chop' ? '🔪' : sp.t === 'tap' ? sp.emoji : sp.t === 'pour' ? sp.liquid : sp.t === 'heat' ? '🔥' : '🔄', state: '' })) : K.ticket();
    return `<div class="ticket"><span class="tname">${d.emoji} <b>${d.name}</b> <small>${r.pi + 1}/${r.portions.length}</small></span><span class="tsteps">${[gather, ...steps].map((s) => `<i class="${s.state}">${s.icon}</i>`).join('')}</span></div>`;
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
  <small>Tap the right ingredients from the fridge 👇</small>
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
  ${r.leveled.map((l) => `<div class="banner">${l.icon} Level up! You are now a <b>${l.name}</b>! +${fmt(l.bonus)}</div>`).join('')}
  ${levelCard(S)}
  ${canCook() ? '' : `<small class="cap">${platesOk() ? 'You ran out of ingredients — time to shop! 🛒' : 'You ran out of plates — visit the Supply Store! 🛒'}</small>`}
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
      const U = getUi();
      if (U.input === '') return;
      const res = billSubmit(r.bill, Number(U.input));
      U.input = '';
      if (res === 'wrong') { sfx.bad(); render(); shake('.display'); return; }
      sfx.ok();
      if (res === 'next') { render(); return; }
      if (r.bill.mistakes === 0) r.cust.stars += 1;
      recordBill(S, r.bill, save);
      U.tries = 0;
      if (r.cust.pay === total()) pay();
      else { r.step = 'change'; render(); }
    } else if (r.step === 'change') {
      submit(r.cust.pay - total(), pay);
    }
  }

  function pay() {
    const t = total();
    r.cust.cookTip = !r.cust.auto && r.cust.cookMistakes <= 1 ? 1 : 0;
    r.cust.signTip = owned().includes('sign') ? 1 : 0;
    r.cust.ambTip = roomStats(S.room).tip;
    r.cust.napkinTip = r.cust.napkin ? 1 : 0;
    const tip = (r.cust.stars >= 2 ? 1 : 0) + r.cust.cookTip + r.cust.signTip + r.cust.ambTip + r.cust.napkinTip;
    r.cust.tip = tip;
    r.cust.earned = t + tip;
    S.money += t + tip;
    S.served += 1;
    r.served += 1;
    r.sales += t + tip;
    r.stars += r.cust.stars;
    const up = record(S, r.cust, r.bill.mistakes === 0, t + tip);
    if (up) r.leveled.push(up);
    save();
    sfx.coin();
    sfx.bell();
    r.step = 'paid';
    render();
  }

  /* ---------- actions ---------- */
  function portionDone(mistakes) {
    const d = recipeById[r.portions[r.pi]];
    r.cust.cookMistakes += mistakes;
    r.tray.push(d.emoji);
    r.pi += 1;
    r.added = {};
    r.phase = 'gather';
    save();
    if (r.pi >= r.portions.length) r.step = 'serve';
    render();
  }

  const acts = {
    ...K.acts,
    ...RD.acts,
    'room-open': () => { getUi().screen = 'r-room'; RD.acts['room-open'](); },
    restaurant: open,
    'r-new': () => { r = newShift(); render(); },
    'r-open': () => {
      const order = makeCustomerOrder(level(), S.pantry, owned(), S.supplies.plate || 0);
      if (!order.length) { render(); return; }
      const t = dishTotal(order, owned());
      let pay = CUSTOMER_BILLS.find((b) => b >= t);
      const next = CUSTOMER_BILLS[CUSTOMER_BILLS.indexOf(pay) + 1];
      if (level() >= 2 && next && Math.random() < 0.4) pay = next;
      const tables = roomStats(S.room).tables;
      r.seatKey = tables[Math.floor(Math.random() * tables.length)];
      r.cust = { face: randomLook(), order, pay, stars: 1, cookMistakes: 0 };
      r.tray = [];
      r.step = 'order';
      sfx.bell();
      render();
    },
    // The chef cooks by himself: the pantry is used up and the dish goes to the tray.
    'r-send': () => {
      r.portions = lines().flatMap((l) => Array(l.qty).fill(l.id));
      for (const p of r.portions) for (const [id, q] of Object.entries(recipeById[p].ing)) { S.pantry[id] -= q; r.cost += byId[id].price * q; }
      save();
      r.cust.auto = true;
      const bake = r.portions.some((p) => recipeById[p].needs === 'oven');
      r.making = { i: 0, stages: [
        { at: 'fridge', msg: 'Chef is fetching the ingredients 🧊', label: 'fetching ingredients' },
        { at: 'board', msg: 'Chopping and mixing… 🔪', label: 'chopping' },
        { at: bake ? 'oven' : 'stove', msg: bake ? 'Baking in the oven… ♨️' : 'Cooking on the stove… 🔥', label: 'cooking' },
        { at: 'pass', msg: 'Plating up! 🍽️', label: 'plating' },
      ] };
      r.step = 'making';
      KT.walkTo('fridge');
      render();
      const tick = () => {
        timer = setTimeout(() => {
          r.making.i += 1;
          if (r.making.i >= r.making.stages.length) {
            r.tray = r.portions.map((p) => recipeById[p].emoji);
            r.step = 'serve';
            sfx.bell();
            render();
            return;
          }
          sfx.pop();
          KT.walkTo(r.making.stages[r.making.i].at);
          render();
          tick();
        }, 900);
      };
      tick();
    },
    'r-cook': () => {
      r.portions = lines().flatMap((l) => Array(l.qty).fill(l.id));
      r.pi = 0;
      r.added = {};
      r.phase = 'gather';
      r.step = 'cook';
      KT.walkTo('fridge');
      render();
    },
    'r-add': (id) => {
      const d = recipeById[r.portions[r.pi]];
      if (r.phase !== 'gather') return;
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
      save();
      r.phase = 'make';
      K.begin(quickDish(d), { rerender: render, onDone: portionDone, onEnter: (st) => KT.walkTo(st), owned: owned(), auto: true });
    },
    'r-serve': () => {
      S.supplies.plate = Math.max(0, (S.supplies.plate || 0) - r.portions.length);
      r.cust.napkin = (S.supplies.napkin || 0) > 0;
      if (r.cust.napkin) S.supplies.napkin -= 1;
      save();
      r.bill = newBill(lines().map((l) => ({ emoji: recipeById[l.id].emoji, qty: l.qty, price: dishPrice(recipeById[l.id], owned()) })), billMode(S));
      r.step = 'bill'; getUi().tries = 0; getUi().input = ''; render();
    },
    'r-next': () => { r.cust = null; r.tray = []; r.step = 'idle'; render(); },
  };

  return { open, stop, acts, ok };
}
