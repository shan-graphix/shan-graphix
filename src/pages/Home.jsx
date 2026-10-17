import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ImageOff, MessageCircle } from 'lucide-react'
import { useSettings, useWorks } from '../context/PublicData.jsx'
import { getIcon } from '../lib/icons.js'
import { waLink } from '../lib/format.js'
import { useReveal } from '../hooks/useReveal.js'
import { EmptyState, SectionHead } from '../components/ui.jsx'

const STEPS = [
  { n: '01', t: 'Tell us what you need', d: 'Pick a service and send a short brief with your details and deadline.' },
  { n: '02', t: 'We design it', d: 'We prepare your design and share it with you for feedback.' },
  { n: '03', t: 'Approve and receive', d: 'Once you are happy, you get final files ready to print or post.' },
]

// The soft red spotlight on a card follows the mouse
function spot(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Home() {
  const s = useSettings()
  const { works, loading } = useWorks()
  const nav = useNavigate()
  const featured = works.filter((w) => w.featured)
  const pick = featured.length ? featured : works
  const wa = waLink(s.whatsapp, 'Hi Shan Graphix, I would like to order a design.')
  const words = s.tagline.split(' ')
  useReveal(loading, works.length)

  // Repeat the works so the moving strip always fills the screen, then double it for a seamless loop
  const strip = useMemo(() => {
    if (!pick.length) return []
    const reps = Math.max(1, Math.ceil(7 / pick.length))
    const half = Array.from({ length: reps }).flatMap(() => pick)
    return [...half, ...half]
  }, [pick])

  const line = [...s.services, ...s.services, ...s.services, ...s.services]
  const open = (id) => nav('/portfolio', { state: { open: id } })

  return (
    <>
      {/* Hero */}
      <section className="hero container">
        <div className="hero-fx" aria-hidden="true">
          <i className="hf-line" />
          <i className="hf-ring r1" />
          <i className="hf-ring r2" />
          <i className="hf-ring r3" />
          <i className="hf-orbit" />
        </div>
        <span className="pill">
          <i /> Graphic design studio{s.location ? ` · ${s.location}` : ''}
        </span>
        <h1 aria-label={s.tagline}>
          {words.map((w, i) => (
            <span className="w" key={i} aria-hidden="true" style={{ '--i': i }}>
              <span>{w}</span>
            </span>
          ))}
        </h1>
        <p className="lead">{s.intro}</p>
        <div className="hero-actions">
          <Link to="/order" className="btn primary lg">
            Order a design <ArrowRight size={16} />
          </Link>
          <Link to="/portfolio" className="btn ghost lg">
            View our work
          </Link>
        </div>
      </section>

      {/* Moving strip of services */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...line, ...line].map((sv, i) => (
            <span key={i} className="marquee-item">
              {sv.title}
            </span>
          ))}
        </div>
      </div>

      {/* Work */}
      <section className="section reveal">
        <div className="container">
          <SectionHead
            title={featured.length ? 'Featured work' : 'Selected work'}
            sub="Recent designs. Hover to pause, select to open."
            link={
              <Link to="/portfolio" className="link">
                View all <ArrowRight size={15} />
              </Link>
            }
          />
        </div>
        {loading ? (
          <div className="container">
            <div className="wm-skel" />
          </div>
        ) : pick.length === 0 ? (
          <div className="container">
            <EmptyState icon={ImageOff} title="New work is on its way" text="Our portfolio is being updated. Check back soon." />
          </div>
        ) : (
          <div className="work-marquee">
            <div className="wm-track" style={{ animationDuration: `${Math.max(30, strip.length * 5)}s` }}>
              {strip.map((w, i) => (
                <button key={`${w.id}-${i}`} className="wm-card" onClick={() => open(w.id)} tabIndex={i >= strip.length / 2 ? -1 : 0} aria-hidden={i >= strip.length / 2}>
                  <img src={w.thumb} alt={w.title} loading="lazy" draggable="false" />
                  <span className="wm-cap">
                    <strong>{w.title}</strong>
                    <small>{w.category}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Services */}
      <section className="section container reveal">
        <SectionHead
          title="What we design"
          sub="Everything your brand needs to look sharp."
          link={
            <Link to="/services" className="link">
              All services <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="svc-bento">
          {s.services.map((sv, i) => {
            const Icon = getIcon(sv.icon)
            return (
              <Link key={sv.id} to={`/order?service=${encodeURIComponent(sv.title)}`} className={`svc-tile ${i === 0 ? 'feature' : ''}`} onMouseMove={spot}>
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="icon-box">
                  <Icon size={20} />
                </span>
                <h3>{sv.title}</h3>
                <p>{sv.desc}</p>
                <span className="svc-link">
                  {sv.price ? sv.price : 'Order now'} <ArrowRight size={15} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Process */}
      <section className="section container reveal">
        <SectionHead title="How it works" sub="Simple from first message to final files." />
        <ol className="steps">
          {STEPS.map((st) => (
            <li key={st.n} className="step card">
              <span className="step-n">{st.n}</span>
              <h3>{st.t}</h3>
              <p>{st.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Call to action */}
      <section className="section container reveal">
        <div className="cta-band">
          <img className="cta-mark" src="mark-white.png" alt="" />
          <h2>Let us make something people remember.</h2>
          <p>Tell us what you need and we will come back with a quote.</p>
          <div className="cta-actions">
            <Link to="/order" className="btn white lg">
              Start your order
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn outline-white lg">
                <MessageCircle size={17} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
