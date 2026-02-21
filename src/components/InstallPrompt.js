'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FiDownload, FiX } from 'react-icons/fi'

export default function InstallPrompt() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  // Hide on admin pages
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    // Don't run on admin pages
    if (isAdmin) return

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Check if dismissed recently (24 hours)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed')
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Track installs
    const installHandler = () => {
      setShowBanner(false)
      setDeferredPrompt(null)
      trackInstall()
    }
    window.addEventListener('appinstalled', installHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installHandler)
    }
  }, [isAdmin])

  const trackInstall = async () => {
    try {
      const platform = /android/i.test(navigator.userAgent)
        ? 'android'
        : /iphone|ipad|ipod/i.test(navigator.userAgent)
          ? 'ios'
          : 'desktop'

      await fetch('/api/public/pwa-install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          platform,
        }),
      })
    } catch (err) {
      // Silent fail
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'dismissed') {
      handleDismiss()
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (isAdmin || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
        <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-2.5 flex-shrink-0">
          <FiDownload className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Install DJYoungster
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add to home screen for quick access
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-gradient-to-r from-primary to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all flex-shrink-0"
        >
          Install
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
