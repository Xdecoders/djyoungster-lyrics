'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FiClock, FiSearch, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PostCard({ post }) {
  return (
    <Link
      href={`/updates/${post.slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col border border-slate-100 hover:border-slate-200"
    >
      {post.coverImage ? (
        <div className="h-44 overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-44 flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <FiTag className="w-8 h-8 text-slate-300" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.blogCategory && (
          <span
            className="inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white mb-3"
            style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
          >
            {post.blogCategory.name}
          </span>
        )}
        <h2 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug flex-1">
          {post.title}
        </h2>
        <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readTime && (
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{post.readTime} min</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function FeaturedCard({ post }) {
  return (
    <Link
      href={`/updates/${post.slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col md:flex-row border border-slate-100 hover:border-slate-200"
    >
      {post.coverImage ? (
        <div className="md:w-2/5 h-52 md:h-auto overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="md:w-2/5 h-52 md:h-auto flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <FiTag className="w-10 h-10 text-slate-300" />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-2 mb-3">
          {post.blogCategory && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
            >
              {post.blogCategory.name}
            </span>
          )}
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">Featured</span>
        </div>
        <h2 className="font-extrabold text-slate-900 group-hover:text-primary transition-colors text-xl md:text-2xl leading-snug">
          {post.title}
        </h2>
        <p className="text-slate-500 text-sm mt-3 line-clamp-3 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-4 mt-5 text-xs text-slate-400">
          <span className="font-medium text-slate-600">{post.author}</span>
          <span>{formatDate(post.publishedAt)}</span>
          {post.readTime && (
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{post.readTime} min</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function BlogIndexClient({ initialData = {} }) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || ''

  const [posts, setPosts] = useState(initialData.posts || [])
  const [categories, setCategories] = useState(initialData.categories || [])
  const [total, setTotal] = useState(initialData.total || 0)
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')

  // Skip the very first fetch when SSR already provided page-1 data with no filters
  const skipRef = useRef(initialData.posts?.length > 0 && !initialCategory)

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false
      return
    }
    fetchPosts()
  }, [page, activeCategory, search])

  const fetchPosts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 12 })
    if (activeCategory) params.set('category', activeCategory)
    if (search) params.set('search', search)
    const res = await fetch(`/api/public/blog?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPosts(data.posts)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }
    setLoading(false)
  }

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug)
    setPage(1)
  }

  const featuredPost = page === 1 && !search && !activeCategory
    ? (posts.find(p => p.isFeatured) || posts[0])
    : null
  const remainingPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero — matches blog post page */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-14 pb-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1DB95422,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">DJYoungster</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-sm mb-3">
            Latest Updates
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Movie Reviews · Box Office · Artist News · Upcoming Releases</p>

          {/* Search */}
          <div className="relative max-w-xl mt-8">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur text-sm"
            />
          </div>
        </div>
      </div>

      {/* Meta bar with category tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              !activeCategory
                ? 'bg-slate-800 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.slug ? 'text-white shadow' : 'bg-slate-100 text-slate-600 hover:opacity-80'
              }`}
              style={activeCategory === cat.slug ? { backgroundColor: cat.color || '#6b7280' } : {}}
            >
              {cat.name}
              {cat._count?.posts > 0 && <span className="ml-1 opacity-60 text-xs">({cat._count.posts})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <FiSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No articles found.</p>
            {(search || activeCategory) && (
              <button
                onClick={() => { setSearch(''); setActiveCategory(''); setPage(1) }}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredPost && (
              <div className="mb-8">
                <FeaturedCard post={featuredPost} />
              </div>
            )}

            {/* Results info */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                {search || activeCategory
                  ? `${total} result${total !== 1 ? 's' : ''} found`
                  : `${total} articles`}
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FiChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let p
                    if (totalPages <= 5) {
                      p = i + 1
                    } else if (page <= 3) {
                      p = i + 1
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i
                    } else {
                      p = page - 2 + i
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          page === p
                            ? 'bg-slate-800 text-white shadow'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
