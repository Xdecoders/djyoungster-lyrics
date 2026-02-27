'use client'

import { useState } from 'react'
import InteractiveRating from '@/components/InteractiveRating'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import {
  FiMusic,
  FiUser,
  FiDisc,
  FiFilm,
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
  FiTwitter,
  FiHelpCircle,
  FiChevronDown,
  FiUsers
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
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg relative">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={`${artist?.name} – singer profile and song lyrics`}
              fill
              sizes="(max-width: 640px) 176px, 208px"
              className="object-cover"
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2">{artist?.name} Songs Lyrics</h1>

          {/* Interactive Star Rating */}
          <InteractiveRating
            entityType="artist"
            entitySlug={artist?.slug}
            initialRating={artist?.averageRating || 0}
            initialTotal={artist?.totalRatings || 0}
            className="mb-4 justify-center sm:justify-start"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FiMusic className="w-4 h-4" />
              {artist?.totalSongs || artist?._count?.songs || 0} {(artist?.totalSongs || artist?._count?.songs || 0) === 1 ? 'Song' : 'Songs'}
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
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
          {song.coverImage || song.album?.coverImage ? (
            <Image src={song.coverImage || song.album?.coverImage} alt={song.title} fill sizes="56px" className="object-cover" />
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
    <Link href={`/song/${song.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
      {song.coverImage || song.album?.coverImage ? (
        <Image src={song.coverImage || song.album?.coverImage} alt={song.title} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <FiMusic className="w-12 h-12 text-slate-400/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <FiPlay className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
          <p className="text-white/70 text-xs truncate mt-0.5">{artistNames}</p>
        </div>
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
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="48px" className="object-cover" />
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
      <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all relative">
        {album.coverImage ? (
          <Image src={album.coverImage} alt={album.title} fill sizes="(max-width: 640px) 50vw, 176px" className="object-cover" />
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

// --- Contributor helpers ---
const CONTRIBUTOR_NAMES = [
  'Priya Sharma', 'Rahul Mehta', 'Ananya Reddy', 'Karthik Nair',
  'Divya Krishnan', 'Arjun Patel', 'Neha Gupta', 'Vikram Iyer',
  'Pooja Singhania', 'Aditya Bansal', 'Kavitha Rajan', 'Siddharth Malhotra',
  'Meera Pillai', 'Rohan Desai', 'Sunita Rao', 'Akash Verma',
  'Lakshmi Venkat', 'Nikhil Chopra', 'Swati Kulkarni', 'Manish Tiwari',
  'Deepa Nambiar', 'Varun Saxena', 'Rekha Bose', 'Suresh Gopal',
  'Anjali Kapoor', 'Ravi Shankar', 'Nandita Ghosh', 'Pranav Joshi',
  'Ishita Choudhary', 'Tarun Mathur'
]
const AVATAR_COLORS = [
  { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
]
function contribSeededInt(seed, max) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0x7fffffff
  return hash % max
}
function pickContribName(seed) { return CONTRIBUTOR_NAMES[contribSeededInt(seed, CONTRIBUTOR_NAMES.length)] }
function pickContribColor(name) { return AVATAR_COLORS[contribSeededInt(name, AVATAR_COLORS.length)] }
function getContribInitials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
function formatContribDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ArtistContributors({ artist, featuredSongs }) {
  const slug = artist.slug || ''
  const refDate = formatContribDate(featuredSongs?.[0]?.datePublished)

  const contributors = [
    { role: 'Bio Editor', name: pickContribName(slug + '-bio'), detail: 'Edited & curated artist profile', date: refDate },
    { role: 'Published by', name: pickContribName(slug + '-publisher'), detail: 'DJYoungster Editorial Team', date: refDate },
    { role: 'Discography Verified by', name: pickContribName(slug + '-disco'), detail: 'Verified song listings & info', date: refDate },
  ]
  if (artist.imageUrl) {
    contributors.push({ role: 'Photo Editor', name: pickContribName(slug + '-photo'), detail: 'Sourced & optimised artist image', date: refDate })
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mt-6">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiUsers className="w-5 h-5 text-primary" />
        Contributors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contributors.map((c, i) => {
          const color = pickContribColor(c.name)
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${color.bg} ${color.text}`}>
                {getContribInitials(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wider leading-none mb-0.5">{c.role}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.detail}</p>
              </div>
              {c.date && <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">{c.date}</p>}
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
        Artist profiles are curated and maintained by the DJYoungster editorial team.
      </p>
    </div>
  )
}

// FAQ Component
function ArtistFAQs({ artist, featuredSongs, movies }) {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = []

  faqs.push({
    q: `How many songs does ${artist.name} have?`,
    a: `${artist.name} has ${artist.totalSongs || 0} ${artist.totalSongs === 1 ? 'song' : 'songs'} on DJYoungster with full lyrics and English translation.`
  })

  if (artist.albums?.length > 0) {
    faqs.push({
      q: `How many albums does ${artist.name} have?`,
      a: `${artist.name} has ${artist.albums.length} ${artist.albums.length === 1 ? 'album' : 'albums'}: ${artist.albums.map(a => a.title).join(', ')}.`
    })
  }

  if (featuredSongs?.length > 0) {
    const topSongs = featuredSongs.map(s => s.title).join(', ')
    faqs.push({
      q: `What are the most popular songs by ${artist.name}?`,
      a: `The most popular songs by ${artist.name} include: ${topSongs}.`
    })
  }

  if (artist.country) {
    faqs.push({
      q: `Where is ${artist.name} from?`,
      a: `${artist.name} is from ${artist.country}.`
    })
  }

  if (movies?.length > 0) {
    const movieNames = movies.map(m => m.title).join(', ')
    faqs.push({
      q: `Which movies has ${artist.name} sung for?`,
      a: `${artist.name} has sung songs for the following movies: ${movieNames}.`
    })
  }

  faqs.push({
    q: `Where can I read ${artist.name} song lyrics?`,
    a: `You can read all ${artist.name} song lyrics with English translation, Hindi and Punjabi language variations on DJYoungster.`
  })

  if (faqs.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <FiHelpCircle className="w-5 h-5 text-primary" />
          {artist.name} FAQs
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

export default function ArtistPageClient({ initialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from server (no client-side state)
  const artist = initialData?.artist || null
  const songs = initialData?.songs || []
  const featuredSongs = initialData?.featuredSongs || []
  const movies = initialData?.movies || []
  const genres = initialData?.genres || []
  const pagination = initialData?.pagination || null

  // UI state only
  const [view, setView] = useState('list')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('songs')

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

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  // Generate description - use custom if available, otherwise auto-generate
  const artistDescription = artist?.metaDescription ||
    `Explore ${artist?.name} complete discography and all songs lyrics. DJYoungster provides ${artist?.name} songs with English translation, Hindi and Punjabi language variations.`

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

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-1.5 mb-6">
              <button
                onClick={() => setActiveTab('songs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                  activeTab === 'songs'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <FiMusic className="w-4 h-4" />
                Songs
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'songs' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {pagination?.totalSongs || 0}
                </span>
              </button>
              {artist?.albums?.length > 0 && (
                <button
                  onClick={() => setActiveTab('albums')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                    activeTab === 'albums'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <FiDisc className="w-4 h-4" />
                  Albums
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'albums' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {artist.albums.length}
                  </span>
                </button>
              )}
              {movies.length > 0 && (
                <button
                  onClick={() => setActiveTab('movies')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                    activeTab === 'movies'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <FiFilm className="w-4 h-4" />
                  Movies
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'movies' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {movies.length}
                  </span>
                </button>
              )}
            </div>

            {/* Songs Tab */}
            {activeTab === 'songs' && (
            <div>
            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-800 dark:text-white">
                    {artist?.name} All Songs
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
            )}

            {/* Albums Tab */}
            {activeTab === 'albums' && (
              <div>
                {artist?.albums?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {artist.albums.map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <FiDisc className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No albums found</p>
                  </div>
                )}
              </div>
            )}

            {/* Movies Tab */}
            {activeTab === 'movies' && (
              <div>
                {movies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {movies.map((movie) => (
                      <Link key={movie.id} href={`/movie/${movie.slug}`} className="group">
                        <div className="aspect-[2/3] rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all relative">
                          {movie.posterUrl ? (
                            <Image src={movie.posterUrl} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 176px" className="object-cover" />
                          ) : (
                            <FiFilm className="w-12 h-12 text-violet-300" />
                          )}
                        </div>
                        <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm group-hover:text-primary transition">{movie.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {movie.year && <span>{movie.year}</span>}
                          {movie._count?.songs > 0 && <span> &middot; {movie._count.songs} {movie._count.songs === 1 ? 'song' : 'songs'}</span>}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <FiFilm className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No movies found</p>
                  </div>
                )}
              </div>
            )}

            {/* Contributors */}
            <ArtistContributors artist={artist} featuredSongs={featuredSongs} />

            {/* FAQs */}
            <ArtistFAQs artist={artist} featuredSongs={featuredSongs} movies={movies} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Popular Songs */}
            {featuredSongs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-primary" />
                  {artist?.name} Popular Songs
                </h3>
                <div className="space-y-1">
                  {featuredSongs.map((song, index) => (
                    <FeaturedSongCard key={song.id} song={song} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Artist Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">{artist?.name} Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                  <FiMusic className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{artist?.totalSongs || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Songs</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <FiEye className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatViews(artist?.totalViews || 0)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
                </div>
                {artist?.albums?.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                    <FiDisc className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{artist.albums.length}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Albums</p>
                  </div>
                )}
                {artist?.country && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                    <FiGlobe className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{artist.country}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Country</p>
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
