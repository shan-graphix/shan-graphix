import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { STATUSES } from '../config.js'

export function Skeleton({ h = 120, r = 14, style }) {
  return <div className="skeleton" style={{ height: h, borderRadius: r, ...style }} />
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty card">
      {Icon && (
        <div className="empty-icon">
          <Icon size={22} />
        </div>
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

// Two-step delete: the first tap asks, the second tap confirms.
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
      <Trash2 size={16} /> {armed ? confirmLabel : label}
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

export function SectionHead({ title, sub, link }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {link}
    </div>
  )
}

export function Chips({ items, value, onChange }) {
  return (
    <div className="chips" role="tablist">
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.id
        const l = typeof it === 'string' ? it : it.label
        return (
          <button key={v} role="tab" aria-selected={value === v} className={`chip ${value === v ? 'on' : ''}`} onClick={() => onChange(v)}>
            {l}
          </button>
        )
      })}
    </div>
  )
}
