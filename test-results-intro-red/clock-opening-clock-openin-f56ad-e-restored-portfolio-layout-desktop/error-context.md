# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clock-opening.spec.ts >> clock opening is separate from the restored portfolio layout
- Location: tests\clock-opening.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Portfolio introduction' }).getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog', { name: 'Portfolio introduction' }).getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Portfolio introduction' }).getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Muza home":
    - /url: "#"
    - text: Muza
  - navigation "Main navigation":
    - link "About":
      - /url: "#about"
    - link "Skills":
      - /url: "#skills"
    - button "Contact":
      - text: Contact
      - img
  - text: Open to collaboration
  - group "Appearance":
    - button "Light" [pressed]
    - button "Dark"
- main:
  - paragraph: Frontend developer focused on clear, usable interfaces.
  - heading "Mukhlis Zahrawani Sutrisno" [level=1]
  - paragraph: I turn interface designs into responsive websites with React and TypeScript.
  - link "About me":
    - /url: "#about"
    - text: About me
    - img
  - 'img "Surabaya time: 11:43:33 WIB (UTC+7)"'
  - text: SURABAYA · WIB Based in Surabaya, Indonesia
  - link "Read about me":
    - /url: "#about"
    - text: Read about me
    - img
  - region "Frontend development, UI/UX design, and interface interactions"
  - heading "About" [level=2]
  - term: Location
  - definition: Surabaya, Indonesia
  - term: Focus
  - definition: Frontend development & UI/UX design
  - term: Stack
  - definition:
    - list:
      - listitem: React
      - listitem: TypeScript
      - listitem: Vite
      - listitem: Motion
      - listitem: CSS
  - paragraph: I’m Mukhlis Zahrawani Sutrisno, a frontend developer and UI/UX designer based in Surabaya, Indonesia. I design in Figma and build in React, working through layouts, prototypes, and interface details.
  - button "Contact":
    - text: Contact
    - img
  - region "Skills":
    - heading "Skills" [level=2]
    - heading "Languages" [level=3]
    - list:
      - listitem: TypeScript
      - listitem: JavaScript
      - listitem: HTML
      - listitem: CSS
    - heading "Frameworks & Libraries" [level=3]
    - list:
      - listitem: React
      - listitem: Motion
      - listitem: Lucide
    - heading "Databases" [level=3]
    - list:
      - listitem: MySQL
    - heading "Tools" [level=3]
    - list:
      - listitem: Vite
      - listitem: Git
      - listitem: GitHub
      - listitem: VS Code
      - listitem: Figma
  - heading "Services" [level=2]
  - article:
    - button "Frontend development" [expanded]:
      - img
      - text: Frontend development
      - img
    - paragraph: I build responsive pages and reusable components with React and TypeScript.
    - text: React / TypeScript / Vite
  - article:
    - button "UI/UX design":
      - img
      - text: UI/UX design
      - img
  - article:
    - button "Interface interactions":
      - img
      - text: Interface interactions
      - img
  - text: Open to collaboration
  - button "Discuss a project":
    - text: Discuss a project
    - img
  - navigation "Contact links":
    - list:
      - listitem:
        - link "Gmail":
          - /url: https://mail.google.com/mail/?view=cm&fs=1&to=mukhliszahrawanisutrisno@gmail.com
      - listitem:
        - link "GitHub":
          - /url: https://github.com/MukhlisZahrawaniSutrisno
      - listitem:
        - link "LinkedIn":
          - /url: https://www.linkedin.com/in/mukhlis-zahrawani-s-149b8843b
      - listitem:
        - link "WhatsApp":
          - /url: https://wa.me/62895321686171
  - link "Muza":
    - /url: "#"
  - link "Back to top":
    - /url: "#"
    - text: Back to top
    - img
  - text: "2026"
  - img "Mukhlis Zahrawani Sutrisno"
- dialog "Portfolio introduction"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('clock opening is separate from the restored portfolio layout', async ({ page }) => {
  4  |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  5  |   await page.clock.install();
  6  |   await page.clock.pauseAt(new Date());
  7  |   await page.goto('/');
  8  |   await expect(page.getByRole('dialog', { name: 'Portfolio introduction' })).toBeVisible();
  9  |   await expect(page.locator('.hero.container')).toHaveCount(1);
  10 |   await expect(page.locator('.cinematic-intro')).toHaveCount(0);
  11 |   await expect(page.locator('.portfolio-content')).toHaveAttribute('inert', '');
  12 |   const intro = page.getByRole('dialog', { name: 'Portfolio introduction' });
> 13 |   await expect(intro.getByRole('img', { name: 'Mukhlis Zahrawani Sutrisno' })).toBeVisible();
     |                                                                                ^ Error: expect(locator).toBeVisible() failed
  14 |   await expect(intro.getByRole('button', { name: 'Skip intro' })).toBeVisible();
  15 |   await expect(page.locator('.hero h1')).toHaveText('Mukhlis Zahrawani Sutrisno');
  16 |   const portfolioBefore = await page.locator('.hero.container').evaluate(element => {
  17 |     const style = getComputedStyle(element);
  18 |     return { color: style.color, background: style.backgroundColor, html: element.innerHTML };
  19 |   });
  20 |   await intro.getByRole('button', { name: 'Skip intro' }).click();
  21 |   await expect(intro).toHaveAttribute('data-phase', 'forward');
  22 |   await page.clock.runFor(1500);
  23 |   await expect(page.locator('.clock-opening')).toHaveCount(0);
  24 |   await expect(page.locator('.portfolio-content')).not.toHaveAttribute('inert');
  25 |   await expect(page.locator('#main')).toBeFocused();
  26 |   expect(await page.locator('.hero.container').evaluate(element => {
  27 |     const style = getComputedStyle(element);
  28 |     return { color: style.color, background: style.backgroundColor, html: element.innerHTML };
  29 |   })).toEqual(portfolioBefore);
  30 | });
  31 | 
```