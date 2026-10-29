# Happy Farm

Isometric farm game for ages 9–14 inspired by Happy Farm. Math, science and physics are learned by running the farm — the game never quizzes.
PixiJS v8 + Vite, plain JS modules, `localStorage` save (server-ready), installable PWA.

```bash
cd happy-farm && npm install
npm run dev      # http://localhost:5173
npm test         # sim unit tests + balance/dominant-strategy checks
npm run build
```

## What you do → what you learn
| In the game | Hidden learning |
|---|---|
| Choose crops for the season; watch soil bars | seasons, plant needs (water, nitrogen, sun) |
| Beans refill nitrogen, corn drains it; compost; fertilizer | nutrient cycle, crop rotation, decomposition |
| Market prices change daily, 7-day graph, selling lots drops the price | graphs, percent change, supply and demand |
| Orders as crates (¼ ½ ¾ 1), bulk offers vs. market unit price, Mia's swaps | fractions, unit price, ratios |
| Buy land: tiles × $10 + fence m × $2 | area and perimeter |
| Money tab: money in − out | profit and budgeting |
| Breed chickens/cows (golden gene H is dominant) | inheritance, probability (tier 3 shows odds) |
| Bees raise yield; ladybugs vs. spray (spray scares bees) | ecosystems and trade-offs |
| Well: bucket weight, pulleys, gears | force × distance, mechanical advantage |
| Delivery trucks: speed vs. time vs. fuel, with a deadline | speed = distance / time, cost trade-offs |
| Windmill (wind³), solar (daylight), battery, auto-pump | power, energy, supply vs. demand |

Tier (9–10 / 11–12 / 13–14) sets what is shown (fractions, gene letters, odds) and rises automatically when the child keeps choosing well. A parent area (hold 2 s) shows how often each skill's decision was good over the last 10 decisions, lets you change the tier, export or reset.

## Structure
```
src/core   clock (1 game day = 90 s), seeded rng, save/migrate
src/data   crops, items, animals, shop
src/sim    pure game rules (weather, soil, market, orders, breeding, machines, power, actions) — unit tested
src/view   Pixi scene (iso grid, pan/zoom, animals, weather FX) and procedural art
src/ui     HUD, panels, audio (sound off by default)
test/      node --test: sim rules and balance (dead-end and dominant-strategy checks)
docs/PLAN.md   plan and review decisions
```

## Notes
- Crops never die: missing water or nitrogen only slows growth. Offline time catches up (capped at 8 h).
- The first plant grows fast so the first harvest happens within a minute.
- Not in this build: irrigation pressure network, greenhouse, loans, accounts/server.
