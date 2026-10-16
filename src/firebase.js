// Firebase setup. The web config is safe to ship in the site code:
// your Firestore security rules are what protect the data.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

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
export const db = getFirestore(app)
