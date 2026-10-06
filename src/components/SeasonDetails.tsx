import './season-details.css'

type Season = 'rain' | 'dry' | 'sakura' | 'storm' | 'wind' | 'clear' | 'autumn'
type Location = 'heading' | 'skills'

function Leaf({ maple = false }: { maple?: boolean }) {
  return <svg viewBox="0 0 40 48" fill="none" className="detail-leaf">
    <path d={maple ? 'M20 2 25 13 32 8 30 19 39 18 33 28 37 32 24 36 20 44 16 36 3 32 7 28 1 18 10 19 8 8 15 13Z' : 'M20 3C30 7 31 10 28 14C38 15 36 21 30 23C38 27 32 32 26 32C28 38 22 41 20 44C18 41 12 38 14 32C8 32 2 27 10 23C4 21 2 15 12 14C9 10 10 7 20 3Z'} fill="currentColor" />
    <path d="M20 8V46M20 20 12 15M20 27 29 21M20 33 11 27" stroke="#745231" strokeWidth="1" opacity=".55" />
    <path d="M20 8V38" stroke="#ffe1a1" opacity=".45" />
  </svg>
}

function Petal() {
  return <svg viewBox="0 0 24 34" fill="none" className="detail-petal">
    <path d="M12 31C3 24 0 15 4 7C6 2 10 2 12 6C14 2 18 2 20 7C24 15 21 24 12 31Z" fill="currentColor" />
    <path d="M12 7C8 13 8 23 12 30" stroke="#fff2f0" strokeWidth="2" opacity=".7" />
    <path d="M13 9C17 15 17 22 12 30" stroke="#a65571" opacity=".35" />
  </svg>
}

export default function SeasonDetails({ season, location }: { season: Season; location: Location }) {
  if (location === 'skills' && !['sakura', 'autumn', 'wind'].includes(season)) return null
  return <span className="season-details" data-season={season} data-location={location} aria-hidden="true">
      {(season === 'sakura' || season === 'autumn' || season === 'wind') && Array.from({ length: season === 'sakura' ? 3 : 2 }, (_, index) => <span className={`detail-flight detail-flight-${index}`} key={index}>{season === 'sakura' ? <Petal /> : <Leaf maple={index === 0} />}</span>)}
      {season === 'rain' && <><span className="detail-bead detail-bead-one" /><span className="detail-bead detail-bead-two" /><span className="detail-ripple" /></>}
      {season === 'wind' && <svg className="detail-wake" viewBox="0 0 140 50" fill="none"><path d="M2 32C29 9 71 47 94 21C110 1 130 5 138 14M20 44C52 28 78 48 103 34" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>}
      {(season === 'clear' || season === 'dry') && <span className="detail-glint" />}
      {season === 'storm' && <span className="detail-edge-glow" />}
  </span>
}
