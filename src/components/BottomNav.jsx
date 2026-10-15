import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

// Phones: Telegram-style bottom bar. Computers: a top bar (public site) or a side bar (admin).
export default function BottomNav({ items, id = 'nav', variant = 'top', brand, footer }) {
  return (
    <nav className={`bottom-nav ${variant}`} aria-label="Main">
      {brand && <div className="nav-brand">{brand}</div>}
      <div className="nav-items">
        {items.map(({ to, label, Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end} className="nav-item">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId={`${id}-pill`} className="nav-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <motion.span
                  className="nav-icon"
                  animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
                </motion.span>
                <span className="nav-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {footer && <div className="nav-footer">{footer}</div>}
    </nav>
  )
}
