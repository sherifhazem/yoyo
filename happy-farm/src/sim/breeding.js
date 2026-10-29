import { ANIMALS, PEN_LIMIT } from '../data/items.js';
import { rand01, hash } from '../core/rng.js';

// Gene "H" (dominant, high yield) or "h" (recessive). A genotype is two alleles.
export const phenotype = (a) => (a.genes.includes('H') ? 'H' : 'h');
export const GENO_LABEL = { HH: 'both parents gave it', Hh: 'carries it', hH: 'carries it', hh: 'does not have it' };
export const yieldMult = (a) => (phenotype(a) === 'H' ? 1.6 : 1);

export function newAnimal(s, type, genes) {
  return { id: s.nextId++, type, genes: genes || [rand01('g', s.nextId) < 0.25 ? 'H' : 'h', 'h'], fed: 1, progress: 0, ready: 0, age: 1 };
}
// each parent passes one random allele
export function breed(s, a, b, seedExtra = 0) {
  const r = (n) => rand01('breed', a.id, b.id, s.nextId, seedExtra, n);
  const g = [a.genes[r(1) < 0.5 ? 0 : 1], b.genes[r(2) < 0.5 ? 0 : 1]];
  return newAnimal(s, a.type, g.sort());
}
// probabilities for the parent pair (tier 3 display)
export function offspringOdds(a, b) {
  const pa = a.genes.filter((x) => x === 'H').length / 2;
  const pb = b.genes.filter((x) => x === 'H').length / 2;
  const hh = (1 - pa) * (1 - pb);          // no H at all
  return { high: 1 - hh, plain: hh };
}
export const canBreed = (s, a, b) => a && b && a !== b && a.type === b.type && a.age >= 1 && b.age >= 1 && s.animals.length < PEN_LIMIT;

// animals eat, then produce
export function stepAnimals(s, dt) {
  for (const a of s.animals) {
    const def = ANIMALS[a.type];
    if (a.fed > 0) {
      a.fed = Math.max(0, a.fed - dt);                  // one feeding lasts a game day
      a.progress += (dt / def.everyDays) * yieldMult(a);
      while (a.progress >= 1 && a.ready < 3) { a.progress -= 1; a.ready++; }
      if (a.ready >= 3) a.progress = Math.min(a.progress, 0.99);
    }
    a.age += dt;
  }
}
