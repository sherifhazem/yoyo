import { Container, Graphics } from 'pixi.js';
import { toScreen, drawTile, grassColor, setSeason, SEASON_GRASS } from './art.js';
import { rand01 } from '../core/rng.js';

// island extent in tile coordinates
const X0 = -2.6, X1 = 11.6, Y0 = -3.2, Y1 = 7.4;
// the farm itself (field, pen, scenery row): nothing decorative is placed here
const inFarm = (gx, gy) => gx > -1.9 && gx < 9.4 && gy > -2.0 && gy < 6.3;
const inPond = (gx, gy) => Math.hypot((gx - 10.3) / 1.5, (gy - 3.0) / 1.0) < 1;

const P = (gx, gy) => toScreen(gx, gy);
const shade = (c, f) => { const r = Math.min(255, ((c >> 16) & 255) * f), g = Math.min(255, ((c >> 8) & 255) * f), b = Math.min(255, (c & 255) * f); return (r << 16) | (g << 8) | b; };

function drawTree(g, kind, season) {
  g.clear();
  g.ellipse(0, 4, 26, 10).fill({ color: 0x000000, alpha: 0.2 });
  if (kind === 'pine') {
    g.rect(-4, -14, 8, 18).fill(0x6b4423);
    const leaf = season === 3 ? 0x3d7a4d : 0x2e7d32;
    for (let i = 0; i < 3; i++) {
      const y = -10 - i * 20, w = 30 - i * 7;
      g.poly([-w, y, w, y, 0, y - 32]).fill(shade(leaf, 1 + i * 0.1)).stroke({ width: 1.5, color: 0x1b4d1f });
      if (season === 3) g.poly([-w * 0.55, y - 12, w * 0.55, y - 12, 0, y - 32]).fill(0xffffff);
    }
  } else {
    g.rect(-5, -26, 10, 30).fill(0x7a4c26).stroke({ width: 1.5, color: 0x4a2c12 });
    if (season === 3) {
      g.moveTo(0, -26).lineTo(-16, -50).moveTo(0, -30).lineTo(16, -54).moveTo(0, -34).lineTo(0, -62).stroke({ width: 4, color: 0x5a3a1c });
      g.ellipse(0, -56, 20, 9).fill({ color: 0xffffff, alpha: 0.85 });
    } else {
      const base = [0x74c44f, 0x4fae3a, 0xe2863a, 0xffffff][season];
      for (const [x, y, r] of [[-15, -40, 18], [15, -40, 18], [0, -56, 22], [0, -38, 22]]) g.circle(x, y, r).fill(shade(base, y < -45 ? 1.12 : 1)).stroke({ width: 1.5, color: shade(base, 0.6) });
      if (season === 0) for (let i = 0; i < 9; i++) g.circle(Math.cos(i * 2.4) * 22, -46 + Math.sin(i * 1.9) * 18, 3).fill(0xffc1d6);
      if (season === 2) for (let i = 0; i < 6; i++) g.circle(Math.cos(i * 2.1) * 20, -44 + Math.sin(i * 1.7) * 16, 3).fill(0xc0392b);
    }
  }
  return g;
}

export function createWorld(world, field, app) {
  const ground = new Container();
  world.addChildAt(ground, 0);
  const island = new Graphics();
  const cells = new Graphics();
  ground.addChild(island, cells);
  const props = [];          // trees, flowers, rocks
  let pondG = null;
  let lastSeason = -1;

  function build(season) {
    setSeason(season);
    island.clear(); cells.clear();
    const A = P(X0, Y0), B = P(X1, Y0), C = P(X1, Y1), D = P(X0, Y1);
    const T = 64;
    // rock and soil sides
    island.poly([D.x, D.y, C.x, C.y, C.x, C.y + T, D.x, D.y + T]).fill(0x7b5128);
    island.poly([C.x, C.y, B.x, B.y, B.x, B.y + T, C.x, C.y + T]).fill(0x93653a);
    island.poly([D.x, D.y + T - 16, C.x, C.y + T - 16, C.x, C.y + T, D.x, D.y + T]).fill(0x5d3c1c);
    island.poly([C.x, C.y + T - 16, B.x, B.y + T - 16, B.x, B.y + T, C.x, C.y + T]).fill(0x744a26);
    for (let i = 0; i < 16; i++) { const t = i / 16; const x = D.x + (C.x - D.x) * t, y = D.y + (C.y - D.y) * t; island.ellipse(x + 6, y + 22 + (i % 3) * 10, 10, 6).fill({ color: 0x000000, alpha: 0.1 }); }
    // grass top, with a darker rim
    island.poly([A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y]).fill(grassColor(0));
    island.poly([D.x, D.y, C.x, C.y, C.x, C.y + 10, D.x, D.y + 10]).fill(shade(grassColor(0), 0.7));
    island.poly([C.x, C.y, B.x, B.y, B.x, B.y + 10, C.x, C.y + 10]).fill(shade(grassColor(0), 0.8));
    // checker cells for depth
    for (let gx = Math.ceil(X0); gx < X1 - 1; gx++) for (let gy = Math.ceil(Y0); gy < Y1 - 1; gy++) {
      if ((gx + gy) & 1) continue;
      const a = P(gx, gy), b = P(gx + 1, gy), c = P(gx + 1, gy + 1), d = P(gx, gy + 1);
      cells.poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y]).fill({ color: grassColor(1), alpha: 1 });
    }
    // props
    for (const p of props) p.destroy();
    props.length = 0;
    const add = (g, gx, gy, z = 0.2) => { const p = P(gx, gy); g.position.set(p.x, p.y); g.zIndex = gx + gy + z; field.addChild(g); props.push(g); return g; };
    // trees
    for (let i = 0; i < 90 && props.length < 24; i++) {
      const gx = X0 + 0.6 + rand01('tx', i) * (X1 - X0 - 1.2), gy = Y0 + 0.6 + rand01('ty', i) * (Y1 - Y0 - 1.2);
      if (inFarm(gx, gy) || inPond(gx, gy)) continue;
      if (props.some((q) => Math.hypot(q.position.x - P(gx, gy).x, (q.position.y - P(gx, gy).y) * 2) < 90)) continue;
      add(drawTree(new Graphics(), rand01('tk', i) < 0.35 ? 'pine' : 'round', season), gx, gy, 0.5);
    }
    // small details
    const nTrees = props.length;
    for (let i = 0; i < 70; i++) {
      const gx = X0 + 0.3 + rand01('fx', i) * (X1 - X0 - 0.6), gy = Y0 + 0.3 + rand01('fy', i) * (Y1 - Y0 - 0.6);
      if (inFarm(gx, gy) || inPond(gx, gy)) continue;
      const g = new Graphics();
      if (season === 3) g.ellipse(0, 0, 6, 2.5).fill({ color: 0xffffff, alpha: 0.9 });
      else if (season === 2) { g.rect(-1.5, -6, 3, 6).fill(0xf3e9d2); g.ellipse(0, -7, 5, 3.5).fill(i % 2 ? 0xc0392b : 0xd98b3a); }
      else {
        const col = [0xffffff, 0xffd54f, 0xff8a9b, 0xb39ddb][i % 4];
        g.moveTo(0, 0).lineTo(0, -6).stroke({ width: 1.5, color: 0x3d8b2e });
        for (let k = 0; k < 5; k++) g.circle(Math.cos(k * 1.256) * 3, -7 + Math.sin(k * 1.256) * 3, 2).fill(col);
        g.circle(0, -7, 1.5).fill(0xffeb3b);
      }
      add(g, gx, gy, 0.1);
    }
    // rocks
    for (let i = 0; i < 6; i++) {
      const gx = X0 + 0.5 + rand01('rx', i) * (X1 - X0 - 1), gy = Y0 + 0.5 + rand01('ry', i) * (Y1 - Y0 - 1);
      if (inFarm(gx, gy) || inPond(gx, gy)) continue;
      const g = new Graphics(); g.ellipse(0, 3, 14, 5).fill({ color: 0, alpha: 0.18 }); g.ellipse(0, -2, 12, 9).fill(season === 3 ? 0xdfe6ea : 0x9aa0a6).stroke({ width: 1.5, color: 0x5f6368 });
      add(g, gx, gy, 0.1);
    }
    // pond
    if (pondG) pondG.destroy();
    pondG = new Graphics();
    const pp = P(10.3, 3.0);
    pondG.position.set(pp.x, pp.y); pondG.zIndex = 10.3 + 3.0 - 3;
    field.addChild(pondG);
  }

  // ----- fences around the land you own -----
  let fences = [], fenceSig = '';
  function setFence(cols, rows) {
    const sig = cols + ',' + rows;
    if (sig === fenceSig) return;
    fenceSig = sig;
    for (const f of fences) f.destroy();
    fences = [];
    const seg = (x0, y0, x1, y1, z) => {
      const g = new Graphics();
      const a = P(x0, y0), b = P(x1, y1);
      g.position.set(a.x, a.y);
      const dx = b.x - a.x, dy = b.y - a.y;
      for (const h of [6, 13]) g.moveTo(0, -h).lineTo(dx, dy - h).stroke({ width: 3, color: 0xb98046 }).moveTo(0, -h).lineTo(dx, dy - h).stroke({ width: 1, color: 0xe3b274, alpha: 0.8 });
      g.rect(-2.5, -18, 5, 20).fill(0xa06a32).stroke({ width: 1, color: 0x5a3b12 });
      g.rect(dx - 2.5, dy - 18, 5, 20).fill(0xa06a32).stroke({ width: 1, color: 0x5a3b12 });
      g.zIndex = z + 0.45; field.addChild(g); fences.push(g);
    };
    for (let gy = 0; gy < rows; gy++) { seg(cols, gy, cols, gy + 1, cols + gy + 0.5); seg(0, gy, 0, gy + 1, gy); }
    for (let gx = 0; gx < cols; gx++) seg(gx, rows, gx + 1, rows, gx + rows + 0.5);
  }

  // ----- sky layer: clouds, snow, leaves, butterflies -----
  const skyLayer = new Container();
  const sky = new Graphics();            // snow and leaves
  app.stage.addChildAt(skyLayer, 1);
  skyLayer.addChild(sky);
  const clouds = Array.from({ length: 5 }, (_, i) => {
    const g = new Graphics();
    for (const [dx, dy, r] of [[0, 0, 1], [1.1, 0.2, 0.8], [-1.0, 0.25, 0.75], [0.4, -0.35, 0.85], [-0.4, -0.2, 0.7]]) g.circle(dx * 30, dy * 30, r * 21).fill(0xffffff);
    skyLayer.addChild(g);
    return { g, x: rand01('cx', i), y: 0.04 + rand01('cy', i) * 0.22, s: 0.7 + rand01('cs', i) * 0.8, v: 0.002 + rand01('cv', i) * 0.003 };
  });
  const flakes = Array.from({ length: 70 }, (_, i) => ({ x: rand01('sx', i), y: rand01('sy', i), r: 1.5 + rand01('sr', i) * 2, v: 0.04 + rand01('sv', i) * 0.05, ph: rand01('sp', i) * 6 }));
  const flies = Array.from({ length: 4 }, (_, i) => ({ gx: 1 + rand01('bx', i) * 5, gy: 0.5 + rand01('by', i) * 4, ph: rand01('bp', i) * 6, col: [0xff8fab, 0xffd54f, 0x90caf9, 0xffffff][i] }));
  const flyG = new Graphics(); flyG.zIndex = 9000; field.addChild(flyG);

  function update(dtMs, t, wx, season, daylightVal, screen, cam) {
    if (season !== lastSeason) { lastSeason = season; build(season); }
    // clouds
    sky.clear();
    const cover = { sunny: 0.35, cloudy: 0.9, rain: 1, windy: 0.55 }[wx.kind];
    for (const c of clouds) {
      c.x += c.v * dtMs * 0.01 * (1 + wx.wind * 0.3); if (c.x > 1.25) c.x = -0.25;
      c.g.position.set(c.x * screen.width, 110 + c.y * screen.height * 0.5);
      c.g.scale.set(c.s);
      c.g.tint = wx.kind === 'rain' ? 0xc3ccd6 : 0xffffff;
      c.g.alpha = Math.min(0.9, 0.55 * cover) * (0.35 + 0.65 * daylightVal);
    }
    // snow in winter, drifting leaves in autumn
    if (season === 3 || season === 2) {
      for (const f of flakes) {
        f.y += f.v * dtMs * 0.0006 * (season === 2 ? 1.4 : 1); f.x += Math.sin(t + f.ph) * 0.0004 * dtMs * 0.1 + (season === 2 ? 0.00005 * dtMs : 0);
        if (f.y > 1.05) { f.y = -0.05; f.x = Math.random(); }
        if (f.x > 1.05) f.x = -0.05;
        const x = f.x * screen.width, y = f.y * screen.height;
        if (season === 3) sky.circle(x, y, f.r).fill({ color: 0xffffff, alpha: 0.9 });
        else sky.ellipse(x, y, f.r * 2, f.r).fill({ color: [0xe2863a, 0xc0392b, 0xf0b429][(f.ph | 0) % 3], alpha: 0.9 });
      }
    }
    // butterflies
    flyG.clear();
    if ((season === 0 || season === 1) && daylightVal > 0.3 && wx.kind !== 'rain') {
      for (const b of flies) {
        b.ph += dtMs * 0.004; b.gx += Math.sin(b.ph * 0.7) * 0.004; b.gy += Math.cos(b.ph * 0.5) * 0.004;
        const p = P(b.gx, b.gy), flap = Math.abs(Math.sin(b.ph * 6)) * 5 + 1, y = p.y - 36 + Math.sin(b.ph) * 6;
        flyG.ellipse(p.x - 3, y, flap, 4).fill(b.col).ellipse(p.x + 3, y, flap, 4).fill(b.col).circle(p.x, y, 1.6).fill(0x333333);
      }
    }
    // pond ripples
    if (pondG) {
      pondG.clear();
      pondG.ellipse(0, 8, 84, 36).fill(season === 3 ? 0xb9d6e6 : 0x6a4a2a);
      pondG.ellipse(0, 4, 80, 33).fill(season === 3 ? 0xdff1fb : 0x58b4e8).stroke({ width: 2, color: 0x2e86c1, alpha: 0.5 });
      if (season !== 3) {
        for (let k = 0; k < 2; k++) { const ph = (t * 0.5 + k * 0.5) % 1; pondG.ellipse(-8 + k * 24, 2 + k * 6, 6 + ph * 22, 2.5 + ph * 9).stroke({ width: 1.5, color: 0xffffff, alpha: 0.7 * (1 - ph) }); }
        pondG.ellipse(26, 0, 9, 4).fill(0x4caf50); pondG.circle(28, -1, 2.5).fill(0xffb3c7);
      }
      for (let k = 0; k < 4; k++) pondG.moveTo(-70 + k * 6, 14).lineTo(-70 + k * 6 + (k % 2 ? 2 : -2), -6).stroke({ width: 2, color: 0x2f7a2e });
    }
  }
  return { update, setFence, build };
}
