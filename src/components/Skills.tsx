import { skillGroups } from '../content'
import './profile-sections.css'

export default function Skills() {
  return <section id="skills" className="skills-section container" aria-labelledby="skills-title">
    <div className="skills-section-heading">
      <h2 id="skills-title">Skills</h2>
      <p>The tools behind my work.</p>
    </div>
    <div className="skills-groups">
      {skillGroups.map(group => <div className="skills-group" key={group.name}>
        <h3>{group.name}</h3>
        {group.items.length ? <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="skills-empty">Details coming soon</p>}
      </div>)}
    </div>
  </section>
}
