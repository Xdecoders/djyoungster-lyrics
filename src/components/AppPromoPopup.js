'use client'

import { useEffect, useState } from 'react'
import { FaGooglePlay } from 'react-icons/fa6'
import { FiX, FiMusic } from 'react-icons/fi'

const STORAGE_KEY = 'appPromo_dismissedAt'
const SHOW_AGAIN_AFTER_DAYS = 30

export default function AppPromoPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return

    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY)
      if (dismissedAt) {
        const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24)
        if (daysSince < SHOW_AGAIN_AFTER_DAYS) return
      }
    } catch {
      return
    }

    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Download DJYoungster App"
    >
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-sm overflow-hidden animate-slideUp">
        {/* Top gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="p-6 pt-5">
          {/* App icon + branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-4 shadow-lg mb-4">
              <FiMusic className="w-10 h-10 text-white" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Free Android App</p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">DJYoungster Lyrics</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Bollywood, Punjabi, English & more — all your favourite lyrics in one place.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {[
              'Create Instagram story from lyrics in seconds',
              'Hindi, Punjabi, English & more',
              'Fast, lightweight & free',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="https://play.google.com/store/apps/details?id=net.djyoungster.twa&hl=en_IN"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-md text-sm"
          >
            <FaGooglePlay className="w-5 h-5" />
            Get it on Google Play
          </a>
        </div>
      </div>
    </div>
  )
}
