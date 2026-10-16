import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ImageOff, MessageCircle } from 'lucide-react'
import { useSettings, useWorks } from '../context/PublicData.jsx'
import { getIcon } from '../lib/icons.js'
import { waLink } from '../lib/format.js'
import { useReveal } from '../hooks/useReveal.js'
import { EmptyState, SectionHead, Skeleton } from '../components/ui.jsx'

const STEPS = [
  { n: '01', t: 'Tell us what you need', d: 'Pick a service and send a short brief with your details and deadline.' },
  { n: '02', t: 'We design it', d: 'We prepare your design and share it with you for feedback.' },
  { n: '03', t: 'Approve and receive', d: 'Once you are happy, you get final files ready to print or post.' },
]

export default function Home() {
  const s = useSettings()
  const { works, loading } = useWorks()
  const nav = useNavigate()
  const featured = works.filter((w) => w.featured)
  const pick = featured.length ? featured : works
  const bento = pick.slice(0, 5)
  const collage = pick.slice(0, 3)
  const wa = waLink(s.whatsapp, 'Hi Shan Graphix, I would like to order a design.')
  const [a, b] = s.services
  const A = getIcon(a?.icon)
  const B = getIcon(b?.icon)
  useReveal(loading, works.length)

  const open = (id) => nav('/portfolio', { state: { open: id } })

  return (
    <>
      {/* Hero */}
      <section className="hero container">
        <div className="hero-copy">
          <span className="pill">
            <i /> Graphic design studio{s.location ? ` · ${s.location}` : ''}
          </span>
          <h1>{s.tagline}</h1>
          <p className="lead">{s.intro}</p>
          <div className="hero-actions">
            <Link to="/order" className="btn primary lg">
              Order a design
            </Link>
            <Link to="/portfolio" className="btn ghost lg">
              View our work <ArrowRight size={16} />
            </Link>
          </div>
          <ul className="hero-list">
            {s.services.slice(0, 4).map((sv) => (
              <li key={sv.id}>{sv.title}</li>
            ))}
          </ul>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          {collage.length > 0 ? (
            collage.map((w, i) => (
              <figure key={w.id} className={`art-card c${i}`}>
                <img src={w.thumb} alt="" />
              </figure>
            ))
          ) : (
            <img className="art-mark" src="mark-white.png" alt="" />
          )}
          {a && (
            <div className="art-chip chip-a">
              <A size={16} /> {a.title}
            </div>
          )}
          {b && (
            <div className="art-chip chip-b">
              <B size={16} /> {b.title}
            </div>
          )}
        </div>
      </section>

      {/* Selected work */}
      <section className="section container reveal">
        <SectionHead
          title={featured.length ? 'Featured work' : 'Selected work'}
          sub="A look at recent designs."
          link={
            <Link to="/portfolio" className="link">
              View all <ArrowRight size={15} />
            </Link>
          }
        />
        {loading ? (
          <div className="bento">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} h="100%" r={14} style={{ minHeight: 120 }} />
            ))}
          </div>
        ) : bento.length === 0 ? (
          <EmptyState icon={ImageOff} title="New work is on its way" text="Our portfolio is being updated. Check back soon." />
        ) : (
          <div className="bento">
            {bento.map((w, i) => (
              <button key={w.id} className={`work-tile b${i}`} onClick={() => open(w.id)}>
                <img src={w.thumb} alt={w.title} loading="lazy" />
                <span className="tw-cap">
                  <strong>{w.title}</strong>
                  <small>{w.category}</small>
                </span>
              </button>
            ))}
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
        <div className="svc-grid">
          {s.services.map((sv) => {
            const Icon = getIcon(sv.icon)
            return (
              <Link key={sv.id} to={`/order?service=${encodeURIComponent(sv.title)}`} className="svc-card card">
                <span className="icon-box">
                  <Icon size={20} />
                </span>
                <h3>{sv.title}</h3>
                <p>{sv.desc}</p>
                <span className="svc-link">
                  Order <ArrowRight size={14} />
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
          <div className="cta-copy">
            <h2>Let us make something people remember.</h2>
            <p>Tell us what you need and we will come back with a quote.</p>
          </div>
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
