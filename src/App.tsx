import { useRef, useState } from 'react'
import { motion, useSpring, useScroll, AnimatePresence } from 'motion/react'
import { ArrowUpRight, ArrowRight, Menu, X, Plus, Code2, PenTool, MousePointer2 } from 'lucide-react'
import Work from './components/Work'
import { profile } from './content'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import ContactLinks from './components/ContactLinks'
import { useMotionPreference } from './useMotionPreference'

function ContactDialog({ dialogRef }: { dialogRef: React.RefObject<HTMLDialogElement | null> }) {
  const [notice, setNotice] = useState('')
  return <dialog ref={dialogRef} className="contact-dialog" aria-labelledby="contact-title" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
    <div className="contact-dialog-inner">
      <button className="dialog-close" aria-label="Close contact" onClick={() => dialogRef.current?.close()}><X /></button>
      <span className="small-label">A good place to start</span><h2 id="contact-title">Tell me about<br />your idea.</h2>
      <p>Have a project in mind? Let’s make something thoughtful.</p>
      <form onSubmit={e => {
        e.preventDefault()
        if (!profile.email) { setNotice('Alamat email belum dikonfigurasi. Tambahkan email di src/content.ts sebelum menggunakan formulir ini.'); return }
        const data = new FormData(e.currentTarget)
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Project enquiry from ${data.get('name')}`)}&body=${encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`)}`
        setNotice('Draft email dibuka di aplikasi email kamu.')
      }}>
        <label>Your name<input name="name" autoComplete="name" required placeholder="How should I call you?" /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
        <label>What are you working on?<textarea name="message" rows={3} required placeholder="A little about your project…" /></label>
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
    { title: 'Frontend development', icon: Code2, tags: 'React / TypeScript / Vite', text: 'Bringing designs to life with responsive, accessible interfaces. Clean components, considered performance, and the kind of details you can feel.' },
    { title: 'UI/UX design', icon: PenTool, tags: 'Figma / Prototyping / Design systems', text: 'Turning complex problems into clear experiences. From user flows and wireframes to a consistent visual language that works across every screen.' },
    { title: 'Creative interactions', icon: MousePointer2, tags: 'Motion / Micro-interactions / CSS', text: 'Movement with a purpose. Scroll choreography, expressive transitions, and small interactions that make a digital experience feel human.' },
  ]
  return <>
    <motion.div className="scroll-progress" style={{ scaleX: progress }} />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header container">
      <a className="wordmark" href="#" aria-label="Mukhlis home">mukhlis<span className="wordmark-star">✳</span></a>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#skills">Skills</a><button onClick={openContact}>Contact <ArrowUpRight size={14} /></button></nav>
      <div className="header-availability"><span className="status-dot" /> {profile.availability}</div>
      <button ref={menuRef} className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <AnimatePresence>{menuOpen && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .25 }}><a href="#work" onClick={() => setMenuOpen(false)}>Work</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#skills" onClick={() => setMenuOpen(false)}>Skills</a><button onClick={openContact}>Contact <ArrowUpRight /></button></motion.nav>}</AnimatePresence>
    <main id="main">
      <Hero />
      <div className="discipline-strip"><div className="container"><span>Design with intention.</span><span className="strip-star">✳</span><span>Develop with precision.</span><span className="strip-star">✳</span><span>Make it feel effortless.</span></div></div>
      <Work />
      <About onContact={openContact} />
      <Skills />
      <section className="services container"><div className="services-heading"><span className="small-label">How I can help</span><h2>From first idea<br />to final interaction.</h2></div><div className="service-list">{services.map((s, i) => <article className={`service ${expanded === i ? 'expanded' : ''}`} key={s.title}><button className="service-trigger" aria-expanded={expanded === i} aria-controls={`service-${i}`} onClick={() => setExpanded(expanded === i ? null : i)}><s.icon size={20} /><span>{s.title}</span><Plus className="service-plus" size={20} /></button><AnimatePresence initial={false}>{expanded === i && <motion.div id={`service-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }} className="service-content"><p>{s.text}</p><span>{s.tags}</span></motion.div>}</AnimatePresence></article>)}</div></section>
      <section id="contact" className="contact"><div className="container"><div className="contact-top"><span><span className="status-dot" /> Open to good conversations</span><span>Have something in mind?</span></div><button className="contact-cta" onClick={openContact}><span>Let’s talk</span><ArrowUpRight strokeWidth={1} /></button><div className="contact-bottom"><p>A new project, a collaboration,<br />or just a friendly hello.</p><button className="button light" onClick={openContact}>Start a conversation <ArrowRight size={17} /></button></div><ContactLinks /><footer><a className="footer-mark" href="#">mukhlis✳</a><span>Designed & developed with care.</span><a href="#">Back to top <ArrowUpRight size={12} /></a></footer></div></section>
    </main>
    <ContactDialog dialogRef={dialogRef} />
  </>
}
