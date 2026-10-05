import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import { ArrowDown, MousePointer2 } from 'lucide-react'
import { profile } from '../content'
import { useMotionPreference } from '../useMotionPreference'
import './hero-about.css'

const ease = [.22, 1, .36, 1] as const

function OrbitalAnimation() {
  const reduced = useMotionPreference()
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { amount: .2 })
  const bounds = useRef<DOMRect | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(y, { stiffness: 80, damping: 18 })
  const rotateY = useSpring(x, { stiffness: 80, damping: 18 })

  useEffect(() => {
    if (reduced) {
      x.set(0)
      y.set(0)
      rotateX.jump(0)
      rotateY.jump(0)
    }
  }, [reduced, x, y, rotateX, rotateY])

  useEffect(() => {
    const clearBounds = () => { bounds.current = null }
    window.addEventListener('resize', clearBounds)
    window.addEventListener('scroll', clearBounds, { passive: true })
    return () => {
      window.removeEventListener('resize', clearBounds)
      window.removeEventListener('scroll', clearBounds)
    }
  }, [])

  return <div ref={stage} className="sculpture-stage" aria-hidden="true"
    onPointerEnter={event => {
      if (reduced || event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      bounds.current = event.currentTarget.getBoundingClientRect()
    }}
    onPointerMove={event => {
      if (reduced || event.pointerType === 'touch' || !bounds.current) return
      const box = bounds.current
      x.set(((event.clientX - box.left) / box.width - .5) * 24)
      y.set(-((event.clientY - box.top) / box.height - .5) * 24)
    }}
    onPointerLeave={() => { bounds.current = null; x.set(0); y.set(0) }}>
    <div className="sculpture-shadow" />
    <motion.div className="sculpture" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY }}
      initial={reduced ? false : { scale: .94 }}
      animate={{ scale: 1 }}
      transition={{ duration: reduced ? 0 : .9, delay: reduced ? 0 : .12, ease }}>
      <div className="orbital-motion" style={{ animationPlayState: inView && !reduced ? 'running' : 'paused' }}>
        <div className="orbit-ring orbit-ring-one"><span className="orbit-node" /></div>
        <div className="orbit-ring orbit-ring-two"><span className="orbit-node" /></div>
        <div className="orbit-ring orbit-ring-three" />
        <div className="orbit-core" />
      </div>
    </motion.div>
    <span className="object-coordinate">Form in motion</span>
    <span className="object-hint"><MousePointer2 size={12} /> Move to explore</span>
  </div>
}

export default function Hero() {
  const reduced = useMotionPreference()
  return <section className="hero container">
    <div className="hero-copy">
      <motion.p className="hero-intro" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .45, ease }}>
        <span className="hero-occupation">Independent frontend developer & UI/UX designer</span>
      </motion.p>
      <h1>{profile.fullName.split(' ').map((line, index) => <span className="headline-mask" key={line}>
        <motion.span initial={reduced ? false : { y: '105%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : .7, delay: reduced ? 0 : .08 + index * .1, ease }}>{line}{index < profile.fullName.split(' ').length - 1 ? ' ' : ''}</motion.span>
      </span>)}</h1>
      <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : .32, duration: reduced ? 0 : .45, ease }}>
        <p className="hero-description">I connect the dots between design and development.<br className="desktop-break" /> Crafting digital experiences that look good,<br className="desktop-break" /> feel right, and work beautifully.</p>
        <a className="button dark" href="#work">Explore my work <ArrowDown size={16} /></a>
      </motion.div>
    </div>
    <div className="hero-art"><OrbitalAnimation /><div className="art-caption"><span>Where form meets function.</span><span>© {new Date().getFullYear()}</span></div></div>
    <div className="hero-bottom"><span>Based in {profile.location}, working everywhere.</span><a href="#work">Scroll to discover <ArrowDown size={12} /></a></div>
  </section>
}
