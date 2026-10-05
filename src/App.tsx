import { useRef, useState } from 'react'
import { motion, useSpring, useScroll, AnimatePresence } from 'motion/react'
import { ArrowUpRight, ArrowRight, Menu, X, Plus, Code2, PenTool, MousePointer2 } from 'lucide-react'
import Work from './components/Work'
import { profile, showSelectedWork } from './content'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import ContactLinks from './components/ContactLinks'
import ThemeSwitcher from './components/ThemeSwitcher'
import SeasonEffects from './components/SeasonEffects'
import { useMotionPreference } from './useMotionPreference'

function ContactDialog({ dialogRef }: { dialogRef: React.RefObject<HTMLDialogElement | null> }) {
  const [notice, setNotice] = useState('')
  return <dialog ref={dialogRef} className="contact-dialog" aria-labelledby="contact-title" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
    <div className="contact-dialog-inner">
      <button className="dialog-close" aria-label="Close contact" onClick={() => dialogRef.current?.close()}><X /></button>
      <h2 id="contact-title">Contact</h2>
      <form onSubmit={e => {
        e.preventDefault()
        if (!profile.email) { setNotice('Alamat email belum dikonfigurasi. Tambahkan email di src/content.ts sebelum menggunakan formulir ini.'); return }
        const data = new FormData(e.currentTarget)
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Project enquiry from ${data.get('name')}`)}&body=${encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`)}`
        setNotice('Draft email dibuka di aplikasi email kamu.')
      }}>
        <label>Your name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>What are you working on?<textarea name="message" rows={3} required /></label>
        <button className="button dark" type="submit">Create email draft <ArrowUpRight size={18} /></button>
        <p className="form-notice" role="status">{notice || 'This form opens your email app; it does not send automatically.'}</p>
      </form>
    </div>
  </dialog>
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const reduced = useMotionPreference()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const openContact = () => {
    if (menuOpen) menuRef.current?.focus()
    setMenuOpen(false)
    dialogRef.current?.showModal()
  }
  const services = [
    { title: 'Frontend development', icon: Code2, tags: 'React / TypeScript / Vite', text: 'Responsive, accessible web interfaces built with React and TypeScript.' },
    { title: 'UI/UX design', icon: PenTool, tags: 'Figma / Prototyping / Design systems', text: 'User flows, wireframes, prototypes, and interface design in Figma.' },
    { title: 'Creative interactions', icon: MousePointer2, tags: 'Motion / Micro-interactions / CSS', text: 'Web animations, transitions, and interactive details using Motion and CSS.' },
  ]
  return <>
    <SeasonEffects />
    <motion.div className="scroll-progress" style={{ scaleX: progress }} />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header container">
      <a className="wordmark" href="#" aria-label="Muza home">Muza</a>
      <nav className="desktop-nav" aria-label="Main navigation">{showSelectedWork && <a href="#work">Work</a>}<a href="#about">About</a><a href="#skills">Skills</a><button onClick={openContact}>Contact <ArrowUpRight size={14} /></button></nav>
      <div className="header-availability"><span className="status-dot" /> {profile.availability}</div>
      <ThemeSwitcher />
      <button ref={menuRef} className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <AnimatePresence>{menuOpen && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .25 }}>{showSelectedWork && <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>}<a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a><button onClick={openContact}>Contact <ArrowUpRight /></button></motion.nav>}</AnimatePresence>
    <main id="main">
      <Hero />
      {showSelectedWork && <Work />}
      <About onContact={openContact} />
      <Skills />
      <section className="services container"><div className="services-heading"><h2>Services</h2></div><div className="service-list">{services.map((s, i) => <article className={`service ${expanded === i ? 'expanded' : ''}`} key={s.title}><button className="service-trigger" aria-expanded={expanded === i} aria-controls={`service-${i}`} onClick={() => setExpanded(expanded === i ? null : i)}><s.icon size={20} /><span>{s.title}</span><Plus className="service-plus" size={20} /></button><AnimatePresence initial={false}>{expanded === i && <motion.div id={`service-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }} className="service-content"><p>{s.text}</p><span>{s.tags}</span></motion.div>}</AnimatePresence></article>)}</div></section>
      <section id="contact" className="contact"><div className="container"><div className="contact-top"><span><span className="status-dot" /> {profile.availability}</span></div><div className="contact-bottom"><button className="button light" onClick={openContact}>Start a conversation <ArrowRight size={17} /></button></div><ContactLinks /><footer><a className="footer-mark" href="#">Muza</a><a href="#">Back to top <ArrowUpRight size={12} /></a><span className="footer-year">2026</span></footer></div></section>
    </main>
    <ContactDialog dialogRef={dialogRef} />
  </>
}
