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
      const words = [...element.querySelectorAll('span > span')].map(word => {
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
