'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import {
  FiMusic,
  FiPlay,
  FiEye,
  FiChevronRight,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiGlobe
} from 'react-icons/fi'

function SongCard({ song }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  return (
    <Link href={`/song/${song.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
      {song.coverImage || song.album?.coverImage ? (
        <Image src={song.coverImage || song.album?.coverImage} alt={`${song.title} lyrics by ${artistNames}`} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
    <Link
      href={`/song/${song.slug}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
    >
      <span className="w-8 text-center text-slate-400 dark:text-slate-500 font-medium">{index + 1}</span>

      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {song.coverImage || song.album?.coverImage ? (
          <Image src={song.coverImage || song.album?.coverImage} alt={`${song.title} lyrics by ${artistNames}`} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover" />
        ) : (
          <FiMusic className="w-5 h-5 text-orange-500" />
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

export default function CategoryPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')

  // Get data from server (no client-side state)
  const category = initialData?.category || null
  const songs = initialData?.songs || []
  const featuredSongs = initialData?.featuredSongs || []
  const genres = initialData?.genres || []
  const pagination = initialData?.pagination || null

  // Generate description - use custom if available, otherwise auto-generate
  const categoryDescription = category?.metaDescription ||
    `Explore ${category?.name} song lyrics and meanings. DJYoungster provides ${category?.name} lyrics in English Translation, Hindi and Punjabi language variations.`

  const currentSort = searchParams.get('sort') || 'latest'
  const currentGenre = searchParams.get('genre') || ''
  const currentPage = parseInt(searchParams.get('page')) || 1

  // Navigate to new URL (triggers SSR)
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    router.push(`/category/${category.slug}?${params.toString()}`)
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiGlobe className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Category Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Home</Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">{category.name} Songs</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="bg-orange-100 dark:bg-slate-800 rounded-2xl p-8 mb-8 border border-orange-200/50 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-200/50 dark:bg-orange-900/30">
              <FiGlobe className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{category.name} Songs</h1>
          </div>
          {category.description ? (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{category.description}</p>
          ) : (
            <p className="text-slate-600 dark:text-slate-300">Browse all {category.name} language songs</p>
          )}
          <p className="text-slate-500 dark:text-slate-400 mt-2">{category.totalSongs} songs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{categoryDescription}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters('sort', e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="oldest">Oldest</option>
                </select>

                {genres.length > 0 && (
                  <select
                    value={currentGenre}
                    onChange={(e) => updateFilters('genre', e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">All Genres</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.slug}>{g.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Songs */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700">
                {songs.map((song, index) => (
                  <SongRow key={song.id} song={song} index={index} />
                ))}
              </div>
            )}

            {songs.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
                <FiMusic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No songs found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => updateFilters('page', page.toString())}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      page === currentPage
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Popular Songs */}
            {featuredSongs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-orange-500" />
                  Popular {category.name} Songs
                </h3>
                <div className="space-y-3">
                  {featuredSongs.map((song, index) => (
                    <Link
                      key={song.id}
                      href={`/song/${song.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
                    >
                      <span className="w-6 text-center text-sm font-medium text-slate-400 dark:text-slate-500">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white truncate text-sm group-hover:text-orange-500 transition">
                          {song.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {song.artists?.map(sa => sa.artist.name).join(', ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Browse by Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => updateFilters('genre', currentGenre === g.slug ? '' : g.slug)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        currentGenre === g.slug
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
