import { Graphics } from 'pixi.js';

export const TW = 110;
export const TH = 55;
export const toScreen = (gx, gy) => ({ x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 });

const diamond = (g, cx, cy, w = TW, h = TH) =>
  g.poly([cx, cy - h / 2, cx + w / 2, cy, cx, cy + h / 2, cx - w / 2, cy]);

export function drawTile(kind) {
  const g = new Graphics();
  const top = { soil: 0x8b5a2b, grass: 0x7cc24a, pen: 0xc9e58f }[kind];
  const side = { soil: 0x6b4120, grass: 0x5a9e32, pen: 0xa3c76a }[kind];
  g.poly([-TW / 2, 0, 0, TH / 2, 0, TH / 2 + 10, -TW / 2, 10]).fill(side);
  g.poly([TW / 2, 0, 0, TH / 2, 0, TH / 2 + 10, TW / 2, 10]).fill(side);
  diamond(g, 0, 0).fill(top).stroke({ width: 2, color: 0x00000022 });
  if (kind === 'soil') {
    for (let i = -1; i <= 1; i++) {
      g.moveTo(-26 + i * 6, 6 + i * 6).lineTo(26 + i * 6, -14 + i * 6).stroke({ width: 3, color: 0x6b4120 });
    }
  }
  return g;
}

export function drawCrop(g, type, p) {
  g.clear();
  const stage = p >= 1 ? 3 : Math.floor(p * 3);
  if (type === 'wheat') {
    const h = [8, 16, 26, 34][stage];
    const n = [2, 3, 5, 6][stage];
    for (let i = 0; i < n; i++) {
      const ox = (i - (n - 1) / 2) * 7;
      g.moveTo(ox, 6).lineTo(ox, 6 - h).stroke({ width: 3, color: stage === 3 ? 0xd9a520 : 0x5fae2e });
      if (stage === 3) g.ellipse(ox, 6 - h - 4, 4, 8).fill(0xf2c230);
    }
  } else {
    const h = [8, 14, 20, 24][stage];
    for (let i = -1; i <= 1; i++) {
      g.moveTo(i * 5, 6).lineTo(i * 9, 6 - h).stroke({ width: 4, color: 0x3d9a2a });
    }
    if (stage === 3) g.poly([-8, 4, 8, 4, 0, 18]).fill(0xf08a1c);
  }
  return g;
}

export function drawChicken() {
  const g = new Graphics();
  g.ellipse(0, 4, 14, 5).fill(0x00000022);
  g.ellipse(0, -8, 12, 10).fill(0xffffff).stroke({ width: 2, color: 0xcccccc });
  g.circle(9, -19, 7).fill(0xffffff).stroke({ width: 2, color: 0xcccccc });
  g.poly([13, -20, 19, -18, 13, -16]).fill(0xf5a623);
  g.circle(11, -21, 1.5).fill(0x222222);
  g.poly([5, -26, 8, -31, 10, -26, 12, -30, 13, -25]).fill(0xe53935);
  g.ellipse(-6, -8, 6, 4).fill(0xeeeeee);
  return g;
}

export function drawEgg() {
  const g = new Graphics();
  g.ellipse(0, 0, 7, 9).fill(0xfff4d6).stroke({ width: 2, color: 0xd9b36a });
  return g;
}
