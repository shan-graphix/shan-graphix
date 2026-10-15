import { lazy, Suspense } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { MotionConfig, motion } from 'framer-motion'
import { Home as HomeIcon, LayoutGrid, Sparkles, ShoppingBag, User } from 'lucide-react'
import { SettingsProvider } from './context/SettingsContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Services from './pages/Services.jsx'
import Order from './pages/Order.jsx'
import About from './pages/About.jsx'
import ScrollTop from './components/ScrollTop.jsx'

const Admin = lazy(() => import('./admin/AdminApp.jsx'))

const NAV = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/portfolio', label: 'Work', Icon: LayoutGrid },
  { to: '/services', label: 'Services', Icon: Sparkles },
  { to: '/order', label: 'Order', Icon: ShoppingBag },
  { to: '/about', label: 'About', Icon: User },
]

function Splash() {
  return (
    <div className="splash">
      <img src="logo.png" alt="" />
    </div>
  )
}

function PublicApp() {
  const loc = useLocation()
  return (
    <SettingsProvider>
      <ScrollTop />
      <div className="app">
        {/* Each page fades in. Nothing waits for an exit animation, so clicks always respond. */}
        <motion.main key={loc.pathname} className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/services" element={<Services />} />
            <Route path="/order" element={<Order />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </div>
      <BottomNav
        items={NAV}
        id="public"
        variant="top"
        brand={
          <Link to="/" className="brand-link">
            <img src="logo.png" alt="" /> Shan Graphix
          </Link>
        }
      />
    </SettingsProvider>
  )
}

export default function App() {
  const loc = useLocation()
  return (
    <MotionConfig reducedMotion="user">
      {loc.pathname.startsWith('/admin') ? (
        <Suspense fallback={<Splash />}>
          <Admin />
        </Suspense>
      ) : (
        <PublicApp />
      )}
    </MotionConfig>
  )
}
