import { Application, Container, Graphics, Polygon, Text, Rectangle } from 'pixi.js';
import { MAX_COLS, MAX_ROWS } from '../core/state.js';
import { dayOf, hourOf, seasonIndex } from '../core/clock.js';
import { weatherOf, daylight } from '../sim/weather.js';
import { key, isRipe, progress } from '../sim/farm.js';
import { ANIMALS } from '../data/items.js';
import { phenotype } from '../sim/breeding.js';
import { supply } from '../sim/power.js';
import { createWorld } from './world.js';
import { SEASON_SKY, TW, TH, toScreen, drawTile, drawCrop, drawChicken, drawCow, drawBarn, drawBoard, drawWell, drawMill, drawSolar, drawHive, drawBin, drawTruck } from './art.js';

export const PEN_X0 = MAX_COLS;           // pen tiles are gx 7..8
export const PEN_COLS = 2;

export async function createScene(state, hooks) {
  const app = new Application();
  await app.init({ resizeTo: window, background: SEASON_SKY[0], antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
  document.body.prepend(app.canvas);

  const world = new Container();
  const field = new Container();
  field.sortableChildren = true;
  world.addChild(field);
  app.stage.addChild(world);

  const sky = new Graphics();           // night tint (screen space)
  const rain = new Graphics();
  app.stage.addChild(sky, rain);
  const wd = createWorld(world, field, app);

  // ---------- camera ----------
  const cam = { s: 0.7, x: 0, y: 0 };
  const applyCam = () => { world.scale.set(cam.s); world.position.set(cam.x, cam.y); };
  function centerOn(gx, gy, s) {
    const p = toScreen(gx, gy);
    cam.s = s;
    cam.x = app.screen.width / 2 - p.x * s;
    cam.y = (app.screen.height - 90) / 2 - p.y * s + 10;
    applyCam();
  }
  const fitScale = () => Math.max(0.55, Math.min(1.1, app.screen.width / 560));
  centerOn(2.5, 1.5, fitScale());
  app.renderer.on('resize', () => centerOn(2.5, 1.5, fitScale()));

  let dragged = false;
  const pts = new Map();
  let pinch0 = 0;
  const cv = app.canvas;
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }); dragged = false; pinch0 = 0; });
  cv.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      p.x = e.clientX; p.y = e.clientY;
      const d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d1 / d0);
      pinch0 = d1; dragged = true;
      return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) dragged = true;
    if (dragged) { cam.x += dx; cam.y += dy; applyCam(); }
    p.x = e.clientX; p.y = e.clientY;
  });
  const up = (e) => { pts.delete(e.pointerId); setTimeout(() => { if (!pts.size) dragged = false; }, 30); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function zoomAt(cx, cy, f) {
    const ns = Math.max(0.4, Math.min(2.2, cam.s * f));
    const k = ns / cam.s;
    cam.x = cx - (cx - cam.x) * k; cam.y = cy - (cy - cam.y) * k; cam.s = ns; applyCam();
  }
  cv.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 0.9); }, { passive: false });
  const tap = (fn) => () => { if (!dragged) fn(); };

  // ---------- tiles ----------
  const tiles = new Map();
  for (let gx = 0; gx < MAX_COLS; gx++) for (let gy = 0; gy < MAX_ROWS; gy++) {
    const c = new Container();
    const g = new Graphics();
    const bars = new Graphics();
    c.addChild(g, bars);
    const p = toScreen(gx + 0.5, gy + 0.5);
    c.position.set(p.x, p.y); c.zIndex = gx + gy;
    c.eventMode = 'static'; c.cursor = 'pointer';
    c.hitArea = new Polygon([0, -TH / 2, TW / 2, 0, 0, TH / 2, -TW / 2, 0]);
    c.on('pointertap', tap(() => hooks.onTile(gx, gy)));
    field.addChild(c);
    tiles.set(key(gx, gy), { c, g, bars, kind: '' });
  }
  const decos = [];
  const deco = (kind, gx, gy) => {
    const g = new Graphics(); drawTile(g, kind, gx + gy);
    const p = toScreen(gx + 0.5, gy + 0.5);
    g.position.set(p.x, p.y); g.zIndex = gx + gy - 0.5; field.addChild(g);
    decos.push([g, kind, gx + gy]);
  };
  for (let gx = PEN_X0; gx < PEN_X0 + PEN_COLS; gx++) for (let gy = 0; gy < MAX_ROWS; gy++) deco('pen', gx, gy);
  for (let gx = 0; gx < PEN_X0 + PEN_COLS; gx++) deco('grass', gx, -1);

  let soilView = false;
  function refreshTiles() {
    wd.setFence(state.land.cols, state.land.rows);
    for (const [k, t] of tiles) {
      const [gx, gy] = k.split(',').map(Number);
      const open = gx < state.land.cols && gy < state.land.rows;
      const so = state.soil[k];
      const kind = !open ? 'locked' : !so ? 'soil' : so.w < 25 ? 'dry' : so.w > 60 ? 'wet' : 'soil';
      if (kind !== t.kind) { t.kind = kind; drawTile(t.g, kind, gx + gy); }
      t.bars.clear();
      if (open && soilView) {
        const w = so ? so.w : 30, n = so ? so.n : 60;
        t.bars.rect(-22, -8, 44, 5).fill(0x00000055).rect(-22, -8, 44 * w / 100, 5).fill(0x3aa0ff);
        t.bars.rect(-22, -1, 44, 5).fill(0x00000055).rect(-22, -1, 44 * n / 100, 5).fill(n < 25 ? 0xe53935 : 0xe0b020);
      }
      if (!open && (gx === state.land.cols || gy === state.land.rows) && gx <= state.land.cols && gy <= state.land.rows) {
        // edge of the unlocked area hints that land can be bought
        t.bars.poly([0, -TH / 2 + 4, TW / 2 - 8, 0, 0, TH / 2 - 4, -TW / 2 + 8, 0]).stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
      }
    }
  }

  // ---------- crops ----------
  const crops = new Map();
  function syncPlots() {
    for (const k of Object.keys(state.plots)) {
      let e = crops.get(k);
      const p = state.plots[k];
      if (!e || e.crop !== p.crop) {
        if (e) e.c.destroy({ children: true });
        const [gx, gy] = k.split(',').map(Number);
        const c = new Container();
        const glow = new Graphics(); glow.ellipse(0, 4, 24, 12).fill({ color: 0xfff176, alpha: 0.7 }); glow.visible = false;
        const g = new Graphics();
        const bug = new Text({ text: '🐛', style: { fontSize: 22 } }); bug.anchor.set(0.5); bug.position.set(10, -22); bug.visible = false;
        c.addChild(glow, g, bug);
        const pos = toScreen(gx + 0.5, gy + 0.5);
        c.position.set(pos.x, pos.y); c.zIndex = gx + gy + 0.5;
        field.addChild(c);
        e = { c, g, glow, bug, crop: p.crop, stage: -1, gx, gy };
        crops.set(k, e);
      }
      const pr = progress(state, k);
      const stage = pr >= 1 ? 3 : Math.floor(pr * 3);
      if (stage !== e.stage) { e.stage = stage; drawCrop(e.g, p.crop, pr); }
      e.glow.visible = stage === 3;
      e.bug.visible = !!p.pest;
    }
    for (const [k, e] of crops) if (!state.plots[k]) { e.c.destroy({ children: true }); crops.delete(k); }
  }

  // ---------- scenery ----------
  const scenery = new Map();
  const P = (gx, gy = -0.5) => toScreen(gx + 0.5, gy + 0.5);
  function obj(id, draw, gx, gy, onTap, z = 0.3, hit = [-45, -92, 90, 108]) {
    let e = scenery.get(id);
    if (e) return e;
    const c = new Container();
    const g = new Graphics();
    draw(g);
    const sh = new Graphics(); sh.ellipse(0, 8, 44, 14).fill({ color: 0x000000, alpha: 0.16 });
    c.addChild(sh, g);
    const p = P(gx, gy);
    c.position.set(p.x, p.y + 4); c.zIndex = gx + gy + z + 1;
    if (onTap) { c.eventMode = 'static'; c.cursor = 'pointer'; c.hitArea = new Rectangle(...hit); c.on('pointertap', tap(onTap)); }
    field.addChild(c);
    e = { c, g };
    scenery.set(id, e);
    return e;
  }
  function syncScenery() {
    obj('barn', drawBarn, 0, -1, () => hooks.onObject('market'), 0.3, [-62, -125, 124, 150]);
    obj('board', drawBoard, 1.7, -1, () => hooks.onObject('orders'));
    obj('well', drawWell, 3.0, -1, () => hooks.onObject('well'), 0.3, [-42, -85, 84, 100]);
    obj('bin', drawBin, 7.9, -1, () => hooks.onObject('compost'));
    for (let i = 0; i < state.owned.windmill; i++) obj('mill' + i, (g) => drawMill(g, 0), 4.3 + i * 0.9, -1, () => hooks.onObject('power'), 0.3, [-42, -112, 84, 124]);
    for (let i = 0; i < state.owned.solar; i++) obj('solar' + i, drawSolar, 6.2 + i * 0.8, -1, () => hooks.onObject('power'));
    for (let i = 0; i < state.owned.hive; i++) obj('hive' + i, drawHive, 8.8 + i * 0.7, -1, () => hooks.onObject('hive'));
    if (state.owned.truck) obj('truck', drawTruck, -1.2, 1.5, () => hooks.onObject('city'));
    const t = scenery.get('truck');
    if (t) t.c.visible = !state.trip;
  }

  // ---------- animals ----------
  const animals = new Map();
  function syncAnimals() {
    const ids = new Set(state.animals.map((a) => a.id));
    for (const a of state.animals) {
      let v = animals.get(a.id);
      if (!v) {
        const c = new Container();
        const g = new Graphics();
        const bub = new Text({ text: '', style: { fontSize: 22 } }); bub.anchor.set(0.5); bub.position.set(0, -52);
        c.addChild(g, bub);
        c.eventMode = 'static'; c.cursor = 'pointer';
        c.hitArea = new Rectangle(-40, -80, 90, 90);
        c.on('pointertap', tap(() => hooks.onAnimal(a.id)));
        field.addChild(c);
        v = { c, g, bub, id: a.id, gx: PEN_X0 + 0.3 + Math.random() * 1.4, gy: 0.5 + Math.random() * (MAX_ROWS - 1), tx: 0, ty: 0, wait: 0, look: '', dir: 1, size: 1 };
        v.tx = v.gx; v.ty = v.gy;
        animals.set(a.id, v);
      }
      const baby = a.age < 1;
      const look = `${a.type}${phenotype(a)}${baby}`;
      if (look !== v.look) {
        v.look = look;
        v.size = a.type === 'cow' && baby ? 0.65 : 1;
        (a.type === 'cow' ? drawCow : drawChicken)(v.g, phenotype(a) === 'H', baby);
      }
    }
    for (const [id, v] of animals) if (!ids.has(id)) { v.c.destroy({ children: true }); animals.delete(id); }
  }

  // ---------- FX ----------
  function floatText(text, gx, gy, color = '#ffffff') {
    const p = toScreen(gx, gy);
    const t = new Text({ text, style: { fontSize: 24, fontWeight: '800', fill: color, stroke: { color: '#5a3b12', width: 5 } } });
    t.anchor.set(0.5); t.position.set(p.x, p.y - 30); t.zIndex = 9999; field.addChild(t);
    let age = 0;
    const f = (tk) => { age += tk.deltaMS; t.y -= 0.05 * tk.deltaMS; t.alpha = 1 - age / 1000; if (age >= 1000) { app.ticker.remove(f); t.destroy(); } };
    app.ticker.add(f);
  }
  function burst(gx, gy, color = 0xfff176) {
    const p = toScreen(gx, gy);
    const g = new Graphics(); g.zIndex = 9998; field.addChild(g);
    let age = 0;
    const f = (tk) => {
      age += tk.deltaMS; const k = age / 500;
      g.clear();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.circle(p.x + Math.cos(a) * 30 * k, p.y - 8 + Math.sin(a) * 18 * k, 4 * (1 - k)).fill(color); }
      if (age >= 500) { app.ticker.remove(f); g.destroy(); }
    };
    app.ticker.add(f);
  }
  const toDom = (gx, gy) => { const p = toScreen(gx, gy); return { x: p.x * cam.s + cam.x, y: p.y * cam.s + cam.y }; };

  // ---------- per-frame ----------
  let acc = 0;
  let seasonDrawn = -1;
  let night = 0;
  const drops = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.6 }));
  app.ticker.add((tk) => {
    const now = Date.now();
    const day = dayOf(state, now);
    const t = now / 1000;
    const wx = weatherOf(day);
    hooks.onFrame(tk.deltaMS);
    const si = seasonIndex(day);
    wd.update(tk.deltaMS, t, wx, si, daylight(hourOf(day)), app.screen, cam);
    if (si !== seasonDrawn) { seasonDrawn = si; for (const [g, kind, alt] of decos) drawTile(g, kind, alt); for (const tl of tiles.values()) tl.kind = ''; refreshTiles(); }
    acc += tk.deltaMS;
    if (acc > 400) { acc = 0; refreshTiles(); syncPlots(); }
    for (const e of crops.values()) {
      e.c.rotation = Math.sin(t * 2 + e.gx * 3 + e.gy) * 0.04;
      if (e.stage === 3) { e.glow.alpha = 0.5 + Math.sin(t * 5) * 0.3; e.g.scale.set(1 + Math.sin(t * 5) * 0.04); }
    }
    // animals
    for (const a of state.animals) {
      const v = animals.get(a.id);
      if (!v) continue;
      if (v.wait > 0) v.wait -= tk.deltaMS;
      else {
        const dx = v.tx - v.gx, dy = v.ty - v.gy, d = Math.hypot(dx, dy);
        if (d < 0.05) { v.wait = 700 + Math.random() * 2500; v.tx = PEN_X0 + 0.3 + Math.random() * (PEN_COLS - 0.6); v.ty = 0.4 + Math.random() * (MAX_ROWS - 0.8); }
        else { const sp = (a.type === 'cow' ? 0.0005 : 0.0009) * tk.deltaMS; v.gx += dx / d * sp; v.gy += dy / d * sp; v.dir = (dx - dy) < 0 ? -1 : 1; v.g.y = -Math.abs(Math.sin(t * 12)) * (a.type === 'cow' ? 1 : 2); }
      }
      v.g.scale.set(v.dir * v.size, v.size);
      const p = toScreen(v.gx, v.gy);
      v.c.position.set(p.x, p.y); v.c.zIndex = v.gx + v.gy + 0.6;
      v.bub.text = a.ready > 0 ? ANIMALS[a.type].product === 'egg' ? '🥚' : '🥛' : a.fed < 0.15 && a.age >= 1 ? '🌾' : '';
      v.bub.y = (a.type === 'cow' ? -(a.age < 1 ? 62 : 84) : -52) + Math.sin(t * 4) * 3;
    }
    // windmill blades follow the wind
    const sp = supply(state, day);
    for (const [id, e] of scenery) if (id.startsWith('mill')) { e.rot = (e.rot || 0) + sp.windSpeed * 0.004 * tk.deltaMS; drawMill(e.g, e.rot); }
    // sky: night tint + season background + rain
    const h = hourOf(day);
    const tgt = (1 - daylight(h)) * 0.38;
    night += (tgt - night) * 0.05;
    sky.clear().rect(0, 0, app.screen.width, app.screen.height).fill({ color: 0x0b1d4d, alpha: night });
    app.renderer.background.color = SEASON_SKY[si];
    rain.clear();
    if (wx.kind === 'rain') {
      for (const d of drops) { d.y += d.v * tk.deltaMS * 0.0014; if (d.y > 1) { d.y = 0; d.x = Math.random(); } rain.moveTo(d.x * app.screen.width, d.y * app.screen.height).lineTo(d.x * app.screen.width - 4, d.y * app.screen.height + 14); }
      rain.stroke({ width: 2, color: 0xbfe3ff, alpha: 0.7 });
    }
  });

  syncScenery(); syncAnimals(); syncPlots(); refreshTiles();

  return {
    app, state, floatText, burst, toDom,
    refresh() { syncScenery(); syncAnimals(); syncPlots(); refreshTiles(); },
    syncPlots, syncAnimals, syncScenery, refreshTiles,
    setSoilView(v) { soilView = v; refreshTiles(); },
    get soilView() { return soilView; },
    centerOn: () => centerOn(2.5, 1.5, fitScale()),
  };
}
