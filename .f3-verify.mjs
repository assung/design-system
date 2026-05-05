import { chromium } from 'playwright';

const URL = 'http://localhost:6007/iframe.html?id=design-system-components-datatable-展示--row-drag-interactive&viewMode=story';

const out = (msg) => console.log(`[verify] ${msg}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('#storybook-root', { timeout: 15000 });
// Wait for actual SKU content
await page.waitForFunction(() => document.querySelector('#storybook-root')?.textContent?.includes('SKU-'), null, { timeout: 15000 }).catch(() => out('SKU not found in time'));
await page.waitForTimeout(500);

const root = page.locator('#storybook-root');

// Identify rows inside story root containing a SKU code
const dataRowSkus = await root.evaluate((el) => {
  const rows = Array.from(el.querySelectorAll('[role="row"], tr'));
  return rows
    .map((r) => {
      const t = r.textContent || '';
      const m = t.match(/SKU-\d+/);
      return m ? { sku: m[0], rect: r.getBoundingClientRect().toJSON() } : null;
    })
    .filter(Boolean);
});
out(`Initial SKU rows: ${dataRowSkus.length}`);
out(`Initial SKU order: ${JSON.stringify(dataRowSkus.map((r) => r.sku))}`);

// Take a clipped screenshot of just storybook-root for clarity
const rootBox = await root.boundingBox();
out(`Root box: ${JSON.stringify(rootBox)}`);

await page.screenshot({
  path: '/tmp/f3-row-drag-verify-1.png',
  clip: rootBox ? { x: rootBox.x, y: rootBox.y, width: Math.min(rootBox.width, 1280), height: Math.min(rootBox.height, 900) } : undefined,
});
out('shot1 saved (initial, no hover)');

// Find drag handles inside storybook root only
const handleCount = await root.locator('svg.lucide-grip-vertical').count();
out(`GripVertical icons inside root: ${handleCount}`);

// Read opacity of handle BEFORE any hover (use 2nd row's handle so we don't move mouse over it)
const handleOpacityInitial = await root
  .locator('svg.lucide-grip-vertical')
  .first()
  .evaluate((el) => {
    // walk up to nearest element with explicit opacity controlled by group hover
    let node = el;
    const chain = [];
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      chain.push({ tag: node.tagName, cls: node.className?.toString().slice(0, 80), opacity: cs.opacity });
      node = node.parentElement;
    }
    return chain.slice(0, 6);
  })
  .catch((e) => 'err: ' + e.message);
out(`Handle ancestor opacity chain (initial, no hover): ${JSON.stringify(handleOpacityInitial)}`);

// Hover the first SKU row at a non-handle area to trigger group-hover reveal
if (dataRowSkus.length > 0) {
  const r0 = dataRowSkus[0].rect;
  // Move to middle of row (away from handle column to avoid grabbing it)
  await page.mouse.move(r0.x + r0.width / 2, r0.y + r0.height / 2);
  await page.waitForTimeout(400);
}

const handleOpacityHover = await root
  .locator('svg.lucide-grip-vertical')
  .first()
  .evaluate((el) => {
    let node = el;
    const chain = [];
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      chain.push({ tag: node.tagName, cls: node.className?.toString().slice(0, 80), opacity: cs.opacity });
      node = node.parentElement;
    }
    return chain.slice(0, 6);
  })
  .catch((e) => 'err: ' + e.message);
out(`Handle ancestor opacity chain (after hover row 0): ${JSON.stringify(handleOpacityHover)}`);

await page.screenshot({
  path: '/tmp/f3-row-drag-verify-2.png',
  clip: rootBox ? { x: rootBox.x, y: rootBox.y, width: Math.min(rootBox.width, 1280), height: Math.min(rootBox.height, 900) } : undefined,
});
out('shot2 saved (hover row 0)');

// Programmatic drag: row 0 handle -> row 2 (drop after row 2)
let dragErr = null;
if (dataRowSkus.length >= 3) {
  try {
    // Locate the actual handle button bounding box
    const handleBox = await root.locator('svg.lucide-grip-vertical').first().evaluate((el) => {
      const btn = el.closest('button') || el.closest('[role="button"]') || el.parentElement;
      return btn.getBoundingClientRect().toJSON();
    });
    const r2 = dataRowSkus[2].rect;
    out(`handle box: ${JSON.stringify(handleBox)}`);
    out(`row2 box: ${JSON.stringify(r2)}`);

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = r2.x + r2.width / 2;
    const endY = r2.y + r2.height - 4; // bottom of row 2 → drop after

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // dnd-kit PointerSensor default activation distance = 8px; do gradual move
    for (let i = 1; i <= 20; i++) {
      const x = startX + ((endX - startX) * i) / 20;
      const y = startY + ((endY - startY) * i) / 20;
      await page.mouse.move(x, y, { steps: 2 });
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(500);
  } catch (e) {
    dragErr = e.message;
    out('drag error: ' + dragErr);
  }
}

// Re-read SKU order
const finalSkus = await root.evaluate((el) => {
  const rows = Array.from(el.querySelectorAll('[role="row"], tr'));
  return rows
    .map((r) => (r.textContent || '').match(/SKU-\d+/)?.[0])
    .filter(Boolean);
});
out(`Final SKU order: ${JSON.stringify(finalSkus)}`);

await page.screenshot({
  path: '/tmp/f3-row-drag-verify-3.png',
  clip: rootBox ? { x: rootBox.x, y: rootBox.y, width: Math.min(rootBox.width, 1280), height: Math.min(rootBox.height, 900) } : undefined,
});
out('shot3 saved (post-drag)');

const initialOrder = dataRowSkus.map((r) => r.sku);
const reordered = JSON.stringify(initialOrder) !== JSON.stringify(finalSkus);

await browser.close();

console.log('\n=== RESULT ===');
console.log(JSON.stringify({
  handleCount,
  initialSkuOrder: initialOrder,
  finalSkuOrder: finalSkus,
  reordered,
  dragErr,
  hoverOpacityChain: handleOpacityHover,
  initialOpacityChain: handleOpacityInitial,
}, null, 2));
