import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { db } from '../firebase.js'

const cache = new Map() // full-size pictures already loaded in this visit

// Full-screen viewer. Swipe, use the arrows, or press Esc / the arrow keys.
export default function Lightbox({ works, index, onIndex, onClose }) {
  const open = index !== null && index >= 0 && !!works[index]
  const w = open ? works[index] : null
  const [full, setFull] = useState(null)
  const touch = useRef(null)

  const go = useCallback((d) => onIndex((i) => (i + d + works.length) % works.length), [onIndex, works.length])

  // The small preview shows first, then the full-size picture replaces it.
  useEffect(() => {
    if (!w) return
    if (cache.has(w.id)) {
      setFull(cache.get(w.id))
      return
    }
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

  if (!open) return null
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>
      {works.length > 1 && (
        <>
          <button className="lb-side prev" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
          <button className="lb-side next" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next">
            <ChevronRight size={22} />
          </button>
        </>
      )}
      <div
        className="lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return
          const dx = e.changedTouches[0].clientX - touch.current
          touch.current = null
          if (dx < -50) go(1)
          else if (dx > 50) go(-1)
        }}
      >
        <img key={w.id} className={`lb-img ${full ? '' : 'loading'}`} src={full || w.thumb} alt={w.title} draggable="false" />
      </div>
      <div className="lb-caption" onClick={(e) => e.stopPropagation()}>
        <strong>{w.title}</strong>
        <span>
          {w.category} · {index + 1} of {works.length}
        </span>
      </div>
    </div>
  )
}
