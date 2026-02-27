'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiMusic, FiPlay, FiGrid, FiList, FiEye, FiChevronRight } from 'react-icons/fi'

function SongCard({ song, priority = false }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  return (
    <Link href={`/song/${song.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
      {song.coverImage || song.album?.coverImage ? (
        <Image src={song.coverImage || song.album?.coverImage} alt={`${song.title} lyrics by ${artistNames}`} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover group-hover:scale-105 transition-transform duration-500" priority={priority} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <FiMusic className="w-12 h-12 text-slate-400/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <FiPlay className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>

      {/* Glass info bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
          <p className="text-white/70 text-xs truncate mt-0.5">{artistNames}</p>
        </div>
      </div>
    </Link>
  )
}

function SongRow({ song, index }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  return (
    <Link href={`/song/${song.slug}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
      <span className="w-8 text-center text-slate-400 dark:text-slate-500 font-medium">{index + 1}</span>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {song.coverImage || song.album?.coverImage ? (
          <Image src={song.coverImage || song.album?.coverImage} alt={`${song.title} by ${artistNames}`} fill sizes="48px" className="object-cover" />
        ) : (
          <FiMusic className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{song.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <FiEye className="w-4 h-4" />
        <span className="text-sm">{formatViews(song.views)}</span>
      </div>
    </Link>
  )
}

export default function SongsPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')

  // Get data from server (no client-side state management for data)
  const songs = initialData?.songs || []
  const categories = initialData?.categories || []
  const pagination = initialData?.pagination || null

  const currentSort = searchParams.get('sort') || 'latest'
  const currentPage = parseInt(searchParams.get('page')) || 1
  const currentCategory = searchParams.get('category') || ''

  // Navigate to new URL (triggers SSR)
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    router.push(`/songs?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">All Songs</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Song Lyrics – Hindi, Punjabi, Bollywood &amp; More</h1>
          <div className="flex items-center gap-3">
            <select
              value={currentSort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="alphabetical">A-Z</option>
              <option value="oldest">Oldest</option>
            </select>
            <div className="flex gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                <FiGrid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters('category', '')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !currentCategory
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters('category', cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentCategory === cat.slug
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-70">({cat._count?.songs || 0})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current filter info */}
        {currentCategory && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Showing:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              ({pagination?.total || 0} songs)
            </span>
          </div>
        )}

        {songs.length === 0 ? (
          <div className="text-center py-20">
            <FiMusic className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No songs found</h3>
            <p className="text-slate-500 dark:text-slate-500">
              {currentCategory ? 'No songs in this category yet.' : 'No songs available.'}
            </p>
            {currentCategory && (
              <button
                onClick={() => updateFilters('category', '')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-emerald-600 transition"
              >
                View All Songs
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {songs.map((song, i) => <SongCard key={song.id} song={song} priority={i < 4} />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700">
            {songs.map((song, i) => <SongRow key={song.id} song={song} index={i} />)}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateFilters('page', page.toString())}
                className={`w-10 h-10 rounded-lg font-medium transition ${page === currentPage ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
