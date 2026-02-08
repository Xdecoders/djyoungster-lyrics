'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useRouter } from 'next/navigation'
import { FiMusic, FiSearch, FiUser, FiDisc, FiFilm, FiX } from 'react-icons/fi'

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Search with Autocomplete Component - CLIENT ONLY
export default function SearchWithAutocomplete() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [results, setResults] = useState({ songs: [], artists: [], albums: [], movies: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch autocomplete results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults({ songs: [], artists: [], albums: [], movies: [] })
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/public/search/autocomplete?q=${encodeURIComponent(debouncedQuery)}&type=${filter}`)
        const data = await res.json()
        setResults(data)
        setIsOpen(true)
      } catch (error) {
        console.error('Autocomplete error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery, filter])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get all results as flat array for keyboard navigation
  const getAllResults = useCallback(() => {
    const all = []
    if (filter === 'all' || filter === 'songs') all.push(...results.songs.map(r => ({ ...r, type: 'song' })))
    if (filter === 'all' || filter === 'artists') all.push(...results.artists.map(r => ({ ...r, type: 'artist' })))
    if (filter === 'all' || filter === 'albums') all.push(...results.albums.map(r => ({ ...r, type: 'album' })))
    if (filter === 'all' || filter === 'movies') all.push(...results.movies.map(r => ({ ...r, type: 'movie' })))
    return all
  }, [results, filter])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const allResults = getAllResults()

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        navigateToResult(allResults[selectedIndex])
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}&type=${filter}`)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const navigateToResult = (result) => {
    const paths = {
      song: `/song/${result.slug}`,
      artist: `/artist/${result.slug}`,
      album: `/album/${result.slug}`,
      movie: `/movie/${result.slug}`,
    }
    router.push(paths[result.type])
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${filter}`)
      setIsOpen(false)
    }
  }

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0 || results.movies.length > 0
  let resultIndex = -1

  return (
    <div ref={wrapperRef} className="max-w-2xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1) }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Search for ${filter === 'all' ? 'songs, artists, albums...' : filter}...`}
            className="w-full pl-14 pr-32 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-100 dark:shadow-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults({ songs: [], artists: [], albums: [], movies: [] }); inputRef.current?.focus() }}
              className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-md"
          >
            Search
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Searching...</p>
              </div>
            ) : hasResults ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {/* Songs */}
                {(filter === 'all' || filter === 'songs') && results.songs.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Songs</p>
                    {results.songs.map((song) => {
                      resultIndex++
                      const currentIndex = resultIndex
                      return (
                        <button
                          key={`song-${song.id}`}
                          onClick={() => navigateToResult({ ...song, type: 'song' })}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                            selectedIndex === currentIndex ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {song.image ? (
                              <Image src={song.image} alt={song.title} fill sizes="48px" className="object-cover" />
                            ) : (
                              <FiMusic className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white truncate">{song.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">Song</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Artists */}
                {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Artists</p>
                    {results.artists.map((artist) => {
                      resultIndex++
                      const currentIndex = resultIndex
                      return (
                        <button
                          key={`artist-${artist.id}`}
                          onClick={() => navigateToResult({ ...artist, type: 'artist' })}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                            selectedIndex === currentIndex ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {artist.image ? (
                              <Image src={artist.image} alt={artist.name} fill sizes="48px" className="object-cover" />
                            ) : (
                              <FiUser className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white truncate">{artist.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{artist.songCount} songs</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full">Artist</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Albums */}
                {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Albums</p>
                    {results.albums.map((album) => {
                      resultIndex++
                      const currentIndex = resultIndex
                      return (
                        <button
                          key={`album-${album.id}`}
                          onClick={() => navigateToResult({ ...album, type: 'album' })}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                            selectedIndex === currentIndex ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {album.image ? (
                              <Image src={album.image} alt={album.title} fill sizes="48px" className="object-cover" />
                            ) : (
                              <FiDisc className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white truncate">{album.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{album.artist}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">Album</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Movies */}
                {(filter === 'all' || filter === 'movies') && results.movies.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Movies</p>
                    {results.movies.map((movie) => {
                      resultIndex++
                      const currentIndex = resultIndex
                      return (
                        <button
                          key={`movie-${movie.id}`}
                          onClick={() => navigateToResult({ ...movie, type: 'movie' })}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
                            selectedIndex === currentIndex ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {movie.image ? (
                              <Image src={movie.image} alt={movie.title} fill sizes="48px" className="object-cover" />
                            ) : (
                              <FiFilm className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white truncate">{movie.title}</p>
                            {movie.year && <p className="text-sm text-slate-500 dark:text-slate-400">{movie.year}</p>}
                          </div>
                          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">Movie</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <FiSearch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No results found for "{query}"</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
