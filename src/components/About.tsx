import { ArrowUpRight } from 'lucide-react'
import { profile } from '../content'
import './hero-about.css'

export default function About({ onContact }: { onContact: () => void }) {
  return <section id="about" className="about container">
    <div className="about-grid">
      <div>
        <h2>About</h2>
        <dl className="about-facts">
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
          <div><dt>Stack</dt><dd><ul className="about-stack">{profile.stack.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
        </dl>
      </div>
      <div className="about-copy">
        <p>I’m {profile.fullName}, a frontend developer and UI/UX designer based in {profile.location}. I design in Figma and build in React, working through layouts, prototypes, and interface details.</p>
        <button className="text-link" onClick={onContact}>Contact <ArrowUpRight size={18} /></button>
      </div>
    </div>
  </section>
}
