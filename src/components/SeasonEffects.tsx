import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMotionPreference } from '../useMotionPreference'
import SeasonScene, { type Season } from './SeasonScene'
import SeasonDetails from './SeasonDetails'
import './season-effects.css'

const seasons = ['rain', 'dry', 'sakura', 'storm', 'wind', 'clear', 'autumn'] as const
const interval = 5_000

function nextSeason(current?: Season): Season {
  const choices = seasons.filter(season => season !== current)
  return choices[Math.floor(Math.random() * choices.length)]
}

export default function SeasonEffects() {
  const reduced = useMotionPreference()
  const [season, setSeason] = useState<Season>(() => nextSeason())
  const [paused, setPaused] = useState(() => document.hidden)
  const [anchors, setAnchors] = useState<{ element: HTMLElement; location: 'heading' | 'art' | 'skills' }[]>([])

  useEffect(() => {
    const targets = [
      ['.hero h1', 'heading'],
      ['.hero-art', 'art'],
      ['.skills-groups', 'skills'],
    ] as const
    setAnchors(targets.flatMap(([selector, location]) => {
      const element = document.querySelector<HTMLElement>(selector)
      return element ? [{ element, location }] : []
    }))
  }, [])

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

  return <>
    <div className="season-effects" data-season={season} data-paused={String(paused)} aria-hidden="true">
      <div className="season-field" key={season}><SeasonScene season={season} /></div>
    </div>
    {anchors.map(({ element, location }) => createPortal(
      <SeasonDetails key={season} season={season} location={location} />, element, location,
    ))}
  </>
}
