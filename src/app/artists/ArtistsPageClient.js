'use client'

import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiUser, FiChevronRight } from 'react-icons/fi'

function ArtistCard({ artist, priority = false }) {
  const displayImage = artist.imageUrl || artist.thumbnail
  return (
    <Link href={`/artist/${artist.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
      {displayImage ? (
        <Image src={displayImage} alt={`${artist.name} – ${artist._count?.songs || 0} song${(artist._count?.songs || 0) !== 1 ? 's' : ''} on DJYoungster`} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover group-hover:scale-105 transition-transform duration-500" priority={priority} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <FiUser className="w-12 h-12 text-slate-400/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm truncate">{artist.name}</h3>
          <p className="text-white/70 text-xs mt-0.5">{artist._count?.songs || 0} {artist._count?.songs === 1 ? 'song' : 'songs'}</p>
        </div>
      </div>
    </Link>
  )
}

export default function ArtistsPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from server (no client-side state)
  const artists = initialData?.artists || []
  const pagination = initialData?.pagination || null

  const currentSort = searchParams.get('sort') || 'popular'
  const currentPage = parseInt(searchParams.get('page')) || 1

  // Navigate to new URL (triggers SSR)
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    if (key !== 'page') params.set('page', '1')
    router.push(`/artists?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">All Artists</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Music Artists – Lyrics &amp; Discography</h1>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="popular">Most Songs</option>
            <option value="alphabetical">A-Z</option>
            <option value="latest">Recently Added</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artists.map((artist, i) => <ArtistCard key={artist.id} artist={artist} priority={i < 4} />)}
        </div>

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
