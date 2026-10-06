import type { Ref } from 'react'
import './analog-clock.css'

const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

export function clockTime(timestamp: number) {
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

type ClockFaceProps = {
  time: ReturnType<typeof clockTime>
  opening?: boolean
  ref?: Ref<SVGSVGElement>
}

export default function ClockFace({ time, opening = false, ref }: ClockFaceProps) {
  return <svg ref={ref} className={opening ? 'opening-clock' : 'analog-clock'} viewBox="0 0 320 320" role={opening ? undefined : 'img'} aria-hidden={opening || undefined} aria-label={opening ? undefined : `Surabaya time: ${time.label} WIB (UTC+7)`} data-clock-time={time.label}>
    <circle className="clock-case" cx="160" cy="160" r="152" />
    <circle className="clock-inner-rim" cx="160" cy="160" r="147" />
    <g aria-hidden="true">
      {Array.from({ length: 60 }, (_, index) => <line key={index} className={index % 5 === 0 ? 'clock-tick clock-hour-tick' : 'clock-tick'} x1="160" y1={index % 5 === 0 ? 24 : 27} x2="160" y2="31" transform={`rotate(${index * 6} 160 160)`} />)}
      {numerals.map((numeral, index) => {
        const angle = index * Math.PI / 6
        return <text key={numeral} data-clock-numeral data-opening-numeral={opening || undefined} x={160 + Math.sin(angle) * 113} y={160 - Math.cos(angle) * 113} dominantBaseline="central" textAnchor="middle">{numeral}</text>
      })}
      <g data-hand="hour" data-opening-hand={opening ? 'hour' : undefined} transform={`rotate(${time.hour} 160 160)`}><path className="clock-hour-hand" d="M157 173 L157 108 L160 94 L163 108 L163 173 Z" /></g>
      <g data-hand="minute" data-opening-hand={opening ? 'minute' : undefined} transform={`rotate(${time.minute} 160 160)`}><path className="clock-minute-hand" d="M158 179 L158 81 L160 65 L162 81 L162 179 Z" /></g>
      <g data-hand="second" data-opening-hand={opening ? 'second' : undefined} transform={`rotate(${time.second} 160 160)`}><line className="clock-second-hand" x1="160" y1="55" x2="160" y2="188" /><circle className="clock-counterweight" cx="160" cy="183" r="3" /></g>
      <circle className="clock-pin" cx="160" cy="160" r="5" />
      <circle className="clock-pin-core" cx="160" cy="160" r="1.6" />
    </g>
  </svg>
}
