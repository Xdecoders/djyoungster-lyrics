'use client'

import { useState } from 'react'
import InteractiveRating from '@/components/InteractiveRating'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { FiFilm, FiMusic, FiPlay, FiEye, FiChevronRight, FiCalendar, FiUser, FiUsers, FiVideo, FiGlobe, FiAward, FiEdit3, FiHeadphones, FiHelpCircle, FiChevronDown } from 'react-icons/fi'

// Auto-generated Movie Description Component
function MovieDescription({ movie }) {
  // Use custom metaDescription if available, otherwise auto-generate consistent format
  const description = movie.metaDescription ||
    `Explore ${movie.title} movie song lyrics and meanings. DJYoungster provides ${movie.title} lyrics in English Translation, Hindi and Punjabi language variations.`

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
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
        {movie.title} Info
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
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="48px" className="object-cover" />
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

// FAQ Component
function MovieFAQs({ movie }) {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = []

  faqs.push({
    q: `How many songs are in ${movie.title}?`,
    a: `${movie.title} has ${movie.totalSongs} ${movie.totalSongs === 1 ? 'song' : 'songs'} in its soundtrack.${movie.musicDirector ? ` The music is composed by ${movie.musicDirector}.` : ''}`
  })

  if (movie.director) {
    faqs.push({
      q: `Who is the director of ${movie.title}?`,
      a: `${movie.title} is directed by ${movie.director}.${movie.year ? ` The movie was released in ${movie.year}.` : ''}`
    })
  }

  if (movie.musicDirector) {
    faqs.push({
      q: `Who is the music director of ${movie.title}?`,
      a: `The music of ${movie.title} is composed by ${movie.musicDirector}.`
    })
  }

  if (movie.cast) {
    faqs.push({
      q: `Who are the cast members of ${movie.title}?`,
      a: `The cast of ${movie.title} includes ${movie.cast}.`
    })
  }

  if (movie.producer) {
    faqs.push({
      q: `Who produced ${movie.title}?`,
      a: `${movie.title} is produced by ${movie.producer}.`
    })
  }

  if (movie.writer) {
    faqs.push({
      q: `Who wrote ${movie.title}?`,
      a: `${movie.title} is written by ${movie.writer}.`
    })
  }

  if (movie.language) {
    faqs.push({
      q: `What language is ${movie.title}?`,
      a: `${movie.title} is a ${movie.language} language movie.${movie.genre ? ` It falls under the ${movie.genre} genre.` : ''}`
    })
  }

  if (movie.year) {
    faqs.push({
      q: `When was ${movie.title} released?`,
      a: `${movie.title} was released in ${movie.year}.${movie.director ? ` It is directed by ${movie.director}.` : ''}`
    })
  }

  if (movie.songs?.length > 0) {
    const songNames = movie.songs.map(s => s.title).join(', ')
    faqs.push({
      q: `What are the songs in ${movie.title}?`,
      a: `The songs in ${movie.title} are: ${songNames}.`
    })
  }

  if (faqs.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <FiHelpCircle className="w-5 h-5 text-rose-500" />
          {movie.title} FAQs
        </h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {faqs.map((faq, index) => (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
            >
              <span className="font-medium text-slate-800 dark:text-white text-sm pr-4">{faq.q}</span>
              <FiChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 -mt-2">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
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
        {/* Movie Header - Clean Minimalist Design */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Poster Image - Larger Size */}
            <div className="w-36 h-48 sm:w-44 sm:h-60 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg relative">
              {movie.posterUrl || movie.songs?.[0]?.coverImage ? (
                <Image
                  src={movie.posterUrl || movie.songs?.[0]?.coverImage}
                  alt={`${movie.title}${movie.year ? ' (' + movie.year + ')' : ''} – movie poster and song lyrics`}
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-cover"
                />
              ) : (
                <FiFilm className="w-16 h-16 text-rose-400" />
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-rose-600 dark:text-rose-400 text-sm font-medium mb-1">Movie Soundtrack</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2">{movie.title} Songs Lyrics</h1>

              {/* Interactive Star Rating */}
              <InteractiveRating
                entityType="movie"
                entitySlug={movie.slug}
                initialRating={movie.averageRating || 0}
                initialTotal={movie.totalRatings || 0}
                className="mb-4 justify-center sm:justify-start"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-500 dark:text-slate-400">
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
                  {movie.totalSongs} {movie.totalSongs === 1 ? 'song' : 'songs'}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiEye className="w-4 h-4" />
                  {formatViews(movie.totalViews)} views
                </span>
              </div>
              {movie.description && (
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {movie.description}
                </p>
              )}
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
                  {movie.title} All Songs Lyrics
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

            {/* FAQs */}
            <MovieFAQs movie={movie} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <MovieInfo movie={movie} />

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">{movie.title} Stats</h3>
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
