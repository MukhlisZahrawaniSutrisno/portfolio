import { useEffect, useState } from 'react'

type ThemePreference = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const saved = document.documentElement.dataset.themePreference
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
      document.documentElement.dataset.theme = theme
      document.documentElement.dataset.themePreference = preference
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#191a18' : '#f8f8f6')
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [preference])

  return <label className="theme-switcher">
    <span>Theme</span>
    <select aria-label="Theme" value={preference} onChange={event => {
      const next = event.target.value as ThemePreference
      setPreference(next)
      try { localStorage.setItem('muza-theme', next) } catch { /* Theme switching still works when storage is unavailable. */ }
    }}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </label>
}
