import { expect, test } from '@playwright/test';

test('seasons change after 5 seconds without repeating or shifting content', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-05T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-05T00:01:00Z'));
  await page.goto('/');
  const effects = page.locator('.season-effects');
  await expect(effects).toHaveAttribute('data-season', /rain|dry|sakura|storm|wind|clear|autumn/);
  await expect(effects).toHaveAttribute('aria-hidden', 'true');
  await expect(effects).toHaveCSS('pointer-events', 'none');
  await page.evaluate(() => document.querySelectorAll('.headline-letter').forEach(letter => letter.getAnimations().forEach(animation => { if (animation.effect?.getTiming().iterations !== Infinity) animation.finish(); })));
  const geometry = await page.locator('h1').boundingBox();
  const first = await effects.getAttribute('data-season');
  await page.clock.fastForward(4_000);
  await expect(effects).toHaveAttribute('data-season', first!);
  await page.clock.fastForward(1_000);
  await expect(effects).not.toHaveAttribute('data-season', first!);
  for (let index = 0; index < 10; index++) {
    const previous = await effects.getAttribute('data-season');
    await page.clock.fastForward(5_000);
    await expect(effects).not.toHaveAttribute('data-season', previous!);
    await expect(effects).toHaveAttribute('data-season', /^(rain|dry|sakura|storm|wind|clear|autumn)$/);
    expect(await effects.locator('*').count()).toBeLessThan(250);
  }
  expect(await page.locator('h1').boundingBox()).toEqual(geometry);
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#contact').getByRole('button', { name: 'Discuss a project', exact: true }).click();
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
  await expect(page.locator('.season-details')).toHaveCount(0);
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
  await expect.poll(() => page.locator('.season-effects, .season-details').evaluateAll(elements =>
    elements.flatMap(element => element.getAnimations({ subtree: true })).filter(animation => animation.playState === 'running').length,
  )).toBe(0);
  await page.clock.fastForward(90_000);
  await expect(effects).toHaveAttribute('data-season', initial!);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(effects).toHaveAttribute('data-paused', 'false');
  await page.clock.fastForward(5_000);
  await expect(effects).not.toHaveAttribute('data-season', initial!);
});

test('all seven scenes render their details and remain usable in both themes', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    let seed = 123456;
    Math.random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });
  await page.clock.install({ time: new Date('2026-10-05T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-05T00:01:00Z'));
  await page.goto('/');
  const effects = page.locator('.season-effects');
  await expect(effects).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelectorAll('.headline-letter').forEach(letter => letter.getAnimations().forEach(animation => { if (animation.effect?.getTiming().iterations !== Infinity) animation.finish(); })));
  const visited = new Set<string>();
  for (let turn = 0; turn < 60 && visited.size < 7; turn++) {
    const current = (await effects.getAttribute('data-season'))!;
    if (!visited.has(current)) {
      visited.add(current);
      await expect(effects.locator('[data-element]').first()).toBeAttached();
      await expect(page.locator('.hero h1 .season-details')).toHaveAttribute('aria-hidden', 'true');
      if (current === 'autumn') await expect(page.locator('.hero-art .season-details svg').first()).toBeAttached();
      for (const theme of ['Light', 'Dark']) {
        await page.getByRole('button', { name: theme, exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme.toLowerCase());
        await expect(page.locator('.hero .button')).toHaveCSS('background-color', theme === 'Light' ? 'rgb(37, 37, 37)' : 'rgb(231, 232, 220)');
        await page.evaluate(() => {
          document.querySelectorAll('.season-effects, .season-details').forEach(element => {
            element.getAnimations({ subtree: true }).forEach(animation => {
              animation.pause();
              animation.currentTime = 2_350;
            });
          });
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
        await page.screenshot({ path: `test-results/season-${current}-${theme.toLowerCase()}-${test.info().project.name}.png` });
      }
    }
    const previous = current;
    await page.clock.fastForward(5_000);
    await expect(effects).not.toHaveAttribute('data-season', previous);
  }
  expect([...visited].sort()).toEqual(['autumn', 'clear', 'dry', 'rain', 'sakura', 'storm', 'wind']);
  await page.locator('#contact').getByRole('button', { name: 'Discuss a project', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(errors).toEqual([]);
});
