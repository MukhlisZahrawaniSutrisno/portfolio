import { useMemo, type CSSProperties } from 'react'
import './season-scene.css'

export type Season = 'rain' | 'dry' | 'sakura' | 'storm' | 'wind' | 'clear' | 'autumn'

function descriptors(count: number) {
  let seed = Math.floor(Math.random() * 0x7fffffff)
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 0x100000000
  }
  return Array.from({ length: count }, (_, index) => ({
    '--scene-x': `${random() * 116 - 8}%`,
    '--scene-y': `${random() * 100}%`,
    '--scene-delay': `${-random() * 26}s`,
    '--scene-speed': `${12 + random() * 14}s`,
    '--rain-speed': `${.9 + random() * 1.4}s`,
    '--scene-scale': `${.55 + random() * .95}`,
    '--scene-tilt': `${random() * 100 - 50}deg`,
    '--scene-drift': `${70 + random() * 150}px`,
    '--scene-alpha': `${.24 + random() * .32}`,
    '--scene-length': `${25 + random() * 65}px`,
    '--scene-index': index,
  } as CSSProperties))
}

function BlossomBranch() {
  return <svg className="scene-blossom-branch" data-element="blossom-branch" viewBox="0 0 500 380" fill="none">
    <defs>
      <radialGradient id="scene-blossom-paint"><stop stopColor="#f8f8f0" /><stop offset=".62" stopColor="#edc0cc" /><stop offset="1" stopColor="#c28298" /></radialGradient>
      <g id="scene-blossom">
        {[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cx="0" cy="-10" rx="8" ry="12" transform={`rotate(${angle})`} fill="url(#scene-blossom-paint)" />)}
        <circle r="4" fill="#b88865" /><circle r="1.5" fill="#f5e5b8" />
      </g>
    </defs>
    <path d="M-30 33C75 61 128 124 250 142S410 181 480 235M103 83C145 41 185 35 235 21M230 139C267 98 302 87 345 76M317 164C322 211 369 233 397 277M393 193C434 169 458 166 492 160" stroke="var(--scene-branch)" strokeWidth="8" strokeLinecap="round" />
    <path d="M111 80L148 68M241 137L273 113M336 212L364 215M422 178L447 147" stroke="var(--scene-branch)" strokeWidth="3" strokeLinecap="round" />
    {[[92, 75], [143, 67], [183, 35], [234, 22], [210, 136], [265, 115], [306, 87], [344, 75], [332, 211], [365, 229], [397, 276], [420, 178], [447, 148], [475, 231]].map(([x, y], index) => <use key={index} href="#scene-blossom" transform={`translate(${x} ${y}) rotate(${index * 27}) scale(${.7 + index % 3 * .2})`} />)}
  </svg>
}

function Leaf({ maple = false }: { maple?: boolean }) {
  return <svg viewBox="0 0 48 62" className="scene-leaf-art" fill="none">
    <path d={maple ? 'M24 2L30 16L39 11L36 25L47 25L37 35L40 43L27 42L25 56L22 56L21 42L8 43L11 35L1 25L12 25L9 11L18 16Z' : 'M24 3C36 4 44 13 40 22C49 28 40 34 37 38C44 46 30 51 24 55C17 51 4 46 11 38C6 34 -1 28 8 22C4 13 12 4 24 3Z'} fill="currentColor" />
    <path d="M24 8L23 61M23 25L13 18M24 22L34 15M23 38L12 31M24 35L37 28M23 47L15 42M24 45L33 39" stroke="var(--scene-leaf-vein)" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
}

export default function SeasonScene({ season }: { season: Season }) {
  const particles = useMemo(() => descriptors(60), [])
  const wet = season === 'rain' || season === 'storm'
  return <div className={`season-scene scene-${season}`} data-scene={season}>
    {wet && <>
      <div className="scene-wet-atmosphere" data-element="rain-mist" />
      <div className="scene-rain-depth scene-rain-far">
        {particles.slice(0, 20).map((style, index) => <i key={index} className="scene-raindrop" data-element="rain-drop" style={style} />)}
      </div>
      <div className="scene-rain-depth scene-rain-near">
        {particles.slice(20, season === 'storm' ? 60 : 44).map((style, index) => <i key={index} className="scene-raindrop" data-element="rain-drop" style={style} />)}
      </div>
      <div className="scene-ripple-bed">
        {particles.slice(0, 8).map((style, index) => <i key={index} className="scene-ripple" data-element="wet-ripple" style={style} />)}
      </div>
    </>}

    {season === 'storm' && <>
      <div className="scene-storm-light" data-element="storm-light" />
      {[0, 1, 2, 3].map(index => <div key={index} className={`scene-cloud-bank scene-cloud-bank-${index}`} data-element="storm-cloud" />)}
      <svg className="scene-lightning" data-element="branching-lightning" viewBox="0 0 260 420" fill="none">
        <path d="M147 0L120 80L147 91L87 173L111 183L70 257L91 263L26 406M121 80L176 121L184 157L225 189M110 183L153 217L152 252L184 287M70 257L34 273L14 317" stroke="var(--scene-lightning)" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M147 0L120 80L147 91L87 173L111 183L70 257L91 263L26 406" stroke="var(--scene-lightning)" strokeOpacity=".18" strokeWidth="9" />
      </svg>
    </>}

    {season === 'sakura' && <>
      <div className="scene-blossom-glow" data-element="blossom-glow" />
      <BlossomBranch />
      {particles.slice(0, 26).map((style, index) => <span className={`scene-falling scene-petal-flight ${index > 15 ? 'scene-depth-extra' : ''}`} style={style} key={index}>
        <i className="scene-petal" data-element="shaded-petal" />
      </span>)}
    </>}

    {season === 'autumn' && <>
      <div className="scene-autumn-light" data-element="autumn-light" />
      <svg className="scene-autumn-canopy" data-element="autumn-canopy" viewBox="0 0 480 300" fill="none">
        <path d="M500 -10C390 50 344 92 210 88S77 109 -20 172M347 55L329 4M223 89L186 28M116 100L92 155" stroke="var(--scene-branch)" strokeWidth="8" strokeLinecap="round" />
        {[[50, 139], [113, 85], [158, 92], [204, 77], [278, 86], [327, 48], [372, 31], [405, 9]].map(([x, y], index) => <g key={index} transform={`translate(${x} ${y}) rotate(${index * 31 - 50}) scale(.7)`}>
          <path d="M0 0L12 14L26 9L23 28L39 30L21 43L4 37L-12 45L-16 29L-29 20L-12 16L-15 3Z" fill={index % 2 ? 'var(--scene-leaf-gold)' : 'var(--scene-leaf-rust)'} />
          <path d="M0 0L5 39M2 17L21 14M3 23L-14 14" stroke="var(--scene-leaf-vein)" strokeWidth="1.5" />
        </g>)}
      </svg>
      {particles.slice(0, 20).map((style, index) => <span className={`scene-falling scene-leaf-flight ${index > 11 ? 'scene-depth-extra' : ''}`} style={style} key={index}>
        <span className={`scene-leaf-spin scene-leaf-tone-${index % 3}`} data-element={index % 2 ? 'oak-leaf' : 'maple-leaf'}><Leaf maple={index % 2 === 0} /></span>
      </span>)}
    </>}

    {season === 'wind' && <>
      <svg className="scene-wind-trails" data-element="curved-wind-trails" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        {[0, 1, 2, 3, 4, 5, 6].map(index => <path key={index} className={index > 3 ? 'scene-depth-extra' : ''} d={`M-180 ${120 + index * 115}C180 ${20 + index * 105} 370 ${235 + index * 60} 700 ${115 + index * 95}S1250 ${180 + index * 85} 1600 ${35 + index * 120}`} stroke="var(--scene-wind)" strokeWidth={index % 2 ? '.8' : '1.7'} strokeLinecap="round" pathLength="100" style={{ '--scene-delay': `${-index * 2.3}s`, '--scene-speed': `${8 + index}s` } as CSSProperties} />)}
      </svg>
      {particles.slice(0, 14).map((style, index) => <span className={`scene-wind-foliage ${index > 7 ? 'scene-depth-extra' : ''}`} style={style} key={index}>
        <i data-element="wind-foliage" />
      </span>)}
    </>}

    {(season === 'dry' || season === 'clear') && <>
      <div className="scene-solar-glow" data-element={season === 'dry' ? 'warm-heat-glow' : 'pale-skyglow'} />
      <div className="scene-solar-disc" data-element="soft-sun" />
      <div className="scene-ray-fan" data-element="sun-rays">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(index => <i key={index} className={index > 4 ? 'scene-depth-extra' : ''} style={{ '--ray-angle': `${-50 + index * 14}deg`, '--scene-delay': `${-index * 1.9}s` } as CSSProperties} />)}
      </div>
      {season === 'dry' ? <>
        <div className="scene-heat-haze" data-element="heat-haze" />
        <div className="scene-solar-flare" data-element="solar-flare" />
        <div className="scene-heat-shadow" data-element="heat-shadow" />
      </> : <>
        {[0, 1, 2].map(index => <div key={index} className={`scene-wisp scene-wisp-${index}`} data-element="wispy-cloud" />)}
      </>}
    </>}
  </div>
}
