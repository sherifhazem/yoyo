# Happy Farm — Execution Plan (ages 9–14)

Goal: a complete farm-sim where math, science and physics are learned by running the farm, never by quizzes in disguise.
Stack: PixiJS v8 + Vite, plain JS modules, `localStorage` save (server-ready). Mobile-first, English UI.

## Design rules (hidden learning)
1. **Learning = the tool the player needs, not a question gate.** Numbers are read/decided/computed because the farm needs it.
2. **No wrong-answer punishment.** A bad decision costs farm resources (dead crop, wasted water), never "Wrong!" popups. Feedback is the simulation.
3. **Always a tool that lets the child reason**: calculator-free, but with visible quantities (gauges, graphs, per-unit price).
4. **Difficulty tiers by age** chosen at start (9–10 / 11–12 / 13–14) change number ranges and which systems unlock, not the theme.
5. Every mechanic maps to a skill tag (`skills.js`); the parent view reads performance per tag from the event log.

## Systems → hidden skill
| System | Mechanic | Skill |
|---|---|---|
| Market | Daily price curve with supply/demand; sell where price is best | percent change, graphs, unit price, profit |
| Orders board | Customers want "3/4 of a crate", "2 for the price of 3", "−15%" | fractions, ratios, percent, discounts |
| Land | Buy plots; fence cost by perimeter, seed by area | area, perimeter, cost |
| Ledger | Income − costs = profit; loan with interest (tier 3) | arithmetic, interest, budgeting |
| Crops | Need light, water, nutrients; soil NPK bars; rotation restores N | plant biology, nutrient cycle |
| Weather/seasons | Season sets growth multipliers; rain fills tank | seasons, cause/effect |
| Breeding | Chicken/cow traits by dominant/recessive genes (Punnett grid shown as "family tree") | genetics, probability |
| Ecosystem | Bees raise yield, pests need ladybugs/scarecrow; chemicals harm bees | food webs, trade-offs |
| Irrigation | Pump + pipes; pressure drops with distance/height, valves share flow | pressure, flow, rates |
| Power | Windmill/solar/water-wheel; watts vs. machine demand; battery | energy, power, units |
| Simple machines | Well: lever / pulley / gears; choose the setup that lifts the bucket | mechanical advantage, ratios |
| Machines | Tractor speed, fuel, distance-time to market trips | speed = distance/time |
| Greenhouse | Insulation and heat; temperature bar vs. crop optimum | heat transfer |
| Quests | Story missions chaining the above | reading, planning |

## Architecture
```
happy-farm/src/
  core/   state.js (versioned save + migrate) · time.js (game clock, real-time catch-up) · events.js (bus) · rng.js (seeded)
  data/   crops.js animals.js items.js quests.js skills.js tiers.js
  sim/    soil.js weather.js market.js orders.js breeding.js ecosystem.js irrigation.js power.js machines.js
  view/   scene.js (Pixi, iso grid, z-sort) · art.js · fx.js (particles/tweens) · audio.js (WebAudio)
  ui/     hud.js panels.js (market, orders, ledger, lab, power, quests, parent) · i18n-free strings in data/
  main.js
```
- Sim modules are **pure** (state in, state out) so they can be unit tested with `node --test` without Pixi/DOM.
- Real-time growth stays timestamp-based (catch-up on load, capped at 8 h so a long absence is rewarded, not punished).
- Save v2 migrates the existing v1 prototype save.

## Phases (revised after Opus review)
Each phase ends with: build green, `node --test` green, Playwright smoke, commit + push.
- **P0 Foundation**: modular layout, save v2 (+v1 migration), clock/seeded weather, event bus, skill-evidence log, **remove the quiz gate** (bills are shown as per-unit price and total, never asked), PWA/offline, test harness.
- **P1 Farm core + first fun**: 5 crops, soil nitrogen and water, seasons/weather, land purchase (area/perimeter), harvest juice (pop, coins fly to HUD), 60-second guided first harvest and sale, minimal XP/levels.
- **P2 Economy + balance**: market curve with supply pressure and price graph, visual orders board (crates, no word problems), ledger, balance simulation script run in every later phase; dominant-strategy checks (reasoning must beat random by ≥20%).
- **P3 Animals and biology**: chicken, cow, bees; feed; simple inherited traits (tier 1: "runs in families", tier 3: probabilities); pollination and pests.
- **P4a Physics core**: well (pulleys/gears → force vs. time trade-off), delivery trips (speed vs. fuel vs. time), windmill/solar with battery (watts, wind cube law).
- **P5 Retention**: daily reward, sticker/collection book, farm decoration, neighbour NPC farm, quests/story, achievements, session-length nudge.
- **P6 Parent view**: evidence per skill defined as "chose the better option k of last n times" (see `skills.js`); tier auto-adjusts from play, age only sets the start; export/reset.
- **P7 Release**: README, balance pass, accessibility (colour-blind-safe bars, sound off by default), performance check.
- **Post-launch (not in this build)**: irrigation pressure network, greenhouse heat, loans with interest, cloud save/server.

## Review decisions
- Prototype `askTotal` quiz gate was removed in P0 (violated rules 1–2).
- P1 cut to 5 crops; physics split; balance simulation moved to P2; juice, onboarding and PWA moved early.
- Orders use visual crates; breeding stays qualitative at tier 1.

## Testing
- `node --test` unit tests for each sim module (growth, price curve bounds, breeding ratios, pressure/flow, power balance).
- Balance script simulates 30 game days with a scripted player to catch dead-ends (no money + no seeds must be impossible).
- Playwright smoke at 390×780 each phase; screenshot review.

## Risks
- **Scope**: mitigated by pure sim modules + phase gates; P5–P8 can ship incrementally.
- **Quiz-feel**: guarded by rule 1–2; every mechanic reviewed against "would a kid do this without being asked?".
- **Dead-ends/frustration**: starter bailout (free wheat seeds if broke), no permanent loss, offline catch-up cap.
- **Performance**: sprite caching of Graphics → textures, cap on animated objects, DPR ≤ 2.

## Status
Built: P0–P7 as revised above (see README). Deferred: irrigation network, greenhouse, loans, server/cloud save.
