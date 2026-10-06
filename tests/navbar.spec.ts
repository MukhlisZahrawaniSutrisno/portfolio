import { expect, test, type Page } from '@playwright/test';

async function scrollTo(page: Page, top: number) {
  await page.evaluate(value => window.scrollTo({ top: value, behavior: 'instant' }), top);
}

async function expectFloatingNavbar(page: Page) {
  const shell = page.locator('.navbar-shell');
  await expect(shell).toHaveAttribute('data-scrolled', 'true');
  await expect.poll(() => shell.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(12);
  await expect(page.getByRole('link', { name: 'Muza home', exact: true })).toBeVisible();
}

async function contentGeometry(page: Page) {
  return page.locator('main').evaluate(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x + window.scrollX, y: box.y + window.scrollY, width: box.width, height: box.height };
  });
}

for (const appearance of ['Light', 'Dark'] as const) {
  test(`navbar floats with a readable glass surface in ${appearance} and restores at the top`, async ({ page }) => {
    await page.goto('/#main');
    await page.getByRole('button', { name: appearance, exact: true }).click();
    const shell = page.locator('.navbar-shell');
    const header = shell;
    await page.evaluate(() => document.fonts.ready);
    await expect(shell).toHaveAttribute('data-scrolled', 'false');
    await expect(shell).toHaveCSS('background-color', appearance === 'Light' ? 'rgb(248, 248, 246)' : 'rgb(25, 26, 24)');
    await expect.poll(() => shell.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
    const geometry = await contentGeometry(page);
    const original = await header.evaluate(element => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, blur: style.backdropFilter, radius: style.borderRadius };
    });

    await scrollTo(page, 450);
    await expectFloatingNavbar(page);
    await expect.poll(() => header.evaluate(element => getComputedStyle(element).backdropFilter)).toMatch(/blur\(/);
    const surface = await header.evaluate(element => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor };
    });
    expect(surface.color).not.toBe(surface.background);
    expect(await contentGeometry(page)).toEqual(geometry);
    if ((appearance === 'Light' && test.info().project.name === 'desktop') || (appearance === 'Dark' && test.info().project.name === 'mobile')) {
      await page.screenshot({ path: `test-results/navbar-${appearance.toLowerCase()}-${test.info().project.name}.png` });
    }
    await scrollTo(page, 900);
    await expectFloatingNavbar(page);
    expect(await contentGeometry(page)).toEqual(geometry);

    await scrollTo(page, 0);
    await expect(shell).toHaveAttribute('data-scrolled', 'false');
    await expect.poll(() => shell.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
    await expect(header).toHaveCSS('backdrop-filter', original.blur);
    await expect(header).toHaveCSS('background-color', original.background);
    await expect(header).toHaveCSS('border-radius', original.radius);
    expect(await contentGeometry(page)).toEqual(geometry);
  });
}

test('section anchors leave their headings below the sticky navigation', async ({ page, isMobile }) => {
  await page.goto('/#main');
  // Native anchor scrolling respects the page offset without timing smooth scrolling.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  for (const section of ['About', 'Skills']) {
    if (isMobile) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    const navigation = page.getByRole('navigation', { name: isMobile ? 'Mobile navigation' : 'Main navigation', exact: true });
    await navigation.getByRole('link', { name: section, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${section.toLowerCase()}$`));
    if (isMobile) await expect(page.locator('#mobile-nav')).toHaveCount(0);
    await expectFloatingNavbar(page);
    const heading = page.locator(`#${section.toLowerCase()}`).getByRole('heading', { name: section, exact: true });
    await expect(heading).toBeVisible();
    await expect.poll(async () => {
      const headingBox = await heading.boundingBox();
      const navbarBox = await page.locator('.navbar-shell').boundingBox();
      return headingBox!.y - (navbarBox!.y + navbarBox!.height);
    }).toBeGreaterThanOrEqual(0);
  }
});

test('mobile menu and contact remain usable from the floating navbar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile menu is limited to narrow viewports.');
  await page.goto('/#main');
  await scrollTo(page, 600);
  await expectFloatingNavbar(page);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
  await expect(menu).toBeVisible();
  await menu.getByRole('button', { name: 'Contact', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Contact', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused();
  await expect(menu).toHaveCount(0);
  await expectFloatingNavbar(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('reduced motion preserves sticky navigation without a movement transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#main');
  await scrollTo(page, 450);
  const shell = page.locator('.navbar-shell');
  await expect(shell).toHaveAttribute('data-scrolled', 'true');
  await expect.poll(() => shell.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
  await expect(shell).toHaveCSS('transition-duration', '0s');
  await expect(shell).toHaveCSS('backdrop-filter', /blur\(/);
  await scrollTo(page, 0);
  await expect(shell).toHaveAttribute('data-scrolled', 'false');
});
