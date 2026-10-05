import { expect, test, type Page } from '@playwright/test';
import { showSelectedWork } from '../src/content';

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('portfolio loads cleanly and stays within the viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  for (const id of [...(showSelectedWork ? ['work'] : []), 'about', 'contact']) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
  expect(errors).toEqual([]);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await expect(page.locator('.headline-letter').last()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: `test-results/portfolio-${test.info().project.name}.png`, fullPage: true });
});

test('mobile navigation closes after selecting a section', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'The menu is for narrow viewports.');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#about$/);
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('#mobile-nav').getByRole('button', { name: 'Contact' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused();
});

test('work filters show the matching projects and reset to all', async ({ page }) => {
  test.skip(!showSelectedWork, 'Selected Work is temporarily hidden.');
  const work = page.locator('#work');
  const forma = work.getByRole('button', { name: 'View Forma case study, concept project' });
  const aesop = work.getByRole('button', { name: 'View Aesop case study, concept project' });
  await expect(forma).toBeVisible();
  await expect(aesop).toBeVisible();

  await work.getByRole('button', { name: 'Frontend', exact: true }).click();
  await expect(work.getByRole('button', { name: 'Frontend', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(forma).toBeVisible();
  await expect(aesop).toHaveCount(0);

  await work.getByRole('button', { name: 'UI/UX', exact: true }).click();
  await expect(aesop).toBeVisible();
  await expect(forma).toHaveCount(0);

  await work.getByRole('button', { name: 'All', exact: true }).click();
  await expect(forma).toBeVisible();
  await expect(aesop).toBeVisible();
});

test('case studies open, close with Escape, and restore keyboard focus', async ({ page }) => {
  test.skip(!showSelectedWork, 'Selected Work is temporarily hidden.');
  const trigger = page.getByRole('button', { name: 'View Forma case study, concept project' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Forma', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Forma', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.press('Enter');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close case study', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('hidden showcase has no dangling work links and discovery leads to About', async ({ page, isMobile }) => {
  test.skip(showSelectedWork, 'Selected Work is enabled.');
  await expect(page.locator('#work')).toHaveCount(0);
  await expect(page.locator('a[href="#work"]')).toHaveCount(0);
  const brand = page.getByRole('link', { name: 'Muza home', exact: true });
  await expect(brand).toContainText('Muza');
  await expect(brand).toHaveAttribute('href', '#');
  await expect(brand).toHaveText('Muza');
  await expect(page.locator('.footer-mark')).toHaveText('Muza');
  await expect(page.getByRole('button', { name: /let.s talk/i })).toHaveCount(0);
  const discovery = page.getByRole('link', { name: 'Discover more', exact: true });
  await expect(discovery).toHaveAttribute('href', '#about');
  await discovery.click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole('link', { name: 'Scroll to discover', exact: true })).toHaveAttribute('href', '#about');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.locator('#mobile-nav a[href="#work"]')).toHaveCount(0);
  }
});

test('contact dialog has usable fields and restores focus after Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Start a conversation', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/name/i).fill('Portfolio visitor');
  await dialog.getByLabel(/email/i).fill('visitor@example.com');
  await dialog.getByLabel('What are you working on?').fill('I would like to discuss a design project.');
  await expect(dialog.getByLabel('What are you working on?')).toHaveValue('I would like to discuss a design project.');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('reduced motion keeps content visible and usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const runningAnimations = await page.evaluate(() =>
    document.getAnimations().filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return animation.playState === 'running' && timing?.iterations === Infinity;
    }).length,
  );
  expect(runningAnimations).toBe(0);
});
