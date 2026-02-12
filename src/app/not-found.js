import Link from 'next/link'
import { FiHome, FiMusic } from 'react-icons/fi'

export const metadata = {
  title: 'Page Not Found | DJYoungster',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 px-4">
      <div className="text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
          <FiMusic className="w-12 h-12 text-primary" />
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
        >
          <FiHome className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
