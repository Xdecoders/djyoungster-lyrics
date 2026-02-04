'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FiMusic, FiSearch, FiChevronLeft, FiChevronRight, FiPlay, FiUser, FiDisc, FiTrendingUp, FiClock, FiArrowRight, FiFilm, FiX, FiTag, FiInfo, FiHelpCircle, FiChevronDown } from 'react-icons/fi'

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Search with Autocomplete Component
function SearchWithAutocomplete() {
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

  const filters = [
    { key: 'all', label: 'All', icon: FiSearch },
    { key: 'songs', label: 'Songs', icon: FiMusic },
    { key: 'artists', label: 'Artists', icon: FiUser },
    { key: 'albums', label: 'Albums', icon: FiDisc },
    { key: 'movies', label: 'Movies', icon: FiFilm },
  ]

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
                          onClick={() => navigateToResult(song)}
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
                          onClick={() => navigateToResult(artist)}
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
                          onClick={() => navigateToResult(album)}
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
                          onClick={() => navigateToResult(movie)}
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

                {/* View All Results */}
                <div className="p-3">
                  <button
                    onClick={() => { router.push(`/search?q=${encodeURIComponent(query)}&type=${filter}`); setIsOpen(false) }}
                    className="w-full py-3 text-center text-primary hover:text-emerald-600 font-medium flex items-center justify-center gap-2"
                  >
                    View all results for "{query}"
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
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

// Carousel Component
function Carousel({ children, title, icon: Icon, iconBg, viewAllLink }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      return () => ref.removeEventListener('scroll', checkScroll)
    }
  }, [children])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-xl ${iconBg || 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm text-primary hover:text-primary-hover font-medium mr-2">
              View All
            </Link>
          )}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition ${canScrollLeft ? 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition ${canScrollRight ? 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  )
}

// Song Card Component
function SongCard({ song, index }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const pastelColors = [
    'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40',
    'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40',
    'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    'from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40',
    'from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40',
  ]
  const bgColor = pastelColors[index % pastelColors.length]

  return (
    <Link href={`/song/${song.slug}`} className="flex-shrink-0 w-44 group">
      <div className={`aspect-square rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center mb-3 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300`}>
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="176px" className="object-cover" />
        ) : (
          <FiMusic className="w-12 h-12 text-slate-400" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <FiPlay className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm">{song.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
    </Link>
  )
}

// Artist Card Component
function ArtistCard({ artist, index }) {
  const pastelBgs = [
    'bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40',
    'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
    'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-900/40',
    'bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-900/40',
    'bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
  ]

  return (
    <Link href={`/artist/${artist.slug}`} className="flex-shrink-0 w-36 group text-center">
      <div className={`w-28 h-28 mx-auto rounded-full ${pastelBgs[index % pastelBgs.length]} flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 relative`}>
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt={artist.name} fill sizes="112px" className="object-cover" />
        ) : (
          <FiUser className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white text-sm truncate">{artist.name}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{artist._count?.songs || 0} songs</p>
    </Link>
  )
}

// Album Card Component
function AlbumCard({ album, index }) {
  const pastelColors = [
    'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    'from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40',
    'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40',
    'from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40',
    'from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40',
  ]

  return (
    <Link href={`/album/${album.slug}`} className="flex-shrink-0 w-44 group">
      <div className={`aspect-square rounded-2xl bg-gradient-to-br ${pastelColors[index % pastelColors.length]} flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 relative`}>
        {album.coverImage ? (
          <Image src={album.coverImage} alt={album.title} fill sizes="176px" className="object-cover" />
        ) : (
          <FiDisc className="w-12 h-12 text-slate-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm">{album.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{album.artist?.name}</p>
    </Link>
  )
}

// Hook to extract dominant color from image
function useImageColor(imageUrl) {
  const [color, setColor] = useState(null)

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 50
        canvas.height = 50
        ctx.drawImage(img, 0, 0, 50, 50)

        const imageData = ctx.getImageData(0, 0, 50, 50).data
        let r = 0, g = 0, b = 0, count = 0

        for (let i = 0; i < imageData.length; i += 16) {
          r += imageData[i]
          g += imageData[i + 1]
          b += imageData[i + 2]
          count++
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        // Make it more pastel/lighter for better readability
        const lighten = (value) => Math.round(value + (255 - value) * 0.6)
        setColor({
          bg: `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`,
          accent: `rgb(${r}, ${g}, ${b})`,
          text: `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`
        })
      } catch (e) {
        // Fallback if CORS fails
        setColor(null)
      }
    }
  }, [imageUrl])

  return color
}

// Minimalist Horizontal Song Card Component with Image Color Extraction
function MinimalistSongCard({ song, colorIndex }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const extractedColor = useImageColor(song.coverImage)

  // Fallback color schemes when color extraction fails
  const fallbackColors = [
    { bg: '#FEE2E2', accent: '#EF4444', text: '#DC2626' },
    { bg: '#CCFBF1', accent: '#14B8A6', text: '#0D9488' },
    { bg: '#D1FAE5', accent: '#10B981', text: '#059669' },
    { bg: '#FEF3C7', accent: '#F59E0B', text: '#D97706' },
    { bg: '#FFEDD5', accent: '#F97316', text: '#EA580C' },
    { bg: '#E9D5FF', accent: '#A855F7', text: '#9333EA' },
    { bg: '#E2E8F0', accent: '#64748B', text: '#475569' },
    { bg: '#FCE7F3', accent: '#EC4899', text: '#DB2777' },
    { bg: '#D1FAE5', accent: '#10B981', text: '#059669' },
    { bg: '#CFFAFE', accent: '#06B6D4', text: '#0891B2' },
  ]
  const fallback = fallbackColors[colorIndex % fallbackColors.length]
  const colors = extractedColor || fallback

  return (
    <Link
      href={`/song/${song.slug}`}
      className="group flex items-center justify-between p-5 rounded-2xl border-l-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: colors.bg,
        borderLeftColor: colors.accent
      }}
    >
      {/* Left: Text */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-1.5 truncate"
          style={{ color: colors.text }}
        >
          {artistNames}
        </p>
        <h4 className="text-slate-800 font-bold text-base sm:text-lg truncate">
          {song.title}
        </h4>
      </div>

      {/* Right: Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md relative">
        {song.coverImage ? (
          <Image
            src={song.coverImage}
            alt={song.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <FiMusic className="w-8 h-8 text-white/80" />
          </div>
        )}
      </div>
    </Link>
  )
}

// Category Song Grid Component
function CategorySongGrid({ category }) {
  const songs = category.songs?.slice(0, 8) || []

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{category.name}</h3>
        <Link
          href={`/category/${category.slug}`}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition flex items-center gap-1"
        >
          View All <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Song Cards Grid */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {songs.map((songCat, index) => (
            <MinimalistSongCard
              key={songCat.song.id}
              song={songCat.song}
              colorIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
          <FiMusic className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No songs yet</p>
        </div>
      )}
    </div>
  )
}

// FAQ Accordion Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <span className="font-medium text-slate-800 dark:text-white text-sm sm:text-base pr-4">{question}</span>
        <FiChevronDown className={`w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HomePageClient({ initialData }) {
  // Use initial data from server - no loading state needed
  const data = initialData
  const siteSettings = initialData?.siteSettings || {
    heroHeading: 'Discover Your Favorite Song Lyrics',
    heroDescription: 'Explore thousands of song lyrics from your favorite artists. Search, discover, and sing along!'
  }

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent pb-2">
              {siteSettings.heroHeading}
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            {siteSettings.heroDescription}
          </p>

          {/* Search with Autocomplete */}
          <SearchWithAutocomplete />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Trending Songs */}
        {data?.trendingSongs?.length > 0 && (
          <Carousel
            title="Trending Now"
            icon={FiTrendingUp}
            iconBg="bg-rose-100"
            viewAllLink="/songs?sort=trending"
          >
            {data.trendingSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </Carousel>
        )}

        {/* Latest Songs */}
        {data?.latestSongs?.length > 0 && (
          <Carousel
            title="Latest Songs"
            icon={FiClock}
            iconBg="bg-blue-100"
            viewAllLink="/songs?sort=latest"
          >
            {data.latestSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </Carousel>
        )}



        {/* Popular Artists */}
        {data?.artists?.length > 0 && (
          <Carousel
            title="Popular Artists"
            icon={FiUser}
            iconBg="bg-emerald-100"
            viewAllLink="/artists"
          >
            {data.artists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
          </Carousel>
        )}

        {/* Browse by Tags */}
        {data?.tags?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <FiTag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Browse by Tags</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {data.tags.slice(0, 14).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <p className="font-medium text-slate-800 dark:text-white group-hover:text-primary transition capitalize truncate">
                    {tag.name} Songs
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {tag._count?.songs || 0} songs
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* About & FAQs Section - Two Columns */}
        <section className="mb-16 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About DJYoungster */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <FiInfo className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">About DJYoungster</h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Welcome to <strong>DJYoungster</strong>, your ultimate destination for discovering and exploring song lyrics from around the world. At DJYoungster, we bring together a vast collection of lyrics spanning multiple languages including Hindi, Punjabi, English, Tamil, Telugu, Bhojpuri, Haryanvi, and many more regional languages.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Whether you're looking for the latest Bollywood hits, trending Punjabi tracks, classic English songs, or regional favorites, DJYoungster has you covered. Our platform is designed to help music lovers find accurate lyrics quickly, understand song meanings, and connect with their favorite artists.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  DJYoungster is more than just a lyrics website - it's a community for music enthusiasts. We continuously update our database with new releases, provide romanized versions for non-native speakers, and offer translations to help you appreciate music in any language. Join millions of users who trust DJYoungster for their daily dose of music and lyrics.
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <FiHelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-3">
                <FAQItem
                  question="What is DJYoungster?"
                  answer="DJYoungster is a comprehensive lyrics platform where you can find song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more. We provide accurate lyrics, artist information, album details, and music streaming links all in one place."
                />
                <FAQItem
                  question="How can I search for lyrics on DJYoungster?"
                  answer="Simply use the search bar at the top of the page to search by song title, artist name, album, or even a few words from the lyrics. DJYoungster's smart search will help you find the exact song you're looking for."
                />
                <FAQItem
                  question="Is DJYoungster free to use?"
                  answer="Yes! DJYoungster is completely free to use. You can browse, search, and read unlimited lyrics without any subscription or hidden charges."
                />
                <FAQItem
                  question="How often is DJYoungster updated?"
                  answer="We update DJYoungster regularly with new song releases, trending tracks, and classic favorites. Our team works to add the latest lyrics as soon as songs are released."
                />
                <FAQItem
                  question="Can I request lyrics on DJYoungster?"
                  answer="Absolutely! If you can't find a song on DJYoungster, you can contact us through our contact page and we'll do our best to add it to our collection."
                />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
