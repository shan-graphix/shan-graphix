import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

// Custom dropdown: animated menu, keyboard friendly, opens upward when there is no room below.
export default function Select({ value, onChange, options, placeholder = 'Select', size = '', ariaLabel, className = '' }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const list = useRef(null)
  const current = opts.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const away = (e) => root.current && !root.current.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function show() {
    const r = root.current.getBoundingClientRect()
    const below = window.innerHeight - r.bottom
    setUp(below < 260 && r.top > below)
    setActive(Math.max(0, opts.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const pick = (o) => {
    onChange(o.value)
    setOpen(false)
  }

  function onKey(e) {
    if (e.key === 'Escape') return setOpen(false)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return show()
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length)
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault()
      pick(opts[active])
    }
  }

  return (
    <div ref={root} className={`select ${size} ${open ? 'open' : ''} ${up ? 'up' : ''} ${className}`} onKeyDown={onKey}>
      <button type="button" className="select-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => (open ? setOpen(false) : show())}>
        <span className={current ? '' : 'ph'}>{current ? current.label : placeholder}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <ul className="select-menu" role="listbox" ref={list}>
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${o.value === value ? 'sel' : ''} ${i === active ? 'act' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o)}
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={15} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
