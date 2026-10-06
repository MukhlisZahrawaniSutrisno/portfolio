import { ArrowUpRight } from 'lucide-react'
import { profile } from '../content'

export default function Footer() {
  return (
    <footer>
      <a className="footer-mark" href="#">Muza</a>
      <a href="#">Back to top <ArrowUpRight size={12} /></a>
      <span className="footer-year">2026</span>
      <div className="col-span-full mt-8 w-full overflow-hidden bg-[var(--bg)] px-[4%] py-8 text-[var(--text)] [container-type:inline-size]">
        <p className="footer-name m-0 text-center text-[14cqw] leading-[1.1] font-bold tracking-tighter uppercase md:text-[5.3cqw]" aria-label={profile.fullName}>
          {profile.fullName.split(' ').map((word, index) => (
            <span key={word}>{index > 0 && ' '}<span className="block md:inline">{word.toUpperCase()}</span></span>
          ))}
        </p>
      </div>
    </footer>
  )
}
