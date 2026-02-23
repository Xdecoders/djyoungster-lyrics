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
          `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline - DJYoungster</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#f8fafc 0%,#ecfdf5 100%);color:#334155;text-align:center;padding:1.5rem}.c{max-width:420px}.icon{width:80px;height:80px;margin:0 auto 1.5rem;background:linear-gradient(135deg,#d1fae5,#ccfbf1);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:pulse 2s ease-in-out infinite}.icon svg{width:40px;height:40px;color:#10b981}@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:.85}}h1{font-size:1.75rem;font-weight:700;background:linear-gradient(to right,#10b981,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.5rem}h2{font-size:1rem;color:#64748b;font-weight:400;line-height:1.6;margin-bottom:2rem}.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 2rem;background:linear-gradient(to right,#10b981,#059669);color:#fff;font-size:.95rem;font-weight:500;border:none;border-radius:12px;cursor:pointer;box-shadow:0 4px 14px rgba(16,185,129,.25);transition:all .2s}.btn:hover{background:linear-gradient(to right,#059669,#047857);transform:translateY(-1px);box-shadow:0 6px 20px rgba(16,185,129,.3)}.brand{margin-top:2.5rem;font-size:.8rem;color:#94a3b8}.brand span{color:#10b981;font-weight:600}</style></head><body><div class="c"><div class="icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2zm12-3c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2z"/></svg></div><h1>The Music Paused...</h1><h2>Don\\'t worry, your favorite lyrics aren\\'t going anywhere. The internet took a quick break &mdash; reconnect and the music flows again.</h2><button class="btn" onclick="window.location.reload()"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Try Again</button><div class="brand"><span>DJYoungster</span> &bull; Your Lyrics Destination</div></div></body></html>`,
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
