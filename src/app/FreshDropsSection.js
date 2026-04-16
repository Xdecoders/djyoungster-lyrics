'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { FiMusic, FiPlay } from 'react-icons/fi'

const TABS = [
  { key: 'all',             label: 'All' },
  { key: 'hindi',          label: 'Hindi' },
  { key: 'punjabi',        label: 'Punjabi' },
  { key: 'english',        label: 'English' },
  { key: 'instagram-viral', label: 'Instagram Viral' },
  { key: 'telugu',         label: 'Telugu' },
  { key: 'tamil',          label: 'Tamil' },
]

export default function FreshDropsSection({ data }) {
  const [active, setActive] = useState('all')

  const songMap = {
    'all':             data.latestSongs,
    'hindi':           data.hindiSongs,
    'punjabi':         data.punjabiSongs,
    'english':         data.englishSongs,
    'instagram-viral': data.instagramViralSongs,
    'telugu':          data.teluguSongs,
    'tamil':           data.tamilSongs,
  }

  const songs = songMap[active] || []

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Latest Lyrics</h2>
        <Link href="/songs?sort=latest" className="text-sm text-primary hover:text-primary-hover font-medium">
          View All
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              active === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-primary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {songs.map((song, index) => {
            const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
            return (
              <Link
                key={song.id}
                href={`/song/${song.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4]"
              >
                {song.coverImage ? (
                  <Image
                    src={song.coverImage}
                    alt={song.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={index < 6}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <FiMusic className="w-10 h-10 text-slate-400/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {index < 3 && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">New</span>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <FiPlay className="w-4 h-4 text-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="bg-white/15 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-white/20">
                    <h3 className="font-semibold text-white text-xs truncate">{song.title}</h3>
                    <p className="text-white/70 text-[10px] truncate mt-0.5">{artistNames}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-slate-400 text-sm py-8 text-center">No lyrics found in this category.</p>
      )}
    </section>
  )
}
