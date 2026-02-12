'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import {
  FiMusic,
  FiDisc,
  FiUser,
  FiCalendar,
  FiClock,
  FiEye,
  FiPlay,
  FiShare2,
  FiChevronRight,
  FiX,
  FiCopy,
  FiCheck,
  FiTwitter
} from 'react-icons/fi'
import { FaWhatsapp, FaFacebook } from 'react-icons/fa'

function ShareModal({ isOpen, onClose, album }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out "${album.title}" by ${album.artist?.name} on DJYoungster!`

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Share this album</h3>

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

        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <input
            type="text"
            value={url}
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

function SongRow({ song, index }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  return (
    <Link
      href={`/song/${song.slug}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
    >
      <span className="w-8 text-center text-slate-400 dark:text-slate-500 font-medium group-hover:hidden">
        {index + 1}
      </span>
      <span className="w-8 text-center hidden group-hover:block">
        <FiPlay className="w-5 h-5 text-primary mx-auto" />
      </span>

      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="48px" className="object-cover" />
        ) : (
          <FiMusic className="w-5 h-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">
          {song.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
      </div>

      {song.duration && (
        <span className="text-sm text-slate-400 dark:text-slate-500 hidden sm:block">{song.duration}</span>
      )}

      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <FiEye className="w-4 h-4" />
        <span className="text-sm">{formatViews(song.views)}</span>
      </div>
    </Link>
  )
}

function AlbumCard({ album }) {
  return (
    <Link href={`/album/${album.slug}`} className="group">
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition relative">
        {album.coverImage ? (
          <Image src={album.coverImage} alt={album.title} fill sizes="(max-width: 640px) 50vw, 176px" className="object-cover" />
        ) : (
          <FiDisc className="w-12 h-12 text-emerald-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate group-hover:text-primary transition">{album.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{album._count?.songs || 0} songs</p>
    </Link>
  )
}

export default function AlbumPageClient({ initialAlbum, initialMoreAlbums = [] }) {
  // Use initial data from server - no loading state needed
  const [album] = useState(initialAlbum)
  const [moreAlbums] = useState(initialMoreAlbums)
  const [showShareModal, setShowShareModal] = useState(false)

  // Generate description - use custom if available, otherwise auto-generate
  const artistName = album?.artist?.name || 'Various Artists'
  const albumDescription = album?.metaDescription ||
    `Explore ${album?.title} by ${artistName} song lyrics and meanings. Djyoungster provides ${album?.title} lyrics in English Translation, Hindi and Punjabi language variations.`

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // If no album data (should not happen with SSR), show nothing
  if (!album) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Home</Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li>
            <Link href="/albums" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">Albums</Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium truncate">{album.title}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Album Header - Clean Minimalist Design */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Cover Image - Larger Size */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden shadow-lg mx-auto sm:mx-0 flex-shrink-0 relative">
              {album.coverImage ? (
                <Image src={album.coverImage} alt={album.title} fill sizes="(max-width: 640px) 176px, 208px" className="object-cover" />
              ) : (
                <FiDisc className="w-20 h-20 text-emerald-400" />
              )}
            </div>

            {/* Album Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">Album</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">{album.title}</h1>

              {/* Artist */}
              <Link
                href={`/artist/${album.artist?.slug}`}
                className="inline-flex items-center gap-3 mb-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                  {album.artist?.imageUrl ? (
                    <Image src={album.artist.imageUrl} alt={album.artist.name} fill sizes="40px" className="object-cover" />
                  ) : (
                    <FiUser className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition">
                  {album.artist?.name}
                </span>
              </Link>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                {album.releaseDate && (
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(album.releaseDate)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiMusic className="w-4 h-4" />
                  {album.totalSongs} songs
                </span>
                <span className="flex items-center gap-1.5">
                  <FiEye className="w-4 h-4" />
                  {formatViews(album.totalViews)} views
                </span>
              </div>

              {/* Label */}
              {album.label && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Label:</span> {album.label}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracklist */}
          <div className="lg:col-span-2">
            {/* Album Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{albumDescription}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <FiMusic className="w-5 h-5 text-primary" />
                  Tracklist
                </h2>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {album.songs?.length > 0 ? (
                  album.songs.map((song, index) => (
                    <SongRow key={song.id} song={song} index={index} />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <FiMusic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No songs in this album yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Album Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Album Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <FiUser className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Artist</p>
                    <Link href={`/artist/${album.artist?.slug}`} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary">
                      {album.artist?.name}
                    </Link>
                  </div>
                </div>
                {album.releaseDate && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                      <FiCalendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Release Date</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatDate(album.releaseDate)}</p>
                    </div>
                  </div>
                )}
                {album.label && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                      <FiDisc className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Label</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{album.label}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <FiMusic className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Total Songs</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{album.totalSongs}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* More from Artist */}
            {moreAlbums.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">More from {album.artist?.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {moreAlbums.slice(0, 4).map((alb) => (
                    <AlbumCard key={alb.id} album={alb} />
                  ))}
                </div>
                <Link
                  href={`/artist/${album.artist?.slug}`}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-emerald-600 font-medium"
                >
                  View All Albums
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        album={album}
      />
    </div>
  )
}
