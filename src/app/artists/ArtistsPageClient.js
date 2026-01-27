'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiUser, FiChevronRight } from 'react-icons/fi'

function ArtistCard({ artist }) {
  const displayImage = artist.imageUrl || artist.thumbnail
  return (
    <Link href={`/artist/${artist.slug}`} className="group text-center">
      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md group-hover:scale-105 transition">
        {displayImage ? (
          <img src={displayImage} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <FiUser className="w-12 h-12 text-emerald-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{artist.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{artist._count?.songs || 0} songs</p>
    </Link>
  )
}

function ArtistsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [artists, setArtists] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const currentSort = searchParams.get('sort') || 'popular'
  const currentPage = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    fetchArtists()
  }, [currentSort, currentPage])

  const fetchArtists = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/public/artists?page=${currentPage}&sort=${currentSort}`)
      const data = await res.json()
      setArtists(data.artists)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    if (key !== 'page') params.set('page', '1')
    router.push(`/artists?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">All Artists</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">All Artists</h1>
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
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

export default function ArtistsPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-primary rounded-full animate-spin"></div></div>}>
      <ArtistsContent />
    </Suspense>
  )
}
