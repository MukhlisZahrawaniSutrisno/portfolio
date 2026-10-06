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
  await page.getByRole('button', { name: 'Skip intro' }).click();
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
  await page.goto('/');
  await expect(opening(page)).toBeVisible();
  await expect(opening(page)).toHaveAttribute('data-phase', 'forward', { timeout: 2500 });
  await expect(opening(page)).toHaveCount(0, { timeout: 1500 });
  await expect(page.locator('.hero.container')).toBeVisible();
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

for (const key of ['Escape', 'ArrowDown', 'PageDown', 'Space']) {
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

test('clock and skip control fit small phones, landscape screens, and desktops', async ({ page }) => {
  await page.goto('/');
  await expect(opening(page)).toBeVisible();
  await page.screenshot({ path: `test-results/clock-opening-${test.info().project.name}.png` });
  for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const clock = await page.locator('.opening-clock').boundingBox();
    const skip = await page.getByRole('button', { name: 'Skip intro' }).boundingBox();
    for (const box of [clock, skip]) {
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
