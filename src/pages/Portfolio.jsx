import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { useWorks } from '../context/PublicData.jsx'
import { CATEGORIES } from '../config.js'
import { Chips, EmptyState, PageHead, Skeleton } from '../components/ui.jsx'
import Lightbox from '../components/Lightbox.jsx'

export default function Portfolio() {
  const { works, loading } = useWorks()
  const loc = useLocation()
  const navigate = useNavigate()
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(null)

  const cats = useMemo(() => ['All', ...CATEGORIES.filter((c) => works.some((w) => w.category === c))], [works])
  const list = useMemo(() => (cat === 'All' ? works : works.filter((w) => w.category === cat)), [works, cat])

  // Arriving from the home page with one design selected
  useEffect(() => {
    const id = loc.state?.open
    if (id && works.length) {
      setCat('All')
      setOpen(works.findIndex((w) => w.id === id))
      navigate(loc.pathname, { replace: true, state: null })
    }
  }, [loc.state, works, loc.pathname, navigate])

  return (
    <div className="container inner">
      <PageHead title="Our work" sub="Select a design to view it full size." />
      {cats.length > 2 && <Chips items={cats} value={cat} onChange={setCat} />}

      {loading ? (
        <div className="masonry">
          {[220, 280, 180, 250].map((h, i) => (
            <Skeleton key={i} h={h} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={ImageOff} title="Nothing here yet" text="New designs will show up here soon." />
      ) : (
        <div className="masonry">
          {list.map((w, i) => (
            <button key={w.id} className="m-item" onClick={() => setOpen(i)}>
              <img src={w.thumb} alt={w.title} loading="lazy" style={w.width && w.height ? { aspectRatio: `${w.width} / ${w.height}` } : undefined} />
              <span className="m-cap">
                <strong>{w.title}</strong>
                <small>{w.category}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <Lightbox works={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  )
}
