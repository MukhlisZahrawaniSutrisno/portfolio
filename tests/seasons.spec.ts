import { expect, test } from '@playwright/test';

test('seasons change after 30 seconds without repeating or shifting content', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const effects = page.locator('.season-effects');
  await expect(effects).toHaveAttribute('data-season', /rain|dry|sakura|storm|wind|clear|autumn/);
  await expect(effects).toHaveAttribute('aria-hidden', 'true');
  await expect(effects).toHaveCSS('pointer-events', 'none');
  await page.evaluate(() => document.querySelectorAll('.headline-letter').forEach(letter => letter.getAnimations().forEach(animation => animation.finish())));
  const geometry = await page.locator('h1').boundingBox();
  const first = await effects.getAttribute('data-season');
  await page.clock.fastForward(28_000);
  await expect(effects).toHaveAttribute('data-season', first!);
  await page.clock.fastForward(2_000);
  await expect(effects).not.toHaveAttribute('data-season', first!);
  for (let index = 0; index < 10; index++) {
    const previous = await effects.getAttribute('data-season');
    await page.clock.fastForward(30_000);
    await expect(effects).not.toHaveAttribute('data-season', previous!);
    await expect(effects).toHaveAttribute('data-season', /^(rain|dry|sakura|storm|wind|clear|autumn)$/);
    expect(await effects.evaluate(element => element.childElementCount)).toBeLessThanOrEqual(20);
  }
  expect(await page.locator('h1').boundingBox()).toEqual(geometry);
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#contact').getByRole('button', { name: /let.s talk/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('reduced motion disables seasons immediately and restores them when allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.season-effects')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-season', /.+/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.season-effects')).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.season-effects')).toHaveCount(0);
});

test('hidden tabs pause effects and the seasonal timer', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const effects = page.locator('.season-effects');
  await expect(effects).toBeAttached();
  const initial = await effects.getAttribute('data-season');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(effects).toHaveAttribute('data-paused', 'true');
  await page.clock.fastForward(90_000);
  await expect(effects).toHaveAttribute('data-season', initial!);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(effects).toHaveAttribute('data-paused', 'false');
  await page.clock.fastForward(30_000);
  await expect(effects).not.toHaveAttribute('data-season', initial!);
});
