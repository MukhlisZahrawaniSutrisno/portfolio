import { expect, test } from '@playwright/test';

test('System follows live device changes with the legacy media listener API', async ({ page }) => {
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = matchMedia(query);
      if (query !== '(prefers-color-scheme: dark)') return media;
      return new Proxy(media, {
        get(target, property) {
          if (property === 'addEventListener' || property === 'removeEventListener') return undefined;
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    };
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('live System updates preserve form state and manual themes ignore device changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const documentHandle = await page.evaluateHandle(() => document);
  await page.locator('#contact').getByRole('button', { name: /let.s talk/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Your name').fill('Visitor');
  for (const scheme of ['dark', 'light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await expect(page.locator('html')).toHaveCSS('color-scheme', scheme);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', scheme === 'dark' ? '#191a18' : '#f8f8f6');
    await expect(dialog.getByLabel('Your name')).toHaveValue('Visitor');
  }
  expect(await page.evaluate(previous => previous === document, documentHandle)).toBe(true);
  await page.keyboard.press('Escape');
  for (const manual of ['Light', 'Dark'] as const) {
    await page.getByRole('button', { name: manual, exact: true }).click();
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await expect(page.locator('html')).toHaveAttribute('data-theme', manual.toLowerCase());
    }
  }
  await documentHandle.dispose();
});

test('appearance buttons support the keyboard without a visible theme label', async ({ page }) => {
  await page.goto('/');
  const controls = page.getByRole('group', { name: 'Appearance', exact: true });
  await expect(controls).not.toContainText(/Tema|Theme/);
  const light = controls.getByRole('button', { name: 'Light', exact: true });
  await light.focus();
  await page.keyboard.press('Enter');
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  const dark = controls.getByRole('button', { name: 'Dark', exact: true });
  await expect(dark).toBeFocused();
  await page.keyboard.press('Space');
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(light).toHaveAttribute('aria-pressed', 'false');
});

test('theme choices persist and System tracks device changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const theme = page.getByRole('group', { name: 'Appearance', exact: true });
  await expect(theme.getByRole('button', { name: 'System', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await theme.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.reload();
  await expect(theme.getByRole('button', { name: 'Light', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await theme.getByRole('button', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme.getByRole('button', { name: 'System', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.headline-letter').last()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: `test-results/theme-dark-${test.info().project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test('themes remain usable at narrow widths with readable forms and no decorative copy', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 320, height: 900 });
  const theme = page.getByRole('group', { name: 'Appearance', exact: true });
  for (const choice of ['Light', 'Dark', 'System']) {
    await theme.getByRole('button', { name: choice, exact: true }).click();
    await expect(theme).toBeVisible();
    await expect.poll(() => page.locator('.hero .button').evaluate(element => {
      const style = getComputedStyle(element);
      const luminance = (color: string) => {
        const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
    })).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.locator('#contact').getByRole('button', { name: /let.s talk/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Your name').fill('Visitor');
    await expect(dialog.getByLabel('Your name')).toHaveValue('Visitor');
    await expect(dialog.locator('[placeholder]')).toHaveCount(0);
    const colors = await dialog.evaluate(element => {
      const style = getComputedStyle(element);
      return { foreground: style.color, background: style.backgroundColor };
    });
    expect(colors.foreground).not.toBe(colors.background);
    await page.keyboard.press('Escape');
    await theme.scrollIntoViewIfNeeded();
  }
  await expect(page.locator('.discipline-strip, .art-caption, .object-coordinate, .about-signature, .about-note')).toHaveCount(0);
});

test('blocked storage falls back safely without breaking the switcher', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new Error('Storage unavailable'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('Storage unavailable'); } });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const theme = page.getByRole('group', { name: 'Appearance', exact: true });
  await expect(theme.getByRole('button', { name: 'System', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await theme.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme.getByRole('button', { name: 'System', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('saved theme is applied before React loads and invalid values use System', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.route(/\/src\/main\.tsx(?:\?.*)?$/, route => route.abort());
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('muza-theme', 'dark'));
  await page.reload();
  await expect(page.locator('#root')).toBeEmpty();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.evaluate(() => localStorage.setItem('muza-theme', 'invalid'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
