'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SiSpotify } from 'react-icons/si'
import { FiMusic, FiDownload, FiSearch, FiRefreshCw, FiChevronDown, FiExternalLink, FiCheck, FiLoader } from 'react-icons/fi'

const LANGUAGES = [
  { key: 'all',     label: 'All',     flag: '🌐' },
  { key: 'hindi',   label: 'Hindi',   flag: '🇮🇳' },
  { key: 'punjabi', label: 'Punjabi', flag: '🎵' },
  { key: 'tamil',   label: 'Tamil',   flag: '🎶' },
  { key: 'telugu',  label: 'Telugu',  flag: '🎸' },
  { key: 'english', label: 'English', flag: '🇺🇸' },
]

function formatDuration(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SpotifyReleasesPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('all')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [importingId, setImportingId] = useState(null)
  const [importedIds, setImportedIds] = useState(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

  const fetchTracks = useCallback(async (lang, off = 0, append = false) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/spotify-releases?language=${lang}&offset=${off}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch')
      setTracks(prev => append ? [...prev, ...data.tracks] : data.tracks)
      setTotal(data.total)
      setOffset(off)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTracks(language, 0, false)
    setImportedIds(new Set())
  }, [language])

  const handleLanguageChange = (lang) => {
    if (lang === language) return
    setLanguage(lang)
    setTracks([])
    setOffset(0)
  }

  const handleLoadMore = () => {
    fetchTracks(language, offset + 30, true)
  }

  const handleImport = async (track) => {
    setImportingId(track.id)
    try {
      const token = localStorage.getItem('adminToken')

      // Try to fetch lyrics from Genius
      let lyrics = ''
      try {
        const lyricsRes = await fetch(
          `/api/admin/genius-search?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artists[0]?.name || '')}&scrape=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const lyricsData = await lyricsRes.json()
        if (lyricsData.found && lyricsData.lyrics) {
          lyrics = lyricsData.lyrics
        }
      } catch {
        // Lyrics fetch failed silently — user can add manually
      }

      // Store import data in localStorage for songs/add to pick up
      localStorage.setItem('spotifyImport', JSON.stringify({
        title: track.title,
        artistNames: track.artists.map(a => a.name),
        coverImageUrl: track.album.coverImage,
        releaseDate: track.album.releaseDate,
        spotifyUrl: track.spotifyUrl,
        previewUrl: track.previewUrl,
        albumName: track.album.name,
        lyrics,
      }))

      setImportedIds(prev => new Set([...prev, track.id]))
      router.push('/admin/songs/add')
    } catch (err) {
      alert('Import failed: ' + err.message)
    } finally {
      setImportingId(null)
    }
  }

  const filtered = search.trim()
    ? tracks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artists.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
      )
    : tracks

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-100">
            <SiSpotify className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Spotify New Releases</h1>
            <p className="text-slate-500 text-sm mt-0.5">Browse latest tracks and import to your database</p>
          </div>
        </div>
        <button
          onClick={() => fetchTracks(language, 0, false)}
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
            onClick={() => handleLanguageChange(lang.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              language === lang.key
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by song or artist name..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error.includes('SPOTIFY_CLIENT_ID') || error.includes('SPOTIFY_CLIENT_SECRET')
            ? '⚠️ Spotify credentials not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your .env file.'
            : `Error: ${error}`}
        </div>
      )}

      {/* Grid */}
      {loading && tracks.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
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
      ) : filtered.length === 0 && !loading ? (
        <div className="text-center py-16 text-slate-400">
          <FiMusic className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No tracks found</p>
          <p className="text-sm mt-1">Try a different language or refresh</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(track => {
              const isImporting = importingId === track.id
              const isImported = importedIds.has(track.id)
              return (
                <div
                  key={track.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Cover */}
                  <div className="relative aspect-square bg-slate-100">
                    {track.album.coverImage ? (
                      <img
                        src={track.album.coverImage}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiMusic className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {/* Preview badge */}
                    {track.previewUrl && (
                      <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        Preview
                      </span>
                    )}
                    {track.isExplicit && (
                      <span className="absolute top-1.5 left-1.5 bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        E
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" title={track.title}>
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{track.album.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-400">{formatDate(track.album.releaseDate)}</span>
                      {track.spotifyUrl && (
                        <a
                          href={track.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-600"
                          title="Open in Spotify"
                          onClick={e => e.stopPropagation()}
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Import button */}
                    <button
                      onClick={() => handleImport(track)}
                      disabled={isImporting || isImported}
                      className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isImported
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isImporting
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
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

          {/* Load more */}
          {!search && tracks.length < total && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiChevronDown className="w-4 h-4" />}
                Load More ({tracks.length} of {total})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
