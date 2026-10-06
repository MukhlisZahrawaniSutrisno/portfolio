import './text-marquee.css'

const phrases = ['Frontend development', 'UI/UX design', 'Interface interactions']

export default function TextMarquee() {
  return <section className="text-marquee" aria-label="Frontend development, UI/UX design, and interface interactions">
    <div className="text-marquee-window" aria-hidden="true">
      <div className="text-marquee-track">
        {[0, 1].map(copy => <div className="text-marquee-group" key={copy}>
          {phrases.map(phrase => <span className="text-marquee-item" key={phrase}>
            <span>{phrase}</span><span className="text-marquee-separator">·</span>
          </span>)}
        </div>)}
      </div>
    </div>
  </section>
}
