// Minimal service worker: only makes the site installable. It caches nothing, so visitors
// always get the newest version. It also clears any cache left by an older version.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})
self.addEventListener('fetch', () => {})
