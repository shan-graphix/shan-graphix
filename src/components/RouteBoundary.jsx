import { Component } from 'react'

// If one page breaks, show a message for that page only. Changing page clears it (no reload needed).
export default class RouteBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="crash card">
        <h2>This page hit a problem</h2>
        <p>Try again, or open another page.</p>
        <small>{String(this.state.error?.message || this.state.error)}</small>
        <button className="btn primary" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    )
  }
}
