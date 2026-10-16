import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AlertTriangle, ExternalLink, Images, Inbox, LayoutDashboard, LogOut, Settings as SettingsIcon, Users } from 'lucide-react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import { AdminDataProvider, useAdminData } from '../context/AdminData.jsx'
import TabBar from '../components/TabBar.jsx'
import RouteBoundary from '../components/RouteBoundary.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Works from './Works.jsx'
import Customers from './Customers.jsx'
import Orders from './Orders.jsx'
import Settings from './Settings.jsx'

function Shell() {
  const { logout, user } = useAuth()
  const { orders, error } = useAdminData()
  const loc = useLocation()
  const fresh = orders.filter((o) => o.status === 'new').length

  const nav = [
    { to: '/admin', label: 'Home', Icon: LayoutDashboard, end: true },
    { to: '/admin/works', label: 'Works', Icon: Images },
    { to: '/admin/customers', label: 'Customers', Icon: Users },
    { to: '/admin/orders', label: 'Orders', Icon: Inbox, badge: fresh },
    { to: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
  ]

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link to="/admin" className="brand">
          <img src="logo.png" alt="" width="32" height="32" />
          <span>
            Shan Graphix
            <small>Admin</small>
          </span>
        </Link>
        <nav className="side-links" aria-label="Admin">
          {nav.map(({ to, label, Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} /> {label}
              {badge > 0 && <span className="side-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <Link to="/">
            <ExternalLink size={18} /> View website
          </Link>
          <div className="user-chip">
            <span className="avatar">{(user?.email || 'A')[0].toUpperCase()}</span>
            <span>
              <strong>Owner</strong>
              <small>{user?.email}</small>
            </span>
            <button className="icon-btn" onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="admin-header">
        <Link to="/admin" className="brand">
          <img src="logo.png" alt="" width="30" height="30" />
          <span>
            Shan Graphix
            <small>Admin</small>
          </span>
        </Link>
        <div className="admin-actions">
          <Link to="/" className="icon-btn" aria-label="View website">
            <ExternalLink size={18} />
          </Link>
          <button className="icon-btn" onClick={logout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="admin-main" key={loc.pathname}>
        {error && (
          <div className="alert">
            <AlertTriangle size={18} />
            <span>
              {error.code === 'permission-denied'
                ? 'Firebase refused to load your data. Publish the latest firestore.rules in Firebase and check that Firestore is created.'
                : 'Could not load your data. Check your internet connection.'}
            </span>
          </div>
        )}
        <RouteBoundary>
          <div className="page-anim" key={loc.pathname}>
          <Routes location={loc}>
            <Route path="/admin" element={<Dashboard orders={orders} />} />
            <Route path="/admin/works" element={<Works />} />
            <Route path="/admin/customers" element={<Customers orders={orders} />} />
            <Route path="/admin/orders" element={<Orders orders={orders} />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          </div>
        </RouteBoundary>
      </main>
      <TabBar items={nav} />
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="splash">
        <img src="logo.png" alt="" />
      </div>
    )
  return user ? (
    <AdminDataProvider>
      <Shell />
    </AdminDataProvider>
  ) : (
    <Login />
  )
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
