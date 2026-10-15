import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import { useCollection } from '../hooks/useFirestore.js'
import { CATEGORIES } from '../config.js'
import { Chips, EmptyState, PageHead, Skeleton } from '../components/ui.jsx'
import Lightbox from '../components/Lightbox.jsx'

export default function Portfolio() {
  const { items: works, loading } = useCollection('works', 'order')
  const loc = useLocation()
  const navigate = useNavigate()
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(null)

  const cats = useMemo(() => ['All', ...CATEGORIES.filter((c) => works.some((w) => w.category === c))], [works])
  const list = useMemo(() => (cat === 'All' ? works : works.filter((w) => w.category === cat)), [works, cat])

  // Coming from the home page with a work selected
  useEffect(() => {
    const id = loc.state?.open
    if (id && works.length) {
      setCat('All')
      setOpen(works.findIndex((w) => w.id === id))
      navigate(loc.pathname, { replace: true, state: null })
    }
  }, [loc.state, works])

  return (
    <>
      <PageHead title="Our work" sub="Tap a design to view it full size." />
      {cats.length > 2 && <Chips id="work" items={cats} value={cat} onChange={setCat} />}

      {loading ? (
        <div className="masonry">
          {[220, 280, 180, 250].map((h, i) => (
            <Skeleton key={i} h={h} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={ImageOff} title="Nothing here yet" text="New designs will show up here soon." />
      ) : (
        <motion.div className="masonry" layout>
          {list.map((w, i) => (
            <motion.button
              key={w.id}
              layout
              className="m-item card press"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 8) * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src={w.thumb}
                alt={w.title}
                loading="lazy"
                style={w.width && w.height ? { aspectRatio: `${w.width} / ${w.height}` } : undefined}
              />
              <span className="m-cap">
                <strong>{w.title}</strong>
                <small>{w.category}</small>
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}

      <Lightbox works={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  )
}
