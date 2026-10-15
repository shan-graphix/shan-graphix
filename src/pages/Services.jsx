import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '../context/SettingsContext.jsx'
import { getIcon } from '../lib/icons.js'
import { PageHead } from '../components/ui.jsx'

export default function Services() {
  const { services } = useSettings()
  return (
    <>
      <PageHead title="Services" sub="Pick what you need. We handle the rest." />
      <div className="stack svc-grid">
        {services.map((sv, i) => {
          const Icon = getIcon(sv.icon)
          return (
            <motion.div
              key={sv.id}
              className="service card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 220, damping: 24 }}
            >
              <span className="tile-icon lg">
                <Icon size={26} />
              </span>
              <div className="service-text">
                <h3>{sv.title}</h3>
                <p>{sv.desc}</p>
                <div className="service-foot">
                  <span className="price">{sv.price ? sv.price : 'Get a quote'}</span>
                  <Link to={`/order?service=${encodeURIComponent(sv.title)}`} className="link">
                    Order this <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
