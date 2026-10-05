import { expect, test } from '@playwright/test';
import { showSelectedWork } from '../src/content';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('full identity and profile details are readable', async ({ page }) => {
  const hero = page.locator('.hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Mukhlis Zahrawani Sutrisno');
  await expect(hero.locator('.hero-full-name')).toHaveCount(0);
  expect((await hero.innerText()).match(/Mukhlis\s+Zahrawani\s+Sutrisno/g)).toHaveLength(1);
  const about = page.locator('#about');
  await expect(about).toContainText('Mukhlis Zahrawani Sutrisno');
  for (const label of ['Location', 'Focus', 'Stack']) {
    await expect(about.locator('dt', { hasText: label })).toBeVisible();
  }
});

test('headline letters enter sequentially without shifting the layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const heading = page.getByRole('heading', { level: 1, name: 'Mukhlis Zahrawani Sutrisno', exact: true });
  await expect(heading.locator('.headline-letter')).toHaveCount(24);
  const result = await heading.evaluate(element => {
    const letters = [...element.querySelectorAll<HTMLElement>('.headline-letter')];
    const animations = letters.flatMap(letter => letter.getAnimations()).filter(animation => animation.effect?.getTiming().iterations !== Infinity);
    const geometry = () => {
      const headingBox = element.getBoundingClientRect();
      const descriptionBox = document.querySelector('.hero-description')!.getBoundingClientRect();
      return [headingBox.x, headingBox.y, headingBox.width, headingBox.height, descriptionBox.y];
    };
    animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
    const before = geometry();
    animations.forEach(animation => { animation.currentTime = 350; });
    const opacity = letters.map(letter => Number(getComputedStyle(letter).opacity));
    animations.forEach(animation => animation.finish());
    return { before, after: geometry(), opacity, animationCount: animations.length };
  });
  expect(result.animationCount).toBe(24);
  expect(result.opacity[0]).toBeGreaterThan(result.opacity.at(-1)!);
  for (let index = 1; index < result.opacity.length; index++) {
    expect(result.opacity[index]).toBeLessThanOrEqual(result.opacity[index - 1]);
  }
  result.before.forEach((value, index) => expect(result.after[index]).toBeCloseTo(value, 1));
  await expect(heading.locator('.headline-letter').last()).toHaveCSS('opacity', '1');
  const loop = await heading.evaluate(element => {
    const letter = element.querySelector<HTMLElement>('.headline-letter')!;
    const animation = letter.getAnimations().find(animation => animation.effect?.getTiming().iterations === Infinity)!;
    const timing = animation.effect!.getTiming();
    animation.pause();
    animation.currentTime = Number(timing.delay);
    const before = element.getBoundingClientRect().toJSON();
    const start = letter.getBoundingClientRect().y;
    animation.currentTime = Number(timing.delay) + 500;
    return { duration: timing.duration, before, after: element.getBoundingClientRect().toJSON(), start, middle: letter.getBoundingClientRect().y };
  });
  expect(loop.duration).toBe(1000);
  expect(loop.middle).toBeLessThan(loop.start);
  expect(loop.after).toEqual(loop.before);
});

test('headline reduced motion reveals every letter immediately, including live changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const letters = page.locator('.headline-letter');
  await expect(letters).toHaveCount(24);
  await letters.evaluateAll(elements => elements.forEach(element => element.getAnimations().forEach(animation => {
    animation.pause();
    animation.currentTime = 200;
  })));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => letters.evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.opacity === '1' && style.transform === 'none' && element.getAnimations().length === 0;
  }))).toBe(true);
  await page.reload();
  await expect(letters).toHaveCount(24);
  expect(await letters.evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.opacity === '1' && style.transform === 'none' && element.getAnimations().length === 0;
  }))).toBe(true);
});

test('skills are grouped without invented database experience', async ({ page }) => {
  const skills = page.locator('#skills');
  for (const name of ['Languages', 'Frameworks & Libraries', 'Databases', 'Tools']) {
    await expect(skills.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(skills).toContainText('TypeScript');
  await expect(skills).toContainText('React');
  await expect(skills).toContainText('Vite');
});

test('contact links use the configured destinations and labels', async ({ page }) => {
  const contacts = page.getByRole('navigation', { name: 'Contact links' });
  const destinations = [
    { label: 'Gmail', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=mukhliszahrawanisutrisno@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/MukhlisZahrawaniSutrisno' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mukhlis-zahrawani-s-149b8843b' },
    { label: 'WhatsApp', href: 'https://wa.me/62895321686171' },
  ];
  for (const { label, href } of destinations) {
    await expect(contacts.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  const hrefs = await contacts.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(hrefs).toEqual(destinations.map(({ href }) => href));
});

test.describe('Surabaya analog clock', () => {
  test.use({ timezoneId: 'America/New_York' });

  async function handAngles(page: import('@playwright/test').Page) {
    return page.locator('.analog-clock [data-hand]').evaluateAll(elements => Object.fromEntries(elements.map(element => [
      element.getAttribute('data-hand'), Number(element.getAttribute('transform')!.match(/rotate\(([-\d.]+)/)![1]),
    ])));
  }

  async function expectCurrentTime(page: import('@playwright/test').Page, wholeSeconds = false) {
    await expect.poll(async () => {
      const now = await page.evaluate(() => Date.now());
      const time = new Date((wholeSeconds ? Math.floor(now / 1000) * 1000 : now) + 7 * 60 * 60 * 1000);
      const seconds = time.getUTCSeconds() + time.getUTCMilliseconds() / 1000;
      const minutes = time.getUTCMinutes() + seconds / 60;
      const expected = { hour: (time.getUTCHours() % 12 + minutes / 60) * 30, minute: minutes * 6, second: seconds * 6 };
      const actual = await handAngles(page);
      return Math.max(...Object.entries(expected).map(([hand, angle]) => {
        const difference = Math.abs(actual[hand] - angle);
        return Math.min(difference, 360 - difference);
      }));
    }).toBeLessThan(.15);
  }

  async function prepareClock(page: import('@playwright/test').Page, reduced = false) {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await page.clock.install({ time: new Date('2026-10-05T16:59:00Z') });
    await page.clock.pauseAt(new Date('2026-10-05T16:59:59.500Z'));
    await page.reload();
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    await page.locator('.sculpture-stage').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(page.locator('.analog-clock')).toBeVisible();
  }

  test('Roman dial keeps Surabaya time across midnight and moves between seconds', async ({ page }) => {
    await prepareClock(page);
    const clock = page.locator('.analog-clock');
    await expect(clock).toHaveAttribute('role', 'img');
    await expect(clock).toHaveAttribute('aria-label', /Surabaya/i);
    expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe('America/New_York');
    const numerals = await clock.locator('[data-clock-numeral]').allTextContents();
    expect(numerals).toHaveLength(12);
    expect([...numerals].sort()).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].sort());
    await expect(page.locator('.clock-label')).toHaveText('SURABAYA · WIB');
    await page.clock.runFor(32);
    await expectCurrentTime(page);
    const before = await handAngles(page);
    expect(before.hour).toBeGreaterThan(359);
    expect(before.second).toBeGreaterThan(357);
    await page.clock.runFor(200);
    await expectCurrentTime(page);
    const fractional = await handAngles(page);
    expect(fractional.second - before.second).toBeGreaterThan(.8);
    expect(fractional.second - before.second).toBeLessThan(1.4);
    await page.clock.runFor(800);
    await expectCurrentTime(page);
    const after = await handAngles(page);
    expect(after.hour).toBeLessThan(1);
    expect(after.minute).toBeLessThan(1);
    expect(after.second).toBeLessThan(6);
  });

  test('live reduced motion uses whole-second updates while keeping the time correct', async ({ page }) => {
    await prepareClock(page, true);
    await expectCurrentTime(page, true);
    const before = await handAngles(page);
    await page.clock.runFor(200);
    expect(await handAngles(page)).toEqual(before);
    await page.clock.runFor(1000);
    await expectCurrentTime(page, true);
    expect(await handAngles(page)).not.toEqual(before);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.runFor(32);
    await expectCurrentTime(page);
    const smooth = await handAngles(page);
    await page.clock.runFor(200);
    expect((await handAngles(page)).second).toBeGreaterThan(smooth.second);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.runFor(32);
    await expectCurrentTime(page, true);
    expect((await handAngles(page)).second % 6).toBeCloseTo(0, 6);
  });

  test('offscreen and hidden clocks pause and resynchronize on return', async ({ page }) => {
    await prepareClock(page);
    await page.clock.runFor(32);
    await page.locator('#contact').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.sculpture-stage')).not.toBeInViewport();
    await page.clock.runFor(32);
    const offscreen = await handAngles(page);
    await page.clock.runFor(2500);
    expect(await handAngles(page)).toEqual(offscreen);
    await page.locator('.sculpture-stage').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(page.locator('.sculpture-stage')).toBeInViewport();
    await page.clock.runFor(32);
    await expectCurrentTime(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const hidden = await handAngles(page);
    await page.clock.runFor(2500);
    expect(await handAngles(page)).toEqual(hidden);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.runFor(32);
    await expectCurrentTime(page);
  });
});

test('filtering preserves the visible retained project instead of fading the grid', async ({ page }) => {
  test.skip(!showSelectedWork, 'Selected Work is temporarily hidden.');
  const card = page.getByRole('button', { name: 'View Forma case study, concept project' });
  await card.evaluate(el => el.setAttribute('data-retained', 'yes'));
  await page.locator('#work').getByRole('button', { name: 'Frontend', exact: true }).click();
  await expect(card).toHaveAttribute('data-retained', 'yes');
  await expect(page.locator('.work-grid')).toHaveCSS('opacity', '1');
});

test('hero and profile sections fit narrow phones and tablets', async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const selector of ['.hero', '#about', '#skills', '#contact']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector)).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  }
});

test('skills navigation and service expansion remain usable', async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('navigation', { name: isMobile ? 'Mobile navigation' : 'Main navigation' }).getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page).toHaveURL(/#skills$/);
  const service = page.getByRole('button', { name: 'UI/UX design', exact: true });
  await service.click();
  await expect(service).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#service-1')).toContainText('Figma');
  await service.click();
  await expect(page.locator('#service-1')).toHaveCount(0);
});
