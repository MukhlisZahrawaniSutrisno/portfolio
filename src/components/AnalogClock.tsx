import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useMotionPreference } from '../useMotionPreference'
import './analog-clock.css'

const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

function clockTime(timestamp: number) {
  // WIB is UTC+7 throughout the year, independent of the visitor's timezone.
  const date = new Date(timestamp + 7 * 60 * 60 * 1000)
  const seconds = date.getUTCSeconds() + date.getUTCMilliseconds() / 1000
  const minutes = date.getUTCMinutes() + seconds / 60
  return {
    hour: (date.getUTCHours() % 12 + minutes / 60) * 30,
    minute: minutes * 6,
    second: seconds * 6,
    label: [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()].map(value => String(value).padStart(2, '0')).join(':'),
  }
}

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
      <svg ref={clock} className="analog-clock" viewBox="0 0 320 320" role="img" aria-label={`Surabaya time: ${initialTime.label} WIB (UTC+7)`} data-clock-time={initialTime.label}>
        <circle className="clock-case" cx="160" cy="160" r="152" />
        <circle className="clock-inner-rim" cx="160" cy="160" r="147" />
        <g aria-hidden="true">
          {Array.from({ length: 60 }, (_, index) => <line key={index} className={index % 5 === 0 ? 'clock-tick clock-hour-tick' : 'clock-tick'} x1="160" y1={index % 5 === 0 ? 24 : 27} x2="160" y2="31" transform={`rotate(${index * 6} 160 160)`} />)}
          {numerals.map((numeral, index) => {
            const angle = index * Math.PI / 6
            return <text key={numeral} data-clock-numeral x={160 + Math.sin(angle) * 113} y={160 - Math.cos(angle) * 113} dominantBaseline="central" textAnchor="middle">{numeral}</text>
          })}
          <g data-hand="hour" transform={`rotate(${initialTime.hour} 160 160)`}><path className="clock-hour-hand" d="M157 173 L157 108 L160 94 L163 108 L163 173 Z" /></g>
          <g data-hand="minute" transform={`rotate(${initialTime.minute} 160 160)`}><path className="clock-minute-hand" d="M158 179 L158 81 L160 65 L162 81 L162 179 Z" /></g>
          <g data-hand="second" transform={`rotate(${initialTime.second} 160 160)`}><line className="clock-second-hand" x1="160" y1="55" x2="160" y2="188" /><circle className="clock-counterweight" cx="160" cy="183" r="3" /></g>
          <circle className="clock-pin" cx="160" cy="160" r="5" />
          <circle className="clock-pin-core" cx="160" cy="160" r="1.6" />
        </g>
      </svg>
    </div>
    <span className="clock-label">SURABAYA · WIB</span>
  </div>
}
