// Vector sprites drawn once into offscreen canvases (2x supersampled), then blitted every frame.

export const CAR_COLORS = {
  red: { hex: '#ff5a4e', price: 0, name: 'Ruby' },
  blue: { hex: '#3a8dff', price: 10, name: 'Ocean' },
  green: { hex: '#3fc96b', price: 10, name: 'Lime' },
  purple: { hex: '#a96bff', price: 15, name: 'Grape' },
  gold: { hex: '#ffc531', price: 30, name: 'Gold' },
};

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const ell = (g, x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
  g.fill();
}
const vgrad = (g, y0, y1, a, b) => {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  return gr;
};

function mk(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w * 2;
  c.height = h * 2;
  const g = c.getContext('2d');
  g.scale(2, 2);
  draw(g, w, h);
  c.logicalW = w;
  c.logicalH = h;
  return c;
}

const leaf = (g, cx, cy, r, a, b) => {
  const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  circ(g, cx, cy, r);
};

const SPRITE_DEFS = {
  tree: [120, 170, (g) => {
    g.fillStyle = '#8a5a2b'; rr(g, 52, 100, 16, 70, 5);
    leaf(g, 30, 92, 30, '#8fe66f', '#2f9d4a');
    leaf(g, 90, 92, 30, '#8fe66f', '#2f9d4a');
    leaf(g, 60, 66, 46, '#9af27a', '#2f9d4a');
    leaf(g, 60, 34, 32, '#a8f686', '#38a94f');
    g.fillStyle = 'rgba(255,255,255,.25)'; circ(g, 44, 50, 12);
  }],
  pine: [100, 180, (g) => {
    g.fillStyle = '#7a4d27'; rr(g, 44, 140, 12, 40, 4);
    [[150, 46, '#2d9b5b'], [112, 38, '#34ad63'], [76, 30, '#3dbd6f'], [44, 22, '#4ccb7c']].forEach(([y, hw, c]) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(50, y - 52); g.lineTo(50 + hw, y); g.lineTo(50 - hw, y); g.closePath(); g.fill();
    });
  }],
  bush: [100, 60, (g) => {
    leaf(g, 25, 38, 22, '#9af27a', '#3aa857'); leaf(g, 75, 38, 22, '#9af27a', '#3aa857'); leaf(g, 50, 28, 28, '#a8f686', '#3aa857');
    g.fillStyle = '#ff7aa8'; circ(g, 36, 24, 4); circ(g, 62, 34, 4); circ(g, 50, 18, 4);
  }],
  lamp: [40, 170, (g) => {
    g.fillStyle = '#4b5563'; rr(g, 17, 24, 6, 146, 3); rr(g, 12, 160, 16, 10, 3);
    g.fillStyle = 'rgba(255,230,120,.35)'; circ(g, 20, 18, 18);
    g.fillStyle = '#ffe066'; circ(g, 20, 18, 10);
  }],
  houseA: [170, 150, (g) => house(g, '#ff9fb2', '#e8505b')],
  houseB: [170, 150, (g) => house(g, '#9fd4ff', '#3a6fd8')],
  houseC: [170, 150, (g) => house(g, '#ffe08a', '#e0732f')],
  cone: [60, 80, (g) => {
    g.fillStyle = '#2b2d42'; rr(g, 4, 66, 52, 12, 4);
    g.fillStyle = vgrad(g, 0, 70, '#ffa94d', '#ff6b1a'); g.beginPath(); g.moveTo(30, 4); g.lineTo(52, 68); g.lineTo(8, 68); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(24, 24); g.lineTo(36, 24); g.lineTo(40, 38); g.lineTo(20, 38); g.closePath(); g.fill();
  }],
  rock: [90, 70, (g) => {
    g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, 45, 62, 40, 8);
    g.fillStyle = vgrad(g, 8, 66, '#b8bfcc', '#6b7385');
    g.beginPath(); g.moveTo(6, 62); g.quadraticCurveTo(0, 26, 26, 14); g.quadraticCurveTo(48, 4, 68, 18); g.quadraticCurveTo(92, 34, 84, 62); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.3)'; ell(g, 34, 26, 12, 6);
  }],
  crate: [80, 80, (g) => {
    g.fillStyle = '#b97a3c'; rr(g, 6, 6, 68, 68, 6);
    g.strokeStyle = '#7a4a1c'; g.lineWidth = 5; g.strokeRect(10, 10, 60, 60);
    g.beginPath(); g.moveTo(10, 10); g.lineTo(70, 70); g.moveTo(70, 10); g.lineTo(10, 70); g.stroke();
  }],
  cow: [130, 120, (g) => {
    g.fillStyle = 'rgba(0,0,0,.18)'; ell(g, 65, 112, 48, 7);
    g.fillStyle = '#fff'; rr(g, 22, 50, 86, 56, 22);
    g.fillStyle = '#2b2d42'; ell(g, 38, 76, 12, 9); ell(g, 94, 66, 10, 14);
    g.fillStyle = '#fff'; circ(g, 65, 40, 30);
    g.fillStyle = '#ffd0cc'; ell(g, 65, 54, 17, 11);
    g.fillStyle = '#c0546b'; circ(g, 58, 54, 3); circ(g, 72, 54, 3);
    g.fillStyle = '#2b2d42'; circ(g, 54, 34, 4.5); circ(g, 76, 34, 4.5); ell(g, 46, 24, 8, 6);
    g.fillStyle = '#fff'; circ(g, 54, 33, 1.5); circ(g, 76, 33, 1.5);
    g.fillStyle = '#e8e8ee'; ell(g, 34, 28, 10, 6); ell(g, 96, 28, 10, 6);
    g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(46, 14); g.lineTo(42, 4); g.lineTo(54, 12); g.fill(); g.beginPath(); g.moveTo(84, 14); g.lineTo(88, 4); g.lineTo(76, 12); g.fill();
  }],
  gift: [70, 70, (g) => {
    g.fillStyle = 'rgba(255,230,120,.4)'; circ(g, 35, 38, 34);
    g.fillStyle = vgrad(g, 20, 64, '#ff6b7d', '#d93a52'); rr(g, 10, 26, 50, 38, 6);
    g.fillStyle = '#ffd23f'; g.fillRect(31, 26, 8, 38); g.fillRect(10, 40, 50, 7);
    g.fillStyle = '#ffd23f'; ell(g, 25, 20, 11, 7); ell(g, 45, 20, 11, 7); circ(g, 35, 24, 5);
  }],
  coin: [60, 60, (g) => {
    g.fillStyle = vgrad(g, 4, 56, '#ffe680', '#f0a500'); circ(g, 30, 30, 26);
    g.fillStyle = '#f7b500'; circ(g, 30, 30, 20);
    g.fillStyle = vgrad(g, 10, 50, '#ffe680', '#ffc531'); circ(g, 30, 30, 17);
    g.fillStyle = '#d98f00'; g.font = '800 26px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 30, 32);
    g.fillStyle = 'rgba(255,255,255,.5)'; ell(g, 22, 18, 6, 3);
  }],
};

function house(g, wall, roof) {
  g.fillStyle = 'rgba(0,0,0,.15)'; ell(g, 85, 144, 70, 7);
  g.fillStyle = vgrad(g, 50, 146, wall, '#fff'); rr(g, 20, 54, 130, 90, 6);
  g.fillStyle = roof; g.beginPath(); g.moveTo(8, 60); g.lineTo(85, 8); g.lineTo(162, 60); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(85, 8); g.lineTo(162, 60); g.lineTo(130, 60); g.closePath(); g.fill();
  g.fillStyle = '#8a5a2b'; rr(g, 70, 94, 30, 50, 5);
  g.fillStyle = '#bfe9ff'; rr(g, 30, 74, 28, 26, 4); rr(g, 112, 74, 28, 26, 4);
  g.fillStyle = '#fff'; g.fillRect(43, 74, 2, 26); g.fillRect(125, 74, 2, 26);
}

let built;
export function getSprites() {
  if (!built) {
    built = {};
    for (const [k, [w, h, fn]] of Object.entries(SPRITE_DEFS)) built[k] = mk(w, h, fn);
  }
  return built;
}

// Rear view of the chef's car. (cx, by) = bottom-centre; w = car width in px.
export function drawCar(g, cx, by, w, color, o = {}) {
  const h = w * 0.62;
  g.save();
  g.translate(cx, by);
  g.rotate((o.tilt || 0) * 0.08);
  g.fillStyle = 'rgba(0,0,0,.28)'; ell(g, 0, -h * 0.02, w * 0.56, h * 0.13);
  g.fillStyle = '#20232c'; rr(g, -w * 0.5, -h * 0.36, w * 0.17, h * 0.36, w * 0.04); rr(g, w * 0.33, -h * 0.36, w * 0.17, h * 0.36, w * 0.04);
  // cabin
  g.fillStyle = shade(color, -0.1);
  g.beginPath(); g.moveTo(-w * 0.36, -h * 0.58); g.lineTo(-w * 0.25, -h * 1.0); g.quadraticCurveTo(0, -h * 1.08, w * 0.25, -h * 1.0); g.lineTo(w * 0.36, -h * 0.58); g.closePath(); g.fill();
  const wg = g.createLinearGradient(0, -h, 0, -h * 0.6);
  wg.addColorStop(0, '#d9f3ff'); wg.addColorStop(1, '#7fc4ee');
  g.fillStyle = wg;
  g.beginPath(); g.moveTo(-w * 0.31, -h * 0.6); g.lineTo(-w * 0.22, -h * 0.94); g.quadraticCurveTo(0, -h * 1.0, w * 0.22, -h * 0.94); g.lineTo(w * 0.31, -h * 0.6); g.closePath(); g.fill();
  // chef
  g.fillStyle = '#ffd2a8'; circ(g, 0, -h * 0.74, w * 0.085);
  g.fillStyle = '#fff'; rr(g, -w * 0.085, -h * 0.98, w * 0.17, h * 0.16, w * 0.03); circ(g, -w * 0.07, -h * 0.98, w * 0.055); circ(g, 0, -h * 1.02, w * 0.065); circ(g, w * 0.07, -h * 0.98, w * 0.055);
  g.fillStyle = '#2b2d42'; circ(g, -w * 0.03, -h * 0.74, w * 0.011); circ(g, w * 0.03, -h * 0.74, w * 0.011);
  // body
  g.fillStyle = vgrad(g, -h * 0.64, -h * 0.16, shade(color, 0.3), shade(color, -0.22));
  rr(g, -w * 0.47, -h * 0.64, w * 0.94, h * 0.5, w * 0.1);
  g.fillStyle = 'rgba(255,255,255,.28)'; rr(g, -w * 0.4, -h * 0.6, w * 0.8, h * 0.06, w * 0.03);
  // tail lights
  const lit = o.brake ? '#ff2a2a' : '#ff5d5d';
  if (o.brake) { g.shadowColor = '#ff2a2a'; g.shadowBlur = w * 0.12; }
  g.fillStyle = lit; rr(g, -w * 0.43, -h * 0.5, w * 0.2, h * 0.13, w * 0.03); rr(g, w * 0.23, -h * 0.5, w * 0.2, h * 0.13, w * 0.03);
  g.shadowBlur = 0;
  g.fillStyle = '#20232c'; rr(g, -w * 0.48, -h * 0.22, w * 0.96, h * 0.1, w * 0.03);
  g.fillStyle = '#fff'; rr(g, -w * 0.1, -h * 0.4, w * 0.2, h * 0.11, w * 0.015);
  g.fillStyle = '#2b2d42'; g.font = `800 ${w * 0.065}px system-ui,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CHEF', 0, -h * 0.345);
  g.restore();
}
