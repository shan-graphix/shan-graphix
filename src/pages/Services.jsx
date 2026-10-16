import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '../context/PublicData.jsx'
import { getIcon } from '../lib/icons.js'
import { PageHead } from '../components/ui.jsx'

export default function Services() {
  const { services } = useSettings()
  return (
    <div className="container inner">
      <PageHead title="Services" sub="Choose what you need. We handle the rest." />
      <div className="svc-list">
        {services.map((sv) => {
          const Icon = getIcon(sv.icon)
          return (
            <div key={sv.id} className="service card">
              <span className="icon-box lg">
                <Icon size={22} />
              </span>
              <div className="service-text">
                <h3>{sv.title}</h3>
                <p>{sv.desc}</p>
                <div className="service-foot">
                  <span className="price">{sv.price ? sv.price : 'Get a quote'}</span>
                  <Link to={`/order?service=${encodeURIComponent(sv.title)}`} className="link">
                    Order this <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
