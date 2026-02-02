'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiFilm, FiMusic, FiPlay, FiEye, FiChevronRight, FiCalendar, FiUser, FiUsers, FiVideo, FiGlobe, FiAward, FiEdit3, FiHeadphones } from 'react-icons/fi'

// Auto-generated Movie Description Component
function MovieDescription({ movie }) {
  // Use custom description if available, otherwise auto-generate
  if (movie.description) {
    return (
      <div className="mb-6 p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          {movie.description}
        </p>
      </div>
    )
  }

  // Auto-generate description
  let description = `"${movie.title}" is a ${movie.language || ''} ${movie.genre || 'film'}`

  if (movie.year) {
    description += ` released in ${movie.year}`
  }
  description += '.'

  if (movie.director) {
    description += ` The movie is directed by ${movie.director}.`
  }

  if (movie.cast) {
    description += ` It stars ${movie.cast}.`
  }

  if (movie.musicDirector) {
    description += ` The music is composed by ${movie.musicDirector}.`
  }

  if (movie.totalSongs > 0) {
    description += ` The movie features ${movie.totalSongs} song${movie.totalSongs > 1 ? 's' : ''} in its soundtrack.`
  }

  description += ` Find all the songs from ${movie.title} with complete lyrics on DJYoungster.`

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        {description}
      </p>
    </div>
  )
}

// Movie Info Sidebar Component
function MovieInfo({ movie }) {
  const info = []

  if (movie.director) {
    info.push({ label: 'Director', value: movie.director, icon: FiVideo })
  }
  if (movie.producer) {
    info.push({ label: 'Producer', value: movie.producer, icon: FiAward })
  }
  if (movie.musicDirector) {
    info.push({ label: 'Music', value: movie.musicDirector, icon: FiHeadphones })
  }
  if (movie.writer) {
    info.push({ label: 'Writer', value: movie.writer, icon: FiEdit3 })
  }
  if (movie.cast) {
    info.push({ label: 'Cast', value: movie.cast, icon: FiUsers })
  }
  if (movie.genre) {
    info.push({ label: 'Genre', value: movie.genre, icon: FiFilm })
  }
  if (movie.language) {
    info.push({ label: 'Language', value: movie.language, icon: FiGlobe })
  }
  if (movie.year) {
    info.push({ label: 'Year', value: movie.year.toString(), icon: FiCalendar })
  }

  if (info.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiFilm className="w-4 h-4 text-rose-500" />
        Movie Information
      </h3>
      <div className="space-y-3">
        {info.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex-shrink-0">
              <item.icon className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SongRow({ song, index }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  return (
    <Link href={`/song/${song.slug}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group">
      <span className="w-8 text-center text-slate-400 dark:text-slate-500 font-medium group-hover:hidden">{index + 1}</span>
      <span className="w-8 text-center hidden group-hover:block">
        <FiPlay className="w-5 h-5 text-rose-500 mx-auto" />
      </span>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
        {song.coverImage ? (
          <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <FiMusic className="w-5 h-5 text-rose-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-rose-500 transition">{song.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <FiEye className="w-4 h-4" />
        <span className="text-sm">{formatViews(song.views)}</span>
      </div>
    </Link>
  )
}

export default function MoviePageClient({ initialMovie }) {
  // Use initial data from server - no loading state needed
  const [movie] = useState(initialMovie)

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  // If no movie data (should not happen with SSR), show nothing
  if (!movie) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li><Link href="/movies" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Movies</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium truncate">{movie.title}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Movie Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          {/* Background Image with Blur */}
          <div className="absolute inset-0">
            {movie.posterUrl || movie.songs?.[0]?.coverImage ? (
              <img
                src={movie.posterUrl || movie.songs?.[0]?.coverImage}
                alt=""
                className="w-full h-full object-cover scale-110 blur-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-32 h-44 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xl ring-1 ring-white/20">
                {movie.posterUrl || movie.songs?.[0]?.coverImage ? (
                  <img
                    src={movie.posterUrl || movie.songs?.[0]?.coverImage}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiFilm className="w-16 h-16 text-white/80" />
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-white/60 text-sm mb-1">Movie Soundtrack</p>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-lg">{movie.title}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/80">
                  {movie.year && (
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="w-4 h-4" />
                      {movie.year}
                    </span>
                  )}
                  {movie.director && (
                    <span className="flex items-center gap-1.5">
                      <FiUser className="w-4 h-4" />
                      {movie.director}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <FiMusic className="w-4 h-4" />
                    {movie.totalSongs} songs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiEye className="w-4 h-4" />
                    {formatViews(movie.totalViews)} views
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Auto-generated Description */}
            <MovieDescription movie={movie} />

            {/* Songs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <FiMusic className="w-5 h-5 text-rose-500" />
                  Songs from {movie.title}
                </h2>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {movie.songs?.length > 0 ? (
                  movie.songs.map((song, index) => (
                    <SongRow key={song.id} song={song} index={index} />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <FiMusic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No songs added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <MovieInfo movie={movie} />

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Soundtrack Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 text-center">
                  <FiMusic className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{movie.totalSongs}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Songs</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <FiEye className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatViews(movie.totalViews)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
                </div>
              </div>
            </div>

            {/* Browse More */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Browse More</h3>
              <div className="space-y-2">
                <Link
                  href="/movies"
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 transition group"
                >
                  <FiFilm className="w-5 h-5 text-rose-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">All Movies</span>
                </Link>
                <Link
                  href="/songs"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition group"
                >
                  <FiMusic className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">All Songs</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
