'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { FiEye, FiMusic } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'

const PERIODS = [
  { key: 'all',   label: 'All Time' },
  { key: 'month', label: 'Month' },
  { key: 'week',  label: 'Week' },
  { key: 'day',   label: 'Today' },
]

function formatViews(views) {
  if (!views) return '0'
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
  return views.toString()
}

function ChartRow({ song, index, isLast }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const isTop = index === 0

  return (
    <Link
      href={`/song/${song.slug}`}
      className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${
        !isLast ? 'border-b border-slate-100 dark:border-slate-700' : ''
      }`}
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0 font-bold tabular-nums">
        {isTop ? (
          <FaFire className="w-4 h-4 mx-auto text-rose-500" />
        ) : (
          <span className={
            index === 1 ? 'text-amber-500 text-sm' :
            index === 2 ? 'text-slate-400 text-sm' :
            'text-slate-400 dark:text-slate-500 text-sm'
          }>{index + 1}</span>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiMusic className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-slate-800 dark:text-white text-sm truncate group-hover:text-primary transition-colors">
            {song.title}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">
            Lyrics
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{artistNames}</p>
      </div>

      {/* Views */}
      <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 dark:text-slate-500">
        <FiEye className="w-3.5 h-3.5" />
        <span className="text-xs tabular-nums font-medium">{formatViews(song.views)}</span>
      </div>
    </Link>
  )
}

export default function ChartsSection({ songs: initialSongs }) {
  const [period, setPeriod] = useState('all')
  const [songs, setSongs] = useState(initialSongs || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (period === 'all') {
      setSongs(initialSongs || [])
      return
    }
    setLoading(true)
    fetch(`/api/public/charts?period=${period}`)
      .then(r => r.json())
      .then(data => {
        setSongs(Array.isArray(data) ? data : [])
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false))
  }, [period, initialSongs])

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Charts</h2>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs font-semibold border border-rose-100 dark:border-rose-900/40">
            <FaFire className="w-3 h-3" /> Top 10
          </span>
        </div>
        <Link href="/songs?sort=views" className="text-sm text-primary hover:text-primary-hover font-medium">
          View All
        </Link>
      </div>

      {/* Period filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              period === p.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-primary hover:text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[100px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">No songs found for this period.</p>
        ) : (
          songs.map((song, index) => (
            <ChartRow key={song.id} song={song} index={index} isLast={index === songs.length - 1} />
          ))
        )}
      </div>
    </section>
  )
}
