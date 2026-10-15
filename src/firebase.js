// Firebase setup. The web config is safe to ship in the site code:
// your Firestore security rules are what protect the data.
import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyDtKQMu30Xur8DBnfN7sCZ_bCpZQ2LzdME',
  authDomain: 'shan-graphix.firebaseapp.com',
  projectId: 'shan-graphix',
  storageBucket: 'shan-graphix.firebasestorage.app',
  messagingSenderId: '3844926324',
  appId: '1:3844926324:web:91d0e79f940a20e0a8da21',
  measurementId: 'G-4P5ZYYLGVE',
}

export const app = initializeApp(firebaseConfig)

// A local cache means returning visitors re-download less, which keeps you inside the free limits.
let database
try {
  database = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
} catch {
  database = getFirestore(app)
}
export const db = database
