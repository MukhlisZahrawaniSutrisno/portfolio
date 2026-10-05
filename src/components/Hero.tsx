import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { profile, showSelectedWork } from '../content'
import { useMotionPreference } from '../useMotionPreference'
import AnalogClock from './AnalogClock'
import './hero-about.css'

const ease = [.22, 1, .36, 1] as const
const nameLines = profile.fullName.split(' ').map((word, index, words) => ({
  word,
  offset: words.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
}))

export default function Hero() {
  const reduced = useMotionPreference()
  return <section className="hero container">
    <div className="hero-copy">
      <motion.p className="hero-intro" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .45, ease }}>
        <span className="hero-occupation">Frontend developer focused on clear, usable interfaces.</span>
      </motion.p>
      <h1 aria-label={profile.fullName}>{nameLines.map(({ word, offset }, lineIndex) => <span className="headline-mask" aria-hidden="true" key={word}>
        <span className="headline-word">{Array.from(word).map((letter, index) => <span className="headline-letter" key={index} style={{ animationDelay: `${.08 + (offset + index) * .024}s, ${.63 + (offset + index) * .024}s` }}>{letter}</span>)}{lineIndex < nameLines.length - 1 ? ' ' : ''}</span>
      </span>)}</h1>
      <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : .32, duration: reduced ? 0 : .45, ease }}>
        <p className="hero-description">I turn interface designs into responsive websites with React and TypeScript.</p>
        <a className="button dark" href={showSelectedWork ? '#work' : '#about'}>{showSelectedWork ? 'View projects' : 'About me'} <ArrowDown size={16} /></a>
      </motion.div>
    </div>
    <div className="hero-art"><AnalogClock /></div>
    <div className="hero-bottom"><span>Based in {profile.location}</span><a href={showSelectedWork ? '#work' : '#about'}>{showSelectedWork ? 'View projects' : 'Read about me'} <ArrowDown size={12} /></a></div>
  </section>
}
