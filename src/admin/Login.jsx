import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/ui.jsx'

const G = (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
)

export default function Login() {
  const { login, error } = useAuth()
  const [busy, setBusy] = useState(false)
  return (
    <div className="login">
      <Link to="/" className="back">
        <ArrowLeft size={18} /> Back to website
      </Link>
      <motion.div className="card login-card" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
        <motion.img src="logo.png" alt="Shan Graphix" initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.1 }} />
        <h1>Admin sign in</h1>
        <p>Only the Shan Graphix owner can sign in here.</p>
        {error && (
          <motion.div className="alert" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }} role="alert">
            {error}
          </motion.div>
        )}
        <button
          className="btn google"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            await login()
            setBusy(false)
          }}
        >
          {busy ? <Spinner /> : G} Continue with Google
        </button>
        <span className="secure">
          <ShieldCheck size={16} /> Protected sign-in
        </span>
      </motion.div>
    </div>
  )
}
