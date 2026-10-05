import './season-details.css'

type Season = 'rain' | 'dry' | 'sakura' | 'storm' | 'wind' | 'clear' | 'autumn'
type Location = 'heading' | 'art' | 'skills'

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

function Squirrel() {
  return <svg className="detail-squirrel" viewBox="0 0 170 115" fill="none">
    <ellipse cx="92" cy="106" rx="45" ry="3" fill="#745231" opacity=".12" />
    <g className="squirrel-tail">
      <path d="M77 88C46 91 14 76 11 49C7 18 37 1 60 17C79 29 74 46 61 52C49 57 41 45 46 38C30 40 33 64 55 66C69 68 86 69 92 82Z" fill="#9b6540" />
      <path d="M73 85C46 83 23 66 25 44C26 29 40 22 51 28C38 26 30 35 32 47C34 63 51 70 69 70" stroke="#d4a878" strokeWidth="8" strokeLinecap="round" />
      <path d="M13 48 7 46M16 36 10 32M25 23 21 18M38 17 36 10M53 19 57 13M65 27 72 24M66 40 73 42" stroke="#9b6540" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g className="squirrel-body">
      <path d="M73 96C67 87 69 72 81 65C92 58 108 63 112 78L119 95C110 104 85 105 73 96Z" fill="#b07a4d" />
      <path d="M96 68C110 72 114 85 108 98C99 101 91 98 89 90C87 81 89 73 96 68Z" fill="#e7c8a0" />
      <path d="M100 52 99 32C106 29 112 38 112 49M115 50 125 34C133 37 131 49 125 57" fill="#9b6540" />
      <path d="M104 49 104 37 109 48M119 50 126 40 125 52" stroke="#d7a88e" strokeWidth="3" strokeLinecap="round" />
      <path d="M93 56C99 43 118 42 129 54L143 67C146 75 128 82 113 77C100 77 89 69 93 56Z" fill="#ba8558" />
      <path d="M129 60 143 67C146 72 135 79 124 76C121 70 123 64 129 60Z" fill="#efdab7" />
      <circle cx="122" cy="58" r="3.6" fill="#32291f" />
      <circle cx="123" cy="57" r="1.1" fill="#fff5df" />
      <path d="M141 65 146 67 142 70Z" fill="#47372b" />
      <path d="M136 73 141 72M138 75 151 76M138 72 152 70" stroke="#745231" strokeWidth=".8" strokeLinecap="round" />
      <path d="M78 92C82 88 91 89 96 96L102 100C100 106 84 106 77 101Z" fill="#9b6540" />
      <path d="M95 103H112M108 96 116 99 128 99" stroke="#9b6540" strokeWidth="5" strokeLinecap="round" />
      <g className="squirrel-paws">
        <ellipse cx="129" cy="86" rx="5" ry="7" transform="rotate(15 129 86)" fill="#805233" />
        <path d="M118 81 128 87M112 88 125 91" stroke="#ba8558" strokeWidth="5" strokeLinecap="round" />
        <path d="M125 82 132 83" stroke="#d4a878" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  </svg>
}

export default function SeasonDetails({ season, location }: { season: Season; location: Location }) {
  if (location === 'art' && season !== 'autumn') return null
  if (location === 'skills' && !['sakura', 'autumn', 'wind'].includes(season)) return null
  return <span className="season-details" data-season={season} data-location={location} aria-hidden="true">
    {location === 'art' ? <Squirrel /> : <>
      {(season === 'sakura' || season === 'autumn' || season === 'wind') && Array.from({ length: season === 'sakura' ? 3 : 2 }, (_, index) => <span className={`detail-flight detail-flight-${index}`} key={index}>{season === 'sakura' ? <Petal /> : <Leaf maple={index === 0} />}</span>)}
      {season === 'rain' && <><span className="detail-bead detail-bead-one" /><span className="detail-bead detail-bead-two" /><span className="detail-ripple" /></>}
      {season === 'wind' && <svg className="detail-wake" viewBox="0 0 140 50" fill="none"><path d="M2 32C29 9 71 47 94 21C110 1 130 5 138 14M20 44C52 28 78 48 103 34" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>}
      {(season === 'clear' || season === 'dry') && <span className="detail-glint" />}
      {season === 'storm' && <span className="detail-edge-glow" />}
    </>}
  </span>
}
