import { sfx } from './sound.js';

// The dining room: a tile grid the child designs. Tables give seats (more customers per
// shift), decorations add ambiance (bigger tips) and new tiles cost $10 each (area = cols × rows).
export const MAX_COLS = 5;
export const MAX_ROWS = 4;
export const TILE_PRICE = 10;
const MAX_CUSTOMERS = 8;

export const ROOM_ITEMS = [
  { id: 'table2', name: 'Table for 2', seats: 2, price: 12, blurb: '2 seats' },
  { id: 'table4', name: 'Table for 4', seats: 4, price: 24, blurb: '4 seats' },
  { id: 'flowers', name: 'Flowers', emoji: '💐', amb: 1, price: 5, blurb: '+1 cozy' },
  { id: 'plant', name: 'Plant', emoji: '🪴', amb: 1, price: 7, blurb: '+1 cozy' },
  { id: 'lamp', name: 'Lamp', emoji: '🏮', amb: 1, price: 9, blurb: '+1 cozy' },
  { id: 'tank', name: 'Fish tank', emoji: '🐠', amb: 3, price: 20, blurb: '+3 cozy' },
];
const byId = Object.fromEntries(ROOM_ITEMS.map((i) => [i.id, i]));

export const newRoom = () => ({ cols: 3, rows: 2, cells: { '1,0': 'table2' }, stock: {} });

export function roomStats(room) {
  let seats = 0;
  let amb = 0;
  const tables = [];
  for (const [key, id] of Object.entries(room.cells)) {
    const it = byId[id];
    if (it.seats) { seats += it.seats; tables.push(key); }
    if (it.amb) amb += it.amb;
  }
  return {
    seats,
    amb,
    tables,
    customers: Math.min(MAX_CUSTOMERS, 2 + Math.floor(seats / 2)),
    tip: Math.min(3, Math.floor(amb / 2)),
  };
}

/** Grid markup. opts: { editable, showLocked, sitAt, face, happy, sel } */
export function gridHtml(room, opts = {}) {
  const cols = opts.showLocked ? MAX_COLS : room.cols;
  const rows = opts.showLocked ? MAX_ROWS : room.rows;
  let cells = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${c},${r}`;
      const open = c < room.cols && r < room.rows;
      const id = room.cells[key];
      const it = id && byId[id];
      let inner = '';
      if (it && it.seats) {
        const chairs = it.seats === 2 ? '<i class="chair l"></i><i class="chair r"></i>' : '<i class="chair l"></i><i class="chair r"></i><i class="chair t"></i><i class="chair b"></i>';
        inner = `<span class="tbl ${it.seats === 4 ? 't4' : 't2'}">${chairs}<b class="top"></b></span>`;
        if (opts.sitAt === key) inner += `<span class="sitter ${opts.happy ? 'happy' : ''}">${opts.face}</span>`;
      } else if (it) {
        inner = `<span class="decor">${it.emoji}</span>`;
      } else if (!open) {
        inner = '<span class="lock">🔒</span>';
      }
      const act = opts.editable ? `data-act="room-cell" data-v="${key}"` : '';
      cells += `<div class="rcell ${open ? '' : 'locked'} ${it ? 'has' : ''}" ${act}>${inner}</div>`;
    }
  }
  return `<div class="rgrid" style="--cols:${cols};--rows:${rows}">${cells}</div>`;
}

export function createRoomDesigner({ S, save, $app, topbar, fmt, shake, onClose }) {
  let sel = null;
  let msg = '';

  const stockOf = (id) => S.room.stock[id] || 0;

  function render() {
    const room = S.room;
    const st = roomStats(room);
    const palette = ROOM_ITEMS.map((it) => {
      const icon = it.seats ? `<span class="tbl ${it.seats === 4 ? 't4' : 't2'} mini"><i class="chair l"></i><i class="chair r"></i>${it.seats === 4 ? '<i class="chair t"></i><i class="chair b"></i>' : ''}<b class="top"></b></span>` : `<span class="pe">${it.emoji}</span>`;
      return `<div class="pitem ${sel === it.id ? 'sel' : ''}" data-act="room-pick" data-v="${it.id}">${icon}<b>${it.name}</b><small>${it.blurb} · have ${stockOf(it.id)}</small><button class="btn sm ${S.money >= it.price ? '' : 'dim'}" data-act="room-buy" data-v="${it.id}">Buy ${fmt(it.price)}</button></div>`;
    }).join('');
    const colCost = room.rows * TILE_PRICE;
    const rowCost = room.cols * TILE_PRICE;
    const colBtn = room.cols < MAX_COLS ? `<button class="btn sm alt" data-act="room-expand" data-v="col">➡️ Column<br><small>${room.rows} tiles × $${TILE_PRICE} = ${fmt(colCost)}</small></button>` : '<span class="maxed">Max width</span>';
    const rowBtn = room.rows < MAX_ROWS ? `<button class="btn sm alt" data-act="room-expand" data-v="row">⬇️ Row<br><small>${room.cols} tiles × $${TILE_PRICE} = ${fmt(rowCost)}</small></button>` : '<span class="maxed">Max length</span>';
    $app.innerHTML = `
<section class="screen designer">
  ${topbar('Design your café')}
  <div class="rstats"><span>📐 ${room.cols} × ${room.rows} = <b>${room.cols * room.rows}</b> tiles</span><span>🪑 <b>${st.seats}</b> seats</span><span>✨ <b>${st.amb}</b> cozy</span></div>
  <div class="rresult">👥 <b>${st.customers}</b> customers per shift · 💝 tip <b>+${fmt(st.tip)}</b></div>
  <div class="card designgrid">${gridHtml(room, { editable: true, showLocked: true })}</div>
  ${msg ? `<div class="toast">${msg}</div>` : `<small class="cap">${sel ? `Placing: ${byId[sel].name} — tap an empty tile` : 'Pick an item, then tap a tile. Tap a placed item to pick it up.'}</small>`}
  <div class="expandrow">${colBtn}${rowBtn}</div>
  <div class="palette">${palette}</div>
  <button class="btn big" data-act="room-close">Done ✔</button>
</section>`;
  }

  const acts = {
    'room-open': () => { sel = null; msg = ''; render(); },
    'room-pick': (id) => { sel = sel === id ? null : id; msg = ''; sfx.tap(); render(); },
    'room-buy': (id) => {
      const it = byId[id];
      if (S.money < it.price) { sfx.bad(); msg = `Not enough yet — you need ${fmt(it.price - S.money)} more.`; render(); shake('.palette'); return; }
      S.money -= it.price;
      S.room.stock[id] = stockOf(id) + 1;
      sel = id;
      msg = `Bought ${it.name}! Wallet: ${fmt(S.money)}`;
      save();
      sfx.coin();
      render();
    },
    'room-cell': (key) => {
      const room = S.room;
      const [c, r] = key.split(',').map(Number);
      msg = '';
      if (c >= room.cols || r >= room.rows) { sfx.bad(); msg = 'Expand the room to use this tile.'; render(); return; }
      const have = room.cells[key];
      if (have) {
        delete room.cells[key];
        room.stock[have] = stockOf(have) + 1;
        sel = have;
        sfx.pop();
      } else if (sel && stockOf(sel) > 0) {
        room.cells[key] = sel;
        room.stock[sel] = stockOf(sel) - 1;
        sfx.add();
        if (stockOf(sel) === 0) sel = null;
      } else {
        sfx.bad();
        msg = sel ? `You have no ${byId[sel].name} left — buy one!` : 'Pick an item first.';
      }
      save();
      render();
    },
    'room-expand': (dir) => {
      const room = S.room;
      const cost = (dir === 'col' ? room.rows : room.cols) * TILE_PRICE;
      if ((dir === 'col' && room.cols >= MAX_COLS) || (dir === 'row' && room.rows >= MAX_ROWS)) return;
      if (S.money < cost) { sfx.bad(); msg = `Not enough yet — you need ${fmt(cost - S.money)} more.`; render(); shake('.expandrow'); return; }
      S.money -= cost;
      if (dir === 'col') room.cols += 1;
      else room.rows += 1;
      msg = `Room expanded to ${room.cols} × ${room.rows} = ${room.cols * room.rows} tiles!`;
      save();
      sfx.ok();
      render();
    },
    'room-close': () => {
      if (roomStats(S.room).tables.length === 0) { sfx.bad(); msg = 'Place at least one table so customers can sit!'; render(); shake('.designgrid'); return; }
      save();
      onClose();
    },
  };
  return { acts, render };
}
