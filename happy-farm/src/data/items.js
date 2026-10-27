import { CROPS } from './crops.js';

export const PRODUCTS = {
  egg:   { name: 'Egg',   icon: '🥚', sell: 4 },
  milk:  { name: 'Milk',  icon: '🥛', sell: 10 },
  honey: { name: 'Honey', icon: '🍯', sell: 14 },
};
// everything sellable
export const GOODS = {
  ...Object.fromEntries(Object.entries(CROPS).map(([k, c]) => [k, { name: c.name, icon: c.icon, sell: c.sell }])),
  ...PRODUCTS,
};
export const goodIds = Object.keys(GOODS);

export const ANIMALS = {
  chicken: { name: 'Chicken', icon: '🐔', price: 25, unlock: 4, product: 'egg', everyDays: 0.5, feed: 1, trait: 'Golden', unitName: 'egg' },
  cow:     { name: 'Cow',     icon: '🐄', price: 80, unlock: 8, product: 'milk', everyDays: 1,  feed: 2, trait: 'Spotted', unitName: 'milk' },
};
export const PEN_LIMIT = 6;
export const BARN_LIMIT = 40;           // total goods the barn holds

export const SHOP = {
  hive:      { name: 'Beehive',     icon: '🐝', price: 30, unlock: 5, max: 3, note: 'Bees help crops give more' },
  ladybugs:  { name: 'Ladybugs',    icon: '🐞', price: 6,  unlock: 5, note: 'Eat pests safely', consumable: true },
  fertilizer:{ name: 'Fertilizer',  icon: '🧪', price: 5,  unlock: 2, note: '+30 nitrogen to a tile', consumable: true },
  windmill:  { name: 'Windmill',    icon: '🌬️', price: 60, unlock: 6, max: 2, note: 'Power from wind' },
  solar:     { name: 'Solar panel', icon: '☀️', price: 50, unlock: 6, max: 2, note: 'Power from sunlight' },
  battery:   { name: 'Battery',     icon: '🔋', price: 40, unlock: 6, max: 2, note: 'Stores power for the night' },
  pump:      { name: 'Auto-pump',   icon: '⚙️', price: 70, unlock: 6, max: 1, note: 'Fills the tank using power' },
  truck:     { name: 'Truck',       icon: '🚚', price: 90, unlock: 8, max: 1, note: 'Deliver to the city' },
};
