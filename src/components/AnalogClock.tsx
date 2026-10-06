import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useMotionPreference } from '../useMotionPreference'
import ClockFace, { clockTime } from './ClockFace'

export default function AnalogClock() {
  const stage = useRef<HTMLDivElement>(null)
  const clock = useRef<SVGSVGElement>(null)
  const visible = useInView(stage, { amount: .2 })
  const reduced = useMotionPreference()
  const [initialTime] = useState(() => clockTime(Date.now()))

  useEffect(() => {
    const svg = clock.current!
    const hands = ['hour', 'minute', 'second'] as const
    const elements = hands.map(hand => svg.querySelector<SVGGElement>(`[data-hand="${hand}"]`)!)
    let frame = 0
    let timer = 0
    let label = ''
    const stop = () => { cancelAnimationFrame(frame); window.clearTimeout(timer) }
    const update = () => {
      const now = Date.now()
      const time = clockTime(reduced ? Math.floor(now / 1000) * 1000 : now)
      elements.forEach((element, index) => element.setAttribute('transform', `rotate(${time[hands[index]]} 160 160)`))
      if (label !== time.label) {
        label = time.label
        svg.setAttribute('aria-label', `Surabaya time: ${label} WIB (UTC+7)`)
        svg.setAttribute('data-clock-time', label)
      }
      if (visible && !document.hidden) {
        if (reduced) timer = window.setTimeout(update, 1000 - now % 1000)
        else frame = requestAnimationFrame(update)
      }
    }
    const resume = () => { stop(); update() }
    resume()
    document.addEventListener('visibilitychange', resume)
    return () => { stop(); document.removeEventListener('visibilitychange', resume) }
  }, [visible, reduced])

  return <div ref={stage} className="sculpture-stage clock-stage">
    <div className="sculpture-shadow" aria-hidden="true" />
    <div className="sculpture clock-body">
      <ClockFace ref={clock} time={initialTime} />
    </div>
    <span className="clock-label">SURABAYA · WIB</span>
  </div>
}
