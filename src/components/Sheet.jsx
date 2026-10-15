import { useEffect } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useMedia } from '../hooks/useMedia.js'

// Phones: bottom sheet (drag down to close). Computers: drawer sliding in from the right.
export default function Sheet({ open, onClose, title, children, footer }) {
  const controls = useDragControls()
  const desktop = useMedia('(min-width: 900px)')

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const from = desktop ? { x: '100%' } : { y: '100%' }
  const rest = desktop ? { x: 0 } : { y: 0 }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className={`sheet ${desktop ? 'drawer' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={from}
            animate={rest}
            exit={from}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            drag={desktop ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragListener={false}
            dragControls={controls}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
          >
            <div className="sheet-head" onPointerDown={(e) => !desktop && controls.start(e)}>
              <span className="grabber" />
              <h2>{title}</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="sheet-body">{children}</div>
            {footer && <div className="sheet-foot">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
