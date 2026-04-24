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

function PostCard({ post }) {
  return (
    <Link
      href={`/updates/${post.slug}`}
      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {post.coverImage ? (
        <div className="aspect-video overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 flex-shrink-0" />
      )}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1 mb-2">
          {post.title}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
          {post.author && (
            <span className="flex items-center gap-1">
              <FiUser className="w-3 h-3" />{post.author}
            </span>
          )}
          {post.readTime && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />{post.readTime} min
            </span>
          )}
          <span>{timeAgo(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

export default function LatestUpdatesSection({ posts = [] }) {
  if (!posts.length) return null

  // Group posts by category, preserving recency order of first occurrence
  const categoryMap = new Map()
  for (const post of posts) {
    const key = post.blogCategory?.slug || '__uncategorized__'
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { category: post.blogCategory, posts: [] })
    }
    categoryMap.get(key).posts.push(post)
  }

  const sections = Array.from(categoryMap.values())

  return (
    <div className="mt-12 space-y-10">
      {sections.map(({ category, posts: catPosts }) => (
        <section key={category?.slug || '__uncategorized__'}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span
                className="w-1 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: category?.color || '#10b981' }}
              />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {category?.name || 'Updates'}
              </h2>
            </div>
            {category?.slug && (
              <Link
                href={`/updates?category=${category.slug}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-emerald-700 transition-colors"
              >
                View all <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catPosts.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
