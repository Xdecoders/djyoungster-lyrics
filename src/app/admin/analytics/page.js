'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCamera, FiVideo, FiTrendingUp, FiMusic, FiSearch, FiGlobe } from 'react-icons/fi'

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [searchData, setSearchData] = useState(null)
  const [referrerData, setReferrerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchAll()
  }, [days])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [shareRes, searchRes, referrerRes] = await Promise.all([
        fetch(`/api/admin/analytics/share-events?days=${days}`, { headers }),
        fetch(`/api/admin/analytics/search-events?days=${days}`, { headers }),
        fetch(`/api/admin/analytics/referrers?days=${days}`, { headers }),
      ])

      const [shareJson, searchJson, referrerJson] = await Promise.all([
        shareRes.json(),
        searchRes.json(),
        referrerRes.json(),
      ])

      if (shareJson.daily) setData(shareJson)
      if (searchJson.daily) setSearchData(searchJson)
      if (referrerJson.sources) setReferrerData(referrerJson)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const maxDaily = data?.daily?.length
    ? Math.max(...data.daily.map(d => d.story + d.reel), 1)
    : 1

  const maxSearchDaily = searchData?.daily?.length
    ? Math.max(...searchData.daily.map(d => d.count), 1)
    : 1

  const zeroResultPct = searchData?.total > 0
    ? Math.round((searchData.zeroResults / searchData.total) * 100)
    : 0

  const referrerColors = {
    'Direct': 'bg-slate-500',
    'Google': 'bg-blue-500',
    'YouTube': 'bg-red-500',
    'Facebook': 'bg-indigo-500',
    'Instagram': 'bg-pink-500',
    'Twitter / X': 'bg-sky-500',
  }
  const getReferrerColor = (label) => referrerColors[label] || 'bg-gray-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6 text-primary" />
              Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Story/reel downloads, searches, and traffic sources</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  days === d
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Story & Reel Section ── */}
            {data && (
              <>
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <FiCamera className="w-5 h-5 text-purple-500" /> Story &amp; Reel Downloads
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FiCamera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Story Clicks</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.totals.story.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All time</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <FiVideo className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Reel Clicks</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.totals.reel.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All time</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Combined</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.totals.combined.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All time</p>
                  </div>
                </div>

                {/* Daily Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 mb-6">
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-6">Daily Activity (last {days} days)</h3>
                  <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                    {data.daily.map((d) => (
                      <div key={d.date} className="flex flex-col items-center gap-0.5 flex-1 min-w-[20px] group relative">
                        <div
                          className="w-full bg-cyan-400 dark:bg-cyan-500 rounded-t transition-all"
                          style={{ height: `${(d.reel / maxDaily) * 100}%`, minHeight: d.reel > 0 ? '2px' : '0' }}
                        />
                        <div
                          className="w-full bg-purple-400 dark:bg-purple-500 rounded-b transition-all"
                          style={{ height: `${(d.story / maxDaily) * 100}%`, minHeight: d.story > 0 ? '2px' : '0' }}
                        />
                        {(d.story > 0 || d.reel > 0) && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {d.date.slice(5)}<br />
                            <span className="text-purple-300">Story: {d.story}</span><br />
                            <span className="text-cyan-300">Reel: {d.reel}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="w-3 h-3 rounded bg-purple-400 inline-block" /> Story
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Reel
                    </span>
                  </div>
                </div>

                {/* Top Songs Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  <TopSongsTable title="Top Songs for Story" icon={FiCamera} color="purple" rows={data.topStory} />
                  <TopSongsTable title="Top Songs for Reel" icon={FiVideo} color="cyan" rows={data.topReel} />
                </div>
              </>
            )}

            {/* ── Search Analytics Section ── */}
            {searchData && (
              <>
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <FiSearch className="w-5 h-5 text-violet-500" /> Search Analytics
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                        <FiSearch className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Searches</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{searchData.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last {days} days</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <FiSearch className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Zero Results</span>
                      </div>
                      {zeroResultPct > 10 && (
                        <span className="text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                          {zeroResultPct}%
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{searchData.zeroResults.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Searches with no results</p>
                  </div>
                </div>

                {/* Daily Search Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 mb-6">
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-6">Daily Search Volume (last {days} days)</h3>
                  <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                    {searchData.daily.map((d) => (
                      <div key={d.date} className="flex flex-col items-center gap-0.5 flex-1 min-w-[20px] group relative">
                        <div
                          className="w-full bg-violet-400 dark:bg-violet-500 rounded transition-all"
                          style={{ height: `${(d.count / maxSearchDaily) * 100}%`, minHeight: d.count > 0 ? '2px' : '0' }}
                        />
                        {d.count > 0 && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {d.date.slice(5)}: {d.count}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Queries + Zero Result Queries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  {/* Top Queries */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-5">Top Queries</h3>
                    {searchData.topQueries.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {searchData.topQueries.map((row, i) => {
                          const maxCount = Math.max(...searchData.topQueries.map(r => r.count), 1)
                          return (
                            <div key={row.query} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-right flex-shrink-0">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{row.query}</span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">avg {row.avgResults}</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.count}</span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                  <div
                                    className="bg-violet-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Zero Result Queries */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">Zero-Result Queries</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Content gaps — consider adding these songs</p>
                    {searchData.zeroResultQueries.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No zero-result searches</p>
                    ) : (
                      <div className="space-y-2">
                        {searchData.zeroResultQueries.map((row, i) => (
                          <div key={row.query} className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                            <span className="text-xs font-bold text-amber-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{row.query}</span>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">{row.count}×</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Referrer Sources Section ── */}
            {referrerData && (
              <>
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <FiGlobe className="w-5 h-5 text-teal-500" /> Traffic Sources
                </h2>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Referrer Breakdown</h3>
                    <span className="text-sm text-slate-400 dark:text-slate-500">{referrerData.total.toLocaleString()} visits in {days}d</span>
                  </div>

                  {referrerData.sources.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No visit data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {referrerData.sources.map((src) => (
                        <div key={src.label} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-32 flex-shrink-0 truncate">{src.label}</span>
                          <div className="flex-1">
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                              <div
                                className={`${getReferrerColor(src.label)} h-2.5 rounded-full transition-all`}
                                style={{ width: `${src.pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 text-right">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-16 text-right">{src.count.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right">{src.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!data && !searchData && !referrerData && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-20">Failed to load analytics.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TopSongsTable({ title, icon: Icon, color, rows }) {
  const colorMap = {
    purple: { header: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', bar: 'bg-purple-500' },
    cyan: { header: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30', bar: 'bg-cyan-500' },
  }
  const c = colorMap[color]
  const max = Math.max(...rows.map(r => r.count), 1)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
        <div className={`p-1.5 ${c.bg} rounded-lg`}>
          <Icon className={`w-4 h-4 ${c.header}`} />
        </div>
        {title}
      </h2>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
          <FiMusic className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row.song?.id || i} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-right flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href={`/song/${row.song?.slug || ''}`}
                    target="_blank"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate hover:text-primary transition"
                  >
                    {row.song?.title || 'Unknown'}
                  </Link>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">{row.count}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`${c.bar} h-1.5 rounded-full transition-all`}
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
                {row.song?.artists?.[0] && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {row.song.artists[0].artist.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
