// Every mechanic reports a decision here. `good` means the child picked the better option.
export const SKILLS = {
  season:    'Planting in the right season (seasons)',
  nutrient:  'Keeping soil nitrogen up (plant nutrients)',
  rotation:  'Using beans to refill soil (crop rotation)',
  market:    'Selling when prices are high (graphs, percent)',
  unitprice: 'Comparing price per item (unit price)',
  fractions: 'Filling orders by fractions of a crate',
  area:      'Planning land: area and fence length',
  profit:    'Spending less than you earn (profit)',
  genetics:  'Breeding traits (inheritance)',
  mechanics: 'Choosing pulleys and gears (force vs distance)',
  speed:     'Picking a delivery speed (speed = distance / time)',
  power:     'Balancing power supply and demand (energy)',
  ecology:   'Helping bees and ladybugs (ecosystems)',
};
const KEEP = 10;
export function record(state, skill, good) {
  const a = state.evidence[skill] || (state.evidence[skill] = []);
  a.push(good ? 1 : 0);
  if (a.length > KEEP) a.shift();
}
export function score(state, skill) {
  const a = state.evidence[skill] || [];
  if (a.length < 3) return null;           // not enough evidence yet
  return a.reduce((x, y) => x + y, 0) / a.length;
}
