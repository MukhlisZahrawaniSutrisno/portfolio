import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useMotionPreference } from '../useMotionPreference'
import './season-effects.css'

const seasons = ['rain', 'dry', 'sakura', 'storm', 'wind', 'clear', 'autumn'] as const
type Season = typeof seasons[number]
const interval = 30_000

function nextSeason(current?: Season): Season {
  const choices = seasons.filter(season => season !== current)
  return choices[Math.floor(Math.random() * choices.length)]
}

export default function SeasonEffects() {
  const reduced = useMotionPreference()
  const [season, setSeason] = useState<Season>(() => nextSeason())
  const [paused, setPaused] = useState(() => document.hidden)
  const particles = useMemo(() => Array.from({ length: 12 }, () => ({
    '--x': `${Math.random() * 100}%`,
    '--y': `${7 + Math.random() * 80}%`,
    '--delay': `${-Math.random() * 20}s`,
    '--duration': `${12 + Math.random() * 10}s`,
  } as CSSProperties)), [season])

  useEffect(() => {
    if (reduced) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let remaining = interval
    let started = 0
    const schedule = () => {
      started = Date.now()
      timer = setTimeout(() => {
        setSeason(current => nextSeason(current))
        remaining = interval
        schedule()
      }, remaining)
    }
    const handleVisibility = () => {
      setPaused(document.hidden)
      if (document.hidden) {
        if (timer !== undefined) {
          clearTimeout(timer)
          timer = undefined
          remaining = Math.max(0, remaining - (Date.now() - started))
        }
      } else if (timer === undefined) schedule()
    }
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    document.documentElement.dataset.season = season
    document.documentElement.dataset.seasonPaused = String(paused)
    return () => {
      delete document.documentElement.dataset.season
      delete document.documentElement.dataset.seasonPaused
    }
  }, [season, paused, reduced])

  if (reduced) return null

  return <div className="season-effects" data-season={season} data-paused={String(paused)} aria-hidden="true">
    <div className="season-field" key={season}>
      {particles.map((style, index) => <span
        className="season-particle"
        key={index}
        style={style}
      />)}
    </div>
  </div>
}
