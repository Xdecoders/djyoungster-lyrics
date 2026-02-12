'use client'

import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiFilm, FiChevronRight } from 'react-icons/fi'

function MovieCard({ movie }) {
  // Get poster image - use posterUrl, or fallback to first song's cover
  const posterImage = movie.posterUrl || movie.songs?.[0]?.coverImage || null

  return (
    <Link href={`/movie/${movie.slug || movie.id}`} className="group">
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition relative">
        {posterImage ? (
          <Image src={posterImage} alt={movie.title} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" className="object-cover" />
        ) : (
          <FiFilm className="w-16 h-16 text-rose-400" />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white/80 text-sm">{movie.year || 'Unknown'}</p>
        </div>
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{movie.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{movie._count?.songs || 0} songs</p>
    </Link>
  )
}

export default function MoviesPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from server (no client-side state)
  const movies = initialData?.movies || []
  const pagination = initialData?.pagination || null

  const currentSort = searchParams.get('sort') || 'latest'
  const currentPage = parseInt(searchParams.get('page')) || 1

  // Navigate to new URL (triggers SSR)
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    if (key !== 'page') params.set('page', '1')
    router.push(`/movies?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">Movies</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FiFilm className="w-8 h-8 text-rose-500" />
            Movie Soundtracks
          </h1>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="latest">Latest</option>
            <option value="alphabetical">A-Z</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-20">
            <FiFilm className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateFilters('page', page.toString())}
                className={`w-10 h-10 rounded-lg font-medium transition ${page === currentPage ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
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
