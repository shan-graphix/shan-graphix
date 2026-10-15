import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { doc, getDoc } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { db } from '../firebase.js'

const cache = new Map() // full-size pictures already loaded in this visit

// Full-screen viewer. Swipe, use the arrows, or press Esc / the arrow keys.
export default function Lightbox({ works, index, onIndex, onClose }) {
  const open = index !== null && index >= 0 && works[index]
  const w = open ? works[index] : null
  const [full, setFull] = useState(null)

  const go = useCallback((d) => onIndex((i) => (i + d + works.length) % works.length), [onIndex, works.length])

  // Load the full-size picture for the current work (the small preview shows first)
  useEffect(() => {
    if (!w) return
    if (cache.has(w.id)) return setFull(cache.get(w.id))
    setFull(null)
    let alive = true
    getDoc(doc(db, 'workImages', w.id))
      .then((snap) => {
        const data = snap.exists() ? snap.data().data : null
        if (data) cache.set(w.id, data)
        if (alive) setFull(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [w?.id])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, go, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <button className="lb-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
          {works.length > 1 && (
            <>
              <button className="lb-side prev" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous">
                <ChevronLeft size={26} />
              </button>
              <button className="lb-side next" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next">
                <ChevronRight size={26} />
              </button>
            </>
          )}
          <motion.div
            key={w.id}
            className="lb-stage"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1)
              else if (info.offset.x > 80) go(-1)
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img className={`lb-img ${full ? '' : 'loading'}`} src={full || w.thumb} alt={w.title} draggable="false" />
          </motion.div>
          <div className="lb-caption" onClick={(e) => e.stopPropagation()}>
            <div>
              <strong>{w.title}</strong>
              <span>
                {w.category} · {index + 1} of {works.length}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
