import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import ClockFace, { clockTime } from './ClockFace'
import { profile } from '../content'
import { useMotionPreference } from '../useMotionPreference'
import './clock-opening.css'

export default function ClockOpening({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'reverse' | 'forward' | 'reveal'>('reverse')
  const [time] = useState(() => clockTime(Date.now()))
  const layer = useRef<HTMLDivElement>(null)
  const clock = useRef<SVGSVGElement>(null)
  const skip = useRef<HTMLButtonElement>(null)
  const leaving = useRef(false)
  const turn = useRef(0)
  const reduced = useMotionPreference()

  useEffect(() => {
    if (reduced || window.scrollY > 0 && phase === 'reverse' && !leaving.current) {
      onComplete()
      return
    }
    if (phase === 'reveal') {
      const fade = animate(layer.current!, { opacity: 0 }, { duration: .45, ease: 'easeInOut', onComplete })
      return () => fade.stop()
    }
    const hands = ['hour', 'minute', 'second'] as const
    const distance = [10, 120, 360]
    const elements = hands.map(hand => clock.current!.querySelector<SVGGElement>(`[data-opening-hand="${hand}"]`)!)
    const controls = animate(turn.current, phase === 'reverse' ? -1 : Math.max(0, turn.current + .65), {
      duration: phase === 'reverse' ? 1.8 : .75,
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
    skip.current?.focus({ preventScroll: true })
    const leave = () => {
      if (leaving.current) return
      leaving.current = true
      setPhase('forward')
    }
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
        skip.current?.focus({ preventScroll: true })
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
  }, [])

  return <div ref={layer} className="clock-opening" role="dialog" aria-modal="true" aria-label="Portfolio introduction" data-phase={phase}>
    <p className="opening-name">{profile.fullName}</p>
    <ClockFace ref={clock} time={time} opening />
    <button ref={skip} className="opening-skip" onClick={() => {
      if (leaving.current) return
      leaving.current = true
      setPhase('forward')
    }}>Skip intro</button>
  </div>
}
