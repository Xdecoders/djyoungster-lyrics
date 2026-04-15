import Link from 'next/link'
import { FiArrowRight, FiClock, FiUser, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi'

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

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function CategoryBadge({ category, className = '' }) {
  if (!category) return null
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wide ${className}`}
      style={{ backgroundColor: category.color || '#10b981' }}
    >
      {category.name}
    </span>
  )
}

function HeroPost({ post }) {
  if (!post) return null
  return (
    <Link href={`/updates/${post.slug}`} className="group block relative rounded-2xl overflow-hidden bg-slate-900 min-h-[420px] sm:min-h-[480px]">
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
        />
      )}
      {!post.coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">
            <FiStar className="w-2.5 h-2.5" /> Featured
          </span>
          {post.blogCategory && <CategoryBadge category={post.blogCategory} />}
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3 group-hover:text-emerald-300 transition-colors line-clamp-3">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-white/70 text-sm line-clamp-2 mb-4 max-w-2xl">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-white/60">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <FiUser className="w-3 h-3" /> {post.author}
            </span>
          )}
          {post.readTime && (
            <span className="flex items-center gap-1.5">
              <FiClock className="w-3 h-3" /> {post.readTime} min read
            </span>
          )}
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }) {
  return (
    <Link
      href={`/updates/${post.slug}`}
      className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-200"
    >
      {post.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20" />
      )}
      <div className="p-4 flex flex-col flex-1">
        {post.blogCategory && <CategoryBadge category={post.blogCategory} className="mb-2 self-start" />}
        <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm leading-snug line-clamp-2 mb-2 flex-1">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-auto">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {post.readTime ? `${post.readTime} min` : timeAgo(post.publishedAt)}
          </span>
          <span>{timeAgo(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function PostRowItem({ post }) {
  return (
    <Link
      href={`/updates/${post.slug}`}
      className="group flex gap-3 items-start py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-3 px-3 rounded-lg transition-colors"
    >
      {post.coverImage && (
        <div className="w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {post.blogCategory && (
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: post.blogCategory.color || '#10b981' }}>
            {post.blogCategory.name}
          </span>
        )}
        <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </p>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(post.publishedAt)}</span>
      </div>
    </Link>
  )
}

export default function HomeContentV2({ data }) {
  const posts = data.blogPosts || []
  const categories = data.blogCategories || []

  const featured = posts.find(p => p.isFeatured) || posts[0]
  const remaining = posts.filter(p => p.id !== featured?.id)
  const topStories = remaining.slice(0, 6)
  const moreStories = remaining.slice(6, 14)
  const sidebarPosts = remaining.slice(0, 8)

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] dark:bg-slate-900" />

      {/* Top breaking bar */}
      <div className="bg-slate-900 dark:bg-black text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs overflow-hidden">
          <span className="flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0">
            <FiZap className="w-3 h-3" /> Latest
          </span>
          <div className="flex gap-6 overflow-hidden whitespace-nowrap">
            {posts.slice(0, 4).map(p => (
              <Link key={p.id} href={`/updates/${p.slug}`} className="hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Entertainment <span className="text-emerald-500">Updates</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your daily source for the latest entertainment news, celebrity buzz, and trending stories
              </p>
            </div>
            <Link
              href="/updates"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex-shrink-0"
            >
              All stories <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/updates"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-80 transition-opacity"
              >
                All
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/updates?category=${cat.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Intro about strip */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-emerald-100 dark:border-emerald-900/40 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white">Welcome to DJYoungster</span> — your go-to destination for the latest celebrity news, entertainment buzz, Bollywood updates, OTT releases, award show highlights, and pop culture stories. We cover everything happening in the world of entertainment, keeping you informed and in the loop every single day.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero + sidebar */}
        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2">
              <HeroPost post={featured} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <FiTrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">Trending Now</h3>
              </div>
              <div className="flex flex-col">
                {sidebarPosts.map(post => (
                  <PostRowItem key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top stories grid */}
        {topStories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
                Top Stories
              </h2>
              <Link href="/updates" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                More <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topStories.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* More stories */}
        {moreStories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-slate-300 dark:bg-slate-600 rounded-full inline-block" />
                More Updates
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreStories.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium">No stories published yet.</p>
            <p className="text-sm mt-1">Check back soon for the latest updates.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            View All Stories <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bottom about section */}
        <div className="mt-14 rounded-2xl bg-slate-900 dark:bg-slate-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700">
            <div className="p-7">
              <h3 className="text-white font-bold text-base mb-3">About DJYoungster</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                DJYoungster is a leading entertainment platform covering Bollywood, OTT, celebrity news, award shows, and pop culture. Our team of passionate writers delivers accurate, timely, and engaging stories from across the entertainment industry — all in one place.
              </p>
            </div>
            <div className="p-7">
              <h3 className="text-white font-bold text-base mb-3">What We Cover</h3>
              <ul className="text-slate-400 text-sm space-y-1.5">
                {[
                  'Bollywood & Regional Cinema',
                  'OTT Platform Releases',
                  'Celebrity News & Gossip',
                  'Award Shows & Events',
                  'TV & Web Series Updates',
                  'Pop Culture & Viral Trends',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7">
              <h3 className="text-white font-bold text-base mb-3">Stay Updated</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Never miss a story. Browse our latest updates, explore by category, or follow us for daily entertainment news delivered fresh every morning.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/updates" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  <FiArrowRight className="w-3.5 h-3.5" /> Browse all stories
                </Link>
                <Link href="/about-us" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  <FiArrowRight className="w-3.5 h-3.5" /> Learn more about us
                </Link>
                <Link href="/contact-us" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  <FiArrowRight className="w-3.5 h-3.5" /> Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
