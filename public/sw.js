const CACHE_NAME = 'djyoungster-v1'

// Install event - cache offline fallback
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, cache fallback for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline - DJYoungster</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#334155;text-align:center}.c{max-width:400px;padding:2rem}h1{color:#10b981;font-size:1.5rem}p{color:#64748b}</style></head><body><div class="c"><h1>You\'re Offline</h1><p>Please check your internet connection and try again.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      })
    )
  }
})

// Push event - show notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = { title: 'DJYoungster', body: event.data.text() }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId || null,
    },
    vibrate: [100, 50, 100],
    actions: data.url ? [{ action: 'open', title: 'Open' }] : [],
  }

  event.waitUntil(self.registration.showNotification(data.title || 'DJYoungster', options))
})

// Notification click - track click + open URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  const notificationId = event.notification.data?.notificationId

  event.waitUntil(
    Promise.all([
      // Track the click
      notificationId
        ? fetch('/api/public/track-notification-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId }),
          }).catch(() => {})
        : Promise.resolve(),
      // Open/focus the window
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return clients.openWindow(url)
      }),
    ])
  )
})
