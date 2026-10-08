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
  await expect(intro.getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })).toBeVisible();
  await expect(intro.getByRole('button', { name: 'Skip intro' })).toBeVisible();
  await expect(page.locator('.hero h1')).toHaveText('Mukhlis Zahrawani Sutrisno');
  const portfolioBefore = await page.locator('.hero.container').evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, headings: Array.from(element.querySelectorAll('h1, h2')).map(heading => heading.textContent) };
  });
  await intro.getByRole('button', { name: 'Skip intro' }).click();
  await expect(intro).toHaveAttribute('data-phase', 'forward');
  await page.clock.runFor(1500);
  await expect(page.locator('.clock-opening')).toHaveCount(0);
  await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert');
  await expect(page.locator('#main')).toBeFocused();
  expect(await page.locator('.hero.container').evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, headings: Array.from(element.querySelectorAll('h1, h2')).map(heading => heading.textContent) };
  })).toEqual(portfolioBefore);
});
