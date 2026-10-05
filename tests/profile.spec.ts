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
    const animations = letters.flatMap(letter => letter.getAnimations());
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
  for (const name of ['Languages', 'Frameworks & Libraries', 'Databases', 'Tools & Infrastructure']) {
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

test('reduced motion changes stop hero movement without reloading', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(page.locator('.headline-letter').last()).toHaveCSS('transform', 'none');
  const stage = page.locator('.sculpture-stage');
  const sculpture = page.locator('.sculpture');
  await expect.poll(() => stage.evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations === Infinity && animation.playState === 'running').length)).toBeGreaterThan(0);
  const box = await stage.boundingBox();
  if (!box) throw new Error('Sculpture stage missing');
  if (isMobile) {
    await stage.dispatchEvent('pointermove', { pointerType: 'touch', clientX: box.x + box.width * .8, clientY: box.y + box.height * .2 });
    await expect.poll(() => page.locator('.sculpture').evaluate(el => el.style.transform)).not.toMatch(/rotate[XY]\([^)]*[1-9]/);
  } else {
    await page.mouse.move(0, 0);
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
    await expect.poll(() => sculpture.evaluate(el => el.style.transform)).toMatch(/rotate[XY]\([^)]*[1-9]/);
    await page.mouse.move(0, 0);
    await expect.poll(() => sculpture.evaluate(el => el.style.transform)).not.toMatch(/rotate[XY]\([^)]*[1-9]/);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stage.dispatchEvent('pointermove', { pointerType: 'mouse', clientX: box.x, clientY: box.y });
  await expect.poll(() => page.locator('.sculpture').evaluate(el => el.style.transform)).not.toMatch(/rotate[XY]\([^)]*[1-9]/);
  await expect.poll(() => stage.evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations === Infinity && animation.playState === 'running').length)).toBe(0);
});

test('hero ambient motion pauses offscreen and resumes on return', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const orbitalMotion = page.locator('.orbital-motion');
  await expect(orbitalMotion).toHaveCSS('animation-play-state', 'running');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(orbitalMotion).toHaveCSS('animation-play-state', 'paused');
  await page.locator('.sculpture-stage').scrollIntoViewIfNeeded();
  await expect(orbitalMotion).toHaveCSS('animation-play-state', 'running');
});

test('touch pointers leave the hero sculpture untilted', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const stage = page.locator('.sculpture-stage');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Sculpture stage missing');
  const pointer = { pointerType: 'touch', clientX: box.x + box.width * .8, clientY: box.y + box.height * .2 };
  await stage.dispatchEvent('pointerenter', pointer);
  await stage.dispatchEvent('pointermove', pointer);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect.poll(() => page.locator('.sculpture').evaluate(el => el.style.transform)).not.toMatch(/rotate[XY]\([^)]*[1-9]/);
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
