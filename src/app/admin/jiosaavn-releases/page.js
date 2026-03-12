'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiMusic, FiDownload, FiSearch, FiRefreshCw, FiChevronDown, FiExternalLink, FiCheck, FiLoader, FiX } from 'react-icons/fi'

const LANGUAGES = [
  { key: 'all',     label: 'All',     flag: '🌐' },
  { key: 'hindi',   label: 'Hindi',   flag: '🇮🇳' },
  { key: 'punjabi', label: 'Punjabi', flag: '🎵' },
  { key: 'tamil',   label: 'Tamil',   flag: '🎶' },
  { key: 'telugu',  label: 'Telugu',  flag: '🎸' },
  { key: 'english', label: 'English', flag: '🇺🇸' },
]

const LIMIT = 50

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isRecentRelease(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  const curY = now.getFullYear(), curM = now.getMonth()
  const prevM = curM === 0 ? 11 : curM - 1
  const prevY = curM === 0 ? curY - 1 : curY
  const y = d.getFullYear(), m = d.getMonth()
  return (y === curY && m === curM) || (y === prevY && m === prevM)
}

export default function JioSaavnReleasesPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('all')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [importingId, setImportingId] = useState(null)
  const [importedIds, setImportedIds] = useState(new Set())
  const [hideImported, setHideImported] = useState(true)
  const [sortOrder, setSortOrder] = useState('desc')

  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const searchTimer = useRef(null)
  const abortRef = useRef(null)

  const isSearchMode = activeSearch.trim().length > 0

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    try {
      const saved = localStorage.getItem('jiosaavnImportedIds')
      if (saved) setImportedIds(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setActiveSearch(searchInput), 600)
    return () => clearTimeout(searchTimer.current)
  }, [searchInput])

  const fetchTracks = useCallback(async ({ lang, off = 0, search = '', append = false }) => {
    if (!append && abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    if (!append) abortRef.current = controller

    append ? setLoadingMore(true) : setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ language: lang, offset: String(off) })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/jiosaavn-releases?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch')
      setTracks(prev => append ? [...prev, ...data.tracks] : data.tracks)
      setTotal(data.total)
      setOffset(off)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setTracks([])
    setOffset(0)
    fetchTracks({ lang: language, off: 0, search: activeSearch })
  }, [language, activeSearch])

  const handleLoadMore = () => {
    fetchTracks({ lang: language, off: offset + LIMIT, search: activeSearch, append: true })
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearch('')
  }

  const handleImport = async (track) => {
    setImportingId(track.id)
    try {
      const token = localStorage.getItem('adminToken')
      let lyrics = ''
      try {
        const lyricsRes = await fetch(
          `/api/admin/genius-search?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artists[0]?.name || '')}&scrape=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const lyricsData = await lyricsRes.json()
        if (lyricsData.found && lyricsData.lyrics) lyrics = lyricsData.lyrics
      } catch {}

      localStorage.setItem('spotifyImport', JSON.stringify({
        title: track.title,
        artistNames: track.artists.map(a => a.name),
        coverImageUrl: track.album.coverImage,
        releaseDate: track.album.releaseDate,
        jiosaavnUrl: track.jiosaavnUrl,
        albumName: track.album.name,
        lyrics,
      }))

      setImportedIds(prev => {
        const next = new Set([...prev, track.id])
        try { localStorage.setItem('jiosaavnImportedIds', JSON.stringify([...next])) } catch {}
        return next
      })
      router.push('/admin/songs/add')
    } catch (err) {
      alert('Import failed: ' + err.message)
    } finally {
      setImportingId(null)
    }
  }

  const displayed = tracks
    .filter(t => !hideImported || !importedIds.has(t.id))
    .filter(t => isSearchMode || isRecentRelease(t.album.releaseDate))
    .sort((a, b) => {
      const diff = new Date(b.album.releaseDate) - new Date(a.album.releaseDate)
      return sortOrder === 'desc' ? diff : -diff
    })

  const hasMore = tracks.length < total && tracks.length > 0

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100">
            <span className="text-xl">🎵</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">JioSaavn New Releases</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isSearchMode
                ? `Search results for "${activeSearch}" — ${total.toLocaleString()} tracks found`
                : `Showing this month & last month releases`}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchTracks({ lang: language, off: 0, search: activeSearch })}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Language Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 mb-4 flex gap-1 overflow-x-auto">
        {LANGUAGES.map(lang => (
          <button
            key={lang.key}
            onClick={() => setLanguage(lang.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              language === lang.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>

      {/* Search + Controls */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          {loading && searchInput ? (
            <FiLoader className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
          ) : (
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search JioSaavn — song name, artist, album…"
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
          {searchInput && (
            <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium whitespace-nowrap transition-all"
        >
          {sortOrder === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
        </button>
        {importedIds.size > 0 && (
          <button
            onClick={() => setHideImported(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
              hideImported ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FiCheck className="w-3.5 h-3.5" />
            {hideImported ? `Hiding ${importedIds.size} imported` : 'Show all'}
          </button>
        )}
      </div>

      {isSearchMode && !loading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
          <FiSearch className="w-4 h-4" />
          <span>Showing results for <strong className="text-slate-700">"{activeSearch}"</strong></span>
          <button onClick={handleClearSearch} className="ml-1 text-orange-600 hover:underline font-medium">Clear</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-4 text-sm">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-7 bg-slate-200 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiMusic className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">
            {isSearchMode ? `No results for "${activeSearch}"` : 'No tracks found'}
          </p>
          <p className="text-sm mt-1">
            {isSearchMode ? 'Try a different search term' : 'No recent releases found — try refreshing'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">Showing {displayed.length} of {total.toLocaleString()} tracks</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayed.map(track => {
              const isImporting = importingId === track.id
              const isImported = importedIds.has(track.id)
              return (
                <div key={track.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-slate-100">
                    {track.album.coverImage ? (
                      <img src={track.album.coverImage} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiMusic className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {isImported && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-emerald-500 rounded-full p-2">
                          <FiCheck className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" title={track.title}>
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-400">{formatDate(track.album.releaseDate)}</span>
                      {track.jiosaavnUrl && (
                        <a href={track.jiosaavnUrl} target="_blank" rel="noopener noreferrer"
                          className="text-orange-500 hover:text-orange-600" title="Open in JioSaavn"
                          onClick={e => e.stopPropagation()}>
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleImport(track)}
                      disabled={isImporting || isImported}
                      className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isImported
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                          : isImporting
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                      }`}
                    >
                      {isImported ? (
                        <><FiCheck className="w-3.5 h-3.5" /> Imported</>
                      ) : isImporting ? (
                        <><FiLoader className="w-3.5 h-3.5 animate-spin" /> Fetching lyrics…</>
                      ) : (
                        <><FiDownload className="w-3.5 h-3.5" /> Import Song</>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {loadingMore
                  ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Loading…</>
                  : <><FiChevronDown className="w-4 h-4" /> Load More ({tracks.length} of {total.toLocaleString()})</>
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
