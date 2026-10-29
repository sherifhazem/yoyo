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

// ---------------------------------------------------------------- animals
const INK = 0x4a2c12;
export function drawChicken(g, golden, baby) {
  g.clear();
  g.ellipse(0, 4, 16, 5.5).fill({ color: 0x000000, alpha: 0.22 });
  if (baby) {
    // fluffy chick: round body, big head
    g.moveTo(-3, -4).lineTo(-3.5, 3).moveTo(4, -4).lineTo(4.5, 3).stroke({ width: 2.4, color: 0xf08a1c });
    g.ellipse(0, -11, 13, 11).fill(0xffe27a).stroke({ width: 2, color: 0xc9a020 });
    g.circle(8, -22, 10).fill(0xffeb8f).stroke({ width: 2, color: 0xc9a020 });
    g.poly([16, -23, 23, -21, 16, -19]).fill(0xf5961e).stroke({ width: 1.2, color: 0xb8610c });
    g.circle(11, -25, 2.6).fill(0x222222); g.circle(11.8, -26, 0.9).fill(0xffffff);
    g.ellipse(-5, -11, 6, 4).fill(0xffd84a);
    g.circle(3, -30, 2.2).fill(0xffeb8f); g.circle(7, -32, 2.2).fill(0xffeb8f);
    return g;
  }
  const body = golden ? 0xffcf3f : 0xffffff, edge = golden ? 0xb8801a : 0xa8a8a8;
  const wing = golden ? 0xf0a81c : 0xe6e6e6, tail = golden ? 0xd98a0c : 0xcfcfcf;
  // legs and feet
  for (const x of [-4, 4]) { g.moveTo(x, -6).lineTo(x - 0.5, 3).stroke({ width: 2.6, color: 0xe8861a }); g.ellipse(x + 1.5, 3.5, 4.2, 1.6).fill(0xe8861a); }
  // tail feathers
  g.poly([-10, -14, -24, -32, -17, -12]).fill(tail).stroke({ width: 1.5, color: edge });
  g.poly([-11, -12, -27, -24, -15, -8]).fill(shade(tail, 0.9)).stroke({ width: 1.5, color: edge });
  g.poly([-10, -16, -19, -38, -12, -17]).fill(shade(tail, 1.08)).stroke({ width: 1.5, color: edge });
  // body
  g.ellipse(0, -13, 14, 11.5).fill(body).stroke({ width: 2, color: edge });
  g.ellipse(2, -9, 8, 5).fill({ color: 0xffffff, alpha: golden ? 0.28 : 0.6 });
  g.ellipse(-4, -13, 8.5, 5.5).fill(wing).stroke({ width: 1.3, color: edge });
  g.moveTo(-9, -12).lineTo(-3, -11).moveTo(-9, -15).lineTo(-2, -14).stroke({ width: 1, color: edge, alpha: 0.7 });
  // head
  g.circle(10, -25, 8).fill(body).stroke({ width: 2, color: edge });
  for (const [x, y, r] of [[7, -32, 3], [10.5, -34, 3.4], [14, -32, 3]]) g.circle(x, y, r).fill(0xe53935).stroke({ width: 1, color: 0x9b1c1a });
  g.poly([16.5, -26.5, 23.5, -24.5, 16.5, -22.5]).fill(0xf5a623).stroke({ width: 1.2, color: 0xb8700c });
  g.ellipse(14.5, -20, 2, 3.6).fill(0xe53935);
  g.circle(12.5, -26.5, 2).fill(0x222222); g.circle(13.2, -27.2, 0.8).fill(0xffffff);
  g.circle(8.5, -22, 2.2).fill({ color: 0xff8a8a, alpha: 0.5 });
  return g;
}

export function drawCow(g, spotted, baby) {
  g.clear();
  const hide = spotted ? 0xffffff : 0xc98a55, edge = spotted ? 0x555555 : 0x7a4a22, patch = spotted ? 0x2e2e2e : 0xa56b3a;
  const hs = baby ? 1.25 : 1;       // calves have bigger heads
  g.ellipse(0, 7, 32, 9).fill({ color: 0x000000, alpha: 0.22 });
  // far legs, then body, then near legs
  for (const x of [-19, 12]) { g.roundRect(x, -12, 7, 18, 2).fill(shade(hide, 0.85)).stroke({ width: 1.5, color: edge }); g.roundRect(x - 0.5, 3, 8, 4, 1.5).fill(0x3a2a1a); }
  g.moveTo(-26, -30).quadraticCurveTo(-36, -22, -32, -8).stroke({ width: 2.6, color: edge });
  g.ellipse(-32, -6, 3, 5).fill(patch).stroke({ width: 1, color: edge });
  g.roundRect(-27, -40, 54, 32, 14).fill(hide).stroke({ width: 2, color: edge });
  g.ellipse(0, -14, 20, 5).fill({ color: 0xffffff, alpha: spotted ? 0.0 : 0.25 });
  if (spotted) {
    for (const [x, y, rx, ry] of [[-12, -30, 9, 6], [8, -34, 7, 4], [14, -18, 8, 6], [-4, -16, 5, 3.5]]) g.ellipse(x, y, rx, ry).fill(patch);
  } else {
    g.ellipse(-8, -30, 9, 6).fill(patch); g.ellipse(12, -20, 7, 5).fill(patch);
  }
  g.ellipse(3, -8, 9, 4.5).fill(0xf6b9b9).stroke({ width: 1.2, color: 0xc98585 });
  for (const x of [-12, 19]) { g.roundRect(x, -12, 7.5, 19, 2).fill(hide).stroke({ width: 1.5, color: edge }); g.roundRect(x - 0.5, 3, 8.5, 4, 1.5).fill(0x3a2a1a); }
  // head
  const hx = 22, hy = -44;
  g.poly([hx + 2, hy + 2, hx - 4 * hs, hy - 8 * hs, hx + 5, hy - 2]).fill(0xf3e7c4).stroke({ width: 1.2, color: 0x9a8a5a });
  g.poly([hx + 15 * hs, hy + 2, hx + 21 * hs, hy - 8 * hs, hx + 12 * hs, hy - 2]).fill(0xf3e7c4).stroke({ width: 1.2, color: 0x9a8a5a });
  g.ellipse(hx - 3, hy + 4, 7, 3.5).fill(hide).stroke({ width: 1.5, color: edge });
  g.roundRect(hx, hy - 2 * hs, 20 * hs, 22 * hs, 8).fill(hide).stroke({ width: 2, color: edge });
  if (spotted) g.ellipse(hx + 7, hy + 2, 5, 4).fill(patch);
  g.ellipse(hx + 17 * hs, hy + 14 * hs, 9, 6.5).fill(0xf6b9b9).stroke({ width: 1.5, color: 0xc98585 });
  g.circle(hx + 15 * hs, hy + 14 * hs, 1.3).fill(0x8a4a4a); g.circle(hx + 20 * hs, hy + 14 * hs, 1.3).fill(0x8a4a4a);
  g.circle(hx + 12 * hs, hy + 5 * hs, 2.4).fill(0x222222); g.circle(hx + 12.8 * hs, hy + 4.2 * hs, 0.9).fill(0xffffff);
  return g;
}

// ---------------------------------------------------------------- buildings
// helper: point on a quad face given by corners a(top-left) b(top-right) c(bottom-right) d(bottom-left), u across, v down
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const faceAt = (f, u, v) => { const top = lerp(f[0], f[1], u), bot = lerp(f[3], f[2], u); return lerp(top, bot, v); };
const faceQuad = (f, u0, u1, v0, v1) => [faceAt(f, u0, v0), faceAt(f, u1, v0), faceAt(f, u1, v1), faceAt(f, u0, v1)].flat();

export function drawBarn(g) {
  g.clear();
  const WALL = 0xc23b2e;
  const L = [[-52, -62], [0, -36], [0, 24], [-52, -2]];   // left wall
  const R = [[0, -36], [52, -62], [52, -2], [0, 24]];     // right wall
  g.poly(L.flat()).fill(shade(WALL, 1.1)).stroke({ width: 2, color: INK });
  g.poly(R.flat()).fill(shade(WALL, 0.82)).stroke({ width: 2, color: INK });
  for (const [F, a] of [[L, 0.18], [R, 0.22]]) for (let k = 1; k < 10; k++) { const p = faceAt(F, k / 10, 0), q = faceAt(F, k / 10, 1); g.moveTo(p[0], p[1]).lineTo(q[0], q[1]).stroke({ width: 1, color: 0x000000, alpha: a }); }
  // trim on corners and base
  g.moveTo(0, -36).lineTo(0, 24).stroke({ width: 3, color: 0xfff3e0 });
  g.poly(faceQuad(L, 0, 1, 0.9, 1)).fill(0x8a8a8a); g.poly(faceQuad(R, 0, 1, 0.9, 1)).fill(0x6e6e6e);
  // big double door on the left wall
  g.poly(faceQuad(L, 0.18, 0.78, 0.28, 0.92)).fill(0x8a2d22).stroke({ width: 3, color: 0xfff3e0 });
  const d = [faceAt(L, 0.18, 0.28), faceAt(L, 0.78, 0.28), faceAt(L, 0.78, 0.92), faceAt(L, 0.18, 0.92)];
  g.moveTo(...d[0]).lineTo(...d[2]).moveTo(...d[1]).lineTo(...d[3]).stroke({ width: 2.4, color: 0xfff3e0 });
  const m0 = faceAt(L, 0.48, 0.28), m1 = faceAt(L, 0.48, 0.92); g.moveTo(...m0).lineTo(...m1).stroke({ width: 2, color: INK });
  // hay-loft window on the right wall
  g.poly(faceQuad(R, 0.3, 0.7, 0.12, 0.5)).fill(0x4a2d12).stroke({ width: 3, color: 0xfff3e0 });
  g.poly(faceQuad(R, 0.34, 0.66, 0.3, 0.5)).fill(0xe8c04a);
  // roof: two slopes with shingle rows
  const RL = [-60, -56, 0, -24, 0, -66, -60, -92], RR = [0, -24, 60, -56, 60, -92, 0, -66];
  g.poly([-60, -56, 0, -24, 0, -66, -58, -94]).fill(0x8d6e63).stroke({ width: 2, color: INK });
  g.poly([0, -24, 60, -56, 58, -94, 0, -66]).fill(0x6d4c41).stroke({ width: 2, color: INK });
  for (let k = 1; k < 5; k++) {
    const t = k / 5;
    g.moveTo(-60 + 60 * 0, -56 - 38 * t + 0).lineTo(0, -24 - 42 * t).stroke({ width: 1.2, color: 0x000000, alpha: 0.22 });
    g.moveTo(0, -24 - 42 * t).lineTo(60, -56 - 38 * t).stroke({ width: 1.2, color: 0x000000, alpha: 0.22 });
  }
  g.poly([-58, -94, 0, -66, 58, -94, 0, -108]).fill(0xa98274).stroke({ width: 2, color: INK });
  g.moveTo(0, -108).lineTo(0, -122).stroke({ width: 2.5, color: 0x555555 });
  g.poly([0, -122, 12, -118, 0, -114]).fill(0xe8c04a).stroke({ width: 1, color: INK });
  return g;
}

export function drawBoard(g) {
  g.clear();
  g.rect(-24, -8, 6, 26).fill(0x7a4c26).stroke({ width: 1.5, color: INK }); g.rect(18, -8, 6, 26).fill(0x7a4c26).stroke({ width: 1.5, color: INK });
  g.roundRect(-32, -56, 64, 50, 5).fill(0xe3b878).stroke({ width: 3, color: INK });
  g.roundRect(-28, -52, 56, 42, 3).fill(0xf6e3b4);
  g.poly([-36, -56, 0, -72, 36, -56]).fill(0xb34a2f).stroke({ width: 2, color: INK });
  const notes = [[-24, -46, 0xfff7c2], [-4, -48, 0xc8f0c0], [14, -44, 0xffd0d0], [-18, -28, 0xd0e4ff], [4, -26, 0xfff7c2]];
  for (const [x, y, c] of notes) { g.rect(x, y, 15, 15).fill(c).stroke({ width: 1, color: 0x8a7a50 }); g.moveTo(x + 3, y + 5).lineTo(x + 12, y + 5).moveTo(x + 3, y + 9).lineTo(x + 10, y + 9).stroke({ width: 1, color: 0x8a7a50 }); g.circle(x + 7.5, y - 1, 1.8).fill(0xe53935); }
  g.circle(22, -26, 6).fill(0xffd447).stroke({ width: 1.5, color: 0xb8860b }); g.moveTo(22, -29).lineTo(22, -23).stroke({ width: 1.5, color: 0xb8860b });
  return g;
}

export function drawWell(g) {
  g.clear();
  g.ellipse(0, 4, 30, 12).fill({ color: 0x000000, alpha: 0.2 });
  // stone ring
  g.poly([-26, -18, 26, -18, 26, 2, -26, 2]).fill(0x9ea1a6);
  g.ellipse(0, 2, 26, 11).fill(0x9ea1a6);
  g.poly([0, 13, 26, 2, 26, -18, 0, -18]).fill({ color: 0x000000, alpha: 0.12 });
  g.moveTo(-26, -18).lineTo(-26, 2).moveTo(26, -18).lineTo(26, 2).stroke({ width: 2, color: 0x555a60 });
  for (const [y, off] of [[-9, 0], [-1, 6]]) { g.moveTo(-26, y).quadraticCurveTo(0, y + 11, 26, y).stroke({ width: 1.2, color: 0x6a6e74 }); for (let k = -3; k <= 3; k++) { const x = k * 8 + off; g.moveTo(x, y + 5).lineTo(x, y + 9).stroke({ width: 1, color: 0x6a6e74 }); } }
  g.ellipse(0, -18, 26, 11).fill(0xc2c5ca).stroke({ width: 2, color: 0x555a60 });
  g.ellipse(0, -18, 19, 7.5).fill(0x3a8fd0);
  g.ellipse(-5, -19, 8, 2.5).fill({ color: 0xffffff, alpha: 0.5 });
  // frame, roof, rope, bucket, crank
  g.rect(-28, -60, 5, 44).fill(0x7a4c26).stroke({ width: 1.5, color: INK }); g.rect(23, -60, 5, 44).fill(0x7a4c26).stroke({ width: 1.5, color: INK });
  g.poly([-38, -56, 0, -80, 38, -56, 0, -46]).fill(0xb34a2f).stroke({ width: 2, color: INK });
  g.poly([0, -46, 38, -56, 0, -80]).fill({ color: 0x000000, alpha: 0.14 });
  for (let k = 1; k < 4; k++) g.moveTo(-38 + k * 6, -56 - k * 2.5).lineTo(0 + k * 0, -46 - k * 8).stroke({ width: 1, color: 0x000000, alpha: 0.2 });
  g.rect(-26, -58, 52, 5).fill(0x8d5a2b).stroke({ width: 1.5, color: INK });
  g.circle(0, -54, 4.5).fill(0xcfcfcf).stroke({ width: 1.5, color: 0x555a60 });
  g.moveTo(0, -52).lineTo(0, -28).stroke({ width: 2, color: 0xe8e0c8 });
  g.roundRect(-8, -28, 16, 12, 3).fill(0x9a6a36).stroke({ width: 1.8, color: INK }); g.moveTo(-8, -23).lineTo(8, -23).moveTo(-8, -19).lineTo(8, -19).stroke({ width: 1.2, color: 0x3a2a1a });
  g.moveTo(28, -54).lineTo(40, -50).stroke({ width: 3, color: 0x555a60 }); g.circle(40, -50, 3.5).fill(0xb87333);
  return g;
}

export function drawMill(g, angle) {
  g.clear();
  g.ellipse(0, 6, 18, 7).fill({ color: 0x000000, alpha: 0.2 });
  g.poly([-14, 6, 14, 6, 8, -62, -8, -62]).fill(0xf2eadb).stroke({ width: 2, color: INK });
  g.poly([0, 6, 14, 6, 8, -62, 0, -62]).fill({ color: 0x000000, alpha: 0.12 });
  for (let k = 1; k < 6; k++) { const y = 6 - k * 11.3, w = 14 - k * 1.0; g.moveTo(-w, y).lineTo(w, y).stroke({ width: 1, color: 0x000000, alpha: 0.16 }); }
  g.poly([-14, 6, 14, 6, 13, -4, -13, -4]).fill(0x8a8a8a).stroke({ width: 1.5, color: INK });
  g.roundRect(-4, -10, 8, 16, 3).fill(0x7a4c26).stroke({ width: 1.5, color: INK });
  g.circle(0, -30, 3).fill(0x9ad1ff).stroke({ width: 1.2, color: INK });
  g.poly([-11, -60, 11, -60, 0, -78]).fill(0xc0392b).stroke({ width: 2, color: INK });
  for (let i = 0; i < 4; i++) {
    const a = angle + (i * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c;
    const hx = 0, hy = -66;
    g.moveTo(hx, hy).lineTo(hx + c * 40, hy + s * 40).stroke({ width: 2.4, color: 0x7a4c26 });
    const p = (r, w) => [hx + c * r + nx * w, hy + s * r + ny * w];
    g.poly([...p(8, 0), ...p(40, 0), ...p(40, 11), ...p(8, 11)]).fill(0xfff6e0).stroke({ width: 1.2, color: INK });
    for (let r = 14; r < 40; r += 7) g.moveTo(...p(r, 0)).lineTo(...p(r, 11)).stroke({ width: 1, color: 0x9a8a5a });
  }
  g.circle(0, -66, 5).fill(0xb34a2f).stroke({ width: 1.5, color: INK });
  return g;
}

export function drawSolar(g) {
  g.clear();
  g.ellipse(0, 6, 28, 8).fill({ color: 0x000000, alpha: 0.2 });
  g.rect(-3, -8, 6, 16).fill(0x9aa0a6).stroke({ width: 1.2, color: 0x555a60 });
  g.poly([-30, -6, 30, -6, 20, -42, -20, -42]).fill(0xb8c0c8).stroke({ width: 2, color: INK });
  g.poly([-27, -8, 27, -8, 18, -39, -18, -39]).fill(0x1d3f8f);
  for (let k = 1; k < 4; k++) { const t = k / 4, y = -8 - 31 * t, w = 27 - 9 * t; g.moveTo(-w, y).lineTo(w, y).stroke({ width: 1, color: 0x8fb4f0, alpha: 0.8 }); }
  for (let k = -2; k <= 2; k++) g.moveTo(k * 10.5, -8).lineTo(k * 6.2, -39).stroke({ width: 1, color: 0x8fb4f0, alpha: 0.8 });
  g.poly([-27, -8, -12, -8, 2, -39, -18, -39]).fill({ color: 0xffffff, alpha: 0.16 });
  return g;
}

export function drawHive(g) {
  g.clear();
  g.ellipse(0, 5, 20, 6).fill({ color: 0x000000, alpha: 0.2 });
  g.rect(-14, -4, 4, 9).fill(0x7a4c26); g.rect(10, -4, 4, 9).fill(0x7a4c26);
  g.rect(-16, -10, 32, 8).fill(0x8d5a2b).stroke({ width: 1.5, color: INK });
  const tints = [0xf6c244, 0xffd966, 0xf1b92f];
  for (let k = 0; k < 3; k++) { g.rect(-15, -20 - k * 12 + 12, 30, 12).fill(tints[k]).stroke({ width: 1.5, color: INK }); g.moveTo(-15, -14 - k * 12 + 12).lineTo(15, -14 - k * 12 + 12).stroke({ width: 1, color: 0x000000, alpha: 0.12 }); }
  g.roundRect(-5, -9, 10, 3, 1.5).fill(0x3a2a1a);
  g.poly([-19, -44, 19, -44, 14, -52, -14, -52]).fill(0xb0b4b9).stroke({ width: 1.5, color: INK });
  for (const [x, y] of [[-24, -22], [22, -30], [-20, -40]]) { g.ellipse(x, y, 3.2, 2.2).fill(0xffd447).stroke({ width: 0.8, color: INK }); g.moveTo(x - 1, y - 2).lineTo(x - 1, y + 2).stroke({ width: 1, color: INK }); g.ellipse(x, y - 3, 2.5, 1.5).fill({ color: 0xffffff, alpha: 0.8 }); }
  return g;
}

export function drawBin(g) {
  g.clear();
  g.ellipse(0, 6, 26, 8).fill({ color: 0x000000, alpha: 0.2 });
  const F = [[-24, -26], [0, -14], [0, 8], [-24, -4]], R = [[0, -14], [24, -26], [24, -4], [0, 8]];
  g.poly(F.flat()).fill(0x8d5a2b).stroke({ width: 2, color: INK }); g.poly(R.flat()).fill(0x6d4423).stroke({ width: 2, color: INK });
  for (const [Q, c] of [[F, 0.2], [R, 0.25]]) for (let k = 1; k < 6; k++) { const p = faceAt(Q, k / 6, 0), q = faceAt(Q, k / 6, 1); g.moveTo(p[0], p[1]).lineTo(q[0], q[1]).stroke({ width: 1, color: 0x000000, alpha: c }); }
  g.poly([-24, -26, 0, -38, 24, -26, 0, -14]).fill(0x5a3a1a).stroke({ width: 2, color: INK });
  g.ellipse(0, -28, 17, 7).fill(0x6a8a2a);
  for (const [x, y, c] of [[-8, -30, 0x8a5a2a], [6, -28, 0xb3d16a], [-1, -32, 0xc0392b], [10, -31, 0xe2863a], [-12, -27, 0xd8c060]]) g.ellipse(x, y, 4, 2.2).fill(c);
  g.moveTo(-4, -40).quadraticCurveTo(-9, -48, -3, -54).moveTo(5, -40).quadraticCurveTo(10, -47, 4, -53).stroke({ width: 1.5, color: 0xffffff, alpha: 0.5 });
  return g;
}

export function drawTruck(g) {
  g.clear();
  g.ellipse(0, 2, 44, 9).fill({ color: 0x000000, alpha: 0.22 });
  // cargo bed with crates
  g.roundRect(-44, -32, 48, 28, 3).fill(0xd9b36a).stroke({ width: 2, color: INK });
  for (let k = 1; k < 4; k++) g.moveTo(-44 + k * 12, -32).lineTo(-44 + k * 12, -4).stroke({ width: 1, color: 0x8a6a30 });
  for (const [x, c] of [[-40, 0xe53935], [-26, 0xf5a623], [-12, 0x7cc24a]]) { g.roundRect(x, -42, 12, 10, 2).fill(c).stroke({ width: 1.2, color: INK }); }
  // cab
  g.poly([6, -26, 22, -26, 36, -12, 36, -4, 6, -4]).fill(0x2e86de).stroke({ width: 2, color: INK });
  g.poly([11, -23, 21, -23, 30, -13, 11, -13]).fill(0xcfe9ff).stroke({ width: 1.2, color: INK });
  g.poly([11, -23, 15, -23, 11, -13]).fill({ color: 0xffffff, alpha: 0.4 });
  g.rect(33, -9, 4, 4).fill(0xffeb3b).stroke({ width: 0.8, color: INK });
  g.rect(-46, -8, 4, 4).fill(0xe53935);
  g.rect(35, -6, 3, 3).fill(0x555555);
  // wheels
  for (const x of [-26, 22]) { g.circle(x, -2, 9).fill(0x2b2b2b).stroke({ width: 1.5, color: 0x000000 }); g.circle(x, -2, 4.2).fill(0xcfd4d9); g.circle(x, -2, 1.6).fill(0x777777); }
  return g;
}
