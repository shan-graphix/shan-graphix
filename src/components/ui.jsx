import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { STATUSES } from '../config.js'

export function Skeleton({ h = 120, r = 20, style }) {
  return <div className="skeleton" style={{ height: h, borderRadius: r, ...style }} />
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty card">
      {Icon && (
        <motion.div
          className="empty-icon"
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Icon size={28} />
        </motion.div>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.id === status) || STATUSES[0]
  return (
    <span className="badge" style={{ '--c': s.color }}>
      <i /> {s.label}
    </span>
  )
}

// Two-step delete: first tap asks, second tap confirms.
export function ConfirmButton({ onConfirm, label = 'Delete', confirmLabel = 'Tap again to delete', className = '' }) {
  const [armed, setArmed] = useState(false)
  const t = useRef()
  useEffect(() => () => clearTimeout(t.current), [])
  return (
    <button
      type="button"
      className={`btn danger ${armed ? 'armed' : ''} ${className}`}
      onClick={() => {
        if (armed) return onConfirm()
        setArmed(true)
        t.current = setTimeout(() => setArmed(false), 3000)
      }}
    >
      <Trash2 size={18} /> {armed ? confirmLabel : label}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Spinner() {
  return <span className="spinner" aria-label="Loading" />
}

export function PageHead({ title, sub, right }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </header>
  )
}

export function Chips({ items, value, onChange, id }) {
  return (
    <div className="chips" role="tablist">
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.id
        const l = typeof it === 'string' ? it : it.label
        const on = value === v
        return (
          <button key={v} role="tab" aria-selected={on} className={`chip ${on ? 'on' : ''}`} onClick={() => onChange(v)}>
            {on && <motion.span layoutId={`${id}-chip`} className="chip-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="chip-t">{l}</span>
          </button>
        )
      })}
    </div>
  )
}
