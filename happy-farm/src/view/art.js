import { Graphics } from 'pixi.js';
import { CROPS } from '../data/crops.js';

export const TW = 110;
export const TH = 55;
export const toScreen = (gx, gy) => ({ x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 });
const OUT = 0x5a3b12;

const diamond = (g, cx, cy, w = TW, h = TH) => g.poly([cx, cy - h / 2, cx + w / 2, cy, cx, cy + h / 2, cx - w / 2, cy]);

// season palettes: [spring, summer, autumn, winter]
export const SEASON_GRASS = [[0x8fd35a, 0x84ca50], [0x7cc44a, 0x71ba40], [0xc9b653, 0xbfab49], [0xeef5f7, 0xe2edf0]];
export const SEASON_SKY = [0xbfe8f7, 0xa6dcf6, 0xf5dcb4, 0xd9e7f1];
let season = 0;
export const setSeason = (i) => { season = i; };
export const grassColor = (alt = 0) => SEASON_GRASS[season][alt & 1];
const shade = (c, f) => {
  const r = Math.max(0, Math.min(255, ((c >> 16) & 255) * f)), g = Math.max(0, Math.min(255, ((c >> 8) & 255) * f)), b = Math.max(0, Math.min(255, (c & 255) * f));
  return (r << 16) | (g << 8) | b;
};

const SOIL = { soil: 0x8b5a2b, dry: 0xb98a55, wet: 0x5e3a1b };
export function drawTile(g, kind, alt = 0) {
  g.clear();
  let top;
  if (kind === 'locked') top = shade(grassColor(alt), 0.94);
  else if (kind === 'pen') top = shade(grassColor(alt), 1.12);
  else if (kind === 'grass') top = grassColor(alt);
  else top = SOIL[kind];
  const left = shade(top, 0.72), right = shade(top, 0.84);
  const D = 12;
  g.poly([-TW / 2, 0, 0, TH / 2, 0, TH / 2 + D, -TW / 2, D]).fill(left);
  g.poly([TW / 2, 0, 0, TH / 2, 0, TH / 2 + D, TW / 2, D]).fill(right);
  diamond(g, 0, 0).fill(top);
  // soft light on the upper edges, dark on the lower ones
  g.poly([-TW / 2, 0, 0, -TH / 2, TW / 2, 0]).stroke({ width: 2, color: 0xffffff, alpha: 0.25 });
  g.poly([-TW / 2, 0, 0, TH / 2, TW / 2, 0]).stroke({ width: 2, color: 0x000000, alpha: 0.12 });
  if (kind === 'soil' || kind === 'dry' || kind === 'wet') {
    const f = shade(top, 0.78), hi = shade(top, 1.18);
    for (let i = -1; i <= 1; i++) {
      g.moveTo(-26 + i * 7, 7 + i * 7).lineTo(26 + i * 7, -13 + i * 7).stroke({ width: 4, color: f });
      g.moveTo(-26 + i * 7, 4 + i * 7).lineTo(26 + i * 7, -16 + i * 7).stroke({ width: 1.5, color: hi, alpha: 0.7 });
    }
    if (kind === 'wet') diamond(g, 0, 0, TW * 0.7, TH * 0.7).fill({ color: 0x9fd8ff, alpha: 0.12 });
  } else if (kind !== 'grass') {
    // little grass blades
    for (let i = 0; i < 5; i++) {
      const x = ((i * 37 + alt * 11) % 60) - 30, y = ((i * 53) % 20) - 10;
      g.moveTo(x, y).lineTo(x - 2, y - 5).moveTo(x, y).lineTo(x + 2, y - 5).stroke({ width: 1.5, color: shade(top, 0.8) });
    }
  }
  return g;
}

export function drawCrop(g, id, p) {
  g.clear();
  const def = CROPS[id];
  const stage = p >= 1 ? 3 : Math.floor(p * 3);
  const h = [8, 16, 26, 32][stage];
  const green = 0x4caf2e, dark = 0x2f7a1c, light = 0x8bd35a;
  // soil mound and contact shadow
  g.ellipse(0, 8, 17, 7).fill({ color: 0x000000, alpha: 0.22 });
  g.ellipse(0, 6, 13, 5).fill(0x7a4c22);
  g.ellipse(0, 4, 11, 4).fill(0x9a6630);
  const leaf = (x, y, rx, ry, c = green) => g.ellipse(x, y, rx, ry).fill(c).stroke({ width: 1.5, color: dark });
  if (id === 'wheat') {
    const n = [2, 3, 5, 6][stage];
    for (let i = 0; i < n; i++) {
      const ox = (i - (n - 1) / 2) * 6.5;
      g.moveTo(ox, 5).lineTo(ox + (i % 2 ? 2 : -2), 5 - h).stroke({ width: 3.2, color: stage === 3 ? 0xc99a1c : green });
      if (stage === 3) {
        g.ellipse(ox + (i % 2 ? 2 : -2), 5 - h - 5, 4.2, 9).fill(def.color).stroke({ width: 1.2, color: 0xb38512 });
        g.moveTo(ox + (i % 2 ? 2 : -2), 5 - h - 12).lineTo(ox + (i % 2 ? 3 : -3), 5 - h - 20).stroke({ width: 1, color: 0xd9b13a });
      } else leaf(ox + 3, 5 - h * 0.6, 4, 2, light);
    }
  } else if (id === 'carrot') {
    for (let i = -1; i <= 1; i++) { g.moveTo(i * 4, 5).lineTo(i * 10, 5 - h * 0.85).stroke({ width: 4.5, color: green }); leaf(i * 10, 5 - h * 0.85, 4, 6, i ? green : light); }
    if (stage === 3) { g.poly([-8, 2, 8, 2, 0, 20]).fill(def.color).stroke({ width: 1.5, color: 0xb35d0a }); g.moveTo(-3, 6).lineTo(2, 7).moveTo(-2, 11).lineTo(3, 12).stroke({ width: 1, color: 0xc9650d }); }
  } else if (id === 'bean') {
    g.moveTo(0, 6).lineTo(0, 6 - h * 1.35).stroke({ width: 3, color: green });
    for (let i = 0; i < stage + 1; i++) {
      leaf(i % 2 ? 8 : -8, 3 - i * 8, 7.5, 4, i % 2 ? green : light);
      if (stage === 3) g.roundRect(i % 2 ? 2 : -6, 4 - i * 8, 4, 12, 2).fill(0x2f7d1e).stroke({ width: 1, color: dark });
    }
  } else if (id === 'corn') {
    const hh = h * 1.5;
    g.moveTo(0, 6).lineTo(0, 6 - hh).stroke({ width: 5.5, color: green });
    g.poly([0, 4 - hh * 0.4, 18, -hh * 0.55, 2, 8 - hh * 0.5]).fill(green).stroke({ width: 1.2, color: dark });
    g.poly([0, 4 - hh * 0.6, -18, -hh * 0.78, -2, 8 - hh * 0.7]).fill(light).stroke({ width: 1.2, color: dark });
    if (stage === 3) { g.ellipse(7, -hh * 0.5, 5.5, 11).fill(def.color).stroke({ width: 1.5, color: 0xb59a1a }); g.poly([5, -hh * 0.5 - 8, 12, -hh * 0.5 - 4, 9, -hh * 0.5 + 8]).fill(green); }
  } else {
    leaf(-9, 4, 11, 4.5); leaf(10, 3, 10, 4.5, light);
    const r = [4, 8, 12, 16][stage];
    g.ellipse(0, 6 - r * 0.45, r * 1.25, r).fill(stage === 3 ? def.color : 0x8bc34a).stroke({ width: 2, color: stage === 3 ? 0xa84f0b : dark });
    if (stage === 3) { g.ellipse(-5, -8, 3, 9).fill({ color: 0xffffff, alpha: 0.22 }); g.moveTo(0, -12).lineTo(0, 6).stroke({ width: 1.2, color: 0xb8590c }); g.roundRect(-2.5, -17, 5, 7, 2).fill(0x4a7a1e); }
  }
  return g;
}

export function drawChicken(g, golden, baby) {
  g.clear();
  const k = baby ? 0.6 : 1;
  const body = golden ? 0xffd34d : 0xffffff;
  const edge = golden ? 0xc9962a : 0xcccccc;
  g.ellipse(0, 4, 14 * k, 5 * k).fill(0x00000022);
  g.ellipse(0, -8 * k, 12 * k, 10 * k).fill(body).stroke({ width: 2, color: edge });
  g.circle(9 * k, -19 * k, 7 * k).fill(body).stroke({ width: 2, color: edge });
  g.poly([13 * k, -20 * k, 19 * k, -18 * k, 13 * k, -16 * k]).fill(0xf5a623);
  g.circle(11 * k, -21 * k, 1.5).fill(0x222222);
  g.poly([5 * k, -26 * k, 8 * k, -31 * k, 10 * k, -26 * k, 12 * k, -30 * k, 13 * k, -25 * k]).fill(0xe53935);
  g.ellipse(-6 * k, -8 * k, 6 * k, 4 * k).fill(golden ? 0xf0b429 : 0xeeeeee);
  return g;
}
export function drawCow(g, spotted, baby) {
  g.clear();
  const k = baby ? 0.6 : 1;
  g.ellipse(0, 6, 26 * k, 8 * k).fill(0x00000022);
  g.roundRect(-22 * k, -26 * k, 44 * k, 26 * k, 8).fill(0xffffff).stroke({ width: 2, color: 0xaaaaaa });
  if (spotted) { g.ellipse(-8 * k, -16 * k, 8 * k, 6 * k).fill(0x3a3a3a); g.ellipse(10 * k, -10 * k, 7 * k, 5 * k).fill(0x3a3a3a); }
  g.roundRect(18 * k, -34 * k, 18 * k, 18 * k, 6).fill(0xffffff).stroke({ width: 2, color: 0xaaaaaa });
  g.ellipse(30 * k, -20 * k, 8 * k, 5 * k).fill(0xf4b8b8);
  g.circle(26 * k, -29 * k, 1.8).fill(0x222222);
  g.rect(-16 * k, -2 * k, 5 * k, 10 * k).fill(0xdddddd); g.rect(10 * k, -2 * k, 5 * k, 10 * k).fill(0xdddddd);
  g.poly([20 * k, -34 * k, 18 * k, -42 * k, 24 * k, -35 * k]).fill(0xf0e0b0);
  return g;
}

export function drawBarn(g) {
  g.clear();
  g.poly([-50, 0, 0, 25, 0, -35, -50, -60]).fill(0xc0392b).stroke({ width: 2, color: OUT });
  g.poly([50, 0, 0, 25, 0, -35, 50, -60]).fill(0xa93226).stroke({ width: 2, color: OUT });
  g.poly([-56, -58, 0, -28, 56, -58, 0, -92]).fill(0x8d6e63).stroke({ width: 2, color: OUT });
  g.poly([-14, 14, 14, 3, 14, -26, -14, -15]).fill(0xfff3e0).stroke({ width: 2, color: OUT });
  g.moveTo(-14, -15).lineTo(14, 3).moveTo(-14, 14).lineTo(14, -26).stroke({ width: 2, color: OUT });
  return g;
}
export function drawBoard(g) {
  g.clear();
  g.rect(-22, -6, 5, 22).fill(0x6b4120); g.rect(17, -6, 5, 22).fill(0x6b4120);
  g.roundRect(-30, -50, 60, 44, 4).fill(0xf5deb3).stroke({ width: 3, color: OUT });
  for (let i = 0; i < 3; i++) g.rect(-22 + i * 16, -42, 12, 14).fill(i === 1 ? 0xffe27a : 0xffffff).stroke({ width: 1, color: 0x999999 });
  return g;
}
export function drawWell(g) {
  g.clear();
  g.ellipse(0, 6, 28, 12).fill(0x00000022);
  g.poly([-24, 0, -24, -18, 0, -6, 24, -18, 24, 0, 0, 14]).fill(0x9e9e9e).stroke({ width: 2, color: OUT });
  g.ellipse(0, -18, 24, 11).fill(0x4aa3df).stroke({ width: 2, color: OUT });
  g.rect(-26, -56, 5, 40).fill(0x6b4120); g.rect(21, -56, 5, 40).fill(0x6b4120);
  g.poly([-34, -54, 0, -76, 34, -54, 0, -48]).fill(0xb34a2f).stroke({ width: 2, color: OUT });
  g.moveTo(0, -52).lineTo(0, -26).stroke({ width: 2, color: 0xeeeeee });
  g.roundRect(-6, -26, 12, 9, 2).fill(0x8b5a2b);
  return g;
}
export function drawMill(g, angle) {
  g.clear();
  g.poly([-6, 6, 6, 6, 3, -62, -3, -62]).fill(0xeeeeee).stroke({ width: 2, color: OUT });
  g.circle(0, -64, 5).fill(0x777777);
  for (let i = 0; i < 3; i++) {
    const a = angle + (i * Math.PI * 2) / 3;
    const x = Math.cos(a) * 34, y = Math.sin(a) * 34;
    const nx = -Math.sin(a) * 6, ny = Math.cos(a) * 6;
    g.poly([0, -64, x + nx, -64 + y + ny, x - nx, -64 + y - ny]).fill(0xffffff).stroke({ width: 1.5, color: OUT });
  }
  return g;
}
export function drawSolar(g) {
  g.clear();
  g.poly([-26, -4, 26, -4, 18, -34, -18, -34]).fill(0x1e3a8a).stroke({ width: 2, color: 0xcfd8dc });
  g.moveTo(-8, -4).lineTo(-6, -34).moveTo(8, -4).lineTo(6, -34).moveTo(-22, -19).lineTo(22, -19).stroke({ width: 1, color: 0x90caf9 });
  g.rect(-2, -4, 4, 14).fill(0x777777);
  return g;
}
export function drawHive(g) {
  g.clear();
  g.rect(-14, -22, 28, 22).fill(0xf6c244).stroke({ width: 2, color: OUT });
  g.rect(-16, -28, 32, 8).fill(0xe6a817).stroke({ width: 2, color: OUT });
  g.circle(0, -10, 4).fill(0x4e342e);
  return g;
}
export function drawBin(g) {
  g.clear();
  g.poly([-20, -22, 20, -22, 16, 6, -16, 6]).fill(0x6d4c41).stroke({ width: 2, color: OUT });
  g.ellipse(0, -22, 20, 6).fill(0x4e342e);
  g.ellipse(0, -24, 14, 3).fill(0x7cb342);
  return g;
}
export function drawTruck(g) {
  g.clear();
  g.roundRect(-34, -30, 40, 26, 3).fill(0xffffff).stroke({ width: 2, color: OUT });
  g.poly([6, -22, 22, -22, 32, -10, 32, -4, 6, -4]).fill(0x2e86de).stroke({ width: 2, color: OUT });
  g.poly([12, -19, 21, -19, 27, -11, 12, -11]).fill(0xcfe9ff);
  g.circle(-18, -2, 7).fill(0x333333); g.circle(20, -2, 7).fill(0x333333);
  g.circle(-18, -2, 3).fill(0xcccccc); g.circle(20, -2, 3).fill(0xcccccc);
  return g;
}
