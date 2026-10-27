export const AISLES = [
  { id: 'fruit', label: 'Fruit', icon: '🍎' },
  { id: 'veg', label: 'Veggies', icon: '🥕' },
  { id: 'meat', label: 'Meat', icon: '🍗' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'bakery', label: 'Bakery', icon: '🍞' },
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
  { id: 'flour', emoji: '🌾', name: 'Flour', price: 2, aisle: 'bakery' },
  { id: 'butter', emoji: '🧈', name: 'Butter', price: 3, aisle: 'bakery' },
  { id: 'sugar', emoji: '🍬', name: 'Sugar', price: 1, aisle: 'bakery' },
];

export const BILLS = [1, 5, 10, 20, 50];
export const CUSTOMER_BILLS = [5, 10, 20, 50, 100];

export const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Sell price is always above ingredient cost, so a shift shows a real profit.
const chop = (ing, pieces, into) => ({ t: 'chop', ing, pieces, into });
const tap = (emoji, label, n) => ({ t: 'tap', emoji, label, n });
const OVEN = (target, secs) => ({ t: 'heat', what: 'oven', target, secs, at: 'oven' });
const PULL = (food) => ({ t: 'flip', food, at: 'oven', label: 'Pull it out when the marker is in the green!', btn: 'PULL OUT! 🧤' });

// Each dish is a short sequence of hands-on steps: chop, pour, tap, heat, flip.
export const RECIPES = [
  { id: 'salad', name: 'Fruit Salad', emoji: '🥗', ing: { apple: 1, banana: 1, orange: 1 }, price: 8,
    steps: [chop('apple', 4, 'bowl'), chop('banana', 3, 'bowl'), chop('orange', 2, 'bowl'), tap('🥄', 'Mix the salad!', 6)] },
  { id: 'omelette', name: 'Omelette', emoji: '🍳', ing: { egg: 2, cheese: 1 }, price: 12,
    steps: [tap('🥚', 'Crack the eggs!', 2), chop('cheese', 3, 'pan'), tap('🥄', 'Whisk it!', 8), { t: 'heat', what: 'pan', target: 160, secs: 3 }, { t: 'flip', food: '🍳' }] },
  { id: 'soup', name: 'Veggie Soup', emoji: '🍲', ing: { carrot: 1, tomato: 1, potato: 1 }, price: 7,
    steps: [chop('carrot', 4, 'pot'), chop('tomato', 2, 'pot'), chop('potato', 4, 'pot'), { t: 'pour', liquid: '💧', name: 'water', target: 3, color: '#6ec6ff' }, { t: 'heat', what: 'pot', target: 200, secs: 4 }] },
  { id: 'shake', name: 'Berry Shake', emoji: '🥤', ing: { milk: 1, berry: 1 }, price: 11,
    steps: [chop('berry', 2, 'blender'), { t: 'pour', liquid: '🥛', name: 'milk', target: 2, color: '#fffdf5' }, { ...tap('🌀', 'Blend it!', 10), pro: 5 }] },
  { id: 'stew', name: 'Chicken Stew', emoji: '🥘', ing: { chicken: 1, potato: 1 }, price: 12,
    steps: [chop('chicken', 4, 'pot'), chop('potato', 4, 'pot'), { t: 'pour', liquid: '🍵', name: 'broth', target: 2, color: '#e0b06a' }, { t: 'heat', what: 'pot', target: 180, secs: 4 }, { ...tap('🥄', 'Stir it!', 6), at: 'stove' }] },
  { id: 'fish', name: 'Fish & Chips', emoji: '🍟', ing: { fish: 1, potato: 1 }, price: 13,
    steps: [chop('potato', 6, 'fryer'), { t: 'heat', what: 'fryer', target: 180, secs: 3 }, { t: 'flip', food: '🐟' }] },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', ing: { flour: 1, cheese: 1, tomato: 1 }, price: 15, needs: 'oven',
    steps: [tap('🌾', 'Knead the dough!', 8), chop('tomato', 4, 'bowl'), chop('cheese', 4, 'bowl'), OVEN(200, 4), PULL('🍕')] },
  { id: 'bread', name: 'Fresh Bread', emoji: '🍞', ing: { flour: 2, butter: 1 }, price: 11, needs: 'oven',
    steps: [tap('🌾', 'Knead the dough!', 10), chop('butter', 3, 'bowl'), OVEN(180, 4), PULL('🍞')] },
  { id: 'cookies', name: 'Cookies', emoji: '🍪', ing: { flour: 1, butter: 1, egg: 1 }, price: 11, needs: 'oven',
    steps: [tap('🥚', 'Crack the egg!', 1), tap('🥄', 'Mix the dough!', 8), OVEN(160, 3), PULL('🍪')] },
  { id: 'cake', name: 'Birthday Cake', emoji: '🎂', ing: { flour: 1, egg: 2, sugar: 1, milk: 1 }, price: 17, needs: 'oven',
    steps: [tap('🥚', 'Crack the eggs!', 2), { t: 'pour', liquid: '🥛', name: 'milk', target: 2, color: '#fffdf5' }, tap('🥄', 'Mix the batter!', 10), OVEN(180, 5), PULL('🎂')] },
  { id: 'steak', name: 'Steak Dinner', emoji: '🍽️', ing: { steak: 1, broccoli: 1 }, price: 18,
    steps: [chop('broccoli', 3, 'pan'), { t: 'heat', what: 'grill', target: 220, secs: 3 }, { t: 'flip', food: '🥩' }, { t: 'flip', food: '🥩' }] },
];
export const recipeById = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const recipeCost = (r) => Object.entries(r.ing).reduce((s, [id, q]) => s + q * byId[id].price, 0);

export const orderCost = (order) =>
  order.reduce((s, l) => s + l.qty * byId[l.id].price, 0);

// Recipes available with the equipment the restaurant owns.
export const available = (owned) => RECIPES.filter((r) => !r.needs || owned.includes(r.needs));
// Selling price, including equipment bonuses (pro blender = fancier shakes).
export const SPECIAL_BONUS = 3;
export const dishPrice = (r, owned, special) => r.price + (r.id === 'shake' && owned.includes('blender') ? 2 : 0) + (r.id === special ? SPECIAL_BONUS : 0);

// Today's special: a dish the pantry can make, chosen fresh each shift.
export function pickSpecial(pantry, owned, plates) {
  if (plates <= 0) return null;
  const pool = available(owned).filter((r) => portionsLeft(r, pantry) > 0);
  return pool.length ? pool[rand(0, pool.length - 1)].id : null;
}

// A shopping list is the ingredient total for a few dishes the chef plans to cook.
export function makePlan(level, owned) {
  const pool = available(owned);
  const k = Math.min(level < 3 ? 2 : 3, pool.length);
  for (let i = 0; i < 60; i++) {
    const dishes = shuffle(pool).slice(0, k).map((r) => ({ id: r.id, qty: rand(1, 2) }));
    const need = {};
    for (const d of dishes) for (const [id, q] of Object.entries(recipeById[d.id].ing)) need[id] = (need[id] || 0) + q * d.qty;
    const order = Object.entries(need).map(([id, qty]) => ({ id, qty }));
    if (order.length <= 5 && orderCost(order) <= 40) return { order, dishes };
  }
  const r = pool[0];
  return { order: Object.entries(r.ing).map(([id, qty]) => ({ id, qty })), dishes: [{ id: r.id, qty: 1 }] };
}

export const portionsLeft = (r, stock) => Math.min(...Object.entries(r.ing).map(([id, q]) => Math.floor((stock[id] || 0) / q)));

// A customer only orders what the pantry (and the kitchen equipment) can make.
export function makeCustomerOrder(level, pantry, owned, plates = 99, special = null) {
  const stock = { ...pantry };
  const lines = [];
  let platesLeft = plates;
  const pool = available(owned);
  const n = level < 3 ? 1 : level < 5 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const can = platesLeft > 0 ? pool.filter((r) => !lines.some((l) => l.id === r.id) && portionsLeft(r, stock) > 0) : [];
    if (!can.length) break;
    const sp = i === 0 && special && can.find((r) => r.id === special);
    const r = sp && Math.random() < 0.6 ? sp : can[rand(0, can.length - 1)];
    const qty = rand(1, Math.min(2, portionsLeft(r, stock), platesLeft));
    for (const [id, q] of Object.entries(r.ing)) stock[id] -= q * qty;
    platesLeft -= qty;
    lines.push({ id: r.id, qty });
  }
  return lines;
}

export const dishTotal = (lines, owned, special) => lines.reduce((s, l) => s + l.qty * dishPrice(recipeById[l.id], owned, special), 0);

// Equipment the restaurant can buy at the Appliance Shop. The first five come with the kitchen.
export const EQUIPMENT = [
  { id: 'fridge', name: 'Fridge', emoji: '🧊', price: 0 },
  { id: 'stove', name: 'Stove', emoji: '🔥', price: 0 },
  { id: 'board', name: 'Cutting board', emoji: '🔪', price: 0 },
  { id: 'counter', name: 'Mixing counter', emoji: '🥣', price: 0 },
  { id: 'sink', name: 'Sink', emoji: '🚰', price: 0 },
  { id: 'blender', name: 'Pro blender', emoji: '🥤', price: 35, benefit: 'Shakes need half the blending and sell for $2 more.' },
  { id: 'sign', name: 'Neon sign', emoji: '✨', price: 40, benefit: 'Every customer leaves a $1 tip.' },
  { id: 'oven', name: 'Oven', emoji: '♨️', price: 60, benefit: 'Unlocks 4 baked dishes: pizza, bread, cookies and cake.' },
];
export const BASE_EQUIPMENT = ['fridge', 'stove', 'board', 'counter', 'sink'];

// Supplies the café uses up while serving: a plate per dish and a napkin per customer
// (a napkin earns a $1 tip). Bigger packs are cheaper per piece; one pack is on sale each visit.
export const SUPPLIES = [
  { id: 'plate', name: 'Plates', emoji: '🍽️', base: 1, use: 'One plate per dish served.',
    packs: [{ id: 'plate1', qty: 1, price: 1 }, { id: 'plate6', qty: 6, price: 5 }, { id: 'plate12', qty: 12, price: 9 }] },
  { id: 'napkin', name: 'Napkins', emoji: '🧻', base: 1, use: 'One napkin per customer → $1 tip.',
    packs: [{ id: 'napkin5', qty: 5, price: 3 }, { id: 'napkin10', qty: 10, price: 5 }, { id: 'napkin20', qty: 20, price: 9 }] },
];
export const START_SUPPLIES = { plate: 8, napkin: 4 };
const SALE_PACKS = ['napkin10', 'plate12', 'napkin20', 'plate6'];
export const saleFor = (visit) => SALE_PACKS[visit % SALE_PACKS.length];
// Buy 2, get 1 free on the sale pack.
export const paidPacks = (pack, count, sale) => count - (sale === pack.id ? Math.floor(count / 3) : 0);
export const saving = (supply, pack) => pack.qty * supply.base - pack.price;
