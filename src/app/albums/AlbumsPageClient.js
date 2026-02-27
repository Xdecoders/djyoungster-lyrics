'use client'

import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiDisc, FiChevronRight } from 'react-icons/fi'

function AlbumCard({ album, priority = false }) {
  const displayImage = album.coverImage || album.thumbnail
  return (
    <Link href={`/album/${album.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
      {displayImage ? (
        <Image src={displayImage} alt={`${album.title}${album.artist?.name ? ' by ' + album.artist.name : ''} – album cover`} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" priority={priority} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <FiDisc className="w-12 h-12 text-slate-400/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm truncate">{album.title}</h3>
          <p className="text-white/70 text-xs truncate mt-0.5">{album.artist?.name} · {album._count?.songs || 0} songs</p>
        </div>
      </div>
    </Link>
  )
}

export default function AlbumsPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from server (no client-side state)
  const albums = initialData?.albums || []
  const pagination = initialData?.pagination || null

  const currentSort = searchParams.get('sort') || 'latest'
  const currentPage = parseInt(searchParams.get('page')) || 1

  // Navigate to new URL (triggers SSR)
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    if (key !== 'page') params.set('page', '1')
    router.push(`/albums?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">All Albums</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Music Albums – Complete Song Lyrics</h1>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="latest">Latest</option>
            <option value="alphabetical">A-Z</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-20">
            <FiDisc className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No albums found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album, i) => <AlbumCard key={album.id} album={album} priority={i < 4} />)}
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
