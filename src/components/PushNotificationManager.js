'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FiBell, FiX } from 'react-icons/fi'

export default function PushNotificationManager() {
  const pathname = usePathname()
  const [showPrompt, setShowPrompt] = useState(false)
  const [swRegistration, setSwRegistration] = useState(null)

  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    registerSW()
  }, [isAdmin])

  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      setSwRegistration(registration)

      // Check if already subscribed
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) return // Already subscribed

      // Check if permission denied
      if (Notification.permission === 'denied') return

      // Check if dismissed recently (7 days)
      const dismissedAt = localStorage.getItem('push-prompt-dismissed')
      if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return

      // Show prompt after 30 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 20000)

      return () => clearTimeout(timer)
    } catch (err) {
      console.error('SW registration failed:', err)
    }
  }

  const handleAccept = async () => {
    setShowPrompt(false)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      if (!swRegistration) return

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const subJson = subscription.toJSON()
      await fetch('/api/public/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          authKey: subJson.keys.auth,
          p256dh: subJson.keys.p256dh,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('push-prompt-dismissed', Date.now().toString())
  }

  if (isAdmin || !showPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 flex-shrink-0">
          <FiBell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Stay Updated
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Get notified when new lyrics are added
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all flex-shrink-0"
        >
          Allow
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition flex-shrink-0"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
