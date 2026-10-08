import { expect, test, type Page } from '@playwright/test';

const opening = (page: Page) => page.getByRole('dialog', { name: 'Portfolio introduction' });

async function handMovement(page: Page) {
  const hand = page.locator('[data-opening-hand]').first();
  const angle = () => hand.evaluate(element => Number(element.getAttribute('transform')?.match(/rotate\(([-\d.]+)/)?.[1]));
  const before = await angle();
  await page.clock.runFor(180);
  return await angle() - before;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

test('clock reverses on arrival, advances on departure, and restores the original hero', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  await page.goto('/');
  await expect(opening(page)).toHaveAttribute('data-phase', 'reverse');
  await expect(page.locator('[data-opening-numeral]')).toHaveCount(12);
  expect(await page.locator('[data-opening-numeral]').allTextContents()).toEqual(expect.arrayContaining(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']));
  await expect(page.locator('.portfolio-content')).toHaveAttribute('inert', '');
  expect(await handMovement(page)).toBeLessThan(0);
  await page.keyboard.press('Escape');
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  expect(await handMovement(page)).toBeGreaterThan(0);
  await page.clock.runFor(1500);
  await expect(opening(page)).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  await expect(page.locator('.hero.container')).toBeVisible();
  await expect(page.locator('.cinematic-intro, .intro-stage')).toHaveCount(0);
  await expect(page.locator('.hero h1')).toHaveText('Mukhlis Zahrawani Sutrisno');
});

test('opening completes automatically without user interaction', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  await page.goto('/');
  await expect(opening(page)).toBeVisible();
  await page.clock.runFor(3000);
  await expect(opening(page)).toBeVisible();
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  await page.clock.runFor(1500);
  await expect(opening(page)).toHaveCount(0);
  await expect(page.locator('.hero.container')).toBeVisible();
});

test('the full name reveals letter by letter before entering the portfolio', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  await page.goto('/');
  await expect(opening(page).getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })).toBeVisible();
  const letters = page.locator('.opening-letter');
  await expect(letters).toHaveCount(24);
  const sampleLetters = (time: number) => letters.evaluateAll((elements, elapsed) => elements.map(element => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = elapsed;
    }
    return Number(getComputedStyle(element).opacity);
  }), time);
  const midway = await sampleLetters(1400);
  expect(midway[0]).toBeGreaterThan(0.9);
  expect(midway.at(-1)).toBeLessThan(0.1);
  const completed = await sampleLetters(2300);
  expect(completed.every(opacity => opacity > 0.99)).toBe(true);
});

test('repeated scroll departure retains scroll intent and dismisses once', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Wheel is covered on desktop; touch is covered separately.');
  await page.goto('/');
  await page.mouse.wheel(0, 180);
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  await page.mouse.wheel(0, 180);
  await page.mouse.wheel(0, 180);
  await expect(opening(page)).toHaveCount(0, { timeout: 1800 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
});

test('touch scroll departs forward and preserves the requested movement', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch belongs to the touch-enabled mobile project.');
  await page.goto('/');
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 450 }] });
  for (const y of [420, 380, 340, 300, 250]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  await expect(opening(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

for (const key of ['Escape', 'Tab', 'ArrowDown', 'PageDown', 'Space']) {
  test(`${key} dismisses the opening and restores keyboard access`, async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press(key);
    await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
    await expect(opening(page)).toHaveCount(0);
    expect(await page.evaluate(() => {
      const focused = document.activeElement;
      return focused?.matches('main, .skip-link, a[href="#main-content"], a[href="#about"]') ?? false;
    })).toBe(true);
    await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
  });
}

test('document scrolling dismisses the overlay without resetting position', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 240, behavior: 'instant' }));
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward');
  await expect(opening(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
});

test('deep links bypass the opening and reach their intended content', async ({ page }) => {
  await page.goto('/#about');
  await expect(opening(page)).toHaveCount(0);
  await expect(page.locator('#about')).toBeInViewport();
});

test('a reload at a restored scroll position bypasses the opening', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(opening(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});

test('reduced motion bypasses the opening and a live change dismisses immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(opening(page)).toHaveCount(0);
  await expect(page.locator('.hero.container')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(opening(page)).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(opening(page)).toHaveCount(0, { timeout: 500 });
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert', '');
});

test('clock and name fit phones, landscape screens, and desktops', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-06T03:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T03:00:01Z'));
  await page.goto('/');
  await expect(opening(page)).toBeVisible();
  for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const clock = await page.locator('.opening-clock').boundingBox();
    const name = await page.locator('.opening-name').boundingBox();
    const skip = await page.getByRole('button', { name: 'Skip intro' }).boundingBox();
    for (const box of [clock, name, skip]) {
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    expect(clock!.x + clock!.width / 2).toBeCloseTo(viewport.width / 2, 0);
    expect(clock!.y + clock!.height / 2).toBeCloseTo(viewport.height / 2, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.clock.runFor(2200);
    await opening(page).evaluate(element => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = 2200;
      }
    });
    await page.screenshot({ path: test.info().outputPath(`time-travel-${viewport.width}x${viewport.height}.png`) });
  }
});
