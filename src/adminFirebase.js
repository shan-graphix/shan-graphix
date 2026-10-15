// Admin-only Firebase piece (Auth). Loaded only when the admin area is opened.
import { getAuth } from 'firebase/auth'
import { app } from './firebase.js'

export const auth = getAuth(app)
