'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMusic,
  FiUser,
  FiDisc,
  FiPlay,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiGrid,
  FiList,
  FiGlobe,
  FiShare2,
  FiTrendingUp,
  FiX,
  FiCopy,
  FiCheck,
  FiTwitter
} from 'react-icons/fi'
import { FaSpotify, FaInstagram, FaTwitter as FaTwitterBrand, FaYoutube, FaWhatsapp, FaFacebook } from 'react-icons/fa'

// Share Modal Component
function ShareModal({ isOpen, onClose, artist }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out ${artist?.name} on DJYoungster Lyrics!`

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    },
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artist?.name,
          text: shareText,
          url: currentUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Share Artist</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Share {artist?.name}'s profile with friends</p>

        {/* Native Share Button (mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
          >
            <FiShare2 className="w-5 h-5" />
            Share via...
          </button>
        )}

        {/* Social Share Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full text-white ${link.color} transition-all hover:scale-110`}
              title={link.name}
            >
              <link.icon className="w-6 h-6" />
            </a>
          ))}
        </div>

        {/* Copy Link */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <input
            type="text"
            value={currentUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none truncate"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-emerald-600 transition flex items-center gap-1"
          >
            {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Share Button Component
function ShareButton({ artist }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
      >
        <FiShare2 className="w-5 h-5" />
      </button>
      <ShareModal isOpen={isOpen} onClose={() => setIsOpen(false)} artist={artist} />
    </>
  )
}

// Hero Section Component - Clean Minimalist Design
function HeroSection({ artist, featuredSongs, songs, socialLinks }) {
  const [profileImageError, setProfileImageError] = useState(false)

  // Get fallback image from songs
  const songCoverImage = featuredSongs?.[0]?.coverImage || songs?.[0]?.coverImage || songs?.[0]?.album?.coverImage

  const getProfileImage = () => {
    if (artist?.imageUrl && !profileImageError) return artist.imageUrl
    if (songCoverImage) return songCoverImage
    return null
  }

  const profileImage = getProfileImage()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Profile Image - Larger Size */}
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
          {profileImage ? (
            <img
              src={profileImage}
              alt={artist?.name}
              className="w-full h-full object-cover"
              onError={() => setProfileImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
              <FiUser className="w-20 h-20 text-emerald-400 dark:text-emerald-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">Artist</span>
            {artist?.verified && (
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">Verified</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">{artist?.name}</h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FiMusic className="w-4 h-4" />
              {artist?.totalSongs || artist?._count?.songs || 0} Songs
            </span>
            {artist?.albums?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <FiDisc className="w-4 h-4" />
                {artist.albums.length} Albums
              </span>
            )}
            {artist?.country && (
              <span className="flex items-center gap-1.5">
                <FiGlobe className="w-4 h-4" />
                {artist.country}
              </span>
            )}
          </div>

          {/* Bio */}
          {artist?.bio && (
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{artist.bio}</p>
          )}

          {/* Social Links & Share */}
          <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
            {socialLinks?.spotify && (
              <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition">
                <FaSpotify className="w-5 h-5" />
              </a>
            )}
            {socialLinks?.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                <FaYoutube className="w-5 h-5" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition">
                <FaInstagram className="w-5 h-5" />
              </a>
            )}
            {socialLinks?.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition">
                <FaTwitterBrand className="w-5 h-5" />
              </a>
            )}
            <ShareButtonClean artist={artist} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Clean Share Button for light background
function ShareButtonClean({ artist }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
      >
        <FiShare2 className="w-5 h-5" />
      </button>
      <ShareModal isOpen={isOpen} onClose={() => setIsOpen(false)} artist={artist} />
    </>
  )
}

// Song Card Component
function SongCard({ song, view = 'grid' }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  if (view === 'list') {
    return (
      <Link
        href={`/song/${song.slug}`}
        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all group"
      >
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {song.coverImage || song.album?.coverImage ? (
            <img src={song.coverImage || song.album?.coverImage} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <FiMusic className="w-6 h-6 text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{song.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
        </div>
        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
          {song.album && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs">
              <FiDisc className="w-3.5 h-3.5" />
              {song.album.title}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs">
            <FiEye className="w-3.5 h-3.5" />
            {formatViews(song.views)}
          </span>
          <FiChevronRight className="w-4 h-4 group-hover:text-primary transition" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/song/${song.slug}`} className="group">
      <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
        {song.coverImage || song.album?.coverImage ? (
          <img src={song.coverImage || song.album?.coverImage} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <FiMusic className="w-12 h-12 text-emerald-300" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
            <FiPlay className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm group-hover:text-primary transition">{song.title}</h3>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <FiEye className="w-3 h-3" />
          {formatViews(song.views)}
        </span>
      </div>
    </Link>
  )
}

// Featured Song Card (larger)
function FeaturedSongCard({ song, index }) {
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  return (
    <Link
      href={`/song/${song.slug}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition group"
    >
      <span className="w-6 text-center font-bold text-slate-300 dark:text-slate-600 group-hover:text-primary transition">{index + 1}</span>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {song.coverImage ? (
          <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <FiMusic className="w-5 h-5 text-emerald-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{song.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <FiEye className="w-3 h-3" />
          {formatViews(song.views)} views
        </p>
      </div>
      <FiPlay className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition" />
    </Link>
  )
}

// Album Card
function AlbumCard({ album }) {
  return (
    <Link href={`/album/${album.slug}`} className="group">
      <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
        {album.coverImage ? (
          <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <FiDisc className="w-12 h-12 text-emerald-300" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm group-hover:text-primary transition">{album.title}</h3>
      {album.releaseDate && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(album.releaseDate).getFullYear()}</p>
      )}
    </Link>
  )
}

export default function ArtistPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from server (no client-side state)
  const artist = initialData?.artist || null
  const songs = initialData?.songs || []
  const featuredSongs = initialData?.featuredSongs || []
  const genres = initialData?.genres || []
  const pagination = initialData?.pagination || null

  // UI state only
  const [view, setView] = useState('list')
  const [showFilters, setShowFilters] = useState(false)

  const currentSort = searchParams.get('sort') || 'latest'
  const selectedGenre = searchParams.get('genre') || ''
  const currentPage = parseInt(searchParams.get('page')) || 1

  // Navigate to new URL (triggers SSR)
  const updateFilters = (newSort, newGenre) => {
    const params = new URLSearchParams()
    if (newSort && newSort !== 'latest') params.set('sort', newSort)
    if (newGenre) params.set('genre', newGenre)
    params.set('page', '1')

    const query = params.toString()
    router.push(`/artist/${artist.slug}${query ? `?${query}` : ''}`)
  }

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/artist/${artist.slug}?${params.toString()}`)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  // Parse social links
  const parseSocialLinks = (socialLinks) => {
    if (!socialLinks) return {}
    try {
      return JSON.parse(socialLinks)
    } catch {
      return {}
    }
  }

  // If no artist data (should not happen with SSR), show nothing
  if (!artist) return null

  const socialLinks = parseSocialLinks(artist?.socialLinks)

  // Generate description - use custom if available, otherwise auto-generate
  const artistDescription = artist?.metaDescription ||
    `${artist?.name} through his song lyrics and meanings. Djyoungster provides ${artist?.name} lyrics in English Translation, Hindi and Punjabi language variations.`

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Home</Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li>
            <Link href="/artists" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Artists</Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium truncate">{artist?.name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <HeroSection artist={artist} featuredSongs={featuredSongs} songs={songs} socialLinks={socialLinks} />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Artist Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{artistDescription}</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-800 dark:text-white">
                    All Songs
                    <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">({pagination?.totalSongs || 0})</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setView('list')}
                      className={`p-2 rounded-md transition ${view === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setView('grid')}
                      className={`p-2 rounded-md transition ${view === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={currentSort}
                    onChange={(e) => updateFilters(e.target.value, selectedGenre)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary border-0"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="alphabetical">A-Z</option>
                    <option value="oldest">Oldest</option>
                  </select>

                  {/* Filter Button */}
                  {genres.length > 0 && (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        showFilters || selectedGenre ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <FiFilter className="w-4 h-4" />
                      Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Genre Filters */}
              {showFilters && genres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateFilters(currentSort, '')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        !selectedGenre ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      All Genres
                    </button>
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => updateFilters(currentSort, genre.slug)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          selectedGenre === genre.slug ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filter */}
              {selectedGenre && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Filtered by:</span>
                  <button
                    onClick={() => updateFilters(currentSort, '')}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-sm rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition"
                  >
                    {genres.find(g => g.slug === selectedGenre)?.name}
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Songs List/Grid */}
            {songs.length > 0 ? (
              <>
                <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-3'}>
                  {songs.map((song) => (
                    <SongCard key={song.id} song={song} view={view} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        let pageNum
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${
                              currentPage === pageNum
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <FiMusic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No songs found</p>
                {selectedGenre && (
                  <button
                    onClick={() => updateFilters(currentSort, '')}
                    className="mt-3 text-primary hover:text-primary-hover font-medium text-sm"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Popular Songs */}
            {featuredSongs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-primary" />
                  Popular Songs
                </h3>
                <div className="space-y-1">
                  {featuredSongs.map((song, index) => (
                    <FeaturedSongCard key={song.id} song={song} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            {artist?.albums?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiDisc className="w-4 h-4 text-primary" />
                  Albums
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {artist.albums.slice(0, 4).map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
                {artist.albums.length > 4 && (
                  <Link
                    href={`/artist/${artist.slug}/albums`}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    View All Albums
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Total Songs</span>
                  <span className="font-medium text-slate-800 dark:text-white">{artist?.totalSongs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Albums</span>
                  <span className="font-medium text-slate-800 dark:text-white">{artist?.albums?.length || 0}</span>
                </div>
                {artist?.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Country</span>
                    <span className="font-medium text-slate-800 dark:text-white">{artist.country}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
