'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiDatabase, FiPlay, FiPause, FiTrash2, FiRefreshCw, FiCheck, FiX, FiAlertCircle, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi'

const SITES = [
  { key: 'lyricsmint.com', name: 'LyricsMint', type: 'sitemap', color: 'from-purple-500 to-purple-700' },
  { key: 'lyricsraag.com', name: 'LyricsRaag', type: 'both', color: 'from-blue-500 to-blue-700' },
  { key: 'tamil2lyrics.com', name: 'Tamil2Lyrics', type: 'sitemap', color: 'from-orange-500 to-orange-700' },
  { key: 'genius.com', name: 'Genius', type: 'manual', color: 'from-yellow-500 to-yellow-700' },
  { key: 'gaana.com', name: 'Gaana', type: 'both', color: 'from-red-500 to-red-700' },
  { key: 'bharatlyrics.com', name: 'BharatLyrics', type: 'both', color: 'from-emerald-500 to-emerald-700' },
  { key: 'vergelyrics.com', name: 'VergeLyrics', type: 'both', color: 'from-teal-500 to-teal-700' }
]

export default function BulkImportPage() {
  const router = useRouter()
  const [imports, setImports] = useState([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(null) // site key being discovered
  const [manualUrls, setManualUrls] = useState('')
  const [manualSite, setManualSite] = useState(null) // which site the manual URL box is for
  const [activityLog, setActivityLog] = useState({}) // importId -> [{url, result, time}]
  const [expandedImport, setExpandedImport] = useState(null)
  const pollingRefs = useRef({}) // importId -> intervalId

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [router])

  // Load imports on mount
  useEffect(() => {
    fetchImports()
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(clearInterval)
    }
  }, [])

  const fetchImports = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/bulk-import', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setImports(data)
      }
    } catch (error) {
      console.error('Failed to fetch imports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Discover URLs from sitemap (non-blocking, polls for completion)
  const handleDiscover = async (site) => {
    setDiscovering(site)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'discover', site })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Poll until discovery finishes (status changes from 'discovering')
      const importId = data.importId
      const pollDiscovery = async () => {
        for (let i = 0; i < 120; i++) { // max ~4 minutes
          await new Promise(r => setTimeout(r, 2000))
          const pollToken = localStorage.getItem('adminToken')
          const pollRes = await fetch('/api/admin/bulk-import', {
            headers: { 'Authorization': `Bearer ${pollToken}` }
          })
          if (!pollRes.ok) continue
          const imports = await pollRes.json()
          const imp = imports.find(m => m.id === importId)
          if (!imp || imp.status !== 'discovering') {
            await fetchImports()
            const total = imp?.totalUrls || 0
            if (total > 0) {
              alert(`Discovered ${total} URLs from ${site}`)
            } else {
              alert(`Discovery completed for ${site} (0 URLs found)`)
            }
            return
          }
        }
        await fetchImports()
        alert('Discovery is still running in the background. Refresh to check progress.')
      }

      await fetchImports()
      await pollDiscovery()
    } catch (error) {
      alert(`Discovery failed: ${error.message}`)
    } finally {
      setDiscovering(null)
    }
  }

  // Add URLs manually for any site
  const handleAddManualUrls = async (siteKey) => {
    const urls = manualUrls.split('\n').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) return alert('Paste at least one URL')

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'add-urls', site: siteKey, urls })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setManualUrls('')
      setManualSite(null)
      await fetchImports()
      alert(`Added ${data.totalUrls} URLs`)
    } catch (error) {
      alert(`Failed: ${error.message}`)
    }
  }

  // Process next URL (called by polling)
  const processNext = useCallback(async (importId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'process-next', importId })
      })
      const data = await res.json()

      if (data.status === 'completed' || data.status === 'paused') {
        stopPolling(importId)
        fetchImports()
        return
      }

      if (data.processed) {
        // Update activity log
        setActivityLog(prev => {
          const log = prev[importId] || []
          return {
            ...prev,
            [importId]: [
              { url: data.processed.url, result: data.processed.result, reason: data.processed.reason, title: data.processed.title, time: new Date().toLocaleTimeString() },
              ...log
            ].slice(0, 50)
          }
        })

        // Update import progress locally
        if (data.progress) {
          setImports(prev => prev.map(imp =>
            imp.id === importId
              ? { ...imp, scraped: data.progress.scraped, failed: data.progress.failed, skipped: data.progress.skipped, status: data.progress.pending === 0 ? 'completed' : imp.status }
              : imp
          ))
        }
      }
    } catch (error) {
      console.error('Process error:', error)
    }
  }, [])

  // Start polling for an import
  const startPolling = (importId) => {
    if (pollingRefs.current[importId]) return // Already polling

    // Set status to running
    setImports(prev => prev.map(imp =>
      imp.id === importId ? { ...imp, status: 'running' } : imp
    ))

    // Process immediately, then poll every 3 seconds
    processNext(importId)
    pollingRefs.current[importId] = setInterval(() => processNext(importId), 3000)
  }

  // Stop polling
  const stopPolling = (importId) => {
    if (pollingRefs.current[importId]) {
      clearInterval(pollingRefs.current[importId])
      delete pollingRefs.current[importId]
    }
  }

  // Pause import
  const handlePause = async (importId) => {
    stopPolling(importId)
    try {
      const token = localStorage.getItem('adminToken')
      await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'pause', importId })
      })
      setImports(prev => prev.map(imp =>
        imp.id === importId ? { ...imp, status: 'paused' } : imp
      ))
    } catch (error) {
      console.error('Pause error:', error)
    }
  }

  // Resume import
  const handleResume = async (importId) => {
    try {
      const token = localStorage.getItem('adminToken')
      await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'resume', importId })
      })
      startPolling(importId)
    } catch (error) {
      console.error('Resume error:', error)
    }
  }

  // Start import (first time)
  const handleStart = (importId) => {
    startPolling(importId)
  }

  // Delete import
  const handleDelete = async (importId) => {
    if (!confirm('Delete this import and all its URLs?')) return
    stopPolling(importId)
    try {
      const token = localStorage.getItem('adminToken')
      await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'delete', importId })
      })
      setImports(prev => prev.filter(imp => imp.id !== importId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Retry failed
  const handleRetryFailed = async (importId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'retry-failed', importId })
      })
      const data = await res.json()
      alert(`Reset ${data.retriedCount} failed URLs to pending`)
      fetchImports()
    } catch (error) {
      console.error('Retry error:', error)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      discovering: 'bg-blue-100 text-blue-700',
      running: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-emerald-100 text-emerald-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    )
  }

  const getResultIcon = (result) => {
    if (result === 'scraped') return <FiCheck className="text-green-500 w-4 h-4" />
    if (result === 'skipped') return <FiAlertCircle className="text-yellow-500 w-4 h-4" />
    return <FiX className="text-red-500 w-4 h-4" />
  }

  const getProgressPercent = (imp) => {
    if (imp.totalUrls === 0) return 0
    return Math.round(((imp.scraped + imp.failed + imp.skipped) / imp.totalUrls) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bulk Import</h1>

      {/* Section A: Start New Import */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Start New Import</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {SITES.map(site => (
            <div
              key={site.key}
              className={`p-4 rounded-xl text-white bg-gradient-to-br ${site.color} text-left`}
            >
              <div className="font-semibold text-lg">{site.name}</div>
              <div className="text-sm opacity-80 mt-1">
                {site.type === 'manual' ? 'Paste URLs manually' : site.type === 'both' ? 'Sitemap + manual URLs' : 'Discover from sitemap'}
              </div>
              <div className="flex gap-2 mt-3">
                {(site.type === 'sitemap' || site.type === 'both') && (
                  <button
                    onClick={() => handleDiscover(site.key)}
                    disabled={discovering !== null}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {discovering === site.key ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Discovering...
                      </>
                    ) : (
                      <>
                        <FiDatabase className="w-3.5 h-3.5" />
                        Sitemap
                      </>
                    )}
                  </button>
                )}
                {(site.type === 'manual' || site.type === 'both') && (
                  <button
                    onClick={() => { setManualSite(manualSite === site.key ? null : site.key); setManualUrls('') }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${manualSite === site.key ? 'bg-white text-slate-700' : 'bg-white/20 hover:bg-white/30'}`}
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    Paste URLs
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Manual URL input (shown for selected site) */}
        {manualSite && (
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              {SITES.find(s => s.key === manualSite)?.name} URLs (one per line)
            </label>
            <textarea
              value={manualUrls}
              onChange={(e) => setManualUrls(e.target.value)}
              placeholder={`https://${manualSite === 'genius.com' ? 'genius.com/Artist-song-name-lyrics' : manualSite === 'lyricsraag.com' ? 'lyricsraag.com/song-name-lyrics/' : manualSite + '/lyrics/song-name'}\nPaste one URL per line...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              rows={4}
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => handleAddManualUrls(manualSite)}
                disabled={!manualUrls.trim()}
                className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Add URLs
              </button>
              <button
                onClick={() => { setManualSite(null); setManualUrls('') }}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section B: Import Batches */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Import Batches</h2>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : imports.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No imports yet. Start by discovering URLs from a site above.
          </div>
        ) : (
          <div className="space-y-4">
            {imports.map(imp => {
              const progress = getProgressPercent(imp)
              const isRunning = !!pollingRefs.current[imp.id]
              const log = activityLog[imp.id] || []
              const isExpanded = expandedImport === imp.id

              return (
                <div key={imp.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Import Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700">{imp.site}</span>
                        {getStatusBadge(isRunning ? 'running' : imp.status)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(imp.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="text-slate-500">Total: <strong>{imp.totalUrls}</strong></span>
                      <span className="text-green-600">Scraped: <strong>{imp.scraped}</strong></span>
                      <span className="text-red-500">Failed: <strong>{imp.failed}</strong></span>
                      <span className="text-yellow-600">Skipped: <strong>{imp.skipped}</strong></span>
                      <span className="text-slate-400">Pending: <strong>{imp.totalUrls - imp.scraped - imp.failed - imp.skipped}</strong></span>
                      <span className="text-slate-400 ml-auto">{progress}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(imp.status === 'pending' || imp.status === 'paused') && !isRunning && (
                        <button
                          onClick={() => imp.status === 'paused' ? handleResume(imp.id) : handleStart(imp.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                        >
                          <FiPlay className="w-3.5 h-3.5" />
                          {imp.status === 'paused' ? 'Resume' : 'Start'}
                        </button>
                      )}
                      {(imp.status === 'running' || isRunning) && (
                        <button
                          onClick={() => handlePause(imp.id)}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                        >
                          <FiPause className="w-3.5 h-3.5" />
                          Pause
                        </button>
                      )}
                      {imp.failed > 0 && !isRunning && (
                        <button
                          onClick={() => handleRetryFailed(imp.id)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                        >
                          <FiRefreshCw className="w-3.5 h-3.5" />
                          Retry Failed
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(imp.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                        onClick={() => setExpandedImport(isExpanded ? null : imp.id)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-1.5 ml-auto"
                      >
                        {isExpanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide Log' : 'Show Log'}
                      </button>
                    </div>
                  </div>

                  {/* Activity Log (expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-slate-50 p-4 max-h-80 overflow-y-auto">
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Activity Log</h4>
                      {log.length === 0 ? (
                        <p className="text-sm text-slate-400">No activity yet. Start the import to see progress.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {log.map((entry, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              {getResultIcon(entry.result)}
                              <div className="flex-1 min-w-0">
                                <span className="text-slate-600 font-medium">{entry.title || 'Unknown'}</span>
                                {entry.reason && (
                                  <span className="text-slate-400 ml-2">— {entry.reason}</span>
                                )}
                                <div className="text-xs text-slate-400 truncate">{entry.url}</div>
                              </div>
                              <span className="text-xs text-slate-400 whitespace-nowrap">{entry.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
