import Link from 'next/link'
import { FiHome, FiSearch, FiArrowRight, FiFileText, FiTrendingUp, FiFilm, FiStar } from 'react-icons/fi'

export const metadata = {
  title: 'Page Not Found | DJYoungster',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#f8fafc] dark:bg-slate-900 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
            <FiFileText className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-3">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white mb-2">
            This Page Doesn&apos;t Exist
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8">
            The page you&apos;re looking for may have been moved or removed. Explore the latest entertainment news, reviews, and industry insights below.
          </p>

          {/* Quick Explore Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <Link href="/updates" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all">
              <FiTrendingUp className="w-3.5 h-3.5" /> Latest Updates
            </Link>
            <Link href="/updates?category=news" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all">
              <FiFileText className="w-3.5 h-3.5" /> News
            </Link>
            <Link href="/updates?category=movie-reviews" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all">
              <FiFilm className="w-3.5 h-3.5" /> Reviews
            </Link>
            <Link href="/updates?category=box-office" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all">
              <FiStar className="w-3.5 h-3.5" /> Box Office
            </Link>
          </div>
        </div>

        {/* Browse Updates CTA */}
        <div className="max-w-lg mx-auto">
          <Link
            href="/updates"
            className="group block bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all"
          >
            <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Explore Latest Updates
            </h3>
            <p className="text-emerald-100 text-sm mb-4">
              Stay on top of entertainment news, movie reviews, box office reports, and music industry insights.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-semibold text-sm rounded-xl group-hover:bg-emerald-50 transition-colors">
              Browse All Updates
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            <FiHome className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
