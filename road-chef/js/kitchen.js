import { chefTop } from './art.js';

// The restaurant kitchen seen from above. The chef is a worker the child directs: he moves
// between stations by himself while a dish is made. The lower row holds the serving counter
// and empty slots reserved for future sections (bakery, drinks bar...).

const W = 390;
const H = 230;
// Station boxes [x, y, w, h] in viewBox units.
const ST = {
  fridge: [8, 18, 68, 78],
  board: [82, 18, 88, 78],
  stove: [176, 18, 76, 78],
  oven: [256, 18, 66, 78],
  sink: [326, 18, 56, 78],
  pass: [8, 144, 142, 72],
};
// Where the chef stands (viewBox units, feet).
const AT = { fridge: [42, 124], board: [126, 124], stove: [214, 124], oven: [289, 124], sink: [354, 124], pass: [79, 140], idle: [195, 150] };
const ALIAS = { counter: 'board' };
const pct = ([x, y]) => ({ x: (x / W) * 100, y: (y / H) * 100 });
export const SPOTS = Object.fromEntries(Object.entries(AT).map(([k, v]) => [k, pct(v)]));

export const STATION_LABEL = { fridge: 'Fridge', board: 'Prep', stove: 'Stove', oven: 'Oven', sink: 'Sink', pass: 'Serving' };

const lin = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function svg({ at, fridgeOpen, hot, ovenHot, ovenOwned, proBlender, water, knife, tray }) {
  const f = (id) => ST[id];
  const hl = at && ST[at] ? `<rect class="kfocus" x="${f(at)[0] - 3}" y="${f(at)[1] - 3}" width="${f(at)[2] + 6}" height="${f(at)[3] + 6}" rx="13"/>` : '';
  const burners = [[198, 40], [230, 40], [198, 72], [230, 72]];
  const flames = hot ? burners.slice(0, 2).map(([x, y]) => `<g class="kflame" transform="translate(${x} ${y})"><circle r="9" fill="none" stroke="#ff9f43" stroke-width="3" stroke-dasharray="4 3"/></g>`).join('') : '';
  const steam = hot ? [[198, 30, 0], [230, 30, 0.5]].map(([x, y, d]) => `<path class="ksteam" style="animation-delay:${d}s" d="M${x} ${y} q-5 -6 0 -11 q5 -5 0 -10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`).join('') : '';
  const drops = water ? [0, 1, 2].map((i) => `<ellipse class="kdrop" style="animation-delay:${i * 0.25}s" cx="${354 + (i - 1) * 3}" cy="${56 + i}" rx="2.4" ry="4" fill="#6ec6ff"/>`).join('') : '';
  const plates = Array.from({ length: 3 }, (_, i) => `<circle cx="${40 + i * 38}" cy="${186}" r="13" fill="#fff" stroke="#d3d9e6" stroke-width="1.5"/><circle cx="${40 + i * 38}" cy="186" r="8" fill="#f1f3f9"/><text x="${40 + i * 38}" y="${191}" font-size="13" text-anchor="middle">${tray[i] || ''}</text>`).join('');
  return `
<svg viewBox="0 0 ${W} ${H}" class="ksvg" role="img" aria-label="Kitchen from above">
<defs>
  ${lin('tWood', '#e0a560', '#b9772f')}${lin('tSteel', '#f1f5fa', '#b4c0cf')}${lin('tFridge', '#f6f9fd', '#cdd8e6')}${lin('tStove', '#7a8396', '#4a5163')}${lin('tStone', '#f7f2ea', '#d9d1c3')}
  <radialGradient id="tGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset="1" stop-color="#ff7a2b" stop-opacity=".1"/></radialGradient>
  <pattern id="tFloor" width="40" height="28" patternUnits="userSpaceOnUse"><rect width="40" height="28" fill="#f2c791"/><rect width="20" height="14" fill="#f9d9b1"/><rect x="20" y="14" width="20" height="14" fill="#f9d9b1"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#tFloor)"/>
<rect width="${W}" height="14" fill="#fff3dc"/><rect y="12" width="${W}" height="4" fill="#d99a58"/>
<rect x="0" y="100" width="${W}" height="40" fill="rgba(255,255,255,.12)"/>

<!-- fridge -->
<g>
<rect x="8" y="18" width="68" height="78" rx="9" fill="url(#tFridge)" stroke="#9fb0c4" stroke-width="2"/>
<rect x="14" y="24" width="56" height="30" rx="5" fill="rgba(255,255,255,.7)"/>
<path d="M8 60 H76" stroke="#9fb0c4" stroke-width="2"/><rect x="60" y="30" width="5" height="22" rx="2.5" fill="#7a8798"/><rect x="60" y="66" width="5" height="22" rx="2.5" fill="#7a8798"/>
<circle cx="24" cy="76" r="5" fill="#ffd23f"/><rect x="34" y="70" width="14" height="12" rx="3" fill="#ff7aa8"/>
${fridgeOpen ? `<path d="M8 96 L-10 112 H48 L76 96Z" fill="#dfe8f2" stroke="#9fb0c4" stroke-width="2"/><rect x="14" y="66" width="56" height="24" rx="4" fill="#eaf8ff"/><text x="22" y="85" font-size="14">🥛🧀🍎</text>` : ''}
</g>

<!-- prep counter -->
<g>
<rect x="82" y="18" width="88" height="78" rx="9" fill="url(#tWood)" stroke="#8d5620" stroke-width="2"/>
<rect x="88" y="24" width="76" height="66" rx="6" fill="url(#tStone)" stroke="#c8bfae" stroke-width="1.5"/>
<g class="${knife ? 'kknife' : ''}"><rect x="94" y="32" width="46" height="40" rx="5" fill="#e3b97b" stroke="#a8742f" stroke-width="1.5"/><circle cx="112" cy="50" r="8" fill="#ff9f43"/><circle cx="109" cy="47" r="2.4" fill="#ffd9a3"/>
<g transform="translate(124 40) rotate(28)"><rect x="0" y="0" width="22" height="6" rx="2" fill="#c0c7d3"/><rect x="20" y="-.5" width="11" height="7" rx="2" fill="#7a4d27"/></g></g>
<circle cx="150" cy="76" r="9" fill="#6ec6ff" stroke="#3a8dff" stroke-width="2"/><circle cx="150" cy="76" r="5.5" fill="#d9f0ff"/>
${proBlender ? '<circle cx="152" cy="40" r="8" fill="url(#tSteel)" stroke="#6f7a8a" stroke-width="1.5"/><circle cx="152" cy="40" r="3" fill="#3fc96b"/>' : '<circle cx="152" cy="40" r="7" fill="#aab6c4" stroke="#6f7a8a" stroke-width="1.5"/><circle cx="152" cy="40" r="2.5" fill="#5a6070"/>'}
</g>

<!-- stove -->
<g>
<rect x="176" y="18" width="76" height="78" rx="9" fill="url(#tStove)" stroke="#2f3542" stroke-width="2"/>
${burners.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#2b303c"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#525a6b" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="#525a6b" stroke-width="2"/>`).join('')}
${flames}
<g><circle cx="198" cy="40" r="11" fill="#9aa3b2" stroke="#5a6070" stroke-width="2"/><circle cx="198" cy="40" r="7.5" fill="#c0c7d3"/><rect x="207" y="38" width="16" height="4.5" rx="2" fill="#2b2d42"/></g>
<g><circle cx="230" cy="40" r="11" fill="#6a7284" stroke="#3a4050" stroke-width="2"/><circle cx="230" cy="40" r="8" fill="#3a4050"/><path d="M238 40 h14" stroke="#2b2d42" stroke-width="4" stroke-linecap="round"/></g>
<g fill="#c0c7d3"><circle cx="190" cy="90" r="3.4"/><circle cx="205" cy="90" r="3.4"/><circle cx="223" cy="90" r="3.4"/><circle cx="238" cy="90" r="3.4"/></g>
${steam}
</g>

<!-- oven -->
<g>
${ovenOwned ? `<rect x="256" y="18" width="66" height="78" rx="9" fill="url(#tSteel)" stroke="#6f7a8a" stroke-width="2.5"/>
<rect x="262" y="26" width="54" height="46" rx="6" fill="#e3e9f1" stroke="#9aa6b6" stroke-width="1.5"/>
<g stroke="#b4c0cf" stroke-width="2"><path d="M270 34 H308M270 42 H308M270 50 H308M270 58 H308"/></g>
<rect x="262" y="76" width="54" height="14" rx="5" fill="${ovenHot ? '#ff9a3c' : '#2b3242'}"/>${ovenHot ? '<ellipse class="kovenglow" cx="289" cy="83" rx="30" ry="9" fill="url(#tGlow)"/>' : ''}
<circle cx="272" cy="82" r="2.4" fill="#3fc96b"/>` : `<rect x="256" y="18" width="66" height="78" rx="9" fill="#2a2f3b" stroke="#6b7384" stroke-width="2.5" stroke-dasharray="6 4"/>
<rect x="262" y="26" width="54" height="46" rx="6" fill="#1b1f29"/><g transform="rotate(-8 289 52)"><rect x="262" y="44" width="54" height="16" rx="3" fill="#e8505b"/><text x="289" y="55.5" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">NO OVEN</text></g>`}
</g>

<!-- sink -->
<g>
<rect x="326" y="18" width="56" height="78" rx="9" fill="url(#tSteel)" stroke="#6f7a8a" stroke-width="2"/>
<rect x="333" y="42" width="42" height="46" rx="10" fill="#8ea2b6"/><rect x="337" y="46" width="34" height="38" rx="8" fill="#6f8397"/>
<circle cx="354" cy="32" r="5" fill="#9aa3b2"/><path d="M354 34 V50" stroke="#9aa3b2" stroke-width="4" stroke-linecap="round"/>
${drops}
</g>

<!-- serving counter -->
<g>
<rect x="8" y="144" width="142" height="72" rx="10" fill="url(#tWood)" stroke="#8d5620" stroke-width="2"/>
<rect x="14" y="150" width="130" height="60" rx="7" fill="url(#tStone)" stroke="#c8bfae" stroke-width="1.5"/>
<text x="79" y="164" font-size="9" font-weight="900" fill="#a8742f" text-anchor="middle">SERVING</text>
${plates}
</g>

<!-- room for future sections -->
<g fill="rgba(255,255,255,.35)" stroke="#c9a46a" stroke-width="2.5" stroke-dasharray="8 6">
<rect x="164" y="152" width="102" height="64" rx="10"/><rect x="278" y="152" width="104" height="64" rx="10"/></g>
<g font-weight="800" fill="#a8825a" text-anchor="middle"><text x="215" y="180" font-size="20">＋</text><text x="215" y="198" font-size="9">Bakery · soon</text>
<text x="330" y="180" font-size="20">＋</text><text x="330" y="198" font-size="9">Drinks bar · soon</text></g>
${hl}
</svg>`;
}

export function createKitchen() {
  let chef = 'idle';
  let anim = null;

  return {
    reset() {
      chef = 'idle';
      anim = null;
    },
    walkTo(station) {
      station = ALIAS[station] || station;
      if (!AT[station] || station === chef) return;
      anim = { from: chef, to: station };
      chef = station;
    },
    /** state: { at, doing, stepType, bubble, owned, tray } */
    scene(state) {
      const a = anim;
      anim = null;
      const from = SPOTS[a ? a.from : chef];
      const to = SPOTS[chef];
      const style = `--fx:${from.x}%;--fy:${from.y}%;--tx:${to.x}%;--ty:${to.y}%`;
      const active = state.stepType === 'heat' || state.stepType === 'flip' || state.stepType === 'tap' || state.making;
      const at = ALIAS[state.at] || state.at;
      const doing = state.doing;
      const owned = state.owned || [];
      return `
<div class="kitchen top">
  ${svg({ at, fridgeOpen: at === 'fridge' && doing, hot: at === 'stove' && active, ovenHot: at === 'oven' && active, ovenOwned: owned.includes('oven'), proBlender: owned.includes('blender'), water: at === 'sink' && doing, knife: at === 'board' && doing, tray: state.tray || [] })}
  <div class="kchef ${a ? 'walking' : ''} ${doing ? 'working' : ''}" style="${style}"><span class="kface">${chefTop()}</span></div>
  ${state.bubble ? `<div class="bubble kbubble">${state.bubble}</div>` : ''}
</div>`;
    },
  };
}
