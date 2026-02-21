'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return

    // Only track once per session
    if (sessionStorage.getItem('visit-tracked')) return
    sessionStorage.setItem('visit-tracked', '1')

    const platform = /android/i.test(navigator.userAgent)
      ? 'android'
      : /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? 'ios'
        : 'desktop'

    fetch('/api/public/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        platform,
        referrer: document.referrer || null,
      }),
    }).catch(() => {})
  }, [isAdmin])

  return null
}
