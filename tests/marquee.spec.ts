import { expect, test } from '@playwright/test';

test('marquee loops seamlessly and keeps running through scroll with a working pause control', async ({ page }) => {
  await page.goto('/#main');
  const marquee = page.locator('.text-marquee');
  const track = marquee.locator('.text-marquee-track');
  await marquee.scrollIntoViewIfNeeded();
  await expect(track).toHaveCSS('animation-timing-function', 'linear');
  await expect(track).toHaveCSS('animation-iteration-count', 'infinite');

  const seam = await track.evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.pause();
    const duration = Number(animation.effect!.getTiming().duration);
    const groups = element.querySelectorAll('.text-marquee-group');
    animation.currentTime = duration - 1;
    const before = groups[1].getBoundingClientRect().left;
    animation.currentTime = duration + 1;
    const after = groups[0].getBoundingClientRect().left;
    const width = groups[0].getBoundingClientRect().width;
    const viewportWidth = element.parentElement!.clientWidth;
    animation.play();
    return { before, after, width, viewportWidth };
  });
  expect(Math.abs(seam.before - seam.after)).toBeLessThan(1);
  expect(seam.width).toBeGreaterThanOrEqual(seam.viewportWidth);

  await page.locator('#skills').scrollIntoViewIfNeeded();
  expect(await track.evaluate(element => element.getAnimations()[0].playState)).toBe('running');
  await page.getByRole('button', { name: 'Pause marquee', exact: true }).click();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume marquee', exact: true }).click();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await marquee.screenshot({ path: `test-results-clock/marquee-${test.info().project.name}.png` });
});

test('reduced motion presents a readable static marquee without duplicated text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#main');
  await expect(page.locator('.text-marquee-track')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.text-marquee-group').nth(1)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Pause marquee', exact: true })).toBeHidden();
  await expect(page.locator('.text-marquee-group').first()).toContainText('Frontend development');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
