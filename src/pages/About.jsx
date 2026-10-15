import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, MapPin, MessageCircle, Phone, Clock } from 'lucide-react'
import { Facebook, Instagram, TikTok } from '../components/BrandIcons.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { PageHead } from '../components/ui.jsx'
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
    s.whatsapp && { href: waLink(s.whatsapp, 'Hi Shan Graphix'), Icon: MessageCircle, label: 'WhatsApp', sub: s.whatsapp },
    s.phone && { href: telLink(s.phone), Icon: Phone, label: 'Call', sub: s.phone },
    s.email && { href: `mailto:${s.email}`, Icon: Mail, label: 'Email', sub: s.email },
  ].filter(Boolean)
  const socials = [
    s.instagram && { href: s.instagram, Icon: Instagram, label: 'Instagram' },
    s.facebook && { href: s.facebook, Icon: Facebook, label: 'Facebook' },
    s.tiktok && { href: s.tiktok, Icon: TikTok, label: 'TikTok' },
  ].filter(Boolean)

  return (
    <div className="narrow">
      <PageHead title="About us" />
      <motion.div className="card about-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <motion.img
          src="logo.png"
          alt="Shan Graphix logo"
          className="about-logo"
          onClick={logoTap}
          whileTap={{ scale: 0.92, rotate: -6 }}
          draggable="false"
        />
        <h2>Shan Graphix</h2>
        <p>{s.about}</p>
        {(s.location || s.hours) && (
          <ul className="meta">
            {s.location && (
              <li>
                <MapPin size={18} /> {s.location}
              </li>
            )}
            {s.hours && (
              <li>
                <Clock size={18} /> {s.hours}
              </li>
            )}
          </ul>
        )}
      </motion.div>

      {contacts.length > 0 && (
        <div className="stack gap">
          {contacts.map(({ href, Icon, label, sub }) => (
            <a key={label} className="contact card press" href={href} target={label === 'WhatsApp' ? '_blank' : undefined} rel="noopener noreferrer">
              <span className="tile-icon">
                <Icon size={22} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{sub}</small>
              </span>
            </a>
          ))}
        </div>
      )}

      {socials.length > 0 && (
        <div className="socials">
          {socials.map(({ href, Icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social card press" aria-label={label}>
              <Icon size={22} />
            </a>
          ))}
        </div>
      )}
      <p className="foot">© {new Date().getFullYear()} Shan Graphix</p>
    </div>
  )
}
