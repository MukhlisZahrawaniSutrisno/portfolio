import { ArrowUpRight } from 'lucide-react'
import { profile } from '../content'
import './hero-about.css'

export default function About({ onContact }: { onContact: () => void }) {
  return <section id="about" className="about container">
    <div className="section-top"><span className="small-label">The person behind the pixels</span><span className="small-label">A little about me</span></div>
    <div className="about-grid">
      <div>
        <h2>A designer’s eye.<br />A developer’s mind.</h2>
        <div className="about-signature">mukhlis<span>✳</span></div>
        <dl className="about-facts">
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
          <div><dt>Stack</dt><dd><ul className="about-stack">{profile.stack.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
        </dl>
      </div>
      <div className="about-copy">
        <p>I’m {profile.fullName}, a frontend developer and UI/UX designer based in {profile.location}. I enjoy the space where thoughtful design meets well-crafted code.</p>
        <p>For me, a great interface is more than how it looks. It’s how naturally it guides you, how quickly it responds, and how much care goes into the smallest interaction.</p>
        <p className="about-note">Currently exploring the possibilities of motion on the web.</p>
        <button className="text-link" onClick={onContact}>More about your next project <ArrowUpRight size={18} /></button>
      </div>
    </div>
  </section>
}
