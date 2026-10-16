import { NavLink } from 'react-router-dom'

// Phone tab bar, docked to the bottom edge of the screen.
export default function TabBar({ items }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {items.map(({ to, label, Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          <span className="tab-icon">
            <Icon size={22} />
            {badge > 0 && <span className="tab-badge">{badge > 9 ? '9+' : badge}</span>}
          </span>
          <span className="tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
