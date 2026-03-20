import Link from 'next/link'
import { FiArrowRight, FiClock, FiUser } from 'react-icons/fi'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function LatestUpdatesSection({ posts = [] }) {
  if (!posts.length) return null

  const [featured, ...rest] = posts

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Latest Updates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">News &amp; articles from the music world</p>
        </div>
        <Link
          href="/updates"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-emerald-700 transition-colors"
        >
          View all <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Featured large card */}
        <Link
          href={`/updates/${featured.slug}`}
          className="lg:col-span-3 group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all duration-200"
        >
          {featured.coverImage ? (
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20" />
          )}
          <div className="p-5">
            {featured.blogCategory && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white mb-3"
                style={{ backgroundColor: featured.blogCategory.color || '#10b981' }}
              >
                {featured.blogCategory.name}
              </span>
            )}
            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors text-lg leading-snug line-clamp-2 mb-2">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{featured.excerpt}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              {featured.author && (
                <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{featured.author}</span>
              )}
              {featured.readTime && (
                <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{featured.readTime} min read</span>
              )}
              <span>{timeAgo(featured.publishedAt)}</span>
            </div>
          </div>
        </Link>

        {/* Side list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {rest.slice(0, 5).map((post) => (
            <Link
              key={post.id}
              href={`/updates/${post.slug}`}
              className="group flex gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200 p-3"
            >
              {post.coverImage && (
                <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {post.blogCategory && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                    style={{ backgroundColor: post.blogCategory.color || '#10b981' }}
                  >
                    {post.blogCategory.name}
                  </span>
                )}
                <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {post.readTime && <span>{post.readTime} min</span>}
                  <span>{timeAgo(post.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
