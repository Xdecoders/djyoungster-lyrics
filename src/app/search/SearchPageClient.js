'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiSearch,
  FiMusic,
  FiUser,
  FiDisc,
  FiFilm,
  FiPlay,
  FiEye,
  FiChevronRight
} from 'react-icons/fi'

function SongCard({ song }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  return (
    <Link href={`/song/${song.slug}`} className="group">
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden mb-3 relative shadow-sm group-hover:shadow-md transition">
        {song.coverImage || song.album?.coverImage ? (
          <Image src={song.coverImage || song.album?.coverImage} alt={song.title} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
        ) : (
          <FiMusic className="w-12 h-12 text-emerald-400" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
            <FiPlay className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{song.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
    </Link>
  )
}

function ArtistCard({ artist }) {
  return (
    <Link href={`/artist/${artist.slug}`} className="group text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md group-hover:scale-105 transition relative">
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt={artist.name} fill sizes="96px" className="object-cover" />
        ) : (
          <FiUser className="w-10 h-10 text-emerald-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{artist.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{artist._count?.songs || 0} songs</p>
    </Link>
  )
}

function AlbumCard({ album }) {
  return (
    <Link href={`/album/${album.slug}`} className="group">
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition relative">
        {album.coverImage ? (
          <Image src={album.coverImage} alt={album.title} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
        ) : (
          <FiDisc className="w-12 h-12 text-emerald-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{album.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{album.artist?.name}</p>
    </Link>
  )
}

function MovieCard({ movie }) {
  return (
    <Link href={`/movie/${movie.slug || movie.id}`} className="group">
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition relative">
        {movie.thumbnail ? (
          <Image src={movie.thumbnail} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
        ) : (
          <FiFilm className="w-12 h-12 text-rose-400" />
        )}
        {movie.year && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white/80 text-sm">{movie.year}</p>
          </div>
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{movie.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{movie._count?.songs || 0} songs</p>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'

  const [searchInput, setSearchInput] = useState(query)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, type])

  const performSearch = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}&type=${type}`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}&type=${type}`)
    }
  }

  const setSearchType = (newType) => {
    router.push(`/search?q=${encodeURIComponent(query)}&type=${newType}`)
  }

  const filterTabs = [
    { key: 'all', label: 'All', icon: FiSearch },
    { key: 'songs', label: 'Songs', icon: FiMusic },
    { key: 'artists', label: 'Artists', icon: FiUser },
    { key: 'albums', label: 'Albums', icon: FiDisc },
    { key: 'movies', label: 'Movies', icon: FiFilm },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for songs, lyrics, artists, albums, movies..."
                className="w-full pl-14 pr-32 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {query && (
          <>
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {loading ? 'Searching...' : `Results for "${query}"`}
                {results?.counts?.total > 0 && (
                  <span className="text-lg font-normal text-slate-500 dark:text-slate-400 ml-2">
                    ({results.counts.total} found)
                  </span>
                )}
              </h1>

              {/* Type Tabs */}
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSearchType(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      type === tab.key
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {results?.counts?.[tab.key] > 0 && tab.key !== 'all' && (
                      <span className="ml-1 opacity-70">({results.counts[tab.key]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : results?.counts?.total === 0 ? (
              <div className="text-center py-20">
                <FiSearch className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No results found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Try different keywords or check spelling</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Songs */}
                {(type === 'all' || type === 'songs') && results?.songs?.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiMusic className="w-5 h-5 text-primary" />
                        Songs
                      </h2>
                      {type === 'all' && results.counts.songs > 10 && (
                        <button
                          onClick={() => setSearchType('songs')}
                          className="text-sm text-primary hover:text-emerald-600 font-medium flex items-center gap-1"
                        >
                          View All <FiChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {results.songs.map((song) => (
                        <SongCard key={song.id} song={song} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists */}
                {(type === 'all' || type === 'artists') && results?.artists?.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiUser className="w-5 h-5 text-primary" />
                        Artists
                      </h2>
                      {type === 'all' && results.counts.artists > 6 && (
                        <button
                          onClick={() => setSearchType('artists')}
                          className="text-sm text-primary hover:text-emerald-600 font-medium flex items-center gap-1"
                        >
                          View All <FiChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                      {results.artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {(type === 'all' || type === 'albums') && results?.albums?.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiDisc className="w-5 h-5 text-primary" />
                        Albums
                      </h2>
                      {type === 'all' && results.counts.albums > 6 && (
                        <button
                          onClick={() => setSearchType('albums')}
                          className="text-sm text-primary hover:text-emerald-600 font-medium flex items-center gap-1"
                        >
                          View All <FiChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Movies */}
                {(type === 'all' || type === 'movies') && results?.movies?.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiFilm className="w-5 h-5 text-rose-500" />
                        Movies
                      </h2>
                      {type === 'all' && results.counts.movies > 6 && (
                        <button
                          onClick={() => setSearchType('movies')}
                          className="text-sm text-primary hover:text-emerald-600 font-medium flex items-center gap-1"
                        >
                          View All <FiChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}

        {!query && (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Search for anything</h2>
            <p className="text-slate-500 dark:text-slate-400">Find songs, lyrics, artists, albums, movies and more</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
