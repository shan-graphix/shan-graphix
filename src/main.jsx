import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
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

// HashRouter keeps every page working on GitHub Pages (addresses look like site/#/portfolio)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Boundary>
      <HashRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </HashRouter>
    </Boundary>
  </StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
