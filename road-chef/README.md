# Road Chef 🚗🍽️

Mobile-first math & money game for ages 7–9 (English, US dollars).
The child drives to shops, buys ingredients from a list, works out the total,
pays with bills and counts the change. Progress (wallet, stars, trips) is saved in `localStorage`.

Plain HTML/CSS/JS (no build, no dependencies). Run:

```bash
cd road-chef && python3 -m http.server 8000   # open on a phone-sized viewport
```

## Done (prototype)
- Home → map → animated drive → Fresh Grocery (4 aisles, list check, cart) → total → pay → change → reward.
- Difficulty scales with trips (more lines, larger quantities).

## Next
- Supply Store and Appliance Shop (save up for an oven).
- Restaurant: cook simple meals, serve customers, take payment and give change.
