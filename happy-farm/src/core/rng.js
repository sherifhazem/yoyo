// Deterministic helpers: the same (seed) always gives the same number, so weather and prices can be replayed.
export function hash(...parts) {
  let h = 2166136261;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 0x9e3779b9; h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export const rand01 = (...parts) => hash(...parts) / 4294967296;

// smooth noise in [0,1] over days (linear blend of per-day randoms)
export function smooth(day, salt) {
  const d0 = Math.floor(day);
  const t = day - d0;
  const a = rand01(salt, d0), b = rand01(salt, d0 + 1);
  const s = t * t * (3 - 2 * t);
  return a + (b - a) * s;
}
