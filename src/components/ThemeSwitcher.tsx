import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

type ThemePreference = 'light' | 'dark' | 'system'

const choices = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

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

  return <div className="theme-switcher" role="group" aria-label="Appearance">
    {choices.map(({ value, label, Icon }) => <button
      type="button"
      key={value}
      aria-label={label}
      aria-pressed={preference === value}
      title={label}
      onClick={() => {
        setPreference(value)
        try { localStorage.setItem('muza-theme', value) } catch { /* Theme switching still works when storage is unavailable. */ }
      }}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>)}
  </div>
}
