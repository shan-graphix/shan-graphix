import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import './styles.css'

// Last safety net: if something unexpected breaks the whole app, show a message with a reload button.
class Boundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="crash card">
        <h2>Something went wrong</h2>
        <p>Reload the page to try again.</p>
        <small>{String(this.state.error?.message || this.state.error)}</small>
        <button className="btn primary" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
    )
  }
}

// The address bar always stays at the site address (no page names in the URL).
// The current page is remembered for this tab, so a refresh stays on the same page.
// Typing  site-address/#/admin  still opens the admin sign-in once, then the address is cleaned.
function startPage() {
  const h = window.location.hash
  const wantsAdmin = h === '#/admin' || h === '#admin'
  if (h) window.history.replaceState(null, '', window.location.pathname + window.location.search)
  if (wantsAdmin) return '/admin'
  try {
    return sessionStorage.getItem('sg_path') || '/'
  } catch {
    return '/'
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-fx" aria-hidden="true">
      <i className="blob b1" />
      <i className="blob b2" />
      <i className="blob b3" />
      <div className="bg-grid" />
    </div>
    <Boundary>
      <MemoryRouter initialEntries={[startPage()]}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    </Boundary>
  </StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
