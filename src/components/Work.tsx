import { useEffect, useRef, useState } from 'react'
import './work.css'

const projects = [
  {
    id: 'forma', name: 'Forma', subtitle: 'Digital banking, made human.', category: 'Frontend',
    tags: ['Frontend development', 'Product design'], year: '2025',
    challenge: 'Financial dashboards often turn everyday decisions into a wall of numbers. This independent concept explores a calmer way to see your money and decide what comes next.',
    process: 'I mapped the everyday tasks of checking balances, reviewing activity, and tracking savings. Low-fidelity layouts helped establish a clear hierarchy before I explored a restrained olive palette and reusable interface components.',
    solution: 'A focused dashboard brings the account balance, spending pattern, and recent transactions into one readable view. The interface concept prioritizes clear labels, generous spacing, and responsive layouts.',
  },
  {
    id: 'aesop', name: 'Aesop', subtitle: 'A quieter kind of commerce.', category: 'UI/UX',
    tags: ['UI/UX design', 'Commerce exploration'], year: '2025',
    challenge: 'How can an online store preserve the quiet, considered feeling of a physical space? This independent, unofficial Aesop concept explores product discovery without visual clutter.',
    process: 'I explored editorial layouts, product grouping, and a simplified path from browsing to product detail. Material-inspired colors and a deliberate typographic hierarchy connect the interface to the products.',
    solution: 'An editorial storefront pairs generous product imagery with concise descriptions and clear navigation. CSS-built product studies demonstrate the visual direction without relying on external assets.',
  },
] as const

type Project = typeof projects[number]
type Filter = 'All' | 'Frontend' | 'UI/UX'

function FormaPreview() {
  return (
    <div className="project-forma" aria-hidden="true">
      <div className="project-bank-sidebar">
        <span className="project-bank-logo">forma<span>®</span></span>
        <div className="project-bank-nav"><span className="project-bank-active">◉ &nbsp; Overview</span><span>↗ &nbsp; Transactions</span><span>▤ &nbsp; Accounts</span><span>◷ &nbsp; Analytics</span></div>
        <div className="project-bank-user"><span className="project-user-avatar">JD</span> Jamie Davis</div>
      </div>
      <div className="project-bank-main">
        <div className="project-bank-top"><span>Overview</span><span className="project-bank-search">Search anything &nbsp; ⌘ K</span></div>
        <div className="project-bank-greeting"><span>Welcome back, Jamie</span><small>Here's how your money is doing today.</small></div>
        <div className="project-bank-balance"><span>Total balance <small>↗</small></span><strong>$24,680<span>.50</span></strong><small>↗ 8.2% <span>from last month</span></small></div>
        <div className="project-bank-chart"><div><span>Cash flow</span><small>Last 6 months ⌄</small></div><svg viewBox="0 0 400 82" preserveAspectRatio="none"><path className="project-chart-grid" d="M0 20H400 M0 45H400 M0 70H400"/><path className="project-chart-fill" d="M0 68 C25 68 28 35 52 43 S91 71 116 46 S153 57 177 30 S205 53 233 29 S272 39 299 16 S330 39 352 18 S381 14 400 4 V82H0Z"/><path className="project-chart-line" d="M0 68 C25 68 28 35 52 43 S91 71 116 46 S153 57 177 30 S205 53 233 29 S272 39 299 16 S330 39 352 18 S381 14 400 4"/></svg><div className="project-chart-months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
        <div className="project-bank-transactions"><span>Recent activity <small>View all ↗</small></span><div><i>↗</i><span>Linear<small>Software subscription</small></span><b>−$16.00</b></div><div><i>↙</i><span>Monthly salary<small>Income</small></span><b>+$4,850.00</b></div></div>
      </div>
    </div>
  )
}

function AesopPreview() {
  return (
    <div className="project-aesop" aria-hidden="true">
      <div className="project-shop-nav"><span className="project-shop-logo">Aēsop</span><span>Skin care &nbsp;&nbsp; Body & hand &nbsp;&nbsp; Fragrance</span><span>Bag (0)</span></div>
      <div className="project-shop-intro"><span>Care for the everyday.</span><small>Considered formulations for the rituals<br/>that make a day your own.</small></div>
      <div className="project-shop-products">
        <div className="project-shop-product"><div className="project-bottle project-bottle-one"><div className="project-bottle-pump"/><div className="project-bottle-label"><strong>Aēsop</strong><span>Resurrection<br/>Aromatique<br/>Hand Wash</span><small>500 mL</small></div></div><div className="project-shop-caption"><span>Resurrection Aromatique<br/>Hand Wash</span><small>A gentle, everyday essential</small></div></div>
        <div className="project-shop-product"><div className="project-tube"><div className="project-tube-label"><strong>Aēsop</strong><span>Resurrection<br/>Aromatique<br/>Hand Balm</span><small>75 mL</small></div><div className="project-tube-cap"/></div><div className="project-shop-caption"><span>Resurrection Aromatique<br/>Hand Balm</span><small>Rich hydration, lasting comfort</small></div></div>
        <div className="project-shop-product"><div className="project-bottle project-bottle-two"><div className="project-bottle-cap"/><div className="project-bottle-label"><strong>Aēsop</strong><span>Geranium Leaf<br/>Body Cleanser</span><small>500 mL</small></div></div><div className="project-shop-caption"><span>Geranium Leaf<br/>Body Cleanser</span><small>A fresh start for the skin</small></div></div>
      </div>
      <div className="project-shop-footer"><span>Discover body & hand</span><span>↗</span></div>
    </div>
  )
}

export default function Work() {
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<Project | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [selected])

  function closeCaseStudy() {
    setSelected(null)
    trigger.current?.focus()
  }

  return (
    <section className="work-section container" id="work" aria-labelledby="work-title">
      <div className="work-intro"><p>A few things I've put my heart into.</p><span>Selected projects / 2025</span></div>
      <div className="work-heading-row"><h2 id="work-title">Selected work<span className="work-heading-dot">.</span></h2><span className="work-count">(02)</span></div>
      <div className="work-toolbar"><p>Thoughtful design. Purposeful development.</p><div className="work-filters" role="group" aria-label="Filter projects">{(['All', 'Frontend', 'UI/UX'] as const).map(item => <button type="button" key={item} aria-pressed={filter === item} className={filter === item ? 'work-filter work-filter-active' : 'work-filter'} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="work-grid">
        {projects.filter(project => filter === 'All' || project.category === filter).map(project => (
          <button className={`project-card project-card-${project.id}`} type="button" key={project.id} aria-label={`View ${project.name} case study, concept project`} onClick={event => { trigger.current = event.currentTarget; setSelected(project) }}>
            <div className={`project-preview project-preview-${project.id}`}>{project.id === 'forma' ? <FormaPreview/> : <AesopPreview/>}<span className="project-open" aria-hidden="true">↗</span></div>
            <div className="project-details"><div><h3>{project.name}<span> — {project.id === 'forma' ? 'digital banking' : 'commerce exploration'}</span></h3><p>{project.subtitle}</p></div><span className="project-year">{project.year}</span></div>
            <div className="project-meta"><div>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className="project-concept">Concept project</span></div>
          </button>
        ))}
      </div>
      <p className="work-result-count" aria-live="polite">{filter === 'All' ? '2 projects' : `1 ${filter} project`}</p>
      <dialog className="work-dialog" ref={dialog} onClose={closeCaseStudy} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} aria-labelledby="work-case-title">
        {selected && <div className="work-dialog-content"><div className="work-dialog-top"><span>Concept project · {selected.year}</span><button type="button" className="work-dialog-close" aria-label="Close case study" onClick={() => dialog.current?.close()} autoFocus>Close <span aria-hidden="true">×</span></button></div><h2 id="work-case-title">{selected.name}</h2><p className="work-dialog-subtitle">{selected.subtitle}</p><div className={`project-preview project-preview-${selected.id} work-dialog-preview`}>{selected.id === 'forma' ? <FormaPreview/> : <AesopPreview/>}</div><div className="work-case-sections">{(['challenge', 'process', 'solution'] as const).map(section => <div key={section}><h3>{section[0].toUpperCase() + section.slice(1)}</h3><p>{selected[section]}</p></div>)}</div><p className="work-case-note">An independent design exploration. No client affiliation or measured business results are implied.</p></div>}
      </dialog>
    </section>
  )
}
