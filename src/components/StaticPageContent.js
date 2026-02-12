import Link from 'next/link'
import { FiShield, FiFileText, FiAlertCircle, FiInfo, FiMail, FiHome } from 'react-icons/fi'

// Get icon based on page slug
const getPageIcon = (slug) => {
  const icons = {
    'privacy-policy': FiShield,
    'terms-and-conditions': FiFileText,
    'disclaimer': FiAlertCircle,
    'about-us': FiInfo,
    'contact-us': FiMail
  }
  return icons[slug] || FiFileText
}

export default function StaticPageContent({ slug, page }) {
  const Icon = getPageIcon(slug)

  if (!page) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Page Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The page you&#39;re looking for doesn&#39;t exist or hasn&#39;t been created yet.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-md"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const currentDate = new Date(page.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">{page.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: {currentDate}</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:text-slate-800 dark:prose-headings:text-white
              prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:mb-4
              prose-a:text-primary hover:prose-a:text-emerald-600
              prose-strong:text-slate-800 dark:prose-strong:text-white
              prose-ul:list-disc prose-ul:list-inside prose-ul:text-slate-600 dark:prose-ul:text-slate-300 prose-ul:space-y-2 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:list-inside prose-ol:text-slate-600 dark:prose-ol:text-slate-300 prose-ol:space-y-2 prose-ol:mb-4
              prose-li:text-slate-600 dark:prose-li:text-slate-300"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:text-emerald-600 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
