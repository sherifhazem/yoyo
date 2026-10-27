import { Graphics } from 'pixi.js';
import { CROPS } from '../data/crops.js';

export const TW = 110;
export const TH = 55;
export const toScreen = (gx, gy) => ({ x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 });
const OUT = 0x5a3b12;

const diamond = (g, cx, cy, w = TW, h = TH) => g.poly([cx, cy - h / 2, cx + w / 2, cy, cx, cy + h / 2, cx - w / 2, cy]);

const TILE = {
  soil:   [0x8b5a2b, 0x6b4120],
  dry:    [0xb98a55, 0x8f6538],
  wet:    [0x6e4520, 0x56351a],
  grass:  [0x7cc24a, 0x5a9e32],
  locked: [0x86c957, 0x68ad3d],
  pen:    [0xc9e58f, 0xa3c76a],
  road:   [0xd8c79a, 0xb8a679],
};
export function drawTile(g, kind, tint) {
  g.clear();
  const [top, side] = TILE[kind];
  g.poly([-TW / 2, 0, 0, TH / 2, 0, TH / 2 + 10, -TW / 2, 10]).fill(side);
  g.poly([TW / 2, 0, 0, TH / 2, 0, TH / 2 + 10, TW / 2, 10]).fill(side);
  diamond(g, 0, 0).fill(tint || top).stroke({ width: 2, color: 0x00000022 });
  if (kind === 'soil' || kind === 'dry' || kind === 'wet') {
    for (let i = -1; i <= 1; i++) g.moveTo(-26 + i * 6, 6 + i * 6).lineTo(26 + i * 6, -14 + i * 6).stroke({ width: 3, color: side });
  }
  return g;
}

export function drawCrop(g, id, p) {
  g.clear();
  const def = CROPS[id];
  const stage = p >= 1 ? 3 : Math.floor(p * 3);
  const h = [8, 16, 26, 32][stage];
  const green = 0x4caf2e;
  if (id === 'wheat') {
    const n = [2, 3, 5, 6][stage];
    for (let i = 0; i < n; i++) {
      const ox = (i - (n - 1) / 2) * 7;
      g.moveTo(ox, 6).lineTo(ox, 6 - h).stroke({ width: 3, color: stage === 3 ? 0xd9a520 : green });
      if (stage === 3) g.ellipse(ox, 6 - h - 4, 4, 8).fill(def.color);
    }
  } else if (id === 'carrot') {
    for (let i = -1; i <= 1; i++) g.moveTo(i * 4, 6).lineTo(i * 9, 6 - h * 0.8).stroke({ width: 4, color: green });
    if (stage === 3) g.poly([-8, 4, 8, 4, 0, 20]).fill(def.color).stroke({ width: 1.5, color: 0xb35d0a });
  } else if (id === 'bean') {
    g.moveTo(0, 8).lineTo(0, 8 - h * 1.3).stroke({ width: 3, color: green });
    for (let i = 0; i < stage + 1; i++) {
      g.ellipse(i % 2 ? 7 : -7, 4 - i * 8, 7, 3.5).fill(green);
      if (stage === 3) g.ellipse(i % 2 ? 4 : -4, 8 - i * 8, 2.5, 6).fill(0x2f7d1e);
    }
  } else if (id === 'corn') {
    const hh = h * 1.5;
    g.moveTo(0, 8).lineTo(0, 8 - hh).stroke({ width: 5, color: green });
    g.poly([0, 4 - hh * 0.4, 16, -hh * 0.6, 2, 8 - hh * 0.5]).fill(green);
    g.poly([0, 4 - hh * 0.6, -16, -hh * 0.8, -2, 8 - hh * 0.7]).fill(green);
    if (stage === 3) g.ellipse(6, -hh * 0.55, 5, 10).fill(def.color).stroke({ width: 1.5, color: 0xb59a1a });
  } else {
    // pumpkin: vine + round fruit
    g.ellipse(-8, 4, 10, 4).fill(green); g.ellipse(9, 2, 9, 4).fill(green);
    const r = [4, 8, 12, 16][stage];
    g.ellipse(0, 6 - r * 0.4, r * 1.2, r).fill(stage === 3 ? def.color : 0x8bc34a).stroke({ width: 2, color: stage === 3 ? 0xa84f0b : 0x4caf2e });
    if (stage === 3) g.rect(-2, -14, 4, 6).fill(0x4a7a1e);
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
