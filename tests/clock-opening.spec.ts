import { expect, test } from '@playwright/test';

test('clock opening is separate from the restored portfolio layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Portfolio introduction' })).toBeVisible();
  await expect(page.locator('.hero.container')).toHaveCount(1);
  await expect(page.locator('.cinematic-intro')).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).toHaveAttribute('inert', '');
  const intro = page.getByRole('dialog', { name: 'Portfolio introduction' });
  await expect(intro.getByRole('button')).toHaveCount(0);
  await expect(intro).not.toContainText('Mukhlis Zahrawani Sutrisno');
  await expect(intro).not.toContainText(/skip intro/i);
  await page.keyboard.press('Escape');
  await page.clock.runFor(1500);
  await expect(page.locator('.clock-opening')).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert');
  await expect(page.locator('#main')).toBeFocused();
});
