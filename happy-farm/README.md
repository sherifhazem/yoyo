# Happy Farm (prototype)

Isometric farm game that teaches money math: buy seeds and chickens, grow crops over real time, sell produce.
PixiJS v8 + Vite. Art is drawn procedurally (no assets). Progress is saved in `localStorage`; growth uses timestamps, so crops keep growing while the game is closed.

```bash
cd happy-farm && npm install && npm run dev
```

## Loop
- 6×6 field, 2 crops (wheat $2 seed → $3, 15s; carrot $4 seed → $7, 30s), chickens in the pen ($20, an egg every 25s, max 4).
- Pick a seed tool and tap a tile to plant; Harvest tool and tap a ripe crop; tap a chicken with an egg to collect it.
- Market: choose quantities, then **compute the bill** (multiple choice) before paying or being paid. Wrong answers just retry.

## Structure
- `src/data.js` — constants, state, save/load (the layer to swap for a server later)
- `src/art.js` — isometric math and Pixi drawings
- `src/main.js` — scene, tools, market and bill modal
