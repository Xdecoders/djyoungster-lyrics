'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error, already
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [emailParam])

  const handleUnsubscribe = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/public/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (data.message.includes('already')) {
          setStatus('already')
        } else {
          setStatus('success')
        }
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.message || 'An error occurred')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-emerald-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <FiMail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Unsubscribe</h1>
            <p className="text-white/80 mt-2 text-sm">DJYoungster Newsletter</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                  <FiCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Successfully Unsubscribed
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {message}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We're sorry to see you go. You can always subscribe again from our website.
                </p>
              </div>
            ) : status === 'already' ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                  <FiMail className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Already Unsubscribed
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  {message}
                </p>
              </div>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
                  Enter your email address to unsubscribe from our newsletter.
                </p>

                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      disabled={status === 'loading'}
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <FiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      'Unsubscribe'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to DJYoungster
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
