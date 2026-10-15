import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Images, Inbox, LayoutDashboard, LogOut, Settings as SettingsIcon, Users } from 'lucide-react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import { useCollection } from '../hooks/useFirestore.js'
import BottomNav from '../components/BottomNav.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Works from './Works.jsx'
import Customers from './Customers.jsx'
import Orders from './Orders.jsx'
import Settings from './Settings.jsx'

function Shell() {
  const { logout } = useAuth()
  const loc = useLocation()
  const { items: orders } = useCollection('orders', 'createdAt', 'desc')
  const fresh = orders.filter((o) => o.status === 'new').length

  const nav = [
    { to: '/admin', label: 'Home', Icon: LayoutDashboard, end: true },
    { to: '/admin/works', label: 'Works', Icon: Images },
    { to: '/admin/customers', label: 'Customers', Icon: Users },
    { to: '/admin/orders', label: 'Orders', Icon: Inbox, badge: fresh },
    { to: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
  ]

  return (
    <>
      <header className="admin-top">
        <Link to="/admin" className="admin-brand">
          <img src="logo.png" alt="" />
          <span>
            <strong>Shan Graphix</strong>
            <small>Admin</small>
          </span>
        </Link>
        <div className="admin-top-actions">
          <Link to="/" className="icon-btn" aria-label="View website">
            <ExternalLink size={20} />
          </Link>
          <button className="icon-btn" onClick={logout} aria-label="Sign out">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <div className="app admin-app">
        <motion.main key={loc.pathname} className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Routes location={loc}>
            <Route index element={<Dashboard orders={orders} />} />
            <Route path="works" element={<Works />} />
            <Route path="customers" element={<Customers orders={orders} />} />
            <Route path="orders" element={<Orders orders={orders} />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </motion.main>
      </div>
      <BottomNav
        items={nav}
        id="admin"
        variant="side"
        brand={
          <Link to="/admin" className="brand-link">
            <img src="logo.png" alt="" />
            <span>
              Shan Graphix
              <small>Admin</small>
            </span>
          </Link>
        }
        footer={
          <>
            <Link to="/" className="nav-action">
              <ExternalLink size={20} /> View website
            </Link>
            <button className="nav-action" onClick={logout}>
              <LogOut size={20} /> Sign out
            </button>
          </>
        }
      />
    </>
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
  return user ? <Shell /> : <Login />
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
