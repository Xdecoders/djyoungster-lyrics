'use client'

import { useState } from 'react'
import { FiRefreshCw, FiTrash2, FiCheck, FiAlertCircle, FiHome, FiMusic, FiUser, FiDisc, FiFilm, FiGrid, FiTag, FiLayers } from 'react-icons/fi'

export default function CacheManagementPage() {
  const [loading, setLoading] = useState({})
  const [results, setResults] = useState({})

  const cacheTypes = [
    { key: 'all', label: 'All Pages', icon: FiRefreshCw, description: 'Clear cache for entire website', color: 'red' },
    { key: 'homepage', label: 'Homepage', icon: FiHome, description: 'Clear homepage cache', color: 'emerald' },
    { key: 'songs', label: 'All Songs', icon: FiMusic, description: 'Clear all song pages cache', color: 'blue' },
    { key: 'artists', label: 'All Artists', icon: FiUser, description: 'Clear all artist pages cache', color: 'pink' },
    { key: 'albums', label: 'All Albums', icon: FiDisc, description: 'Clear all album pages cache', color: 'purple' },
    { key: 'movies', label: 'All Movies', icon: FiFilm, description: 'Clear all movie pages cache', color: 'amber' },
    { key: 'genres', label: 'All Genres', icon: FiGrid, description: 'Clear all genre pages cache', color: 'cyan' },
    { key: 'categories', label: 'All Categories', icon: FiLayers, description: 'Clear all category pages cache', color: 'indigo' },
    { key: 'tags', label: 'All Tags', icon: FiTag, description: 'Clear all tag pages cache', color: 'teal' },
  ]

  const handleClearCache = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }))
    setResults(prev => ({ ...prev, [type]: null }))

    try {
      const body = type === 'all' ? { all: true } : { type }

      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      setResults(prev => ({
        ...prev,
        [type]: { success: data.success, message: data.message }
      }))

      // Clear result after 5 seconds
      setTimeout(() => {
        setResults(prev => ({ ...prev, [type]: null }))
      }, 5000)
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: { success: false, message: error.message }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
      pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30',
      cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
      teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30',
    }
    return colors[color] || colors.emerald
  }

  const getIconColorClasses = (color) => {
    const colors = {
      red: 'text-red-600 dark:text-red-400',
      emerald: 'text-emerald-600 dark:text-emerald-400',
      blue: 'text-blue-600 dark:text-blue-400',
      pink: 'text-pink-600 dark:text-pink-400',
      purple: 'text-purple-600 dark:text-purple-400',
      amber: 'text-amber-600 dark:text-amber-400',
      cyan: 'text-cyan-600 dark:text-cyan-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      teal: 'text-teal-600 dark:text-teal-400',
    }
    return colors[color] || colors.emerald
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Cache Management</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Clear cached pages to see the latest content. Pages are automatically cached for 1 hour using ISR (Incremental Static Regeneration).
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-200">How ISR Caching Works</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Pages are cached and served instantly to visitors. Cache automatically refreshes every hour.
              Use the buttons below to manually clear cache when you make content updates.
            </p>
          </div>
        </div>
      </div>

      {/* Cache Clear Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cacheTypes.map((type) => {
          const Icon = type.icon
          const isLoading = loading[type.key]
          const result = results[type.key]

          return (
            <div
              key={type.key}
              className={`relative border rounded-xl p-5 transition-all ${getColorClasses(type.color)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm`}>
                  <Icon className={`w-5 h-5 ${getIconColorClasses(type.color)}`} />
                </div>
                {result && (
                  <div className={`flex items-center gap-1 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
                    <span>{result.success ? 'Cleared!' : 'Failed'}</span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{type.label}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{type.description}</p>

              <button
                onClick={() => handleClearCache(type.key)}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${type.key === 'all'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Clear Cache
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Specific Page Cache Clear */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Clear Specific Page Cache</h2>
        <SpecificPageCacheClear />
      </div>
    </div>
  )
}

function SpecificPageCacheClear() {
  const [type, setType] = useState('song')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleClear = async () => {
    if (!slug.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug: slug.trim() })
      })

      const data = await res.json()
      setResult({ success: data.success, message: data.message })

      if (data.success) {
        setSlug('')
      }
    } catch (error) {
      setResult({ success: false, message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <option value="song">Song</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="movie">Movie</option>
          <option value="genre">Genre</option>
          <option value="category">Category</option>
          <option value="tag">Tag</option>
        </select>

        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Enter slug (e.g., tum-hi-ho)"
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400"
        />

        <button
          onClick={handleClear}
          disabled={loading || !slug.trim()}
          className="px-6 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <FiTrash2 className="w-4 h-4" />
              Clear
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`flex items-center gap-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          <span>{result.message}</span>
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Enter the slug of the specific page you want to clear. For example, for the URL <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">/song/tum-hi-ho</code>, enter <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">tum-hi-ho</code>.
      </p>
    </div>
  )
}
