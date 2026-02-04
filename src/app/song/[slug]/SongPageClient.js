'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiMusic,
  FiUser,
  FiDisc,
  FiFilm,
  FiCalendar,
  FiGlobe,
  FiEye,
  FiClock,
  FiHeart,
  FiShare2,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiTwitter,
  FiEdit3,
  FiMic,
  FiHeadphones,
  FiVideo,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiPlay,
  FiType,
  FiPlus,
  FiMinus,
  FiTag,
  FiGrid
} from 'react-icons/fi'
import { MdTranslate } from 'react-icons/md'
import { FaWhatsapp, FaFacebook, FaSpotify, FaYoutube } from 'react-icons/fa'

// Apple Music Icon Component
function AppleMusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.384-.38-1.106.186-2.333 1.326-2.68.47-.143.946-.2 1.427-.248.376-.037.752-.077 1.12-.18.164-.046.312-.12.397-.292.068-.14.085-.294.085-.447V8.373c0-.138-.025-.262-.135-.357-.112-.097-.25-.112-.388-.09-.04.006-.08.015-.12.024-.36.074-.722.147-1.083.22l-3.898.79-.644.13c-.14.03-.26.09-.34.22-.07.11-.1.24-.1.37v7.29c0 .36-.04.71-.18 1.04-.31.74-.9 1.18-1.68 1.35-.39.09-.79.13-1.19.13-.66-.01-1.26-.15-1.77-.57-.63-.52-.88-1.2-.78-1.97.1-.72.49-1.27 1.12-1.63.42-.25.88-.38 1.36-.46.46-.07.92-.12 1.37-.2.26-.05.5-.12.7-.28.19-.16.27-.38.27-.64V6.02c0-.17.02-.33.1-.48.14-.28.38-.44.68-.51.08-.02.16-.03.24-.05l6.05-1.23 1.12-.23c.08-.01.15-.03.23-.03.37-.01.59.2.6.6v6.05z" />
    </svg>
  )
}

// Font Size Control Component
function FontSizeControl({ fontSize, setFontSize }) {
  const minSize = 14
  const maxSize = 24
  const step = 2

  const decrease = () => {
    if (fontSize > minSize) setFontSize(fontSize - step)
  }

  const increase = () => {
    if (fontSize < maxSize) setFontSize(fontSize + step)
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        onClick={decrease}
        disabled={fontSize <= minSize}
        className={`p-2 rounded-lg transition ${
          fontSize <= minSize
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title="Decrease font size"
      >
        <FiMinus className="w-4 h-4" />
      </button>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-center font-medium">{fontSize}px</span>
      <button
        onClick={increase}
        disabled={fontSize >= maxSize}
        className={`p-2 rounded-lg transition ${
          fontSize >= maxSize
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title="Increase font size"
      >
        <FiPlus className="w-4 h-4" />
      </button>
    </div>
  )
}

// Auto-generated Song Description Component
function SongDescription({ song }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const genres = song.genres?.map(sg => sg.genre.name).join(', ')
  const categories = song.categories?.map(sc => sc.category.name).join(', ')

  let description = `"${song.title}" is a popular ${song.language || ''} song`

  if (artistNames !== 'Unknown Artist') {
    description += ` sung by ${artistNames}`
  }

  if (song.releaseYear) {
    description += `, released in ${song.releaseYear}`
  }

  description += '.'

  let creditInfo = ''
  if (song.lyricist && song.composer) {
    creditInfo = ` The lyrics are penned by ${song.lyricist} and the music is composed by ${song.composer}.`
  } else if (song.lyricist) {
    creditInfo = ` The lyrics are written by ${song.lyricist}.`
  } else if (song.composer) {
    creditInfo = ` The music is composed by ${song.composer}.`
  }

  let sourceInfo = ''
  if (song.movie) {
    sourceInfo = ` This song is from the movie "${song.movie.title}"${song.movie.year ? ` (${song.movie.year})` : ''}.`
  } else if (song.album) {
    sourceInfo = ` This track is part of the album "${song.album.title}".`
  }

  let genreInfo = ''
  if (genres) {
    genreInfo = ` The song falls under ${genres} genre${song.genres?.length > 1 ? 's' : ''}`
    if (categories) {
      genreInfo += ` and is popular among ${categories} music lovers.`
    } else {
      genreInfo += '.'
    }
  }

  let labelInfo = ''
  if (song.label) {
    labelInfo = ` The song is released under ${song.label}.`
  }

  const fullDescription = description + creditInfo + sourceInfo + genreInfo + labelInfo

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        {fullDescription}
      </p>
    </div>
  )
}

// Song Credits Sidebar Component
function SongCredits({ song }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ')

  const credits = []

  if (artistNames) {
    credits.push({ label: 'Singer', value: artistNames, icon: FiMic })
  }
  if (song.singers) {
    credits.push({ label: 'Featuring', value: song.singers, icon: FiUsers })
  }
  if (song.lyricist) {
    credits.push({ label: 'Lyricist', value: song.lyricist, icon: FiEdit3 })
  }
  if (song.composer) {
    credits.push({ label: 'Music', value: song.composer, icon: FiHeadphones })
  }
  if (song.producer) {
    credits.push({ label: 'Producer', value: song.producer, icon: FiMusic })
  }
  if (song.director) {
    credits.push({ label: 'Director', value: song.director, icon: FiVideo })
  }
  if (song.starring) {
    credits.push({ label: 'Starring', value: song.starring, icon: FiUsers })
  }
  if (song.label) {
    credits.push({ label: 'Label', value: song.label, icon: FiAward })
  }
  if (song.releaseYear) {
    credits.push({ label: 'Year', value: song.releaseYear.toString(), icon: FiCalendar })
  }
  if (song.language) {
    credits.push({ label: 'Language', value: song.language, icon: FiGlobe })
  }

  if (credits.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiUsers className="w-4 h-4 text-primary" />
        {song.title} Song Credits
      </h3>
      <div className="space-y-3">
        {credits.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex-shrink-0">
              <item.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Song Meaning Sidebar Component
function SongMeaning({ song }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!song.meaning) return null

  const meaningText = song.meaning
  const shouldTruncate = meaningText.length > 300
  const displayText = shouldTruncate && !isExpanded
    ? meaningText.substring(0, 300) + '...'
    : meaningText

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiBookOpen className="w-4 h-4 text-primary" />
        {song.title} Song Meaning
      </h3>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="whitespace-pre-line">{displayText}</p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-primary hover:text-emerald-600 font-medium text-sm flex items-center gap-1 transition"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
            <FiChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  )
}

// FAQ Section Component - Dynamic & Unique Answers
function FAQSection({ song }) {
  const [openIndex, setOpenIndex] = useState(0)
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const artistCount = song.artists?.length || 1
  const genres = song.genres?.map(sg => sg.genre.name).join(', ')
  const firstArtist = song.artists?.[0]?.artist?.name || artistNames

  // Randomized answer variations for uniqueness
  const getVoiceAnswer = () => {
    const baseInfo = artistCount > 1
      ? `This track features the combined talents of ${artistNames}`
      : `${firstArtist} lends ${artistCount > 1 ? 'their' : 'their'} voice to this track`

    let extra = ''
    if (song.releaseYear && song.label) {
      extra = `, dropping in ${song.releaseYear} via ${song.label}.`
    } else if (song.releaseYear) {
      extra = `, released back in ${song.releaseYear}.`
    } else if (song.label) {
      extra = `, released under the ${song.label} label.`
    } else {
      extra = '.'
    }
    return baseInfo + extra
  }

  const getLyricistAnswer = () => {
    if (song.lyricist) {
      const phrases = [
        `${song.lyricist} crafted the words for "${song.title}," bringing depth and emotion to every line.`,
        `The pen behind "${song.title}" belongs to ${song.lyricist}, whose lyrics give the song its soul.`,
        `Credit for the memorable lyrics goes to ${song.lyricist}, who wrote the words that fans love to sing along to.`
      ]
      return phrases[song.title.length % phrases.length]
    }
    return `${firstArtist} wrote the lyrics, adding a personal touch that resonates throughout the track.`
  }

  const getComposerAnswer = () => {
    if (song.composer) {
      const phrases = [
        `${song.composer} is the musical genius behind the composition, creating the melody that makes this song memorable.`,
        `The music was composed by ${song.composer}, whose arrangement perfectly complements the vocals.`,
        `${song.composer} crafted the musical arrangement, blending instruments and beats into something special.`
      ]
      return phrases[song.title.length % phrases.length]
    }
    return `${firstArtist} composed the music, showcasing versatility as both vocalist and musician.`
  }

  const getSourceAnswer = () => {
    if (song.movie) {
      return `You'll hear "${song.title}" in the ${song.movie.year ? song.movie.year + ' ' : ''}film "${song.movie.title}"${song.movie.director ? `, directed by ${song.movie.director}` : ''}. The song plays a key role in the movie's soundtrack and gained massive popularity through the film.`
    }
    if (song.album) {
      return `"${song.title}" is part of the album "${song.album.title}"${song.album.artist?.name ? ` by ${song.album.artist.name}` : ''}. It stands out as one of the notable tracks from this collection.`
    }
    return `"${song.title}" was released as an independent single by ${artistNames}, standing strong on its own without being tied to any film or album.`
  }

  const faqs = []

  // Q1: Singer/Voice
  faqs.push({
    question: `Who is the singer of "${song.title}"?`,
    answer: getVoiceAnswer()
  })

  // Q2: Lyricist
  faqs.push({
    question: `Who wrote the lyrics for "${song.title}"?`,
    answer: getLyricistAnswer()
  })

  // Q3: Composer
  faqs.push({
    question: `Who composed the music of "${song.title}"?`,
    answer: getComposerAnswer()
  })

  // Q4: Movie/Album Source
  if (song.movie) {
    faqs.push({
      question: `Which movie is "${song.title}" from?`,
      answer: getSourceAnswer()
    })
  } else if (song.album) {
    faqs.push({
      question: `Which album features "${song.title}"?`,
      answer: getSourceAnswer()
    })
  } else {
    faqs.push({
      question: `Is "${song.title}" from a movie or album?`,
      answer: getSourceAnswer()
    })
  }

  // Q5: Genre (conditional)
  if (genres) {
    faqs.push({
      question: `What type of song is "${song.title}"?`,
      answer: `"${song.title}" falls under ${genres}${song.language ? ` and is performed in ${song.language}` : ''}. The track blends these influences to create its distinctive sound.`
    })
  }

  // Q6: Streaming
  faqs.push({
    question: `Where can I stream "${song.title}"?`,
    answer: `"${song.title}" is available on major platforms including Spotify, Apple Music, YouTube Music, Gaana, and JioSaavn.${song.youtubeUrl ? ' The official video is on YouTube.' : ''} For the complete lyrics, you're already in the right place!`
  })

  // Q7: Producer (if available)
  if (song.producer) {
    faqs.push({
      question: `Who produced "${song.title}"?`,
      answer: `${song.producer} handled the production, shaping the final sound you hear. Their work on mixing and arrangement gives the track its polished quality.`
    })
  }

  // Q8: Music Video Cast (if available)
  if (song.starring) {
    faqs.push({
      question: `Who appears in the "${song.title}" music video?`,
      answer: `The visual story features ${song.starring}, bringing the song's narrative to life on screen.`
    })
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
        <FiBookOpen className="w-5 h-5 text-primary" />
        Frequently Asked Questions about {song.title}
      </h2>
      <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
        {faqs.slice(0, 4).map((faq, index) => (
          <div
            key={index}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
            className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <span itemProp="name" className="font-medium text-slate-700 dark:text-slate-200 pr-4">{faq.question}</span>
              <FiChevronDown
                className={`w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div itemProp="text" className="px-4 pb-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Related Song Card Component - Simple List Style
function RelatedSongCard({ song }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'

  return (
    <Link
      href={`/song/${song.slug}`}
      className="flex items-center gap-2 py-2 px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
    >
      <FiMusic className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary transition truncate block">
          {song.title}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 truncate block">{artistNames}</span>
      </div>
    </Link>
  )
}

// Share Modal Component
function ShareModal({ isOpen, onClose, song, url, selectedText }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareText = selectedText
    ? `"${selectedText}"\n\nFrom "${song.title}" - Read full lyrics on DJYoungster!`
    : `Check out "${song.title}" lyrics on DJYoungster!`

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
    const textToCopy = selectedText ? `"${selectedText}"\n\n${url}` : url
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          {selectedText ? 'Share Selected Lyrics' : 'Share this song'}
        </h3>

        {selectedText && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 mb-4 text-sm text-slate-600 dark:text-slate-300 italic">
            "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
          </div>
        )}

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
            value={selectedText ? `"${selectedText.substring(0, 50)}..." - ${url}` : url}
            readOnly
            className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none truncate"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition flex items-center gap-1"
          >
            {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Report Error Modal
function ReportModal({ isOpen, onClose, songTitle, songId }) {
  const [reportType, setReportType] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/public/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          description,
          songId
        })
      })

      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setReportType('')
          setDescription('')
        }, 2000)
      } else {
        alert('Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Report Submitted!</h3>
            <p className="text-slate-500 dark:text-slate-400">Thank you for helping us improve.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Report an Error</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Found an issue with "{songTitle}"? Let us know!
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Error Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select an issue</option>
                  <option value="lyrics">Incorrect Lyrics</option>
                  <option value="spelling">Spelling/Grammar</option>
                  <option value="artist">Wrong Artist Info</option>
                  <option value="album">Wrong Album Info</option>
                  <option value="credits">Wrong Credits Info</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// YouTube Player Component
function YouTubePlayer({ url, title }) {
  if (!url) return null

  const getVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const videoId = getVideoId(url)
  if (!videoId) return null

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FaYoutube className="w-5 h-5 text-red-500" />
        Watch {title} Music Video
      </h2>
      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`${title} - Official Music Video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </section>
  )
}

// Lyrics Toggle Component
function LyricsToggle({ lyricsMode, setLyricsMode, hasRomanized, hasTranslated, hasHindi, hasPunjabi }) {
  const tabs = [
    { id: 'original', label: 'Original', icon: FiMusic, available: true },
    { id: 'romanized', label: 'Romanized', icon: FiType, available: hasRomanized },
    { id: 'translated', label: 'English', icon: MdTranslate, available: hasTranslated },
    { id: 'hindi', label: 'Hindi', icon: FiGlobe, available: hasHindi },
    { id: 'punjabi', label: 'Punjabi', icon: FiGlobe, available: hasPunjabi },
  ]

  const availableTabs = tabs.filter(tab => tab.available)

  if (availableTabs.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {availableTabs.map((tab) => {
        const Icon = tab.icon
        const isActive = lyricsMode === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setLyricsMode(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/50'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// Lyrics Display Component - All versions rendered in HTML for SEO, CSS controls visibility
function LyricsDisplay({ song, lyricsMode, lyricsRef, fontSize }) {
  const modeLabels = {
    romanized: { icon: FiType, text: 'Showing Romanized/Transliterated lyrics for easier reading' },
    translated: { icon: MdTranslate, text: 'Showing English Translation of the lyrics' },
    hindi: { icon: FiGlobe, text: 'Showing Hindi version of the lyrics' },
    punjabi: { icon: FiGlobe, text: 'Showing Punjabi version of the lyrics' }
  }

  const modeLabel = modeLabels[lyricsMode]

  // Build all lyrics versions that exist
  const lyricsVersions = [
    { id: 'original', label: 'Original Lyrics', content: song.lyrics },
    song.lyricsRomanized && { id: 'romanized', label: 'Romanized Lyrics', content: song.lyricsRomanized },
    song.lyricsTranslated && { id: 'translated', label: 'English Translation', content: song.lyricsTranslated },
    song.lyricsHindi && { id: 'hindi', label: 'Hindi Lyrics', content: song.lyricsHindi },
    song.lyricsPunjabi && { id: 'punjabi', label: 'Punjabi Lyrics', content: song.lyricsPunjabi }
  ].filter(Boolean)

  return (
    <div ref={lyricsRef} className="lyrics-content">
      {lyricsMode !== 'original' && modeLabel && (
        <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
          <p className="text-sm text-primary font-medium flex items-center gap-2">
            <modeLabel.icon className="w-4 h-4" />
            {modeLabel.text}
          </p>
        </div>
      )}

      {/* All lyrics versions rendered in HTML for SEO - only selected version visible to users */}
      {lyricsVersions.map((version) => {
        const isActive = lyricsMode === version.id
        return (
          <section
            key={version.id}
            className={isActive ? 'block' : 'sr-only'}
            aria-hidden={!isActive}
            itemProp={version.id === 'original' ? 'lyrics' : undefined}
          >
            {/* Semantic heading for each lyrics version - helps SEO understand content */}
            <h3 className={isActive && version.id !== 'original' ? 'sr-only' : version.id === 'original' ? 'sr-only' : 'text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3'}>
              {version.label}
            </h3>
            <p
              className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-relaxed"
              style={{ fontSize: isActive ? `${fontSize}px` : '16px', lineHeight: '1.8' }}
            >
              {version.content}
            </p>
          </section>
        )
      })}
    </div>
  )
}

export default function SongPageClient({ initialSong, initialRelatedSongs = [] }) {
  const params = useParams()
  // Use initial data from server - no loading state needed
  const [song] = useState(initialSong)
  const [relatedSongs] = useState(initialRelatedSongs)
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialSong?.likes || 0)
  const [viewCount, setViewCount] = useState(initialSong?.views || 0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [lyricsMode, setLyricsMode] = useState('original')
  const [lyricsFontSize, setLyricsFontSize] = useState(18)
  const lyricsRef = useRef(null)

  const copyLyrics = () => {
    let textToCopy = song.lyrics
    if (lyricsMode === 'romanized' && song.lyricsRomanized) {
      textToCopy = song.lyricsRomanized
    } else if (lyricsMode === 'translated' && song.lyricsTranslated) {
      textToCopy = song.lyricsTranslated
    } else if (lyricsMode === 'hindi' && song.lyricsHindi) {
      textToCopy = song.lyricsHindi
    } else if (lyricsMode === 'punjabi' && song.lyricsPunjabi) {
      textToCopy = song.lyricsPunjabi
    }
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views?.toString() || '0'
  }

  // If no song data (should not happen with SSR), show nothing
  if (!song) return null

  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const genres = song.genres?.map(sg => sg.genre) || []
  const tags = song.tags?.map(st => st.tag) || []
  const categories = song.categories?.map(sc => sc.category) || []
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Breadcrumb with Schema */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" itemProp="item" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/songs" itemProp="item" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">
              <span itemProp="name">Songs</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name" className="text-slate-800 dark:text-white font-medium truncate">{song.title}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article itemScope itemType="https://schema.org/MusicRecording">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Song Header - Clean Minimalist Design */}
              <header className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Cover Image - Larger Size */}
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg mx-auto sm:mx-0 relative">
                    {song.coverImage ? (
                      <Image src={song.coverImage} alt={`${song.title} Song Cover`} fill sizes="(max-width: 640px) 176px, 208px" className="object-cover" itemProp="image" />
                    ) : (
                      <FiMusic className="w-20 h-20 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 itemProp="name" className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-3">
                      {song.title} Lyrics
                    </h1>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                      {song.artists?.map(({ artist }) => (
                        <Link
                          key={artist.id}
                          href={`/artist/${artist.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition"
                        >
                          <FiUser className="w-3.5 h-3.5" />
                          <span itemProp="byArtist" itemScope itemType="https://schema.org/MusicGroup">
                            <span itemProp="name">{artist.name}</span>
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                      {song.album && (
                        <Link href={`/album/${song.album.slug}`} className="flex items-center gap-1.5 hover:text-primary transition">
                          <FiDisc className="w-4 h-4" />
                          <span itemProp="inAlbum" itemScope itemType="https://schema.org/MusicAlbum">
                            <span itemProp="name">{song.album.title}</span>
                          </span>
                        </Link>
                      )}
                      {song.movie && (
                        <Link href={`/movie/${song.movie.slug}`} className="flex items-center gap-1.5 hover:text-primary transition">
                          <FiFilm className="w-4 h-4" />
                          <span>{song.movie.title}</span>
                        </Link>
                      )}
                      {viewCount >= 1000 && (
                        <span className="flex items-center gap-1.5">
                          <FiEye className="w-4 h-4" />
                          <span>{formatViews(viewCount)} views</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <button
                        onClick={async () => {
                          if (isLikeLoading) return
                          setIsLikeLoading(true)
                          try {
                            const res = await fetch(`/api/public/songs/${params.slug}/interact`, {
                              method: 'PUT'
                            })
                            if (res.ok) {
                              const data = await res.json()
                              setIsLiked(data.hasLiked)
                              setLikeCount(data.likes)
                            }
                          } catch (err) {
                            console.error('Error toggling like:', err)
                          } finally {
                            setIsLikeLoading(false)
                          }
                        }}
                        disabled={isLikeLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                          isLiked
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700'
                        } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likeCount}</span>
                        <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                      >
                        <FiShare2 className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        onClick={copyLyrics}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                      >
                        {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Lyrics'}
                      </button>
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                      >
                        <FiAlertCircle className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Song Meaning - Before Lyrics */}
              {song.meaning && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-primary" />
                    {song.title} Song Meaning
                  </h2>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p className="whitespace-pre-line">{song.meaning}</p>
                  </div>
                </div>
              )}

              {/* Lyrics Section */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <FiMusic className="w-5 h-5 text-primary" />
                    {song.title} Lyrics
                    {lyricsMode === 'romanized' && <span className="text-sm font-normal text-primary">(Romanized)</span>}
                    {lyricsMode === 'translated' && <span className="text-sm font-normal text-primary">(English)</span>}
                    {lyricsMode === 'hindi' && <span className="text-sm font-normal text-primary">(Hindi)</span>}
                    {lyricsMode === 'punjabi' && <span className="text-sm font-normal text-primary">(Punjabi)</span>}
                  </h2>
                  <FontSizeControl fontSize={lyricsFontSize} setFontSize={setLyricsFontSize} />
                </div>

                <LyricsToggle
                  lyricsMode={lyricsMode}
                  setLyricsMode={setLyricsMode}
                  hasRomanized={!!song.lyricsRomanized}
                  hasTranslated={!!song.lyricsTranslated}
                  hasHindi={!!song.lyricsHindi}
                  hasPunjabi={!!song.lyricsPunjabi}
                />

                <LyricsDisplay
                  song={song}
                  lyricsMode={lyricsMode}
                  lyricsRef={lyricsRef}
                  fontSize={lyricsFontSize}
                />
              </section>

              {/* WhatsApp Channel Banner */}
              <a
                href="https://whatsapp.com/channel/0029Vb7A52PEAKW8b0wxfV03"
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0d7d6e] rounded-2xl shadow-lg shadow-[#25D366]/30 transition-all hover:scale-[1.01] group"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <FaWhatsapp className="w-10 h-10 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg sm:text-xl">Join Our WhatsApp Channel</p>
                    <p className="text-white/90 text-sm mt-1">Get latest lyrics updates & new song alerts instantly!</p>
                  </div>
                  <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#25D366] font-bold rounded-xl group-hover:bg-white/90 transition shadow-md mt-2 sm:mt-0">
                    <FaWhatsapp className="w-5 h-5" />
                    <span>Follow Now</span>
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </a>

              {/* Disclaimer Note */}
              <div className="mb-6 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Note:</span> Lyrics are provided for educational and personal use. Ownership belongs to the respective artists and labels.
                </p>
              </div>

              {/* Auto-generated Description - After Lyrics */}
              <SongDescription song={song} />

              {/* YouTube Player */}
              <YouTubePlayer url={song.youtubeUrl} title={song.title} />

              {/* FAQ Section */}
              <FAQSection song={song} />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Categories/Languages */}
              {categories.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiGrid className="w-4 h-4 text-primary" />
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-lg text-sm font-medium hover:from-orange-500 hover:to-rose-600 transition"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <SongCredits song={song} />

              {/* Listen On */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Listen On</h3>
                <div className="space-y-2">
                  <a
                    href={song.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + artistNames)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition group"
                  >
                    <FaYoutube className="w-6 h-6 text-red-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">YouTube</span>
                  </a>
                  <a
                    href={song.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + artistNames)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition group"
                  >
                    <FaSpotify className="w-6 h-6 text-primary" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary">Spotify</span>
                  </a>
                                  </div>
              </div>

              {/* Album Info */}
              {song.album && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">From Album</h3>
                  <Link href={`/album/${song.album.slug}`} className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden relative">
                      {song.album.coverImage ? (
                        <Image src={song.album.coverImage} alt={song.album.title} fill sizes="56px" className="object-cover" />
                      ) : (
                        <FiDisc className="w-7 h-7 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white group-hover:text-primary transition truncate">{song.album.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.album.artist?.name}</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Movie Info */}
              {song.movie && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">From Movie</h3>
                  <Link href={`/movie/${song.movie.slug}`} className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <FiFilm className="w-7 h-7 text-rose-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white group-hover:text-primary transition">{song.movie.title}</p>
                      {song.movie.year && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{song.movie.year}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Related Songs */}
              {relatedSongs.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Related Songs</h3>
                  <div className="space-y-1">
                    {relatedSongs.slice(0, 8).map((relatedSong) => (
                      <RelatedSongCard key={relatedSong.id} song={relatedSong} />
                    ))}
                  </div>
                  <Link
                    href={`/artist/${song.artists?.[0]?.artist?.slug || ''}`}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    View More Songs
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-primary" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition capitalize"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres */}
              {genres.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiMusic className="w-4 h-4 text-primary" />
                    Genre
                  </h3>
                  <div className="flex flex-wrap gap-2" itemProp="genre">
                    {genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/genre/${genre.slug}`}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        song={song}
        url={currentUrl}
        selectedText=""
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        songTitle={song.title}
        songId={song.id}
      />
    </div>
  )
}
