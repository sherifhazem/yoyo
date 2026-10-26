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

## Hands-on cooking (restaurant)
Each portion: gather ingredients → a short sequence of mini-steps per dish → "order up". The learning is hidden in the actions:
- **Chop** (tap the board to cut, then confirm): pieces = cuts + 1 (counting / fractions). Then tap each piece to toss it into the bowl, pot or pan.
- **Pour** (hold to fill, release at the marked line): measuring and estimating; overshooting resets the glass.
- **Heat** (dial ±20° to the target, then start): skip-counting by 20 and reading numbers.
- **Flip** (stop the moving marker inside the green zone): timing; the zone widens after misses.
- **Tap** steps (crack, whisk, stir, blend): counting. Few mistakes while cooking earns a tip.

## Kitchen
While cooking, the restaurant switches to an illustrated kitchen (fridge, worktop with cutting board and mixing bowl, stove and oven, sink). Each step belongs to a station: the station glows, the child taps it (or Go!), the chef walks there and the mini-step opens. A ticket shows the recipe progress. Equipment catalogue (`EQUIPMENT` in `data.js`) and `S.kitchen.owned` are the groundwork for buying/placing appliances (oven, pro blender, bigger fridge) and expanding the restaurant.

## Appliance Shop (investment and planning)
- Unlocked from the map (drive there like the grocery). Equipment is bought with the wallet through the same pay-with-bills and change steps; bills go up to $50.
- Catalogue (`EQUIPMENT` in `data.js`): **Pro blender $35** (half the blending taps, shakes +$2), **Neon sign $40** (+$1 tip per customer), **Extra table $50** (4 customers per shift), **Oven $60** (unlocks pizza, bread, cookies, cake; needs the new Bakery aisle: flour, butter, sugar).
- Planning: each card shows a progress bar toward the price, "Save for it" sets a goal that appears on the map, and an unaffordable Buy sets the goal automatically.
- The kitchen shows the purchases: the old oven starts "OUT OF ORDER", the new one glows when baking; the pro blender is drawn in steel.

## Guided billing (grocery checkout and restaurant bill)
- Step 1: multiply each line (qty × price), one highlighted row at a time; results stay on screen.
- Step 2: add the line results shown in front of the child. Hints appear after 2 wrong tries (repeated addition / running sums).
- Lines with qty 1 are filled in automatically; a single 1-item bill is just the total.
- Auto mode merges both steps into one "total" question after 3 flawless bills in a row (any mistake resets); the home screen button cycles Auto / Guided / Combined for parents.

## Next
- Supply Store (plates, decor), restaurant expansion (more tables and layout).
