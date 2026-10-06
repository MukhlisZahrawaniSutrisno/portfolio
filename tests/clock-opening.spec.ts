import { expect, test } from '@playwright/test';

test('clock opening is separate from the restored portfolio layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Portfolio introduction' })).toBeVisible();
  await expect(page.locator('.hero.container')).toHaveCount(1);
  await expect(page.locator('.cinematic-intro')).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.clock-opening')).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert');
  await expect(page.locator('#main')).toBeFocused();
});
