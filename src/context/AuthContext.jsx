import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { auth } from '../adminFirebase.js'
import { ADMIN_EMAIL, IDLE_LOGOUT_MS } from '../config.js'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const isOwner = (u) => !!u && u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && u.emailVerified

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const idle = useRef()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && !isOwner(u)) {
        // Any other Google account is signed straight back out.
        await signOut(auth)
        setError('That account is not allowed to sign in here.')
        setUser(null)
      } else {
        setUser(u)
      }
      setLoading(false)
    })
    return () => typeof unsub === 'function' && unsub()
  }, [])

  // Sign out automatically after a period with no activity.
  useEffect(() => {
    if (!user) return
    const reset = () => {
      clearTimeout(idle.current)
      idle.current = setTimeout(() => signOut(auth), IDLE_LOGOUT_MS)
    }
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(idle.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [user])

  const login = useCallback(async () => {
    setError('')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: 'select_account' })
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      if (e.code === 'auth/popup-blocked') return signInWithRedirect(auth, provider)
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      if (e.code === 'auth/unauthorized-domain')
        return setError('This website address is not authorised yet. Add it in Firebase under Authentication, Settings, Authorized domains.')
      if (e.code === 'auth/operation-not-allowed')
        return setError('Google sign-in is not enabled. Turn it on in Firebase under Authentication, Sign-in method.')
      setError('Sign-in failed. Please try again.')
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  return <Ctx.Provider value={{ user, loading, error, login, logout }}>{children}</Ctx.Provider>
}
