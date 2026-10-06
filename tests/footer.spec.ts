import { expect, test } from '@playwright/test'

test('footer name stays fully visible from narrow phones to wide desktops', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#contact')
  await page.evaluate(() => document.fonts.ready)
  const name = page.locator('footer .footer-name')
  await expect(name).toHaveText('MUKHLIS ZAHRAWANI SUTRISNO')

  for (const width of [320, 390, 767, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await name.scrollIntoViewIfNeeded()
    await expect(name).toBeVisible()
    const layout = await name.evaluate(element => {
      const panel = element.parentElement!.getBoundingClientRect()
      const words = [...element.querySelectorAll('.footer-word')].map(word => {
        const range = document.createRange()
        range.selectNodeContents(word)
        const bounds = range.getBoundingClientRect()
        return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }
      })
      return {
        panel: { left: panel.left, right: panel.right, top: panel.top, bottom: panel.bottom },
        words,
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }
    })
    expect(layout.content, `page overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport + 1)
    for (const word of layout.words) {
      expect(word.left, `left clipping at ${width}px`).toBeGreaterThanOrEqual(layout.panel.left)
      expect(word.right, `right clipping at ${width}px`).toBeLessThanOrEqual(layout.panel.right)
      expect(word.top, `top clipping at ${width}px`).toBeGreaterThanOrEqual(layout.panel.top)
      expect(word.bottom, `bottom clipping at ${width}px`).toBeLessThanOrEqual(layout.panel.bottom)
    }
  }
})

test('footer letters disappear in sequence and repeat without moving the text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/#contact')
  const name = page.locator('footer .footer-name')
  await name.scrollIntoViewIfNeeded()
  const letters = name.locator('.footer-letter')
  await expect(letters).toHaveCount(24)
  await expect(name).toHaveAccessibleName('Mukhlis Zahrawani Sutrisno')
  const frames = await name.evaluate(element => {
    const letters = [...element.querySelectorAll<HTMLElement>('.footer-letter')]
    const animations = letters.map(letter => letter.getAnimations()[0])
    animations.forEach(animation => animation.pause())
    const sample = (time: number) => {
      animations.forEach(animation => { animation.currentTime = time })
      return letters.map(letter => ({ opacity: Number(getComputedStyle(letter).opacity), width: letter.getBoundingClientRect().width }))
    }
    return { start: sample(0), early: sample(2600), hidden: sample(4600), restored: sample(7500), repeat: sample(10600) }
  })
  expect(frames.start.every(letter => letter.opacity === 1)).toBe(true)
  expect(frames.early[0].opacity).toBe(0)
  expect(frames.early.at(-1)!.opacity).toBe(1)
  expect(frames.hidden.every(letter => letter.opacity === 0)).toBe(true)
  expect(frames.restored.every(letter => letter.opacity === 1)).toBe(true)
  expect(frames.repeat.map(letter => letter.opacity)).toEqual(frames.early.map(letter => letter.opacity))
  expect(frames.hidden.map(letter => letter.width)).toEqual(frames.start.map(letter => letter.width))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(letters.first()).toHaveCSS('animation-name', 'none')
  await expect(letters.first()).toHaveCSS('opacity', '1')
  await expect(letters.last()).toHaveCSS('opacity', '1')
})
