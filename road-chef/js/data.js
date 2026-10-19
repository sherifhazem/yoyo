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

export const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// Difficulty rises with level: more lines, bigger quantities.
export function makeOrder(level) {
  const lines = Math.min(2 + Math.floor((level - 1) / 2), 4);
  const maxQty = level < 3 ? 2 : 3;
  const pool = [...ITEMS].sort(() => Math.random() - 0.5);
  const order = [];
  let total = 0;
  for (const item of pool) {
    if (order.length === lines) break;
    const qty = rand(1, maxQty);
    if (total + qty * item.price > 35) continue;
    order.push({ id: item.id, qty });
    total += qty * item.price;
  }
  return order;
}

export const orderCost = (order) =>
  order.reduce((s, l) => s + l.qty * byId[l.id].price, 0);
