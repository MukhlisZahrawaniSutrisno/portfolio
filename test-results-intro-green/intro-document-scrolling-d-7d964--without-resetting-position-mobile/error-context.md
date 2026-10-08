# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: intro.spec.ts >> document scrolling dismisses the overlay without resetting position
- Location: tests\intro.spec.ts:111:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:5173/", waiting until "load"

```

# Test source

```ts
  12  | 
  13  | test.beforeEach(async ({ page }) => {
  14  |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  15  | });
  16  | 
  17  | test('clock reverses on arrival, advances on departure, and restores the original hero', async ({ page }) => {
  18  |   await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  19  |   await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  20  |   await page.goto('/');
  21  |   await expect(opening(page)).toHaveAttribute('data-phase', 'reverse');
  22  |   await expect(page.locator('[data-opening-numeral]')).toHaveCount(12);
  23  |   expect(await page.locator('[data-opening-numeral]').allTextContents()).toEqual(expect.arrayContaining(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']));
  24  |   await expect(page.locator('.portfolio-content')).toHaveAttribute('inert', '');
  25  |   expect(await handMovement(page)).toBeLessThan(0);
  26  |   await page.keyboard.press('Escape');
  27  |   await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  28  |   expect(await handMovement(page)).toBeGreaterThan(0);
  29  |   await page.clock.runFor(1500);
  30  |   await expect(opening(page)).toHaveCount(0);
  31  |   await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  32  |   await expect(page.locator('.hero.container')).toBeVisible();
  33  |   await expect(page.locator('.cinematic-intro, .intro-stage')).toHaveCount(0);
  34  |   await expect(page.locator('.hero h1')).toHaveText('Mukhlis Zahrawani Sutrisno');
  35  | });
  36  | 
  37  | test('opening completes automatically without user interaction', async ({ page }) => {
  38  |   await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  39  |   await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  40  |   await page.goto('/');
  41  |   await expect(opening(page)).toBeVisible();
  42  |   await page.clock.runFor(3000);
  43  |   await expect(opening(page)).toBeVisible();
  44  |   await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  45  |   await page.clock.runFor(1500);
  46  |   await expect(opening(page)).toHaveCount(0);
  47  |   await expect(page.locator('.hero.container')).toBeVisible();
  48  | });
  49  | 
  50  | test('the full name reveals letter by letter before entering the portfolio', async ({ page }) => {
  51  |   await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  52  |   await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  53  |   await page.goto('/');
  54  |   await expect(opening(page).getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })).toBeVisible();
  55  |   const letters = page.locator('.opening-letter');
  56  |   await expect(letters).toHaveCount(24);
  57  |   const sampleLetters = (time: number) => letters.evaluateAll((elements, elapsed) => elements.map(element => {
  58  |     for (const animation of element.getAnimations()) {
  59  |       animation.pause();
  60  |       animation.currentTime = elapsed;
  61  |     }
  62  |     return Number(getComputedStyle(element).opacity);
  63  |   }), time);
  64  |   const midway = await sampleLetters(1400);
  65  |   expect(midway[0]).toBeGreaterThan(0.9);
  66  |   expect(midway.at(-1)).toBeLessThan(0.1);
  67  |   const completed = await sampleLetters(2300);
  68  |   expect(completed.every(opacity => opacity > 0.99)).toBe(true);
  69  | });
  70  | 
  71  | test('repeated scroll departure retains scroll intent and dismisses once', async ({ page, isMobile }) => {
  72  |   test.skip(isMobile, 'Wheel is covered on desktop; touch is covered separately.');
  73  |   await page.goto('/');
  74  |   await page.mouse.wheel(0, 180);
  75  |   await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  76  |   await page.mouse.wheel(0, 180);
  77  |   await page.mouse.wheel(0, 180);
  78  |   await expect(opening(page)).toHaveCount(0, { timeout: 1800 });
  79  |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  80  |   await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  81  | });
  82  | 
  83  | test('touch scroll departs forward and preserves the requested movement', async ({ page, isMobile }) => {
  84  |   test.skip(!isMobile, 'Touch belongs to the touch-enabled mobile project.');
  85  |   await page.goto('/');
  86  |   const session = await page.context().newCDPSession(page);
  87  |   await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 450 }] });
  88  |   for (const y of [420, 380, 340, 300, 250]) {
  89  |     await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  90  |   }
  91  |   await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  92  |   await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  93  |   await expect(opening(page)).toHaveCount(0);
  94  |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  95  | });
  96  | 
  97  | for (const key of ['Escape', 'Tab', 'ArrowDown', 'PageDown', 'Space']) {
  98  |   test(`${key} dismisses the opening and restores keyboard access`, async ({ page }) => {
  99  |     await page.goto('/');
  100 |     await page.keyboard.press(key);
  101 |     await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  102 |     await expect(opening(page)).toHaveCount(0);
  103 |     expect(await page.evaluate(() => {
  104 |       const focused = document.activeElement;
  105 |       return focused?.matches('main, .skip-link, a[href="#main-content"], a[href="#about"]') ?? false;
  106 |     })).toBe(true);
  107 |     await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  108 |   });
  109 | }
  110 | 
  111 | test('document scrolling dismisses the overlay without resetting position', async ({ page }) => {
> 112 |   await page.goto('/');
      |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  113 |   await page.evaluate(() => window.scrollTo({ top: 240, behavior: 'instant' }));
  114 |   await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  115 |   await expect(opening(page)).toHaveCount(0);
  116 |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
  117 | });
  118 | 
  119 | test('deep links bypass the opening and reach their intended content', async ({ page }) => {
  120 |   await page.goto('/#about');
  121 |   await expect(opening(page)).toHaveCount(0);
  122 |   await expect(page.locator('#about')).toBeInViewport();
  123 | });
  124 | 
  125 | test('a reload at a restored scroll position bypasses the opening', async ({ page }) => {
  126 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  127 |   await page.goto('/');
  128 |   await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  129 |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  130 |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  131 |   await page.reload();
  132 |   await expect(opening(page)).toHaveCount(0);
  133 |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  134 | });
  135 | 
  136 | test('reduced motion bypasses the opening and a live change dismisses immediately', async ({ page }) => {
  137 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  138 |   await page.goto('/');
  139 |   await expect(opening(page)).toHaveCount(0);
  140 |   await expect(page.locator('.hero.container')).toBeVisible();
  141 |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  142 |   await page.goto('/');
  143 |   await expect(opening(page)).toBeVisible();
  144 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  145 |   await expect(opening(page)).toHaveCount(0, { timeout: 500 });
  146 |   await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  147 | });
  148 | 
  149 | test('clock and name fit phones, landscape screens, and desktops', async ({ page }) => {
  150 |   await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  151 |   await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  152 |   await page.goto('/');
  153 |   await expect(opening(page)).toBeVisible();
  154 |   for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }, { width: 1280, height: 720 }]) {
  155 |     await page.setViewportSize(viewport);
  156 |     await page.goto('/');
  157 |     const clock = await page.locator('.opening-clock').boundingBox();
  158 |     const name = await page.locator('.opening-name').boundingBox();
  159 |     const skip = await page.getByRole('button', { name: 'Skip intro' }).boundingBox();
  160 |     for (const box of [clock, name, skip]) {
  161 |       expect(box).not.toBeNull();
  162 |       expect(box!.x).toBeGreaterThanOrEqual(0);
  163 |       expect(box!.y).toBeGreaterThanOrEqual(0);
  164 |       expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  165 |       expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
  166 |     }
  167 |     expect(clock!.x + clock!.width / 2).toBeCloseTo(viewport.width / 2, 0);
  168 |     expect(clock!.y + clock!.height / 2).toBeCloseTo(viewport.height / 2, 0);
  169 |     expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  170 |     await page.clock.runFor(2200);
  171 |     await opening(page).evaluate(element => {
  172 |       for (const animation of element.getAnimations({ subtree: true })) {
  173 |         animation.pause();
  174 |         animation.currentTime = 2200;
  175 |       }
  176 |     });
  177 |     await page.screenshot({ path: test.info().outputPath(`time-travel-${viewport.width}x${viewport.height}.png`) });
  178 |   }
  179 | });
  180 | 
```