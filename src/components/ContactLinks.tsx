import { ArrowUpRight, Github, Linkedin, Mail, MessageCircle } from 'lucide-react'
import { profile } from '../content'
import './profile-sections.css'

export default function ContactLinks() {
  const links = [
    {
      name: 'Gmail',
      href: profile.email
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}`
        : '',
      icon: Mail,
    },
    {
      name: 'GitHub',
      href: profile.github,
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: profile.linkedin,
      icon: Linkedin,
    },
    {
      name: 'WhatsApp',
      href: profile.whatsapp
        ? `https://wa.me/${profile.whatsapp}`
        : '',
      icon: MessageCircle,
    },
  ]

  return (
    <nav className="contact-links" aria-label="Contact links">
      <ul>
        {links.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={18} aria-hidden="true" />
                <span>{name}</span>
                <ArrowUpRight
                  size={16}
                  className="contact-links-arrow"
                  aria-hidden="true"
                />
              </a>
            ) : (
              <div className="contact-links-unavailable">
                <Icon size={18} aria-hidden="true" />
                <span>
                  {name} <small>Not available yet</small>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}