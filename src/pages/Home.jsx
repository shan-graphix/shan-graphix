import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ImageOff } from 'lucide-react'
import { useSettings } from '../context/SettingsContext.jsx'
import { useCollection } from '../hooks/useFirestore.js'
import { getIcon } from '../lib/icons.js'
import { Skeleton, EmptyState } from '../components/ui.jsx'

const word = {
  hidden: { opacity: 0, y: 18, rotateX: -40 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 160, damping: 16 } },
}

export default function Home() {
  const s = useSettings()
  const nav = useNavigate()
  const { items: works, loading } = useCollection('works', 'order')
  const featured = works.filter((w) => w.featured)
  const shown = (featured.length ? featured : works).slice(0, 8)

  return (
    <>
      <section className="hero">
        <motion.img
          src="mark-white.png"
          alt=""
          className="hero-mark"
          initial={{ scale: 0.5, rotate: -35, opacity: 0, x: 40 }}
          animate={{ scale: 1, rotate: 0, opacity: 0.2, x: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 11, delay: 0.1 }}
        />
        <div className="hero-copy">
          <motion.div className="hero-brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <img src="logo.png" alt="" /> Shan Graphix
          </motion.div>
          <motion.h1 initial="hidden" animate="show" transition={{ staggerChildren: 0.07, delayChildren: 0.25 }}>
            {s.tagline.split(' ').map((w, i) => (
              <motion.span key={i} variants={word} style={{ display: 'inline-block', marginRight: '0.28em' }}>
                {w}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {s.intro}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
            <Link to="/order" className="btn light">
              Order a design
            </Link>
            <Link to="/portfolio" className="btn ghost-light">
              See our work
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>{featured.length ? 'Featured work' : 'Latest work'}</h2>
          <Link to="/portfolio" className="link">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="scroller">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} h={220} style={{ minWidth: 190 }} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon={ImageOff} title="New work is on its way" text="Our portfolio is being updated. Check back soon." />
        ) : (
          <div className="scroller">
            {shown.map((w, i) => (
              <motion.button
                key={w.id}
                className="work-tile card press"
                onClick={() => nav('/portfolio', { state: { open: w.id } })}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
                whileTap={{ scale: 0.97 }}
              >
                <img src={w.thumb} alt={w.title} loading="lazy" />
                <span>{w.title}</span>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      <section className="block">
        <div className="block-head">
          <h2>What we design</h2>
          <Link to="/services" className="link">
            All services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="tiles">
          {s.services.slice(0, 4).map((sv) => {
            const Icon = getIcon(sv.icon)
            return (
              <Link key={sv.id} to="/services" className="tile card press">
                <span className="tile-icon">
                  <Icon size={22} />
                </span>
                <strong>{sv.title}</strong>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="block">
        <div className="cta card">
          <div>
            <h3>Have a design in mind?</h3>
            <p>Tell us what you need. We reply with a quote.</p>
          </div>
          <Link to="/order" className="btn primary">
            Start an order
          </Link>
        </div>
      </section>
    </>
  )
}
