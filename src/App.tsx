import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useSpring, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'motion/react'
import { ArrowUpRight, ArrowRight, Menu, X, Plus, Code2, PenTool, MousePointer2 } from 'lucide-react'
import Work from './components/Work'
import { profile, showSelectedWork } from './content'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import ContactLinks from './components/ContactLinks'
import Footer from './components/Footer'
import ThemeSwitcher from './components/ThemeSwitcher'
import SeasonEffects from './components/SeasonEffects'
import ClockOpening from './components/ClockOpening'
import TextMarquee from './components/TextMarquee'
import { useMotionPreference } from './useMotionPreference'
import './components/navbar.css'

const isReload = () => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload'

function ContactDialog({ dialogRef }: { dialogRef: React.RefObject<HTMLDialogElement | null> }) {
  const [notice, setNotice] = useState('')
  return <dialog ref={dialogRef} className="contact-dialog" aria-labelledby="contact-title" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
    <div className="contact-dialog-inner">
      <button className="dialog-close" aria-label="Close contact" onClick={() => dialogRef.current?.close()}><X /></button>
      <h2 id="contact-title">Contact</h2>
      <form onSubmit={e => {
        e.preventDefault()
        if (!profile.email) { setNotice('Email is unavailable. Please use another contact link.'); return }
        const data = new FormData(e.currentTarget)
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Project enquiry from ${data.get('name')}`)}&body=${encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`)}`
        setNotice('Please review and send the draft in your email app.')
      }}>
        <label>Your name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Project details<textarea name="message" rows={3} required /></label>
        <button className="button dark" type="submit">Create email draft <ArrowUpRight size={18} /></button>
        <p className="form-notice" role="status">{notice || 'Opens an email draft for you to review and send.'}</p>
      </form>
    </div>
  </dialog>
}

export default function App() {
  const [opening, setOpening] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.location.hash && window.scrollY === 0 && !isReload())
  const restoreOpeningFocus = useRef(false)
  const finishOpening = useCallback(() => {
    restoreOpeningFocus.current = Boolean(document.activeElement?.closest('.clock-opening'))
    setOpening(false)
  }, [])
  useEffect(() => {
    if (!opening && restoreOpeningFocus.current) {
      restoreOpeningFocus.current = false
      document.getElementById('main')?.focus({ preventScroll: true })
    }
  }, [opening])
  useEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
    } else if (isReload() && typeof history.state?.muzaScrollY === 'number') {
      window.scrollTo({ top: history.state.muzaScrollY, behavior: 'instant' })
    }
    const savePosition = () => history.replaceState({ ...history.state, muzaScrollY: window.scrollY }, '')
    window.addEventListener('pagehide', savePosition)
    window.addEventListener('beforeunload', savePosition)
    return () => {
      window.removeEventListener('pagehide', savePosition)
      window.removeEventListener('beforeunload', savePosition)
    }
  }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(() => window.scrollY > 8)
  const [expanded, setExpanded] = useState<number | null>(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const reduced = useMotionPreference()
  const { scrollY, scrollYProgress } = useScroll()
  const navOffset = useTransform(scrollY, [0, 100], [0, 12])
  const navY = useSpring(navOffset, { stiffness: 180, damping: 28 })
  useMotionValueEvent(scrollY, 'change', latest => setNavScrolled(latest > 8))
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const openContact = () => {
    if (menuOpen) menuRef.current?.focus({ preventScroll: true })
    setMenuOpen(false)
    dialogRef.current?.showModal()
  }
  const services = [
    { title: 'Frontend development', icon: Code2, tags: 'React / TypeScript / Vite', text: 'I build responsive pages and reusable components with React and TypeScript.' },
    { title: 'UI/UX design', icon: PenTool, tags: 'Figma / Prototyping / Design systems', text: 'I plan user flows and develop wireframes, layouts, and prototypes in Figma.' },
    { title: 'Interface interactions', icon: MousePointer2, tags: 'Motion / CSS', text: 'I add transitions and feedback that make interface changes easier to follow.' },
  ]
  return <>
    <SeasonEffects />
    <div className="portfolio-content" inert={opening}>
    <motion.div className="scroll-progress" style={{ scaleX: progress }} />
    <a className="skip-link" href="#main">Skip to content</a>
    <motion.div className="navbar-shell" data-scrolled={navScrolled} style={{ y: reduced ? 0 : navY }}>
    <header className="header container">
      <a className="wordmark" href="#" aria-label="Muza home">Muza</a>
      <nav className="desktop-nav" aria-label="Main navigation">{showSelectedWork && <a href="#work">Work</a>}<a href="#about">About</a><a href="#skills">Skills</a><button onClick={openContact}>Contact <ArrowUpRight size={14} /></button></nav>
      <div className="header-availability"><span className="status-dot" /> {profile.availability}</div>
      <ThemeSwitcher />
      <button ref={menuRef} className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <AnimatePresence>{menuOpen && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .25 }}>{showSelectedWork && <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>}<a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a><button onClick={openContact}>Contact <ArrowUpRight /></button></motion.nav>}</AnimatePresence>
    </motion.div>
    <main id="main" tabIndex={-1}>
      <Hero />
      <TextMarquee />
      {showSelectedWork && <Work />}
      <About onContact={openContact} />
      <Skills />
      <section className="services container"><div className="services-heading"><h2>Services</h2></div><div className="service-list">{services.map((s, i) => <article className={`service ${expanded === i ? 'expanded' : ''}`} key={s.title}><button className="service-trigger" aria-expanded={expanded === i} aria-controls={`service-${i}`} onClick={() => setExpanded(expanded === i ? null : i)}><s.icon size={20} /><span>{s.title}</span><Plus className="service-plus" size={20} /></button><AnimatePresence initial={false}>{expanded === i && <motion.div id={`service-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }} className="service-content"><p>{s.text}</p><span>{s.tags}</span></motion.div>}</AnimatePresence></article>)}</div></section>
      <section id="contact" className="contact"><div className="container"><div className="contact-top"><span><span className="status-dot" /> {profile.availability}</span></div><div className="contact-bottom"><button className="button light" onClick={openContact}>Discuss a project <ArrowRight size={17} /></button></div><ContactLinks /><Footer /></div></section>
    </main>
    <ContactDialog dialogRef={dialogRef} />
    </div>
    {opening && <ClockOpening onComplete={finishOpening} />}
  </>
}
