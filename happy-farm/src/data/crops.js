// growDays: game days at 100% conditions. thirst: water/day. nUse: soil nitrogen used per day (legume < 0 adds).
// fit: season multiplier [Spring, Summer, Autumn, Winter]
export const CROPS = {
  wheat:   { name: 'Wheat',   icon: '🌾', seed: 2, sell: 5,  growDays: 1.5, thirst: 20, nUse: 6,  fit: [1, 0.55, 1, 0.4],     unlock: 1, color: 0xf2c230 },
  carrot:  { name: 'Carrot',  icon: '🥕', seed: 3, sell: 9,  growDays: 2,   thirst: 25, nUse: 5,  fit: [1, 0.4, 1, 0.2],     unlock: 2, color: 0xf08a1c },
  bean:    { name: 'Beans',   icon: '🫘', seed: 3, sell: 8,  growDays: 2,   thirst: 20, nUse: -8, fit: [1, 1, 0.45, 0.15],     unlock: 3, color: 0x3d9a2a, legume: true },
  corn:    { name: 'Corn',    icon: '🌽', seed: 5, sell: 15, growDays: 3,   thirst: 30, nUse: 9,  fit: [0.5, 1, 0.5, 0.1],   unlock: 5, color: 0xf6d743 },
  pumpkin: { name: 'Pumpkin', icon: '🎃', seed: 8, sell: 27, growDays: 4,   thirst: 35, nUse: 10, fit: [0.35, 0.7, 1, 0.1],   unlock: 7, color: 0xe8741a },
};
export const cropIds = Object.keys(CROPS);
