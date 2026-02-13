'use client'

import Link from 'next/link'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <FiAlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          An unexpected error occurred. Please try again or go back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-medium hover:shadow-lg transition"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
