// Illustrated characters and dining-room furniture, drawn as inline SVG.
// Characters are built from a few parts (skin, hair, outfit, accessory) so the café can
// show a varied crowd without any image files.
import { shade } from './sprites.js';

let n = 0;
const uid = () => `a${++n}`;

const SKINS = ['#ffd5b0', '#f2b98a', '#d99a6c', '#a86b45', '#7a4a2b'];

/** Customers: appearance presets. `look` strings are stored in r.cust.face. */
export const LOOKS = [
  { skin: 0, hair: 'short', hc: '#4a2f1b', top: 'tee', tc: '#3a8dff' },
  { skin: 1, hair: 'ponytail', hc: '#2b2d42', top: 'tee', tc: '#ff7aa8' },
  { skin: 3, hair: 'curly', hc: '#1d1a1f', top: 'hoodie', tc: '#3fc96b' },
  { skin: 0, hair: 'long', hc: '#c9792b', top: 'dress', tc: '#a96bff' },
  { skin: 2, hair: 'cap', hc: '#e8505b', top: 'tee', tc: '#2b2d42', beard: true },
  { skin: 1, hair: 'bun', hc: '#cfd3dc', top: 'cardigan', tc: '#c0546b', glasses: true },
  { skin: 4, hair: 'short', hc: '#17151a', top: 'suit', tc: '#46506a', glasses: true },
  { skin: 0, hair: 'bald', hc: '#8a5a2b', top: 'cardigan', tc: '#4a8f6a', beard: true, glasses: true },
  { skin: 2, hair: 'long', hc: '#17151a', top: 'hoodie', tc: '#ffb020' },
  { skin: 1, hair: 'short', hc: '#9a5a2a', top: 'tee', tc: '#ff6b4a', freckles: true },
].map((l, i) => ({ ...l, id: i }));

export const randomLook = () => Math.floor(Math.random() * LOOKS.length);

const grad = (id, a, b, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function faceParts(skin, mood) {
  const ink = '#2b2d42';
  const mouth = {
    smile: `<path d="M41 61 Q50 68 59 61" fill="none" stroke="#9c3d3d" stroke-width="2.4" stroke-linecap="round"/>`,
    happy: `<path d="M40 59 Q50 74 60 59 Z" fill="#7a2431"/><path d="M43 66 Q50 70 57 66 Q50 64 43 66Z" fill="#ff8a9a"/><path d="M41.5 59.4 Q50 62 58.5 59.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`,
    talk: `<ellipse cx="50" cy="63" rx="5" ry="4.2" fill="#7a2431"/><ellipse cx="50" cy="65" rx="3" ry="1.6" fill="#ff8a9a"/>`,
  }[mood] || '';
  const brow = (x, flip) => `<path d="M${x - 6} ${flip ? 41 : 42} Q${x} ${flip ? 38 : 37} ${x + 6} ${flip ? 42 : 41}" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`;
  const eye = (x) => `<ellipse cx="${x}" cy="49" rx="3.6" ry="4.6" fill="${ink}"/><circle cx="${x + 1.2}" cy="47.3" r="1.5" fill="#fff"/><circle cx="${x - 1.2}" cy="50.6" r=".8" fill="#fff" opacity=".8"/>`;
  return `${brow(38, 0)}${brow(62, 1)}${eye(38)}${eye(62)}
  <ellipse cx="31" cy="58" rx="5" ry="3.2" fill="#ff6b6b" opacity=".22"/><ellipse cx="69" cy="58" rx="5" ry="3.2" fill="#ff6b6b" opacity=".22"/>
  <path d="M48 53 Q50 57 52 53" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="1.8" stroke-linecap="round"/>${mouth}`;
}

function hairBack(style, c) {
  const d = shade(c, -0.25);
  if (style === 'long') return `<path d="M22 44 Q20 26 50 20 Q80 26 78 44 L84 92 Q50 100 16 92Z" fill="${d}"/>`;
  if (style === 'ponytail') return `<path d="M72 30 Q96 34 90 62 Q88 76 80 80 Q84 60 70 44Z" fill="${d}"/><path d="M72 30 Q92 38 86 60" fill="none" stroke="${c}" stroke-width="2" opacity=".5"/>`;
  if (style === 'bun') return `<circle cx="50" cy="12" r="11" fill="${d}"/><circle cx="46" cy="9" r="4" fill="${c}" opacity=".6"/>`;
  return '';
}

function hairFront(style, c, id) {
  const d = shade(c, -0.25);
  const lite = shade(c, 0.25);
  const g = `<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lite}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  const f = `url(#${id}h)`;
  switch (style) {
    case 'short': return `${g}<path d="M24 46 Q18 20 50 17 Q82 20 76 46 Q72 32 60 30 Q46 34 34 28 Q28 34 24 46Z" fill="${f}"/><path d="M30 26 Q44 20 56 22" fill="none" stroke="#fff" stroke-width="2" opacity=".3" stroke-linecap="round"/>`;
    case 'ponytail': return `${g}<path d="M23 48 Q16 20 50 16 Q84 20 77 48 Q70 30 52 30 Q36 30 23 48Z" fill="${f}"/><rect x="70" y="30" width="7" height="6" rx="3" fill="#ff7aa8" transform="rotate(25 73 33)"/>`;
    case 'long': return `${g}<path d="M22 52 Q16 18 50 15 Q84 18 78 52 Q74 34 58 28 Q44 36 26 40Z" fill="${f}"/><path d="M28 28 Q44 18 62 22" fill="none" stroke="#fff" stroke-width="2" opacity=".3" stroke-linecap="round"/>`;
    case 'bun': return `${g}<path d="M24 46 Q20 22 50 19 Q80 22 76 46 Q64 34 50 34 Q36 34 24 46Z" fill="${f}"/>`;
    case 'curly': return `${g}<g fill="${f}"><circle cx="28" cy="34" r="10"/><circle cx="40" cy="22" r="11"/><circle cx="56" cy="20" r="11"/><circle cx="70" cy="30" r="10"/><circle cx="76" cy="44" r="7"/><circle cx="24" cy="46" r="7"/></g><circle cx="44" cy="20" r="3" fill="#fff" opacity=".18"/>`;
    case 'cap': return `${g}<path d="M24 40 Q22 14 50 13 Q78 14 76 40Z" fill="${c}"/><path d="M24 40 H76 V34 H24Z" fill="${d}"/><path d="M60 40 Q86 38 94 46 Q80 50 60 46Z" fill="${d}"/><circle cx="50" cy="13" r="3" fill="${d}"/><path d="M32 22 Q44 16 56 17" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>`;
    case 'bald': return `<path d="M26 40 Q24 30 30 26" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M74 40 Q76 30 70 26" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
    default: return '';
  }
}

function outfit(kind, c, id, full) {
  const d = shade(c, -0.22);
  const l = shade(c, 0.28);
  const top = full ? 84 : 82;
  const torso = `M12 122 Q12 ${top + 8} 34 ${top} H66 Q88 ${top + 8} 88 122Z`;
  const defs = grad(`${id}t`, l, d);
  const base = `<path d="${torso}" fill="url(#${id}t)"/>`;
  const neck = '';
  switch (kind) {
    case 'hoodie': return `${defs}${base}<path d="M30 ${top} Q50 ${top + 20} 70 ${top} Q64 ${top + 6} 50 ${top + 8} Q36 ${top + 6} 30 ${top}Z" fill="${d}"/><path d="M42 ${top + 10} V${top + 30} M58 ${top + 10} V${top + 30}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><rect x="34" y="106" width="32" height="12" rx="6" fill="${d}" opacity=".55"/>${neck}`;
    case 'dress': return `${defs}${base}<path d="M38 ${top} Q50 ${top + 14} 62 ${top}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="50" cy="${top + 22}" r="3" fill="#ffe066"/>`;
    case 'cardigan': return `${defs}${base}<path d="M38 ${top} L50 122 L62 ${top} L56 ${top} L50 100 L44 ${top}Z" fill="#fff" opacity=".9"/><path d="M50 ${top + 8} V122" stroke="${d}" stroke-width="2"/><circle cx="46" cy="104" r="2" fill="${d}"/><circle cx="46" cy="114" r="2" fill="${d}"/>`;
    case 'suit': return `${defs}${base}<path d="M38 ${top} L50 106 L62 ${top} Z" fill="#fff"/><path d="M47 ${top + 2} L53 ${top + 2} L55 ${top + 24} L50 ${top + 30} L45 ${top + 24}Z" fill="#e8505b"/><path d="M34 ${top} L46 ${top + 24} L40 ${top + 34} L24 ${top + 10}Z M66 ${top} L54 ${top + 24} L60 ${top + 34} L76 ${top + 10}Z" fill="${d}"/>`;
    case 'chef': return `${grad(`${id}t`, '#ffffff', '#d9dfea')}${base}<path d="M50 ${top + 2} V122" stroke="#c4ccdb" stroke-width="2"/><g fill="#c4ccdb"><circle cx="43" cy="${top + 16}" r="2.4"/><circle cx="43" cy="${top + 28}" r="2.4"/><circle cx="57" cy="${top + 16}" r="2.4"/><circle cx="57" cy="${top + 28}" r="2.4"/></g><path d="M34 ${top} L50 ${top + 14} L66 ${top} L62 ${top - 3} L50 ${top + 6} L38 ${top - 3}Z" fill="#e8505b"/><path d="M38 ${top - 2} L50 ${top + 6} L50 ${top + 14}Z" fill="#c63a30"/>`;
    case 'cashier': return `${grad(`${id}t`, '#7fc4ee', '#3a8dff')}${base}<path d="M38 ${top} L50 ${top + 12} L62 ${top} L58 ${top - 3} L50 ${top + 4} L42 ${top - 3}Z" fill="#fff"/><rect x="58" y="${top + 16}" width="16" height="9" rx="2" fill="#fff"/><rect x="60" y="${top + 19}" width="12" height="2" rx="1" fill="#3a8dff"/><rect x="60" y="${top + 22.4}" width="8" height="1.6" rx=".8" fill="#9db4d8"/>`;
    default: return `${defs}${base}<path d="M38 ${top} Q50 ${top + 13} 62 ${top}" fill="${d}"/><path d="M38 ${top} Q50 ${top + 10} 62 ${top}" fill="none" stroke="${l}" stroke-width="1.6" opacity=".7"/>`;
  }
}

/**
 * A bust portrait. o: { look (index into LOOKS), role: 'customer'|'chef'|'cashier', mood, size }
 */
export function person(o = {}) {
  const id = uid();
  const role = o.role || 'customer';
  const look = role === 'chef'
    ? { skin: 1, hair: 'none', hc: '#4a2f1b', top: 'chef', tc: '#fff', mustache: true }
    : role === 'cashier'
      ? { skin: 2, hair: 'short', hc: '#2b2d42', top: 'cashier', tc: '#3a8dff', glasses: true, visor: true }
      : LOOKS[(o.look ?? 0) % LOOKS.length] || LOOKS[0];
  const skin = SKINS[look.skin];
  const sk2 = shade(skin, -0.12);
  const sk3 = shade(skin, 0.3);
  const mood = o.mood || 'smile';
  const ink = '#2b2d42';
  const glasses = look.glasses ? `<g fill="rgba(190,230,255,.25)" stroke="${ink}" stroke-width="2"><circle cx="38" cy="49" r="8"/><circle cx="62" cy="49" r="8"/></g><path d="M46 49 H54" stroke="${ink}" stroke-width="2"/>` : '';
  const beard = look.beard ? `<path d="M26 56 Q26 82 50 84 Q74 82 74 56 Q70 70 50 70 Q30 70 26 56Z" fill="${shade(look.hc, -0.1)}"/><path d="M42 61 Q50 66 58 61" fill="none" stroke="#9c3d3d" stroke-width="2.4" stroke-linecap="round"/>` : '';
  const stache = look.mustache ? `<path d="M36 59 Q43 55 50 60 Q57 55 64 59 Q58 66 50 62 Q42 66 36 59Z" fill="#4a2f1b"/><path d="M38 59.5 Q43 57 49 60" fill="none" stroke="#fff" stroke-width="1.2" opacity=".25"/>` : '';
  const freckles = look.freckles ? `<g fill="#b9774b" opacity=".6"><circle cx="30" cy="55" r="1"/><circle cx="34" cy="58" r="1"/><circle cx="68" cy="58" r="1"/><circle cx="72" cy="55" r="1"/><circle cx="64" cy="55" r="1"/><circle cx="36" cy="55" r="1"/></g>` : '';
  const chefHat = role === 'chef'
    ? `<g><path d="M30 34 Q26 14 38 12 Q40 0 52 4 Q64 0 66 12 Q78 14 72 34Z" fill="#fff"/><path d="M30 34 Q26 14 38 12 Q40 0 52 4 Q64 0 66 12 Q78 14 72 34Z" fill="url(#${id}hat)"/><rect x="29" y="30" width="44" height="9" rx="3" fill="#eef1f7" stroke="#d3d9e6" stroke-width="1.2"/></g>`
    : '';
  const hatDefs = role === 'chef' ? `<radialGradient id="${id}hat" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#c9d1e0" stop-opacity=".75"/></radialGradient>` : '';
  const visor = look.visor ? `<path d="M22 38 Q22 18 50 17 Q78 18 78 38 Q50 30 22 38Z" fill="#2b2d42"/><path d="M26 36 Q50 28 74 36" fill="none" stroke="#fff" stroke-width="1.6" opacity=".25"/>` : '';
  const hf = role === 'chef' ? '' : hairFront(look.hair, look.hc, id);
  const hb = role === 'chef' ? '' : hairBack(look.hair, look.hc);
  const size = o.size || 64;
  return `<svg class="ppl ${o.cls || ''}" viewBox="0 0 100 122" width="${size}" height="${size * 1.22}" aria-hidden="true">
<defs>${hatDefs}${grad(`${id}s`, sk3, skin)}</defs>
<ellipse cx="50" cy="119" rx="40" ry="3.5" fill="rgba(0,0,0,.14)"/>
${hb}
<rect x="42" y="68" width="16" height="18" rx="6" fill="${sk2}"/>
${outfit(look.top, look.tc, id)}
<ellipse cx="24" cy="52" rx="4.6" ry="6.4" fill="${skin}"/><ellipse cx="76" cy="52" rx="4.6" ry="6.4" fill="${skin}"/>
<ellipse cx="24" cy="53" rx="2" ry="3.4" fill="${sk2}"/><ellipse cx="76" cy="53" rx="2" ry="3.4" fill="${sk2}"/>
<ellipse cx="50" cy="48" rx="26" ry="29" fill="url(#${id}s)"/>
<ellipse cx="41" cy="30" rx="11" ry="5" fill="#fff" opacity=".16"/>
${faceParts(skin, mood)}${freckles}${beard}${stache}${glasses}
${hf}${visor}${chefHat}
</svg>`;
}

/** A small full-body chef for the kitchen (legs animate through CSS when walking). */
export function chefFull() {
  const id = uid();
  const skin = SKINS[1];
  return `<svg class="pfull" viewBox="0 0 80 124" width="40" height="62" aria-hidden="true">
<defs>${grad(`${id}c`, '#ffffff', '#d3d9e6')}${grad(`${id}s`, shade(skin, 0.3), skin)}
<radialGradient id="${id}hat" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#c9d1e0" stop-opacity=".7"/></radialGradient></defs>
<g class="pleg a"><rect x="25" y="86" width="13" height="28" rx="5" fill="#3b4256"/><path d="M21 112 H40 Q41 122 34 122 H22Z" fill="#2b2d42"/></g>
<g class="pleg b"><rect x="42" y="86" width="13" height="28" rx="5" fill="#3b4256"/><path d="M40 112 H59 Q60 122 53 122 H41Z" fill="#2b2d42"/></g>
<g class="parm a"><rect x="9" y="52" width="13" height="30" rx="6" fill="url(#${id}c)" stroke="#c4ccdb" stroke-width="1.2"/><circle cx="15.5" cy="84" r="5.5" fill="${skin}"/></g>
<path d="M18 50 Q18 44 28 44 H52 Q62 44 62 50 V92 H18Z" fill="url(#${id}c)" stroke="#c4ccdb" stroke-width="1.2"/>
<path d="M40 46 V92" stroke="#c4ccdb" stroke-width="1.6"/>
<g fill="#c4ccdb"><circle cx="35" cy="58" r="2"/><circle cx="35" cy="68" r="2"/><circle cx="45" cy="58" r="2"/><circle cx="45" cy="68" r="2"/></g>
<path d="M22 92 H58 L56 98 H24Z" fill="#e8505b"/>
<path d="M28 44 L40 56 L52 44 L49 41 L40 48 L31 41Z" fill="#e8505b"/>
<g class="parm b"><rect x="58" y="52" width="13" height="30" rx="6" fill="url(#${id}c)" stroke="#c4ccdb" stroke-width="1.2"/><circle cx="64.5" cy="84" r="5.5" fill="${skin}"/></g>
<rect x="34" y="36" width="12" height="10" rx="4" fill="${shade(skin, -0.12)}"/>
<ellipse cx="40" cy="28" rx="15" ry="16" fill="url(#${id}s)"/>
<ellipse cx="33" cy="29" rx="2.2" ry="2.8" fill="#2b2d42"/><ellipse cx="47" cy="29" rx="2.2" ry="2.8" fill="#2b2d42"/>
<circle cx="33.8" cy="28" r=".9" fill="#fff"/><circle cx="47.8" cy="28" r=".9" fill="#fff"/>
<path d="M30 35 Q35 33 40 36 Q45 33 50 35 Q46 40 40 37 Q34 40 30 35Z" fill="#4a2f1b"/>
<path d="M34 40 Q40 44 46 40" fill="none" stroke="#9c3d3d" stroke-width="1.8" stroke-linecap="round"/>
<ellipse cx="27" cy="34" rx="3" ry="2" fill="#ff6b6b" opacity=".22"/><ellipse cx="53" cy="34" rx="3" ry="2" fill="#ff6b6b" opacity=".22"/>
<path d="M22 20 Q18 6 27 5 Q28 -3 37 0 Q40 -4 46 0 Q54 -3 54 5 Q62 6 58 20Z" fill="#fff" stroke="#d3d9e6" stroke-width="1"/>
<path d="M22 20 Q18 6 27 5 Q28 -3 37 0 Q40 -4 46 0 Q54 -3 54 5 Q62 6 58 20Z" fill="url(#${id}hat)"/>
<rect x="22" y="17" width="36" height="8" rx="3" fill="#eef1f7" stroke="#d3d9e6" stroke-width="1"/>
</svg>`;
}

/** Face-only chef used on the car body. Returns an SVG fragment (viewBox units follow the caller). */
export function chefHeadGroup(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="12" ry="13" fill="#ffd2a8"/><circle cx="-4.5" cy="-1" r="1.8" fill="#2b2d42"/><circle cx="4.5" cy="-1" r="1.8" fill="#2b2d42"/><path d="M-4 5 Q0 8 4 5" fill="none" stroke="#9c3d3d" stroke-width="1.6" stroke-linecap="round"/><path d="M-8 4 Q-4 2 0 5 Q4 2 8 4 Q4 9 0 6 Q-4 9 -8 4Z" fill="#4a2f1b"/><path d="M-13 -9 Q-17 -22 -8 -22 Q-8 -30 0 -27 Q8 -30 8 -22 Q17 -22 13 -9Z" fill="#fff"/><rect x="-13" y="-11" width="26" height="6" rx="2" fill="#eef1f7"/></g>`;
}

/* ---------- furniture ---------- */

function chair(x, y, dir, c = '#c0546b') {
  const d = shade(c, -0.25);
  const l = shade(c, 0.25);
  const back = {
    l: `<rect x="${x - 3}" y="${y - 8}" width="5" height="16" rx="2.5" fill="${d}"/>`,
    r: `<rect x="${x + 1}" y="${y - 8}" width="5" height="16" rx="2.5" fill="${d}"/>`,
    t: `<rect x="${x - 8}" y="${y - 3}" width="16" height="5" rx="2.5" fill="${d}"/>`,
    b: `<rect x="${x - 8}" y="${y + 1}" width="16" height="5" rx="2.5" fill="${d}"/>`,
  }[dir];
  return `<g><ellipse cx="${x}" cy="${y + 2}" rx="8.5" ry="8.5" fill="rgba(0,0,0,.14)"/>${back}<circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x - 1.5}" cy="${y - 1.8}" r="3.4" fill="${l}" opacity=".6"/></g>`;
}

/** Table seen from above (a little tilted), with chairs. seats: 2 | 4. */
export function tableSvg(seats, size = 54) {
  const id = uid();
  const set = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="4.6" fill="#fff" stroke="#d3d9e6" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="2.6" fill="#f1f3f9"/><rect x="${cx + 5.2}" y="${cy - 3}" width="1.4" height="6" rx=".7" fill="#aab4c8"/>`;
  const chairs = seats === 4
    ? chair(27, 7, 't') + chair(27, 47, 'b') + chair(7, 27, 'l') + chair(47, 27, 'r')
    : chair(8, 27, 'l') + chair(46, 27, 'r');
  const top = seats === 4
    ? `<rect x="14" y="14" width="26" height="26" rx="6" fill="rgba(0,0,0,.18)" transform="translate(0 3)"/><rect x="14" y="14" width="26" height="26" rx="6" fill="url(#${id}w)"/><rect x="16" y="16" width="22" height="22" rx="4" fill="url(#${id}c)"/>`
    : `<circle cx="27" cy="30" r="13.5" fill="rgba(0,0,0,.18)"/><circle cx="27" cy="27" r="13.5" fill="url(#${id}w)"/><circle cx="27" cy="27" r="11.5" fill="url(#${id}c)"/>`;
  const plates = seats === 4 ? set(27, 21) + set(27, 33) : set(21, 27) + set(33, 27);
  const deco = `<rect x="25.4" y="25.4" width="3.2" height="3.2" rx="1" fill="#ffe066"/><circle cx="27" cy="27" r="1" fill="#e8505b"/>`;
  return `<svg class="furn" viewBox="0 0 54 54" width="${size}" height="${size}" aria-hidden="true"><defs>${grad(`${id}w`, '#d99a58', '#a8742f')}<pattern id="${id}c" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff6e6"/><rect width="3" height="3" fill="#ffd9d9"/><rect x="3" y="3" width="3" height="3" fill="#ffd9d9"/></pattern></defs>${chairs}${top}${plates}${deco}</svg>`;
}

const DECOR = {
  flowers: `<ellipse cx="24" cy="42" rx="12" ry="3" fill="rgba(0,0,0,.14)"/>
<path d="M17 24 H31 L29 42 Q24 45 19 42Z" fill="url(#G)"/><path d="M17 24 H31" stroke="#fff" stroke-width="2" opacity=".5"/>
<g stroke="#3a9b52" stroke-width="2" stroke-linecap="round" fill="none"><path d="M24 26 V12"/><path d="M21 26 L14 14"/><path d="M27 26 L34 14"/></g>
<g><circle cx="24" cy="10" r="5.5" fill="#ff7aa8"/><circle cx="24" cy="10" r="2.2" fill="#ffe066"/><circle cx="13" cy="13" r="5" fill="#ffd23f"/><circle cx="13" cy="13" r="2" fill="#e8883a"/><circle cx="35" cy="13" r="5" fill="#a96bff"/><circle cx="35" cy="13" r="2" fill="#ffe066"/></g>`,
  plant: `<ellipse cx="24" cy="43" rx="13" ry="3" fill="rgba(0,0,0,.14)"/>
<path d="M24 30 Q10 28 8 12 Q22 12 24 30Z" fill="#3fc96b"/><path d="M24 30 Q38 28 40 12 Q26 12 24 30Z" fill="#2f9d4a"/><path d="M24 30 Q16 20 22 4 Q32 16 24 30Z" fill="#58de82"/>
<path d="M24 30 V10 M24 28 L12 16 M24 28 L36 16" stroke="#1f7a37" stroke-width="1.1" fill="none" opacity=".6"/>
<path d="M14 30 H34 L31 44 H17Z" fill="url(#G)"/><rect x="12" y="28" width="24" height="5" rx="2.5" fill="#e0733f"/>`,
  lamp: `<ellipse cx="24" cy="44" rx="10" ry="2.6" fill="rgba(0,0,0,.14)"/>
<circle cx="24" cy="14" r="15" fill="url(#GL)"/>
<rect x="22.4" y="22" width="3.2" height="20" rx="1.6" fill="#6b7385"/><ellipse cx="24" cy="42" rx="8" ry="2.6" fill="#4b5563"/>
<path d="M14 22 L18 6 H30 L34 22Z" fill="url(#G)"/><path d="M18 6 H30" stroke="#fff" stroke-width="1.6" opacity=".5"/>`,
  tank: `<ellipse cx="24" cy="43" rx="19" ry="3" fill="rgba(0,0,0,.14)"/>
<rect x="4" y="12" width="40" height="28" rx="5" fill="url(#G)" stroke="#e9eef4" stroke-width="3"/>
<rect x="4" y="8" width="40" height="6" rx="3" fill="#aab6c4"/><rect x="4" y="38" width="40" height="5" rx="2.5" fill="#6f7a8a"/>
<path d="M7 36 Q14 31 20 36 Q28 30 41 36 V38 H7Z" fill="#f0d49a"/><path d="M33 36 q-1 -8 2 -11 q3 4 1 11" fill="#2f9d4a"/><path d="M12 36 q-2 -6 1 -9 q2 3 0 9" fill="#3fc96b"/>
<g><ellipse cx="22" cy="24" rx="5" ry="3.2" fill="#ff8a3d"/><path d="M26.5 24 L31 20.5 V27.5Z" fill="#ff8a3d"/><circle cx="19.5" cy="23.2" r=".9" fill="#2b2d42"/></g>
<g><ellipse cx="34" cy="30" rx="3.4" ry="2.2" fill="#6ec6ff"/><path d="M31 30 L27.6 27.8 V32.2Z" fill="#6ec6ff"/></g>
<g fill="none" stroke="#fff" stroke-width="1" opacity=".8"><circle cx="12" cy="30" r="1.6"/><circle cx="14" cy="24" r="1.2"/><circle cx="11" cy="19" r="1"/></g>
<path d="M8 15 H14 L10 38 H8Z" fill="#fff" opacity=".25"/>`,
};
const DECOR_FILL = {
  flowers: ['#9fd4ff', '#4a90d9'],
  plant: ['#e8883a', '#a8531c'],
  lamp: ['#ffe9a8', '#ffc531'],
  tank: ['#9fe6ff', '#3a9ad8'],
};

export const hasDecor = (id) => id in DECOR;

export function decorSvg(id, size = 44) {
  const u = uid();
  const [a, b] = DECOR_FILL[id];
  const body = DECOR[id].replace(/url\(#GL\)/g, `url(#${u}l)`).replace(/url\(#G\)/g, `url(#${u}g)`);
  return `<svg class="furn" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><defs>${grad(`${u}g`, a, b)}<radialGradient id="${u}l"><stop offset="0" stop-color="#ffe066" stop-opacity=".75"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient></defs>${body}</svg>`;
}

/* ---------- restaurant wall decorations ---------- */

export function windowSvg() {
  const id = uid();
  return `<svg class="rwall win" viewBox="0 0 70 66" width="70" height="66" aria-hidden="true"><defs>${grad(`${id}s`, '#9fdcff', '#d9f3ff')}</defs>
<rect x="4" y="2" width="62" height="54" rx="6" fill="#fff" stroke="#e3c28f" stroke-width="2"/><rect x="9" y="7" width="52" height="44" rx="3" fill="url(#${id}s)"/>
<circle cx="48" cy="20" r="7" fill="#ffe066"/><ellipse cx="22" cy="26" rx="11" ry="4.5" fill="#fff"/><ellipse cx="30" cy="22" rx="7" ry="4" fill="#fff"/>
<path d="M9 40 Q22 32 34 38 Q46 32 61 40 V51 H9Z" fill="#7fd48a"/><path d="M35 7V51M9 29H61" stroke="#fff" stroke-width="3"/>
<path d="M12 9 L30 30 L12 30Z" fill="#fff" opacity=".35"/><rect x="0" y="54" width="70" height="7" rx="3" fill="#c88a45"/>
<g transform="translate(12 46)"><path d="M0 8 H10 L9 16 H1Z" fill="#e0733f"/><path d="M5 8 Q-1 0 5 -4 Q11 0 5 8" fill="#3fc96b"/></g></svg>`;
}

export function frameSvg() {
  return `<svg class="rwall pic" viewBox="0 0 60 66" width="56" height="62" aria-hidden="true">
<rect x="4" y="4" width="52" height="46" rx="4" fill="#a8742f" stroke="#7a4d27" stroke-width="2"/><rect x="9" y="9" width="42" height="36" rx="2" fill="#fff6e6"/>
<path d="M9 36 Q20 26 30 34 Q40 24 51 34 V45 H9Z" fill="#ffd9a3"/><circle cx="40" cy="20" r="5" fill="#ff9f43"/>
<g transform="translate(18 14)"><path d="M0 12 Q0 4 6 4 Q12 4 12 12Z" fill="#fff" stroke="#c4ccdb" stroke-width="1"/><rect x="0" y="12" width="12" height="3" rx="1.5" fill="#e8505b"/></g>
<rect x="14" y="54" width="32" height="8" rx="4" fill="#e8505b"/><rect x="18" y="56.5" width="24" height="1.6" rx=".8" fill="#fff" opacity=".7"/></svg>`;
}

export function pendantSvg(color = '#e8505b') {
  return `<svg class="rwall pend" viewBox="0 0 30 56" width="26" height="48" aria-hidden="true">
<path d="M15 0 V22" stroke="#6b7385" stroke-width="2"/><path d="M4 38 Q4 22 15 22 Q26 22 26 38Z" fill="${color}"/><path d="M8 34 Q8 26 14 25" fill="none" stroke="#fff" stroke-width="2" opacity=".4" stroke-linecap="round"/>
<ellipse cx="15" cy="39" rx="11" ry="3" fill="#ffe9a8"/><path d="M5 40 H25 L31 56 H-1Z" fill="#ffe066" opacity=".22"/></svg>`;
}

export function registerSvg() {
  return `<svg class="rwall reg" viewBox="0 0 54 44" width="48" height="39" aria-hidden="true">
<rect x="4" y="22" width="46" height="20" rx="4" fill="#4b5563"/><rect x="4" y="22" width="46" height="6" rx="3" fill="#6b7385"/>
<rect x="10" y="6" width="26" height="14" rx="3" fill="#2b2d42"/><rect x="12" y="8" width="22" height="9" rx="2" fill="#3fc96b"/><text x="23" y="15.5" font-size="7" font-weight="900" fill="#0d3b1e" text-anchor="middle">$ 0</text>
<g fill="#aab6c4"><rect x="10" y="30" width="6" height="4" rx="1"/><rect x="19" y="30" width="6" height="4" rx="1"/><rect x="28" y="30" width="6" height="4" rx="1"/></g><rect x="38" y="30" width="8" height="8" rx="2" fill="#ffd23f"/></svg>`;
}

/** Hot-dish steam / cloche for the counter tray is drawn via emoji; this is the bell. */
export function bellSvg() {
  return `<svg class="rwall bell" viewBox="0 0 40 30" width="34" height="26" aria-hidden="true"><ellipse cx="20" cy="26" rx="16" ry="3" fill="#8c98a8"/><path d="M6 24 Q6 6 20 6 Q34 6 34 24Z" fill="#ffd23f"/><path d="M11 20 Q11 11 18 10" fill="none" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/><circle cx="20" cy="5" r="3" fill="#e8a600"/></svg>`;
}
