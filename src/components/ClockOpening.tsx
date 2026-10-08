import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import ClockFace, { clockTime } from './ClockFace'
import { useMotionPreference } from '../useMotionPreference'
import { profile } from '../content'
import './clock-opening.css'

export default function ClockOpening({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'reverse' | 'forward' | 'reveal'>('reverse')
  const [time] = useState(() => clockTime(Date.now()))
  const layer = useRef<HTMLDivElement>(null)
  const clock = useRef<SVGSVGElement>(null)
  const leaving = useRef(false)
  const skipped = useRef(false)
  const turn = useRef(0)
  const reduced = useMotionPreference()
  const leave = useCallback(() => {
    if (leaving.current) return
    skipped.current = true
    leaving.current = true
    setPhase('forward')
  }, [])

  useEffect(() => {
    if (reduced || window.scrollY > 0 && phase === 'reverse' && !leaving.current) {
      onComplete()
      return
    }
    if (phase === 'reveal') {
      const fade = animate(layer.current!, { opacity: 0 }, { duration: skipped.current ? .6 : .8, ease: [.65, 0, .35, 1], onComplete })
      return () => fade.stop()
    }
    const hands = ['hour', 'minute', 'second'] as const
    const distance = [10, 120, 360]
    const elements = hands.map(hand => clock.current!.querySelector<SVGGElement>(`[data-opening-hand="${hand}"]`)!)
    const controls = animate(turn.current, phase === 'reverse' ? -1 : Math.max(0, turn.current + .65), {
      duration: phase === 'reverse' ? 2.4 : skipped.current ? .45 : .8,
      ease: [.45, 0, .2, 1],
      onUpdate: value => {
        turn.current = value
        elements.forEach((element, index) => element.setAttribute('transform', `rotate(${time[hands[index]] + value * distance[index]} 160 160)`))
      },
      onComplete: () => {
        leaving.current = true
        setPhase(phase === 'reverse' ? 'forward' : 'reveal')
      },
    })
    return () => controls.stop()
  }, [phase, reduced, onComplete, time])

  useEffect(() => {
    layer.current?.focus({ preventScroll: true })
    const wheel = (event: WheelEvent) => { if (Math.abs(event.deltaY) > 2) leave() }
    const scroll = () => { if (window.scrollY > 0) leave() }
    let touchY = 0
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0 }
    const touchMove = (event: TouchEvent) => {
      if (Math.abs((event.touches[0]?.clientY ?? touchY) - touchY) > 8) leave()
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        leave()
      } else if (['Escape', 'ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) {
        event.preventDefault()
        leave()
        if (event.key !== 'Escape') window.scrollBy({ top: event.key === 'ArrowDown' ? 100 : window.innerHeight * .7, behavior: 'instant' })
      }
    }
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('keydown', keyboard)
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('keydown', keyboard)
    }
  }, [leave])

  let letterIndex = 0
  return <div ref={layer} className="clock-opening" role="dialog" tabIndex={-1} aria-modal="true" aria-label="Portfolio introduction" data-phase={phase} data-skipping={skipped.current}>
    <div className="opening-atmosphere" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => <i className="opening-particle" key={index} style={{ left: `${(index * 37 + 9) % 100}%`, top: `${(index * 23 + 11) % 100}%`, animationDelay: `${-index * .47}s` }} />)}
    </div>
    <div className="opening-portal" aria-hidden="true">
      <div className="opening-orbit opening-orbit-outer" />
      <div className="opening-orbit opening-orbit-inner" />
      <div className="opening-orbit opening-orbit-arc" />
    </div>
    <div className="opening-dial"><ClockFace ref={clock} time={time} opening /></div>
    <p className="opening-name" role="img" aria-label={profile.fullName}>
      {profile.fullName.split(' ').map((word, index) => <span key={word} aria-hidden="true">
        {index > 0 && ' '}
        <span className="opening-word">{[...word].map((letter, index) => <span className="opening-letter" key={index} style={{ animationDelay: `${.75 + letterIndex++ * .035}s` }}>{letter}</span>)}</span>
      </span>)}
    </p>
    <div className="opening-light" aria-hidden="true" />
    <button className="opening-skip" type="button" onClick={leave}>Skip intro <span aria-hidden="true">↗</span></button>
    <div className="opening-progress" aria-hidden="true"><span /></div>
  </div>
}
