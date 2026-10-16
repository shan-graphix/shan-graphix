import { lazy, Suspense, useEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, LayoutGrid, Sparkles, ShoppingBag, User, Mail, Phone, MessageCircle } from 'lucide-react'
import { PublicDataProvider, useSettings } from './context/PublicData.jsx'
import TabBar from './components/TabBar.jsx'
import RouteBoundary from './components/RouteBoundary.jsx'
import ScrollTop from './components/ScrollTop.jsx'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Services from './pages/Services.jsx'
import Order from './pages/Order.jsx'
import About from './pages/About.jsx'
import { telLink, waLink } from './lib/format.js'

const Admin = lazy(() => import('./admin/AdminApp.jsx'))

const NAV = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/portfolio', label: 'Work', Icon: LayoutGrid },
  { to: '/services', label: 'Services', Icon: Sparkles },
  { to: '/order', label: 'Order', Icon: ShoppingBag },
  { to: '/about', label: 'About', Icon: User },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="bar">
          <Link to="/" className="brand">
            <img src="logo.png" alt="" width="30" height="30" />
            <span>Shan Graphix</span>
          </Link>
          <nav className="top-links" aria-label="Main">
            {NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link to="/order" className="btn primary sm top-cta">
            Order now
          </Link>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  const s = useSettings()
  const wa = waLink(s.whatsapp, 'Hi Shan Graphix')
  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <Link to="/" className="brand">
            <img src="logo.png" alt="" width="32" height="32" />
            <span>Shan Graphix</span>
          </Link>
          <p>{s.intro}</p>
        </div>
        <div className="foot-links">
          <strong>Explore</strong>
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </div>
        <div className="foot-links">
          <strong>Contact</strong>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          {s.phone && (
            <a href={telLink(s.phone)}>
              <Phone size={15} /> {s.phone}
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`}>
              <Mail size={15} /> {s.email}
            </a>
          )}
          {!wa && !s.phone && !s.email && <Link to="/order">Send an order request</Link>}
        </div>
      </div>
      <div className="container foot-base">© {new Date().getFullYear()} Shan Graphix. All rights reserved.</div>
    </footer>
  )
}

function PublicApp() {
  const loc = useLocation()
  return (
    <PublicDataProvider>
      <ScrollTop />
      <SiteHeader />
      <main className="page" key={loc.pathname}>
        <RouteBoundary>
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/services" element={<Services />} />
            <Route path="/order" element={<Order />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </RouteBoundary>
      </main>
      <SiteFooter />
      <TabBar items={NAV} />
    </PublicDataProvider>
  )
}

export default function App() {
  const loc = useLocation()
  const navigate = useNavigate()
  // Typing  site-address/#/admin  while already on the site opens the admin sign-in too.
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash
      if (!h) return
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      if (h === '#/admin' || h === '#admin') navigate('/admin')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [navigate])
  useEffect(() => {
    try {
      sessionStorage.setItem('sg_path', loc.pathname + loc.search)
    } catch {
      /* private mode: ignore */
    }
  }, [loc.pathname, loc.search])
  if (loc.pathname.startsWith('/admin'))
    return (
      <Suspense
        fallback={
          <div className="splash">
            <img src="logo.png" alt="" />
          </div>
        }
      >
        <Admin />
      </Suspense>
    )
  return <PublicApp />
}
