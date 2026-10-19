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

## Next
- Supply Store and Appliance Shop (save up for an oven).
- Restaurant: cook simple meals, serve customers, take payment and give change.
