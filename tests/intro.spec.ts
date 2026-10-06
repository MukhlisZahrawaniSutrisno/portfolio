import { expect, test } from '@playwright/test';

test('opening fills the viewport and scroll transforms it before revealing the profile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const stage = page.locator('.intro-stage');
  await expect(stage).toBeVisible();
  const initial = await stage.boundingBox();
  const viewport = page.viewportSize()!;
  expect(initial!.y + initial!.height).toBeCloseTo(viewport.height, -1);
  const footer = await page.locator('.intro-footer').boundingBox();
  expect(footer!.y + footer!.height).toBeLessThanOrEqual(viewport.height);
  await expect(page.locator('.headline-letter').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.intro-footer')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: `test-results/intro-${test.info().project.name}.png` });
  const panel = page.locator('.intro-panel');
  const before = await panel.evaluate(el => getComputedStyle(el).clipPath);
  await page.evaluate(() => window.scrollTo({ top: innerHeight * .5, behavior: 'instant' }));
  await expect.poll(() => panel.evaluate(el => getComputedStyle(el).clipPath)).not.toBe(before);
  await page.getByRole('link', { name: 'About me', exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about')).toBeInViewport();
});

test('opening content fits short phones, tablets, desktops and landscape screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 600 }, { width: 768, height: 900 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 844, height: 390 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const footer = await page.locator('.intro-footer').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const heading = await page.locator('h1').boundingBox();
    if (viewport.height > 500) expect(heading!.y + heading!.height).toBeLessThanOrEqual(footer!.y + 1);
    else expect(heading!.x + heading!.width).toBeLessThanOrEqual(footer!.x + 1);
  }
});

test('keyboard focus reveals the discovery link during the scroll transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: innerHeight * .5, behavior: 'instant' }));
  const discovery = page.getByRole('link', { name: 'About me', exact: true });
  await discovery.focus();
  await expect(discovery).toBeFocused();
  await expect(discovery).toBeInViewport();
  await expect(page.locator('.intro-panel')).toHaveCSS('clip-path', 'none');
  await discovery.press('Enter');
  await expect(page.locator('#about')).toBeInViewport();
});

test('live reduced motion removes the pinned transition and keeps keyboard discovery usable', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const stage = page.locator('.intro-stage');
  await expect(stage).toHaveCSS('position', 'relative');
  await expect(page.locator('.intro-panel')).toHaveCSS('clip-path', 'none');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#about')).toBeInViewport();
});
