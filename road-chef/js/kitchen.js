import { chefFull } from './art.js';

// The restaurant kitchen: an illustrated room with stations. The chef walks between
// stations as the recipe steps move on. New appliances (EQUIPMENT in data.js, saved in
// S.kitchen.owned) are meant to be added to this room as stations later.

// Chef standing spots, as % of the kitchen picture (x = centre, y = feet).
export const SPOTS = {
  fridge: { x: 15, y: 91, label: 'Fridge', emoji: '🧊' },
  board: { x: 33, y: 92, label: 'Cutting board', emoji: '🔪' },
  counter: { x: 49, y: 92, label: 'Mixing counter', emoji: '🥣' },
  stove: { x: 69, y: 92, label: 'Stove', emoji: '🔥' },
  oven: { x: 69, y: 92, label: 'Oven', emoji: '♨️' },
  sink: { x: 90, y: 92, label: 'Sink', emoji: '🚰' },
};

// Clickable areas in SVG units (viewBox 390 × 300).
const HIT = {
  fridge: [6, 34, 86, 176],
  board: [94, 112, 58, 94],
  counter: [152, 100, 58, 106],
  stove: [212, 20, 88, 110],
  oven: [222, 130, 68, 66],
  sink: [302, 116, 82, 90],
};

const wood = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function svg({ focus, fridgeOpen, hot, ovenHot, ovenOwned, proBlender, water, knife }) {
  const glow = ovenHot ? '<ellipse cx="256" cy="168" rx="30" ry="26" fill="url(#kGlow)"/>' : '';
  const flames = hot ? [[228, 110], [256, 110], [284, 110]].map(([x, y]) => `<g class="kflame" transform="translate(${x} ${y})"><path d="M0 0 C-5 -7 -3 -13 0 -17 C3 -13 5 -7 0 0Z" fill="#ff9f43"/><path d="M0 0 C-2 -4 -1 -8 0 -10 C1 -8 2 -4 0 0Z" fill="#ffe066"/></g>`).join('') : '';
  const drops = water ? [0, 1, 2].map((i) => `<ellipse class="kdrop" style="animation-delay:${i * 0.25}s" cx="${342 + (i - 1) * 3}" cy="${112 + i}" rx="2.4" ry="4" fill="#6ec6ff"/>`).join('') : '';
  const focusBox = focus && HIT[focus] ? `<rect class="kfocus" x="${HIT[focus][0]}" y="${HIT[focus][1]}" width="${HIT[focus][2]}" height="${HIT[focus][3]}" rx="12"/><text class="karrow" x="${HIT[focus][0] + HIT[focus][2] / 2}" y="${HIT[focus][1] - 4}" text-anchor="middle" font-size="22">👇</text>` : '';
  const hits = Object.entries(HIT).map(([id, [x, y, w, h]]) => `<rect class="khit" data-act="k-station" data-v="${id}" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>`).join('');
  return `
<svg viewBox="0 0 390 300" class="ksvg" role="img" aria-label="Kitchen">
<defs>
  ${wood('kWall', '#ffeccb', '#ffd9a3')}
  ${wood('kWood', '#d99a58', '#b9772f')}
  ${wood('kWoodDark', '#b9772f', '#8d5620')}
  ${wood('kSteel', '#e9eef4', '#aab6c4')}
  ${wood('kStone', '#f7f2ea', '#d9d1c3')}
  ${wood('kFridge', '#f1f5fa', '#c5d1e0')}
  ${wood('kGlass', '#bfe9ff', '#7fc4ee')}
  ${wood('kStove', '#68707f', '#434a58')}
  <radialGradient id="kGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset="1" stop-color="#ff7a2b" stop-opacity=".1"/></radialGradient>
  <pattern id="kTile" width="26" height="16" patternUnits="userSpaceOnUse"><rect width="26" height="16" fill="#e8f6ff"/><path d="M0 .5H26M13 .5V8M0 8.5H26M0 8.5V16M26 8.5V16" stroke="#bfe0f2" stroke-width="1" fill="none"/></pattern>
  <pattern id="kFloor" width="40" height="28" patternUnits="userSpaceOnUse"><rect width="40" height="28" fill="#f2c791"/><rect width="20" height="14" fill="#f9d9b1"/><rect x="20" y="14" width="20" height="14" fill="#f9d9b1"/></pattern>
</defs>
<rect width="390" height="206" fill="url(#kWall)"/>
<rect y="118" width="390" height="88" fill="url(#kTile)"/>
<rect y="206" width="390" height="94" fill="url(#kFloor)"/>
<rect y="204" width="390" height="6" fill="#a8742f"/>
<ellipse cx="195" cy="270" rx="150" ry="14" fill="rgba(0,0,0,.06)"/>

<!-- window -->
<g><rect x="104" y="26" width="92" height="76" rx="8" fill="#fff"/><rect x="110" y="32" width="80" height="64" rx="5" fill="url(#kGlass)"/>
<circle cx="168" cy="52" r="11" fill="#ffe066"/><circle cx="168" cy="52" r="17" fill="#ffe066" opacity=".25"/>
<ellipse cx="132" cy="60" rx="16" ry="7" fill="#fff" opacity=".9"/><ellipse cx="143" cy="55" rx="10" ry="6" fill="#fff" opacity=".9"/>
<path d="M150 32V96M110 64H190" stroke="#fff" stroke-width="4"/>
<path d="M104 24 Q120 54 104 104 H96 V24Z" fill="#e8505b"/><path d="M196 24 Q180 54 196 104 H204 V24Z" fill="#e8505b"/>
<rect x="98" y="100" width="104" height="6" rx="3" fill="#a8742f"/>
<g transform="translate(120 88)"><rect x="-8" y="-2" width="16" height="12" rx="3" fill="#c0546b"/><path d="M0 -2 C-8 -14 8 -14 0 -2" fill="#3fc96b"/><circle cx="-3" cy="-9" r="3" fill="#ff7aa8"/></g></g>
<!-- clock -->
<g transform="translate(334 34)"><circle r="17" fill="#fff" stroke="#a8742f" stroke-width="4"/><path d="M0 0V-10M0 0L7 4" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/><circle r="2" fill="#e8505b"/></g>
<!-- shelf over sink -->
<g><rect x="306" y="78" width="78" height="7" rx="3" fill="url(#kWood)"/><rect x="314" y="58" width="16" height="20" rx="4" fill="#ff9fb2"/><rect x="316" y="54" width="12" height="5" rx="2" fill="#fff"/><rect x="336" y="62" width="14" height="16" rx="4" fill="#9fd4ff"/><rect x="338" y="58" width="10" height="5" rx="2" fill="#fff"/><path d="M366 78 q-8 -18 0 -22 q8 4 0 22" fill="#3fc96b"/><path d="M366 78 q-14 -8 -10 -16 q10 2 10 16" fill="#2f9d4a"/><rect x="360" y="76" width="12" height="4" fill="#c0546b"/></g>
<!-- hood and rail -->
<g><path d="M222 22 H290 L300 62 H212 Z" fill="url(#kSteel)" stroke="#8c98a8" stroke-width="2"/><rect x="226" y="58" width="60" height="6" rx="3" fill="#ffe9a8"/>
<rect x="216" y="70" width="80" height="4" rx="2" fill="#8c98a8"/>
<g stroke="#5a6070" stroke-width="2" fill="none"><path d="M226 74V82M246 74V84M266 74V80M284 74V82"/></g>
<ellipse cx="226" cy="90" rx="6" ry="9" fill="#5a6070"/><rect x="224" y="78" width="4" height="8" fill="#5a6070"/>
<circle cx="246" cy="92" r="6" fill="#c0c7d3"/><path d="M246 86V84" stroke="#5a6070" stroke-width="2"/>
<path d="M266 80 v14 q-5 5 0 8 q5 -3 0 -8" fill="#c0c7d3"/><circle cx="284" cy="92" r="5" fill="#e8505b"/></g>

<!-- fridge -->
<g>
<rect x="6" y="34" width="84" height="172" rx="10" fill="url(#kFridge)" stroke="#9fb0c4" stroke-width="2"/>
${fridgeOpen ? `
<rect x="14" y="42" width="68" height="156" rx="6" fill="#eaf8ff"/>
<g stroke="#b8d3e6" stroke-width="3"><path d="M14 90H82M14 132H82M14 166H82"/></g>
<text x="26" y="86" font-size="20">🥛</text><text x="52" y="86" font-size="20">🥚</text>
<text x="22" y="128" font-size="22">🧀</text><text x="50" y="128" font-size="22">🍎</text>
<text x="24" y="162" font-size="22">🥕</text><text x="52" y="162" font-size="22">🍅</text>
<text x="30" y="194" font-size="22">🥩</text><text x="54" y="194" font-size="22">🐟</text>
<path d="M6 34 L-14 46 V196 L6 206Z" fill="#dfe8f2" stroke="#9fb0c4" stroke-width="2"/><rect x="-8" y="100" width="4" height="30" rx="2" fill="#7a8798"/>
` : `
<path d="M6 92H90" stroke="#9fb0c4" stroke-width="3"/><rect x="74" y="50" width="6" height="30" rx="3" fill="#7a8798"/><rect x="74" y="104" width="6" height="52" rx="3" fill="#7a8798"/>
<rect x="18" y="108" width="22" height="22" rx="3" fill="#ffd23f" transform="rotate(-6 29 119)"/><text x="22" y="125" font-size="14">🍎</text>
<rect x="22" y="140" width="22" height="16" rx="3" fill="#ff7aa8" transform="rotate(5 33 148)"/><circle cx="52" cy="64" r="7" fill="#3a8dff"/>`}
</g>

<!-- worktop + cabinets -->
<g><rect x="94" y="140" width="116" height="66" fill="url(#kWood)"/><path d="M152 140V206" stroke="#8d5620" stroke-width="3"/>
<rect x="104" y="150" width="40" height="48" rx="5" fill="url(#kWoodDark)" opacity=".55"/><rect x="160" y="150" width="40" height="48" rx="5" fill="url(#kWoodDark)" opacity=".55"/>
<circle cx="140" cy="172" r="3" fill="#f5d9a8"/><circle cx="164" cy="172" r="3" fill="#f5d9a8"/>
<rect x="90" y="128" width="124" height="14" rx="4" fill="url(#kStone)" stroke="#c8bfae" stroke-width="1.5"/></g>
<!-- cutting board + knife -->
<g class="${knife ? 'kknife' : ''}"><rect x="98" y="118" width="48" height="12" rx="3" fill="#e3b97b" stroke="#a8742f" stroke-width="1.5"/><ellipse cx="116" cy="124" rx="6" ry="3" fill="#ff9f43"/>
<g transform="translate(130 112) rotate(-18)"><rect x="0" y="0" width="22" height="5" rx="2" fill="#c0c7d3"/><rect x="20" y="-0.5" width="10" height="6" rx="2" fill="#7a4d27"/></g></g>
<!-- mixing bowl + blender -->
<g><path d="M158 118 H190 Q188 134 174 134 Q160 134 158 118Z" fill="#6ec6ff" stroke="#3a8dff" stroke-width="2"/><ellipse cx="174" cy="118" rx="16" ry="4" fill="#d9f0ff" stroke="#3a8dff" stroke-width="1.5"/>
<g transform="translate(195 106)"><rect x="-1" y="14" width="14" height="10" rx="2" fill="${proBlender ? 'url(#kSteel)' : '#5a6070'}" stroke="${proBlender ? '#6f7a8a' : 'none'}"/>${proBlender ? '<circle cx="6" cy="19" r="1.8" fill="#3fc96b"/>' : ''}<path d="M0 14 L-2 -6 H15 L13 14Z" fill="url(#kGlass)" stroke="#7a8798" stroke-width="1.5"/><rect x="-3" y="-9" width="20" height="4" rx="2" fill="${proBlender ? '#e8505b' : '#5a6070'}"/></g></g>

<!-- stove -->
<g>
<rect x="212" y="98" width="88" height="108" rx="6" fill="url(#kStove)" stroke="#2f3542" stroke-width="2"/>
<rect x="212" y="98" width="88" height="14" rx="5" fill="#2f3542"/>
<g fill="#1f2430"><ellipse cx="236" cy="104" rx="13" ry="4.5"/><ellipse cx="276" cy="104" rx="13" ry="4.5"/></g>
<g><path d="M222 100 h28 v-14 h-28z" fill="#9aa3b2" stroke="#5a6070" stroke-width="2"/><rect x="220" y="82" width="32" height="6" rx="3" fill="#c0c7d3"/><rect x="250" y="88" width="10" height="4" rx="2" fill="#5a6070"/></g>
<g><ellipse cx="276" cy="97" rx="15" ry="5" fill="#5a6070"/><path d="M262 96 q14 6 28 0" fill="none" stroke="#c0c7d3" stroke-width="2"/><rect x="288" y="95" width="14" height="4" rx="2" fill="#2b2d42"/></g>
${flames}
<g fill="#c0c7d3"><circle cx="228" cy="120" r="4.5"/><circle cx="244" cy="120" r="4.5"/><circle cx="268" cy="120" r="4.5"/><circle cx="284" cy="120" r="4.5"/></g>
${ovenOwned ? `
<rect x="222" y="130" width="68" height="66" rx="8" fill="url(#kSteel)" stroke="#6f7a8a" stroke-width="3"/>
<rect x="229" y="140" width="54" height="40" rx="5" fill="${ovenHot ? '#ff9a3c' : '#2b3242'}"/>${glow}
<rect x="229" y="140" width="54" height="40" rx="5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
<rect x="232" y="132" width="48" height="5" rx="2.5" fill="#4a5262"/><circle cx="240" cy="188" r="2.5" fill="#3fc96b"/><rect x="250" y="186" width="26" height="5" rx="2.5" fill="#4a5262"/>` : `
<rect x="222" y="130" width="68" height="66" rx="8" fill="#2a2f3b" stroke="#6b7384" stroke-width="3" stroke-dasharray="6 4"/>
<rect x="229" y="140" width="54" height="40" rx="5" fill="#1b1f29"/>
<path d="M236 144 L248 160 L242 172 M270 146 L260 164" stroke="#46506a" stroke-width="2" fill="none"/>
<g transform="rotate(-8 256 168)"><rect x="228" y="158" width="56" height="18" rx="3" fill="#e8505b"/><text x="256" y="171" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">OUT OF ORDER</text></g>`}
</g>

<!-- sink -->
<g><rect x="302" y="140" width="82" height="66" fill="url(#kWood)"/><path d="M343 140V206" stroke="#8d5620" stroke-width="3"/>
<rect x="310" y="150" width="30" height="48" rx="5" fill="url(#kWoodDark)" opacity=".55"/><rect x="346" y="150" width="30" height="48" rx="5" fill="url(#kWoodDark)" opacity=".55"/>
<circle cx="337" cy="172" r="3" fill="#f5d9a8"/><circle cx="349" cy="172" r="3" fill="#f5d9a8"/>
<rect x="298" y="128" width="90" height="14" rx="4" fill="url(#kStone)" stroke="#c8bfae" stroke-width="1.5"/>
<ellipse cx="343" cy="130" rx="30" ry="6" fill="#8ea2b6"/><ellipse cx="343" cy="131" rx="26" ry="4.5" fill="#6f8397"/>
<path d="M343 128 V108 q0 -12 14 -12 h2" fill="none" stroke="#9aa3b2" stroke-width="5" stroke-linecap="round"/><rect x="354" y="94" width="10" height="6" rx="2" fill="#9aa3b2"/>
<circle cx="337" cy="120" r="0"/>${drops}
<rect x="372" y="116" width="8" height="12" rx="3" fill="#ffd23f"/></g>

${focusBox}${hits}
</svg>`;
}

export function createKitchen() {
  let chef = 'counter';
  let anim = null;

  return {
    reset() {
      chef = 'counter';
      anim = null;
    },
    walkTo(station) {
      if (station === chef) return;
      anim = { from: chef, to: station };
      chef = station;
    },
    /** state: { focus, doing, stepType, bubble } */
    scene(state) {
      const doing = state.doing;
      const a = anim;
      anim = null;
      const from = SPOTS[a ? a.from : chef];
      const to = SPOTS[chef];
      const style = `--fx:${from.x}%;--fy:${from.y}%;--tx:${to.x}%;--ty:${to.y}%`;
      const active = state.stepType === 'heat' || state.stepType === 'flip' || state.stepType === 'tap';
      const hot = doing === 'stove' && active;
      const ovenHot = doing === 'oven' && active;
      const owned = state.owned || [];
      return `
<div class="kitchen">
  ${svg({ focus: state.focus, fridgeOpen: doing === 'fridge', hot, ovenHot, ovenOwned: owned.includes('oven'), proBlender: owned.includes('blender'), water: doing === 'sink', knife: doing === 'board' })}
  <div class="kchef ${a ? 'walking' : ''} ${doing ? 'working' : ''}" style="${style}"><span class="kshadow"></span><span class="kface">${chefFull()}</span></div>
  ${state.bubble ? `<div class="bubble kbubble">${state.bubble}</div>` : ''}
</div>`;
    },
  };
}
