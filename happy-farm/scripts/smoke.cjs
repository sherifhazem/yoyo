// Browser smoke test (needs Playwright and `npm run build && npm run preview -- --port 4173`).
// Plays the first minutes: plant, water, fast-forward, harvest, sell, open every market tab.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 390, height: 780 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.env.URL || 'http://localhost:4173/');
  await p.waitForTimeout(1200);
  await p.click('[data-t="2"]');
  // toolbar buttons are re-rendered when a quest completes, so click through the DOM
  const tool = (id) => p.evaluate((id) => document.querySelector(`[data-t="${id}"]`).click(), id);
  const tile = async (x, y) => { const d = await p.evaluate(([x, y]) => __game.scene.toDom(x + 0.5, y + 0.5), [x, y]); await p.mouse.click(d.x, d.y); await p.waitForTimeout(120); };
  for (const [x, y] of [[0, 0], [1, 0], [2, 0]]) await tile(x, y);
  await tool('water'); await tile(0, 0);
  await p.evaluate(() => { __game.state.startedAt -= 26.5 * 90000; __game.state.lastTick -= 2.5 * 90000; });
  await p.waitForTimeout(800);
  await tool('harvest');
  for (const [x, y] of [[0, 0], [1, 0], [2, 0]]) await tile(x, y);
  await p.waitForTimeout(700);   // the level-up card appears on the next game tick
  if (await p.locator('[data-act="ok"]').count()) await p.click('[data-act="ok"]');
  await tool('market');
  await p.click('[data-act="sell"]');
  for (const tab of ['buy', 'orders', 'city']) await p.click(`[data-tab="${tab}"]`);
  const st = await p.evaluate(() => ({ coins: __game.state.coins, goods: __game.state.goods }));
  console.log(JSON.stringify({ errors: errs, ...st }));
  await b.close();
  process.exit(errs.length || st.coins <= 20 ? 1 : 0);
})();
