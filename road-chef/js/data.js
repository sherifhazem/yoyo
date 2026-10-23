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
export const RECIPES = [
  { id: 'salad', name: 'Fruit Salad', emoji: '🥗', ing: { apple: 1, banana: 1, orange: 1 }, price: 8 },
  { id: 'omelette', name: 'Omelette', emoji: '🍳', ing: { egg: 2, cheese: 1 }, price: 12 },
  { id: 'soup', name: 'Veggie Soup', emoji: '🍲', ing: { carrot: 1, tomato: 1, potato: 1 }, price: 7 },
  { id: 'shake', name: 'Berry Shake', emoji: '🥤', ing: { milk: 1, berry: 1 }, price: 11 },
  { id: 'stew', name: 'Chicken Stew', emoji: '🥘', ing: { chicken: 1, potato: 1 }, price: 12 },
  { id: 'fish', name: 'Fish & Chips', emoji: '🍟', ing: { fish: 1, potato: 1 }, price: 13 },
  { id: 'steak', name: 'Steak Dinner', emoji: '🍽️', ing: { steak: 1, broccoli: 1 }, price: 18 },
];
export const recipeById = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const recipeCost = (r) => Object.entries(r.ing).reduce((s, [id, q]) => s + q * byId[id].price, 0);

export const orderCost = (order) =>
  order.reduce((s, l) => s + l.qty * byId[l.id].price, 0);

// A shopping list is the ingredient total for a few dishes the chef plans to cook.
export function makePlan(level) {
  const k = level < 3 ? 2 : 3;
  for (let i = 0; i < 60; i++) {
    const dishes = shuffle(RECIPES).slice(0, k).map((r) => ({ id: r.id, qty: level < 2 ? 1 : rand(1, 2) }));
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
    const qty = rand(1, Math.min(level < 2 ? 1 : 2, portionsLeft(r, stock)));
    for (const [id, q] of Object.entries(r.ing)) stock[id] -= q * qty;
    lines.push({ id: r.id, qty });
  }
  return lines;
}

export const dishTotal = (lines) => lines.reduce((s, l) => s + l.qty * recipeById[l.id].price, 0);
