export const AISLES = [
  { id: 'fruit', label: 'Fruit', icon: '🍎' },
  { id: 'veg', label: 'Veggies', icon: '🥕' },
  { id: 'meat', label: 'Meat', icon: '🍗' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
];

export const ITEMS = [
  { id: 'apple', emoji: '🍎', name: 'Apple', price: 2, aisle: 'fruit' },
  { id: 'banana', emoji: '🍌', name: 'Banana', price: 1, aisle: 'fruit' },
  { id: 'orange', emoji: '🍊', name: 'Orange', price: 2, aisle: 'fruit' },
  { id: 'berry', emoji: '🍓', name: 'Berries', price: 4, aisle: 'fruit' },
  { id: 'carrot', emoji: '🥕', name: 'Carrot', price: 1, aisle: 'veg' },
  { id: 'tomato', emoji: '🍅', name: 'Tomato', price: 2, aisle: 'veg' },
  { id: 'potato', emoji: '🥔', name: 'Potato', price: 1, aisle: 'veg' },
  { id: 'broccoli', emoji: '🥦', name: 'Broccoli', price: 3, aisle: 'veg' },
  { id: 'chicken', emoji: '🍗', name: 'Chicken', price: 6, aisle: 'meat' },
  { id: 'steak', emoji: '🥩', name: 'Steak', price: 9, aisle: 'meat' },
  { id: 'fish', emoji: '🐟', name: 'Fish', price: 7, aisle: 'meat' },
  { id: 'milk', emoji: '🥛', name: 'Milk', price: 3, aisle: 'dairy' },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', price: 4, aisle: 'dairy' },
  { id: 'egg', emoji: '🥚', name: 'Eggs', price: 2, aisle: 'dairy' },
];

export const BILLS = [1, 5, 10, 20];
export const CUSTOMER_BILLS = [5, 10, 20, 50, 100];

export const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Sell price is always above ingredient cost, so a shift shows a real profit.
const chop = (ing, pieces, into) => ({ t: 'chop', ing, pieces, into });
const tap = (emoji, label, n) => ({ t: 'tap', emoji, label, n });

// Each dish is a short sequence of hands-on steps: chop, pour, tap, heat, flip.
export const RECIPES = [
  { id: 'salad', name: 'Fruit Salad', emoji: '🥗', ing: { apple: 1, banana: 1, orange: 1 }, price: 8,
    steps: [chop('apple', 4, 'bowl'), chop('banana', 3, 'bowl'), chop('orange', 2, 'bowl'), tap('🥄', 'Mix the salad!', 6)] },
  { id: 'omelette', name: 'Omelette', emoji: '🍳', ing: { egg: 2, cheese: 1 }, price: 12,
    steps: [tap('🥚', 'Crack the eggs!', 2), chop('cheese', 3, 'pan'), tap('🥄', 'Whisk it!', 8), { t: 'heat', what: 'pan', target: 160, secs: 3 }, { t: 'flip', food: '🍳' }] },
  { id: 'soup', name: 'Veggie Soup', emoji: '🍲', ing: { carrot: 1, tomato: 1, potato: 1 }, price: 7,
    steps: [chop('carrot', 4, 'pot'), chop('tomato', 2, 'pot'), chop('potato', 4, 'pot'), { t: 'pour', liquid: '💧', name: 'water', target: 3, color: '#6ec6ff' }, { t: 'heat', what: 'pot', target: 200, secs: 4 }] },
  { id: 'shake', name: 'Berry Shake', emoji: '🥤', ing: { milk: 1, berry: 1 }, price: 11,
    steps: [chop('berry', 2, 'blender'), { t: 'pour', liquid: '🥛', name: 'milk', target: 2, color: '#fffdf5' }, tap('🌀', 'Blend it!', 10)] },
  { id: 'stew', name: 'Chicken Stew', emoji: '🥘', ing: { chicken: 1, potato: 1 }, price: 12,
    steps: [chop('chicken', 4, 'pot'), chop('potato', 4, 'pot'), { t: 'pour', liquid: '🍵', name: 'broth', target: 2, color: '#e0b06a' }, { t: 'heat', what: 'pot', target: 180, secs: 4 }, { ...tap('🥄', 'Stir it!', 6), at: 'stove' }] },
  { id: 'fish', name: 'Fish & Chips', emoji: '🍟', ing: { fish: 1, potato: 1 }, price: 13,
    steps: [chop('potato', 6, 'fryer'), { t: 'heat', what: 'fryer', target: 180, secs: 3 }, { t: 'flip', food: '🐟' }] },
  { id: 'steak', name: 'Steak Dinner', emoji: '🍽️', ing: { steak: 1, broccoli: 1 }, price: 18,
    steps: [chop('broccoli', 3, 'pan'), { t: 'heat', what: 'grill', target: 220, secs: 3 }, { t: 'flip', food: '🥩' }, { t: 'flip', food: '🥩' }] },
];
export const recipeById = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const recipeCost = (r) => Object.entries(r.ing).reduce((s, [id, q]) => s + q * byId[id].price, 0);

export const orderCost = (order) =>
  order.reduce((s, l) => s + l.qty * byId[l.id].price, 0);

// A shopping list is the ingredient total for a few dishes the chef plans to cook.
export function makePlan(level) {
  const k = level < 3 ? 2 : 3;
  for (let i = 0; i < 60; i++) {
    const dishes = shuffle(RECIPES).slice(0, k).map((r) => ({ id: r.id, qty: rand(1, 2) }));
    const need = {};
    for (const d of dishes) for (const [id, q] of Object.entries(recipeById[d.id].ing)) need[id] = (need[id] || 0) + q * d.qty;
    const order = Object.entries(need).map(([id, qty]) => ({ id, qty }));
    if (order.length <= 5 && orderCost(order) <= 40) return { order, dishes };
  }
  const r = RECIPES[0];
  return { order: Object.entries(r.ing).map(([id, qty]) => ({ id, qty })), dishes: [{ id: r.id, qty: 1 }] };
}

export const portionsLeft = (r, stock) => Math.min(...Object.entries(r.ing).map(([id, q]) => Math.floor((stock[id] || 0) / q)));

// A customer only orders what the pantry can actually make.
export function makeCustomerOrder(level, pantry) {
  const stock = { ...pantry };
  const lines = [];
  const n = level < 3 ? 1 : level < 5 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const can = RECIPES.filter((r) => !lines.some((l) => l.id === r.id) && portionsLeft(r, stock) > 0);
    if (!can.length) break;
    const r = can[rand(0, can.length - 1)];
    const qty = rand(1, Math.min(2, portionsLeft(r, stock)));
    for (const [id, q] of Object.entries(r.ing)) stock[id] -= q * qty;
    lines.push({ id: r.id, qty });
  }
  return lines;
}

export const dishTotal = (lines) => lines.reduce((s, l) => s + l.qty * recipeById[l.id].price, 0);

// Kitchen equipment. `owned` ones are drawn in the kitchen; the rest are planned
// upgrades for the Appliance Shop (price in dollars, what they unlock).
export const EQUIPMENT = [
  { id: 'fridge', name: 'Fridge', emoji: '🧊', price: 0 },
  { id: 'stove', name: 'Stove', emoji: '🔥', price: 0 },
  { id: 'board', name: 'Cutting board', emoji: '🔪', price: 0 },
  { id: 'counter', name: 'Mixing counter', emoji: '🥣', price: 0 },
  { id: 'sink', name: 'Sink', emoji: '🚰', price: 0 },
  { id: 'oven', name: 'Oven', emoji: '♨️', price: 60, unlocks: 'baked dishes' },
  { id: 'blender', name: 'Pro blender', emoji: '🥤', price: 35, unlocks: 'faster shakes' },
  { id: 'fridge2', name: 'Big fridge', emoji: '🧊', price: 80, unlocks: 'bigger pantry' },
];
