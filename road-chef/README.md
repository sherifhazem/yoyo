# Road Chef 🚗🍽️

Mobile-first math & money game for ages 7–9 (English, US dollars).
The child drives to shops, buys ingredients from a list, works out the total,
pays with bills and counts the change. Progress (wallet, stars, trips) is saved in `localStorage`.

Plain HTML/CSS/JS (no build, no dependencies). Run:

```bash
cd road-chef && python3 -m http.server 8000   # open on a phone-sized viewport
```

## Done (prototype)
- Home → map → **driving mini-game** → Fresh Grocery (4 aisles, list check, cart) → total → pay → change → reward.
- Difficulty scales with trips (more lines, larger quantities).

## Driving mini-game (≤ 60 s: 40–55 s depending on level)
- Canvas pseudo-3D road, drag to steer; grab coins (5 coins = $1), gift boxes (+$3), dodge cones/rocks/crates/cows.
- 12 coins in a row = TURBO (smash obstacles). A crash only slows the car, money is never lost.
- Math gates (2–3 per run): drive through the right answer for +$3. Difficulty follows level.
- Garage: car colours and a coin magnet, bought from the wallet. Day / sunset / rain themes rotate per trip.
- Vector sprites pre-rendered to offscreen canvases; engine hum and music via Web Audio (mute button).

## Restaurant (Chef's Café)
- The shopping list is now the ingredients for a few planned dishes; bought items go to the **pantry** (saved).
- A shift serves up to 3 customers who only order what the pantry can make: read the order → cook (tap the right ingredients from the fridge) → serve → **compute the bill** → customer pays with a larger bill → **give change**. Tip for accurate answers.
- Shift report shows Sales − Ingredients = **Profit**. If the pantry runs out the shift ends and prompts a shopping trip.
- 7 dishes (price always above ingredient cost). Order size and bill size grow with customers served.

## Guided billing (grocery checkout and restaurant bill)
- Step 1: multiply each line (qty × price), one highlighted row at a time; results stay on screen.
- Step 2: add the line results shown in front of the child. Hints appear after 2 wrong tries (repeated addition / running sums).
- Lines with qty 1 are filled in automatically; a single 1-item bill is just the total.
- Auto mode merges both steps into one "total" question after 3 flawless bills in a row (any mistake resets); the home screen button cycles Auto / Guided / Combined for parents.

## Next
- Supply Store and Appliance Shop (save up for an oven).
