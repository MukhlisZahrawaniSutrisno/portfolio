import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemePreference = 'light' | 'dark'

const choices = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const saved = document.documentElement.dataset.themePreference
    return saved === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = preference
    document.documentElement.dataset.themePreference = preference
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', preference === 'dark' ? '#191a18' : '#f8f8f6')
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
