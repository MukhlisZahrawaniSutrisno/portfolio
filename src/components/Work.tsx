import { useEffect, useRef, useState } from 'react'
import './work.css'

const projects = [
  {
    id: 'forma', name: 'Forma', subtitle: 'Account balances and activity in one dashboard.', category: 'Frontend',
    tags: ['Frontend development', 'Product design'], year: '2025',
    challenge: 'This banking dashboard concept groups account balances, transaction history, and spending information.',
    process: 'The layout separates account summaries from transaction details and uses shared components for repeated interface elements.',
    solution: 'Balances, cash flow, and recent transactions appear in a responsive dashboard with clear labels.',
  },
  {
    id: 'aesop', name: 'Aesop', subtitle: 'A product-focused storefront concept.', category: 'UI/UX',
    tags: ['UI/UX design', 'Commerce exploration'], year: '2025',
    challenge: 'This unofficial Aesop storefront concept explores product browsing and navigation.',
    process: 'Product groups, headings, and images organize the catalogue and distinguish product information from navigation.',
    solution: 'Product images, descriptions, and navigation share a consistent layout. The preview uses CSS illustrations.',
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
      <div className="project-shop-intro"><span>Hand and body care.</span><small>Hand washes, balms,<br/>and body cleansers.</small></div>
      <div className="project-shop-products">
        <div className="project-shop-product"><div className="project-bottle project-bottle-one"><div className="project-bottle-pump"/><div className="project-bottle-label"><strong>Aēsop</strong><span>Resurrection<br/>Aromatique<br/>Hand Wash</span><small>500 mL</small></div></div><div className="project-shop-caption"><span>Resurrection Aromatique<br/>Hand Wash</span><small>Hand wash · 500 mL</small></div></div>
        <div className="project-shop-product"><div className="project-tube"><div className="project-tube-label"><strong>Aēsop</strong><span>Resurrection<br/>Aromatique<br/>Hand Balm</span><small>75 mL</small></div><div className="project-tube-cap"/></div><div className="project-shop-caption"><span>Resurrection Aromatique<br/>Hand Balm</span><small>Hand balm · 75 mL</small></div></div>
        <div className="project-shop-product"><div className="project-bottle project-bottle-two"><div className="project-bottle-cap"/><div className="project-bottle-label"><strong>Aēsop</strong><span>Geranium Leaf<br/>Body Cleanser</span><small>500 mL</small></div></div><div className="project-shop-caption"><span>Geranium Leaf<br/>Body Cleanser</span><small>Body cleanser · 500 mL</small></div></div>
      </div>
      <div className="project-shop-footer"><span>View hand and body care</span><span>↗</span></div>
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
      <div className="work-intro"><p>Frontend and UI/UX concepts.</p><span>Selected projects / 2025</span></div>
      <div className="work-heading-row"><h2 id="work-title">Selected work<span className="work-heading-dot">.</span></h2><span className="work-count">(02)</span></div>
      <div className="work-toolbar"><p>Browse by frontend development or UI/UX design.</p><div className="work-filters" role="group" aria-label="Filter projects">{(['All', 'Frontend', 'UI/UX'] as const).map(item => <button type="button" key={item} aria-pressed={filter === item} className={filter === item ? 'work-filter work-filter-active' : 'work-filter'} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
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
        {selected && <div className="work-dialog-content"><div className="work-dialog-top"><span>Concept project · {selected.year}</span><button type="button" className="work-dialog-close" aria-label="Close case study" onClick={() => dialog.current?.close()} autoFocus>Close <span aria-hidden="true">×</span></button></div><h2 id="work-case-title">{selected.name}</h2><p className="work-dialog-subtitle">{selected.subtitle}</p><div className={`project-preview project-preview-${selected.id} work-dialog-preview`}>{selected.id === 'forma' ? <FormaPreview/> : <AesopPreview/>}</div><div className="work-case-sections">{(['challenge', 'process', 'solution'] as const).map(section => <div key={section}><h3>{section[0].toUpperCase() + section.slice(1)}</h3><p>{selected[section]}</p></div>)}</div><p className="work-case-note">An unofficial concept with no client affiliation.</p></div>}
      </dialog>
    </section>
  )
}
