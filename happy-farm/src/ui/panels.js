import { CROPS, cropIds } from '../data/crops.js';
import { GOODS, goodIds, ANIMALS, SHOP, BARN_LIMIT, PEN_LIMIT } from '../data/items.js';
import { basePrice, priceOf, history, quote } from '../sim/market.js';
import { CRATE, offerUnit, marketUnit } from '../sim/orders.js';
import * as A from '../sim/actions.js';
import * as M from '../sim/machines.js';
import { supply, demand, BATTERY_WH, TANK_MAX, PUMP_W } from '../sim/power.js';
import { weatherOf, WEATHER_ICON } from '../sim/weather.js';
import { phenotype, offspringOdds } from '../sim/breeding.js';
import { SKILLS, score } from '../sim/skills.js';
import { STICKERS } from '../sim/progress.js';
import { MAX_COLS, MAX_ROWS, goodCount } from '../core/state.js';
import { dayOf } from '../core/clock.js';

const $ = (id) => document.getElementById(id);
const modal = $('modal'), card = $('card');
let live = null;
const ui = { tab: {}, sell: {}, load: {}, speed: 60, pick: [], msg: '' };

export const closeModal = () => { modal.classList.add('hidden'); clearInterval(live); live = null; card.onclick = null; };
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
const show = (html) => { card.innerHTML = html; modal.classList.remove('hidden'); };

const tabsHtml = (tabs, cur) => `<div class="tabs">${tabs.map(([id, label]) => `<button class="tab ${cur === id ? 'on' : ''}" data-tab="${id}">${label}</button>`).join('')}</div>`;
const gauge = (v, max, cls, mark) => `<div class="gauge"><b class="${cls}" style="width:${Math.max(0, Math.min(100, (v / max) * 100))}%"></b>${mark != null ? `<i style="left:${(mark / max) * 100}%"></i>` : ''}</div>`;
const spark = (arr, today) => {
  const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
  const pts = arr.map((v, i) => `${(i / (arr.length - 1)) * 66 + 2},${22 - ((v - mn) / r) * 18}`).join(' ');
  const last = pts.split(' ').pop().split(',');
  return `<svg class="spark" viewBox="0 0 70 24"><polyline points="${pts}" fill="none" stroke="#5a3b12" stroke-width="2"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="#e0a030"/></svg>`;
};

// ctx: { s, now(), day(), run(res, opts), refreshAll(), closeAll }
export function createPanels(ctx) {
  const s = ctx.s;
  const lockedNote = (lv) => `<small>🔒 Level ${lv}</small>`;
  const frac = (n) => ({ 2: '¼', 4: '½', 6: '¾', 8: '1' })[n] || `${n}/8`;

  // ================= MARKET =================
  function market(tab = ui.tab.market || 'sell') {
    ui.tab.market = tab;
    const day = ctx.day();
    let body = '';
    if (tab === 'sell') {
      const owned = goodIds.filter((id) => (s.goods[id] || 0) > 0);
      body += `<div class="kv"><span>Barn</span><span>${goodCount(s)} / ${BARN_LIMIT}</span></div>`;
      body += owned.length ? owned.map((id) => {
        const g = GOODS[id], h = history(s, id, day, 7), p = priceOf(s, id, day);
        const prev = Math.round(h[h.length - 2]), arrow = p > prev ? '<span class="up">▲</span>' : p < prev ? '<span class="down">▼</span>' : '＝';
        const q = Math.min(ui.sell[id] ?? 1, s.goods[id]); ui.sell[id] = Math.max(1, q);
        const qt = quote(s, id, ui.sell[id], day);
        return `<div class="row"><span class="ico">${g.icon}</span><span class="nm">${g.name} $${p} ${arrow}<small>you have ${s.goods[id]} · 7 days →</small></span>${spark(h)}
          <button class="step" data-act="sq" data-id="${id}" data-d="-1">−</button><span class="qty">${ui.sell[id]}</span><button class="step" data-act="sq" data-id="${id}" data-d="1">+</button>
          <button class="btn sm" data-act="sell" data-id="${id}">+$${qt.total}</button></div>`;
      }).join('') : '<p class="center">Nothing to sell yet. Harvest some crops!</p>';
      body += `<p class="center"><small>Selling lots at once lowers the price. Prices change every day.</small></p>`;
    } else if (tab === 'buy') {
      body += '<h3>🌱 Seeds</h3>' + cropIds.map((id) => {
        const c = CROPS[id], lock = c.unlock > s.level;
        return `<div class="row"><span class="ico">${c.icon}</span><span class="nm">${c.name} seed $${c.seed}<small>${lock ? '🔒 Level ' + c.unlock : `grows in ${c.growDays} days · you have ${s.seeds[id] || 0}`}</small></span>
          <button class="btn sm" data-act="seed" data-id="${id}" data-n="1" ${lock ? 'disabled' : ''}>1 · $${c.seed}</button>
          <button class="btn sm alt" data-act="seed" data-id="${id}" data-n="5" ${lock ? 'disabled' : ''}>5 · $${c.seed * 5}</button></div>`;
      }).join('');
      body += '<h3>🐾 Animals</h3>' + Object.entries(ANIMALS).map(([id, a]) => {
        const lock = a.unlock > s.level;
        return `<div class="row"><span class="ico">${a.icon}</span><span class="nm">${a.name} $${a.price}<small>${lock ? '🔒 Level ' + a.unlock : `${s.animals.filter((x) => x.type === id).length} owned · eats ${a.feed} 🌾/day`}</small></span>
          <button class="btn sm" data-act="animal" data-id="${id}" ${lock ? 'disabled' : ''}>Buy</button></div>`;
      }).join('');
      body += '<h3>🧰 Farm shop</h3>' + Object.entries(SHOP).map(([id, it]) => {
        const lock = it.unlock > s.level, have = it.consumable ? s.extras[id] || 0 : s.owned[id] || 0;
        const maxed = it.max && have >= it.max;
        return `<div class="row"><span class="ico">${it.icon}</span><span class="nm">${it.name} $${it.price}<small>${lock ? '🔒 Level ' + it.unlock : `${it.note} · have ${have}`}</small></span>
          <button class="btn sm" data-act="shop" data-id="${id}" ${lock || maxed ? 'disabled' : ''}>${maxed ? 'Max' : 'Buy'}</button></div>`;
      }).join('');
    } else if (tab === 'orders') {
      body += s.orders.map((o) => {
        const g = GOODS[o.item], have = s.goods[o.item] || 0;
        if (o.done) return `<div class="card order" style="opacity:.5"><div class="orderrow"><span class="ico">${o.face}</span><span class="nm">${o.who}<small>${o.skipped ? 'Declined' : 'Delivered ✔'}</small></span></div></div>`;
        if (o.type === 'crate') {
          const slots = Array.from({ length: CRATE }, (_, i) => `<span class="${i < o.need ? 'f' : ''}">${i < o.need ? g.icon : ''}</span>`).join('');
          return `<div class="card order"><div class="orderrow"><span class="ico">${o.face}</span>
            <span class="nm">${o.who} wants ${s.tier >= 2 ? frac(o.need) + ' of a crate of' : 'this much'} ${g.name}<small>${o.need} of 8 slots · you have ${have}</small></span><div class="crate">${slots}</div></div>
            <div class="btns" style="margin-top:6px"><button class="btn sm" data-act="fill" data-id="${o.id}" ${have < o.need ? 'disabled' : ''}>Deliver +$${o.reward}</button></div></div>`;
        }
        const unit = (offerUnit(o)).toFixed(1), mk = marketUnit(s, o, day);
        return `<div class="card order"><div class="orderrow"><span class="ico">${o.face}</span>
          <span class="nm">${o.who} offers $${o.reward} for ${o.need} ${g.icon} ${g.name}<small>That is $${unit} each. Market today: $${mk} each. You have ${have}.</small></span></div>
          <div class="btns" style="margin-top:6px"><button class="btn sm" data-act="fill" data-id="${o.id}" ${have < o.need ? 'disabled' : ''}>Accept</button><button class="btn sm gray" data-act="skip" data-id="${o.id}">No thanks</button></div></div>`;
      }).join('') || '<p class="center">No orders today. Come back tomorrow!</p>';
    } else if (tab === 'city') {
      body += cityHtml();
    }
    show(`<h2>🏪 Market</h2>${tabsHtml([['sell', 'Sell'], ['buy', 'Buy'], ['orders', 'Orders'], ['city', '🚚 City']], tab)}${body}<div class="msg" id="msg">${ui.msg}</div><div class="btns"><button class="btn gray" data-act="close">Close</button></div>`);
    ui.msg = '';
    card.onclick = (e) => marketClick(e, tab);
    clearInterval(live); live = tab === 'city' ? setInterval(() => market('city'), 1000) : null;
  }

  function marketClick(e, tab) {
    const t = e.target.closest('[data-tab],[data-act]');
    if (!t) return;
    if (t.dataset.tab) return market(t.dataset.tab);
    const a = t.dataset.act, id = t.dataset.id, day = ctx.day();
    if (a === 'close') return closeModal();
    if (a === 'sq') { ui.sell[id] = Math.max(1, Math.min(s.goods[id] || 1, (ui.sell[id] ?? 1) + Number(t.dataset.d))); return market(); }
    if (a === 'sell') { const r = A.sell(s, id, ui.sell[id] || 1, day); ctx.run(r, { coinsFrom: 'center' }); if (r.ok) ui.sell[id] = 1; return market(); }
    if (a === 'seed') { ctx.run(A.buySeed(s, id, Number(t.dataset.n), day)); return market(); }
    if (a === 'animal') { ctx.run(A.buyAnimal(s, id, day)); return market(); }
    if (a === 'shop') { ctx.run(A.buyShop(s, id, day)); return market(); }
    if (a === 'fill') { ctx.run(A.fillOrder(s, id, day), { coinsFrom: 'center' }); return market(); }
    if (a === 'skip') { ctx.run(A.skipOrder(s, id, day)); return market(); }
    if (a === 'ld') { const cur = ui.load[id] || 0; const total = Object.values(ui.load).reduce((x, y) => x + y, 0); const d = Number(t.dataset.d); if (d > 0 && total >= M.TRUCK_CAPACITY) return; ui.load[id] = Math.max(0, Math.min(s.goods[id] || 0, cur + d)); return market('city'); }
    if (a === 'speed') { ui.speed = Number(t.dataset.v); return market('city'); }
    if (a === 'go') {
      const day = ctx.day();
      const load = Object.fromEntries(Object.entries(ui.load).filter(([, n]) => n > 0));
      const value = Object.entries(load).reduce((sum, [g, n]) => sum + Math.round(basePrice(g, day) * 1.25) * n, 0);
      const r = M.startTrip(s, load, ui.speed, M.makeDeadline(Math.floor(day)), ctx.now(), value);
      if (r.ok) { ui.load = {}; ctx.refreshAll(); } else ui.msg = r.msg;
      return market('city');
    }
  }

  function cityHtml() {
    if (!s.owned.truck) return '<p class="center">🚚 Buy a truck in the <b>Buy</b> tab to deliver to the city. The city pays 25% more!</p>';
    const now = ctx.now();
    if (s.trip) {
      const left = Math.max(0, (s.trip.endsAt - now) / 1000), total = (s.trip.endsAt - s.trip.startedAt) / 1000;
      return `<div class="center big">🚚💨</div><p class="center">Driving at ${s.trip.v} km/h… ${left.toFixed(0)}s left</p>${gauge(total - left, total, 'g-blue')}<p class="center"><small>The customer wanted it within ${s.trip.deadlineS}s.</small></p>`;
    }
    const day = Math.floor(ctx.day()), dl = M.makeDeadline(day);
    const total = Object.values(ui.load).reduce((x, y) => x + y, 0);
    const owned = goodIds.filter((id) => (s.goods[id] || 0) > 0);
    const value = Object.entries(ui.load).reduce((sum, [g, n]) => sum + Math.round(basePrice(g, day) * 1.25) * n, 0);
    const rows = owned.map((id) => `<div class="row"><span class="ico">${GOODS[id].icon}</span><span class="nm">${GOODS[id].name} <small>city pays $${Math.round(basePrice(id, day) * 1.25)} each · have ${s.goods[id]}</small></span>
      <button class="step" data-act="ld" data-id="${id}" data-d="-1">−</button><span class="qty">${ui.load[id] || 0}</span><button class="step" data-act="ld" data-id="${id}" data-d="1">+</button></div>`).join('') || '<p class="center">Nothing to deliver.</p>';
    const speeds = M.SPEEDS.map((v) => `<button class="chip ${ui.speed === v ? 'sel' : ''}" data-act="speed" data-v="${v}">${v} km/h<br><small>${M.tripSeconds(v).toFixed(0)}s · $${M.fuelCost(v)}</small></button>`).join('');
    const late = M.tripSeconds(ui.speed) > dl;
    return `<p class="center">City is ${M.CITY_KM} km away. A big order is waiting: arrive within <b>${dl}s</b> for a 40% bonus!</p>${rows}
      <div class="kv"><span>Load</span><span>${total} / ${M.TRUCK_CAPACITY}</span></div><div class="kv"><span>Value</span><span>$${value}</span></div>
      <h3>Speed</h3><div class="btns" style="margin-top:0">${speeds}</div>
      <p class="center">${late ? '⏰ Too slow — the bonus will be missed.' : '✅ Fast enough for the bonus.'} Trip: ${M.tripSeconds(ui.speed).toFixed(0)}s, fuel $${M.fuelCost(ui.speed)}</p>
      <div class="btns"><button class="btn alt" data-act="go" ${total ? '' : 'disabled'}>Go! 🚚</button></div>`;
  }

  // ================= BARN =================
  function barn(tab = ui.tab.barn || 'well') {
    ui.tab.barn = tab;
    const day = ctx.day();
    let body = '';
    if (tab === 'well') body = wellHtml();
    else if (tab === 'power') body = powerHtml(day);
    else if (tab === 'animals') body = animalsHtml();
    else if (tab === 'land') body = landHtml();
    else if (tab === 'compost') body = compostHtml();
    else if (tab === 'money') body = moneyHtml(day);
    show(`<h2>🏠 Barn</h2>${tabsHtml([['well', '🪣 Well'], ['power', '⚡ Power'], ['animals', '🐾 Pen'], ['land', '🗺️ Land'], ['compost', '♻️'], ['money', '💰']], tab)}${body}<div class="msg" id="msg">${ui.msg}</div><div class="btns"><button class="btn gray" data-act="close">Close</button></div>`);
    ui.msg = '';
    card.onclick = (e) => barnClick(e);
    clearInterval(live); live = ['well', 'power', 'animals', 'compost'].includes(tab) ? setInterval(() => barn(tab), 1000) : null;
  }

  function wellHtml() {
    const b = M.bucketOf(s), ma = M.advantage(s), f = M.forceNeeded(s), ok = M.canLift(s);
    const cd = Math.max(0, (s.well.readyAt - ctx.now()) / 1000);
    const buckets = M.BUCKETS.map((x) => `<button class="chip ${s.well.bucket === x.id ? 'sel' : ''}" data-act="bucket" data-id="${x.id}">${x.name.split(' ')[0]}<br><small>${x.units}💧 · ${x.kg} kg</small></button>`).join('');
    return `<div class="btns" style="margin-top:0">${buckets}</div>
      <div class="row"><span class="ico">🪢</span><span class="nm">Pulleys: ${s.well.pulleys}<small>each pulley shares the load</small></span><button class="btn sm" data-act="pulley">+ $${M.PULLEY_COST}</button></div>
      <div class="row"><span class="ico">⚙️</span><span class="nm">Gears: ${s.well.gears}<small>gears trade speed for strength</small></span><button class="btn sm" data-act="gear">+ $${M.GEAR_COST}</button><button class="btn sm gray" data-act="rig0">Reset</button></div>
      <div class="kv"><span>Bucket weight</span><b>${b.kg} kg</b></div>
      <div class="kv"><span>Mechanical advantage</span><b>× ${ma}</b></div>
      <div class="kv"><span>You pull with</span><b class="${ok ? 'up' : 'down'}">${f.toFixed(0)} kg of your ${M.STRENGTH} kg</b></div>
      ${gauge(f, Math.max(M.STRENGTH * 2, f), ok ? 'g-green' : 'g-red', M.STRENGTH)}
      <div class="kv"><span>Rope you pull per 1 m lifted</span><b>${ma} m</b></div>
      <div class="kv"><span>Lift time</span><b>${M.liftSeconds(s)} s</b></div>
      <div class="kv"><span>Water tank</span><b>${Math.round(s.tank)} / ${TANK_MAX}</b></div>${gauge(s.tank, TANK_MAX, 'g-blue')}
      <div class="btns"><button class="btn alt" data-act="draw" ${cd > 0 ? 'disabled' : ''}>${cd > 0 ? `Rope returning ${cd.toFixed(0)}s` : `Draw ${b.units} 💧`}</button></div>`;
  }

  function powerHtml(day) {
    const sp = supply(s, day), dem = demand(s), cap = s.owned.battery * BATTERY_WH;
    const nx = weatherOf(Math.floor(day) + 1);
    const total = sp.wind + sp.solar;
    const none = !s.owned.windmill && !s.owned.solar && !s.owned.pump;
    return `${none ? '<p class="center">Buy windmills ☀️ solar panels, a battery and an auto-pump in <b>Market › Buy</b> (level 6).</p>' : ''}
      <div class="kv"><span>🌬️ Windmills ×${s.owned.windmill} · wind ${sp.windSpeed.toFixed(1)}</span><b>${sp.wind.toFixed(0)} W</b></div>${gauge(sp.wind, 240, 'g-blue')}
      <div class="kv"><span>☀️ Solar ×${s.owned.solar}</span><b>${sp.solar.toFixed(0)} W</b></div>${gauge(sp.solar, 120, 'g-gold')}
      <div class="kv"><span>⚙️ Auto-pump needs</span><b>${dem} W</b></div>${gauge(Math.min(total, dem), Math.max(dem, 1), total >= dem ? 'g-green' : 'g-red')}
      <div class="kv"><span>🔋 Battery ×${s.owned.battery}</span><b>${s.battery.toFixed(0)} / ${cap} Wh</b></div>${gauge(s.battery, Math.max(cap, 1), 'g-green')}
      <div class="kv"><span>Pump running</span><b>${Math.round((s.pumpRun || 0) * 100)}%</b></div>
      <div class="kv"><span>💧 Tank</span><b>${Math.round(s.tank)} / ${TANK_MAX}</b></div>
      <div class="kv"><span>Tomorrow</span><b>${WEATHER_ICON[nx.kind]} ${nx.kind}, wind ${nx.wind.toFixed(1)}</b></div>
      <p class="center"><small>Double the wind speed and a windmill makes 8× the power!</small></p>`;
  }

  function animalsHtml() {
    const need = s.animals.filter((a) => a.fed < 0.5).reduce((n, a) => n + ANIMALS[a.type].feed, 0);
    ui.pick = ui.pick.filter((id) => s.animals.some((a) => a.id === id));
    const cards = s.animals.map((a) => {
      const def = ANIMALS[a.type], gold = phenotype(a) === 'H', baby = a.age < 1;
      const genes = s.tier >= 2 ? ` · genes ${a.genes.join(' ')}` : '';
      return `<div class="anim ${ui.pick.includes(a.id) ? 'sel' : ''}" data-act="pick" data-id="${a.id}"><span class="ico">${def.icon}${gold ? '✨' : ''}</span>
        <span class="nm" style="flex:1">${gold ? def.trait : 'Plain'} ${def.name} #${a.id}${baby ? ' (baby)' : ''}<small>${baby ? 'growing up…' : `hunger ${a.fed < 0.15 ? 'hungry!' : 'ok'}${genes}`}${a.parents ? ` · child of #${a.parents.join(' & #')}` : ''}</small>${gauge(a.fed, 1, 'g-gold')}</span>
        ${a.ready > 0 ? `<button class="btn sm" data-act="collect" data-id="${a.id}">Collect ${a.ready}</button>` : ''}
        <button class="btn sm gray" data-act="sellanimal" data-id="${a.id}">Sell</button></div>`;
    }).join('') || '<p class="center">No animals yet. Buy a chicken in Market › Buy (level 4).</p>';
    let info = '';
    const [a, b] = ui.pick.map((id) => s.animals.find((x) => x.id === id));
    if (s.tier === 1) info = '<p class="center"><small>Golden animals give more. Traits run in families — try breeding two golden ones!</small></p>';
    else if (a && b && s.tier === 3) { const o = offspringOdds(a, b); info = `<p class="center">Chance of a golden baby: <b>${Math.round(o.high * 100)}%</b></p>`; }
    else info = '<p class="center"><small>H = golden gene (strong). h = plain gene. One H is enough to be golden!</small></p>';
    return `<div class="btns" style="margin-top:0"><button class="btn" data-act="feed">Feed all (${need} 🌾)</button><button class="btn alt" data-act="breed" ${ui.pick.length === 2 ? '' : 'disabled'}>Breed 💕</button></div>
      <div class="kv"><span>Pen</span><span>${s.animals.length} / ${PEN_LIMIT}</span></div>${cards}${info}<p class="center"><small>Tap two animals of the same kind, then Breed.</small></p>`;
  }

  function landHtml() {
    const { cols, rows } = s.land;
    const opts = [[1, 0, '+1 column'], [0, 1, '+1 row'], [1, 1, '+1 column & row']].map(([dc, dr, label]) => {
      const o = A.landOffer(s, dc, dr);
      return `<div class="row"><span class="nm">${label}${o ? `<small>${o.tiles} tiles × $${A.TILE_COST} + ${o.fence} m fence × $${A.FENCE_COST}</small>` : '<small>biggest size</small>'}</span>${o ? `<button class="btn sm" data-act="land" data-dc="${dc}" data-dr="${dr}">$${o.cost}</button>` : ''}</div>`;
    }).join('');
    const grid = Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => `<div class="cell ${i % MAX_COLS < cols && Math.floor(i / MAX_COLS) < rows ? 'own' : ''}"></div>`).join('');
    return `<div class="grid" style="grid-template-columns:repeat(${MAX_COLS},30px)">${grid}</div>
      <div class="kv"><span>Field</span><b>${cols} × ${rows}</b></div><div class="kv"><span>Area</span><b>${A.area(cols, rows)} tiles</b></div><div class="kv"><span>Fence around it</span><b>${A.perimeter(cols, rows)} m</b></div>${opts}`;
  }

  function compostHtml() {
    const now = ctx.now();
    const owned = goodIds.filter((id) => (s.goods[id] || 0) >= 3);
    const bins = s.compost.brewing.map((t) => `<div class="kv"><span>♻️ Rotting…</span><span>${Math.max(0, (t - now) / 1000).toFixed(0)}s</span></div>`).join('');
    return `<p class="center">Put <b>3</b> of the same item in the bin. Tiny helpers rot it into nitrogen-rich compost in a day. 🌱</p>
      <div class="kv"><span>Compost ready</span><b>${s.extras.compost}</b></div>${bins}
      ${owned.map((id) => `<div class="row"><span class="ico">${GOODS[id].icon}</span><span class="nm">${GOODS[id].name} <small>have ${s.goods[id]}</small></span><button class="btn sm" data-act="brew" data-id="${id}">Brew</button></div>`).join('') || '<p class="center"><small>You need 3 of one item.</small></p>'}
      <p class="center"><small>Use compost with the 🔍 Soil tool on a tile.</small></p>`;
  }

  function moneyHtml(day) {
    const d = Math.floor(day);
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const k = d - i, l = s.ledger[k] || { in: 0, out: 0 }, p = l.in - l.out;
      rows.push(`<div class="kv"><span>Day ${k + 1}</span><span>in $${l.in} · out $${l.out} · <b class="${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '+' : '−'}$${Math.abs(p)}</b></span></div>${gauge(l.in, Math.max(l.in, l.out, 1), 'g-green')}${gauge(l.out, Math.max(l.in, l.out, 1), 'g-red')}`);
    }
    return `<div class="kv"><span>Coins now</span><b>$${s.coins}</b></div><p><small>Profit = money in − money out.</small></p>${rows.join('')}`;
  }

  function barnClick(e) {
    const t = e.target.closest('[data-tab],[data-act]');
    if (!t) return;
    if (t.dataset.tab) return barn(t.dataset.tab);
    const a = t.dataset.act, id = t.dataset.id, day = ctx.day();
    if (a === 'close') return closeModal();
    if (a === 'bucket') { A.setBucket(s, Number(id)); return barn(); }
    if (a === 'pulley') { ctx.run(A.buyPulley(s, day)); return barn(); }
    if (a === 'gear') { ctx.run(A.buyGear(s, day)); return barn(); }
    if (a === 'rig0') { A.resetRig(s); return barn(); }
    if (a === 'draw') { ctx.run(A.draw(s, ctx.now())); return barn(); }
    if (a === 'feed') { ctx.run(A.feedAnimals(s)); return barn(); }
    if (a === 'collect') { ctx.run(A.collectProduct(s, Number(id))); return barn(); }
    if (a === 'sellanimal') { ctx.run(A.sellAnimal(s, Number(id), day), { coinsFrom: 'center' }); return barn(); }
    if (a === 'pick') { const n = Number(id); ui.pick = ui.pick.includes(n) ? ui.pick.filter((x) => x !== n) : [...ui.pick, n].slice(-2); return barn(); }
    if (a === 'breed') { const r = A.breedPair(s, ui.pick[0], ui.pick[1]); ctx.run(r); if (r.ok) ui.pick = []; return barn(); }
    if (a === 'land') { ctx.run(A.buyLand(s, Number(t.dataset.dc), Number(t.dataset.dr), day)); return barn(); }
    if (a === 'brew') { ctx.run(A.brewCompost(s, id, ctx.now())); return barn(); }
  }

  // ================= SOIL INSPECTOR =================
  function soilInfo(gx, gy) {
    const k = `${gx},${gy}`, so = s.soil[k] || { n: 60, w: 30 }, p = s.plots[k];
    const day = ctx.day();
    let info = '<p class="center">Empty soil. Plant something!</p>';
    if (p) {
      const f = import_growth(k, day);
      const name = { season: 'Season', water: 'Water', nitrogen: 'Nitrogen', sun: 'Sunlight', pest: 'Pests' };
      const worst = Object.entries(f).sort((a, b) => a[1] - b[1])[0];
      const rows = Object.entries(f).map(([id, v]) => `<div class="kv"><span>${name[id]}</span><b class="${v >= 0.9 ? 'up' : v >= 0.5 ? '' : 'down'}">${v >= 0.99 ? 'great' : v >= 0.7 ? 'good' : v >= 0.4 ? 'low' : 'very low'}</b></div>${gauge(v, 1, v >= 0.7 ? 'g-green' : v >= 0.4 ? 'g-gold' : 'g-red')}`).join('');
      info = `<div class="kv"><span>${CROPS[p.crop].icon} ${CROPS[p.crop].name}</span><b>${Math.round((p.growth / CROPS[p.crop].growDays) * 100)}% grown</b></div>${rows}
        <p class="center">${worst[1] < 0.7 ? `Slowed by: <b>${name[worst[0]].toLowerCase()}</b>` : 'Growing well!'}</p>`;
    }
    show(`<h2>🔍 Soil (${gx + 1}, ${gy + 1})</h2><div class="kv"><span>💧 Water</span><b>${Math.round(so.w)}%</b></div>${gauge(so.w, 100, 'g-blue')}
      <div class="kv"><span>🟡 Nitrogen</span><b>${Math.round(so.n)}%</b></div>${gauge(so.n, 100, so.n < 25 ? 'g-red' : 'g-gold')}${info}
      <div class="btns"><button class="btn sm" data-act="fert">🧪 Fertilizer ×${s.extras.fertilizer}</button><button class="btn sm" data-act="comp">♻️ Compost ×${s.extras.compost}</button>
      ${p && p.pest ? `<button class="btn sm" data-act="lady">🐞 Ladybugs ×${s.extras.ladybugs}</button><button class="btn sm red" data-act="spray">Spray</button>` : ''}</div>
      <div class="msg" id="msg">${ui.msg}</div><div class="btns"><button class="btn gray" data-act="close">Close</button></div>`);
    ui.msg = '';
    card.onclick = (e) => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      const a = t.dataset.act;
      if (a === 'close') return closeModal();
      let r;
      if (a === 'fert') r = A.applyFertilizer(s, gx, gy, day);
      if (a === 'comp') r = A.applyCompost(s, gx, gy);
      if (a === 'lady') r = A.ladybugs(s, gx, gy);
      if (a === 'spray') { r = A.spray(s, gx, gy); if (r.ok && r.hurtBees) ui.msg = 'The spray scared the bees away for 2 days 🐝'; }
      ctx.run(r); soilInfo(gx, gy);
    };
  }
  const import_growth = (k, day) => ctx.growth(k, day);

  // ================= MENU / BOOK / PARENT =================
  function menu() {
    show(`<h2>☰ Menu</h2><div class="btns" style="flex-direction:column">
      <button class="btn" data-act="book">📖 Sticker book</button>
      <button class="btn" data-act="neighbor">🧑‍🌾 Neighbour Mia</button>
      <button class="btn alt" data-act="parent">👪 Parent area</button>
      <button class="btn gray" data-act="close">Close</button></div>`);
    card.onclick = (e) => {
      const a = e.target.dataset.act;
      if (a === 'close') closeModal();
      if (a === 'book') book();
      if (a === 'parent') parentGate();
      if (a === 'neighbor') neighbor();
    };
  }
  function book() {
    show(`<h2>📖 Sticker book</h2><div class="grid" style="grid-template-columns:repeat(4,70px)">${STICKERS.map((id) => {
      const g = GOODS[id], got = s.stickers.includes(id);
      return `<div class="center" style="border:2px solid var(--tan2);border-radius:10px;padding:6px;background:${got ? '#fff' : '#ddd'}"><div class="ico">${got ? g.icon : '❔'}</div><small>${got ? g.name : '???'}</small></div>`;
    }).join('')}</div><p class="center"><small>${s.stickers.length} / ${STICKERS.length} collected. Harvest or collect each product once!</small></p>
      <div class="btns"><button class="btn gray" data-act="back">Back</button></div>`);
    card.onclick = (e) => { if (e.target.dataset.act === 'back') menu(); };
  }
  // trade offers rotate daily: compare the ratios
  function neighbor() {
    const d = Math.floor(ctx.day());
    const offers = ctx.trades(d);
    show(`<h2>🧑‍🌾 Neighbour Mia</h2><p class="center">Mia likes to swap! Is the swap fair for you?</p>${offers.map((o, i) => `<div class="card order"><div class="orderrow"><span class="nm">Give ${o.giveN} ${GOODS[o.give].icon} get ${o.getN} ${GOODS[o.get].icon}<small>You have ${s.goods[o.give] || 0}</small></span>
      <button class="btn sm" data-act="trade" data-i="${i}" ${o.done || (s.goods[o.give] || 0) < o.giveN ? 'disabled' : ''}>${o.done ? 'Done' : 'Swap'}</button></div></div>`).join('')}
      <div class="msg" id="msg">${ui.msg}</div><div class="btns"><button class="btn gray" data-act="back">Back</button></div>`);
    ui.msg = '';
    card.onclick = (e) => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      if (t.dataset.act === 'back') return menu();
      if (t.dataset.act === 'trade') { ctx.run(ctx.doTrade(d, Number(t.dataset.i))); neighbor(); }
    };
  }
  function parentGate() {
    let n = 0;
    show(`<h2>👪 Parent area</h2><p class="center">Hold the button for 2 seconds.</p><div class="btns"><button class="btn alt" id="hold">Hold…</button><button class="btn gray" data-act="back">Back</button></div>`);
    let tmr;
    const hold = $('hold');
    const start = () => { tmr = setTimeout(parent, 2000); };
    const stop = () => clearTimeout(tmr);
    hold.addEventListener('pointerdown', start); hold.addEventListener('pointerup', stop); hold.addEventListener('pointerleave', stop);
    card.onclick = (e) => { if (e.target.dataset.act === 'back') menu(); };
  }
  function parent() {
    const rows = Object.entries(SKILLS).map(([id, label]) => {
      const sc = score(s, id), n = (s.evidence[id] || []).length;
      return `<div class="kv"><span>${label}</span><b>${sc == null ? '…' : Math.round(sc * 100) + '%'}</b></div>${gauge(sc ?? 0, 1, sc == null ? 'g-gray' : sc >= 0.7 ? 'g-green' : sc >= 0.4 ? 'g-gold' : 'g-red')}<small>${n} recent decisions</small>`;
    }).join('');
    show(`<h2>👪 Parent area</h2><p><small>The game never quizzes. These bars show how often your child picked the better option in play (last 10 decisions per skill).</small></p>
      <h3>Level of challenge</h3><div class="btns" style="margin-top:0">${[[1, '9–10'], [2, '11–12'], [3, '13–14']].map(([t, l]) => `<button class="chip ${s.tier === t ? 'sel' : ''}" data-act="tier" data-t="${t}">${l}</button>`).join('')}</div>
      <h3>Skills</h3>${rows}<div class="btns"><button class="btn sm" data-act="export">Export data</button><button class="btn sm red" data-act="reset">Reset game</button><button class="btn gray" data-act="back">Back</button></div><div class="msg" id="msg"></div>`);
    card.onclick = (e) => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      const a = t.dataset.act;
      if (a === 'back') return menu();
      if (a === 'tier') { s.tier = Number(t.dataset.t); ctx.refreshAll(); return parent(); }
      if (a === 'export') { const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = 'happy-farm-save.json'; l.click(); return; }
      if (a === 'reset') { if (t.dataset.sure) return ctx.reset(); t.dataset.sure = 1; t.textContent = 'Tap again to erase everything'; }
    };
  }

  // ================= generic cards =================
  function info(html, btn = 'OK', cb) {
    show(`${html}<div class="btns"><button class="btn" data-act="ok">${btn}</button></div>`);
    card.onclick = (e) => { if (e.target.dataset.act === 'ok') { closeModal(); cb && cb(); } };
  }
  function agePicker(done) {
    show(`<h2>🌾 Welcome to Happy Farm!</h2><p class="center">Grow crops, raise animals and run your own farm.<br>How old are you?</p>
      <div class="btns">${[[1, '9–10'], [2, '11–12'], [3, '13–14']].map(([t, l]) => `<button class="btn" data-t="${t}">${l}</button>`).join('')}</div>`);
    card.onclick = (e) => { const t = e.target.dataset.t; if (t) { s.tier = Number(t); closeModal(); done(); } };
  }

  return { market, barn, soilInfo, menu, info, agePicker, closeModal, isOpen: () => !modal.classList.contains('hidden') };
}
