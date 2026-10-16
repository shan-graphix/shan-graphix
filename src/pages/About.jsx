import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone, Clock } from 'lucide-react'
import { useSettings } from '../context/PublicData.jsx'
import { PageHead } from '../components/ui.jsx'
import { Facebook, Instagram, TikTok } from '../components/BrandIcons.jsx'
import { telLink, waLink } from '../lib/format.js'

export default function About() {
  const s = useSettings()
  const nav = useNavigate()
  const taps = useRef({ n: 0, t: 0 })

  // Tap the logo 5 times quickly to open the admin sign-in. There is no public link to it.
  function logoTap() {
    const now = Date.now()
    taps.current = { n: now - taps.current.t < 1500 ? taps.current.n + 1 : 1, t: now }
    if (taps.current.n >= 5) {
      taps.current.n = 0
      nav('/admin')
    }
  }

  const contacts = [
    s.whatsapp && { href: waLink(s.whatsapp, 'Hi Shan Graphix'), Icon: MessageCircle, label: 'WhatsApp', sub: s.whatsapp, ext: true },
    s.phone && { href: telLink(s.phone), Icon: Phone, label: 'Call us', sub: s.phone },
    s.email && { href: `mailto:${s.email}`, Icon: Mail, label: 'Email', sub: s.email },
  ].filter(Boolean)
  const socials = [
    s.instagram && { href: s.instagram, Icon: Instagram, label: 'Instagram' },
    s.facebook && { href: s.facebook, Icon: Facebook, label: 'Facebook' },
    s.tiktok && { href: s.tiktok, Icon: TikTok, label: 'TikTok' },
  ].filter(Boolean)

  return (
    <div className="container inner">
      <PageHead title="About us" />
      <div className="about-grid">
        <div className="card about-card">
          <img src="logo.png" alt="Shan Graphix logo" className="about-logo" onClick={logoTap} draggable="false" />
          <h2>Shan Graphix</h2>
          <p>{s.about}</p>
          {(s.location || s.hours) && (
            <ul className="meta">
              {s.location && (
                <li>
                  <MapPin size={16} /> {s.location}
                </li>
              )}
              {s.hours && (
                <li>
                  <Clock size={16} /> {s.hours}
                </li>
              )}
            </ul>
          )}
          <Link to="/order" className="btn primary">
            Place an order
          </Link>
        </div>

        <div className="stack">
          {contacts.map(({ href, Icon, label, sub, ext }) => (
            <a key={label} className="contact card" href={href} target={ext ? '_blank' : undefined} rel="noopener noreferrer">
              <span className="icon-box">
                <Icon size={20} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{sub}</small>
              </span>
            </a>
          ))}
          {socials.length > 0 && (
            <div className="socials">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social card" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          )}
          {contacts.length === 0 && socials.length === 0 && (
            <div className="card contact">
              <span className="icon-box">
                <MessageCircle size={20} />
              </span>
              <span>
                <strong>Get in touch</strong>
                <small>Use the order form and we will reply.</small>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
