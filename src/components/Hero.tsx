import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { profile, showSelectedWork } from '../content'
import { useMotionPreference } from '../useMotionPreference'
import AnalogClock from './AnalogClock'
import './hero-about.css'
import './intro.css'

const ease = [.22, 1, .36, 1] as const
const nameLines = profile.fullName.split(' ').map((word, index, words) => ({
  word,
  offset: words.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
}))

export default function Hero() {
  const reduced = useMotionPreference()
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0% 0% 0% 0%)', 'inset(4% 3% 3% 3%)'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, .91])
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const pointer = useMotionValue(0)
  const x = useSpring(pointer, { stiffness: 80, damping: 25 })
  return <section ref={section} className="hero cinematic-intro" aria-label="Introduction">
    <div className="intro-stage">
      <motion.div className="intro-panel container" style={{ clipPath: reduced ? 'none' : clipPath }} onPointerMove={event => {
        if (reduced || event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        pointer.set(((event.clientX - bounds.left) / bounds.width - .5) * 12)
      }} onPointerLeave={() => pointer.set(0)}>
        <div className="intro-top"><p>Frontend development & interface design</p><span>Based in {profile.location}</span></div>
        <motion.div className="hero-copy" style={{ scale: reduced ? 1 : scale, y: reduced ? 0 : y }}>
          <motion.div style={{ x: reduced ? 0 : x }}>
            <h1 aria-label={profile.fullName}>{nameLines.map(({ word, offset }, lineIndex) => <span className="headline-mask" aria-hidden="true" key={word}>
              <span className="headline-word">{Array.from(word).map((letter, index) => <span className="headline-letter" key={index} style={{ animationDelay: `${.12 + (offset + index) * .026}s` }}>{letter}</span>)}{lineIndex < nameLines.length - 1 ? ' ' : ''}</span>
            </span>)}</h1>
          </motion.div>
        </motion.div>
        <motion.div className="intro-footer" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : .9, duration: reduced ? 0 : .6, ease }}>
          <div className="intro-note">
            <p className="hero-description">I turn interface designs into responsive websites with React and TypeScript.</p>
            <a className="button dark" href={showSelectedWork ? '#work' : '#about'}>{showSelectedWork ? 'View projects' : 'About me'} <ArrowDown size={16} /></a>
          </div>
          <a className="intro-scroll" href={showSelectedWork ? '#work' : '#about'} aria-label={showSelectedWork ? 'View projects' : 'Read about me'}><span>Scroll to explore</span><ArrowDown size={22} strokeWidth={1} /></a>
          <div className="hero-art"><AnalogClock /></div>
        </motion.div>
      </motion.div>
    </div>
  </section>
}
