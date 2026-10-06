import { ArrowUpRight } from 'lucide-react'
import { profile } from '../content'
import './footer.css'

export default function Footer() {
  let letterIndex = 0
  return (
    <footer>
      <a className="footer-mark" href="#">Muza</a>
      <a href="#">Back to top <ArrowUpRight size={12} /></a>
      <span className="footer-year">2026</span>
      <div className="col-span-full mt-8 w-full overflow-hidden bg-[var(--bg)] px-[4%] py-8 text-[var(--text)] [container-type:inline-size]">
        <p className="footer-name m-0 text-center text-[14cqw] leading-[1.1] font-normal tracking-tight uppercase md:text-[5.3cqw]" role="img" aria-label={profile.fullName}>
          {profile.fullName.split(' ').map((word, index) => (
            <span key={word} aria-hidden="true">
              {index > 0 && ' '}
              <span className="footer-word block whitespace-nowrap md:inline-block">
                {[...word.toUpperCase()].map((letter, index) => (
                  <span className="footer-letter" key={index} style={{ animationDelay: `${letterIndex++ * .085}s` }}>{letter}</span>
                ))}
              </span>
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}
