'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { useStoryMode } from './StoryCreator'
import { useClipMode } from './ClipMaker'

const StoryPreviewModal = dynamic(() => import('./StoryCreator').then(mod => ({ default: mod.StoryPreviewModal })), { ssr: false })
const StoryTemplatePickerModal = dynamic(() => import('./StoryCreator').then(mod => ({ default: mod.StoryTemplatePickerModal })), { ssr: false })
const ClipPreviewModal = dynamic(() => import('./ClipMaker').then(mod => ({ default: mod.ClipPreviewModal })), { ssr: false })
const TemplatePickerModal = dynamic(() => import('./ClipMaker').then(mod => ({ default: mod.TemplatePickerModal })), { ssr: false })
import {
  FiMusic,
  FiUser,
  FiDisc,
  FiFilm,
  FiCalendar,
  FiGlobe,
  FiEye,
  FiClock,
  FiShare2,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiChevronRight,
  FiChevronDown,
  FiX,
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
  FiGrid,
  FiDownload,
  FiCamera,
  FiStar
} from 'react-icons/fi'
import { MdTranslate } from 'react-icons/md'
import { FaWhatsapp, FaFacebook, FaSpotify, FaYoutube, FaPinterest } from 'react-icons/fa'
import { FaXTwitter, FaLinkedinIn } from 'react-icons/fa6'

// HTML helpers for backward-compatible rendering
function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || ''
}

function isHtml(text) {
  return /<[a-z][\s\S]*>/i.test(text)
}

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

  let description = `"${song.title}" is a popular song`

  if (artistNames !== 'Unknown Artist') {
    description += ` sung by ${artistNames}`
  }

  if (song.datePublished) {
    description += `, released in ${new Date(song.datePublished).getFullYear()}`
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
  if (song.datePublished) {
    credits.push({ label: 'Year', value: new Date(song.datePublished).getFullYear().toString(), icon: FiCalendar })
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
  const meaningPlain = stripHtml(meaningText)
  const shouldTruncate = meaningPlain.length > 300
  const htmlContent = isHtml(meaningText)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <FiBookOpen className="w-4 h-4 text-primary" />
        {song.title} Song Meaning
      </h3>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {htmlContent ? (
          <div
            className={`prose prose-sm max-w-none dark:prose-invert ${shouldTruncate && !isExpanded ? 'line-clamp-6' : ''}`}
            dangerouslySetInnerHTML={{ __html: shouldTruncate && !isExpanded ? meaningText.substring(0, 500) + '...' : meaningText }}
          />
        ) : (
          <p className="whitespace-pre-line">{shouldTruncate && !isExpanded ? meaningPlain.substring(0, 300) + '...' : meaningText}</p>
        )}
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
    const releaseYear = song.datePublished ? new Date(song.datePublished).getFullYear() : null
    if (releaseYear && song.label) {
      extra = `, dropping in ${releaseYear} via ${song.label}.`
    } else if (releaseYear) {
      extra = `, released back in ${releaseYear}.`
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

  // Q5: IG Story & Reel Creator — always shown with varied answers
  const getStoryReelAnswer = () => {
    const phrases = [
      `Yes! On DJYoungster, you can create beautiful Instagram Stories and Reels directly from "${song.title}" lyrics. Just tap "Create Story" or "Create Reel" on the lyrics page, select your favorite lines by ${firstArtist}, pick a template style, and download a ready-to-share image or animated video clip.`,
      `Absolutely! DJYoungster lets you turn "${song.title}" lyrics into stunning IG Stories and animated Reels. Choose 2-4 lines for a story image or up to 8 lines for a video reel, select from 6 unique templates, and share your creation with friends — no extra apps needed.`,
      `DJYoungster makes it easy to share "${song.title}" lyrics on Instagram. Use "Create Story" to generate a gorgeous lyrics poster or "Create Reel" to create an animated 20-second video clip. Pick your favorite lines by ${firstArtist}, choose a style that fits the mood, and download instantly.`,
    ]
    return phrases[(song.title.length + artistNames.length) % phrases.length]
  }

  faqs.push({
    question: `Can I create an Instagram Story or Reel with "${song.title}" lyrics?`,
    answer: getStoryReelAnswer()
  })

  // Q6: Genre (conditional)
  if (genres) {
    faqs.push({
      question: `What type of song is "${song.title}"?`,
      answer: `"${song.title}" falls under ${genres}. The track blends these influences to create its distinctive sound.`
    })
  }

  // Q7: Streaming
  faqs.push({
    question: `Where can I stream "${song.title}"?`,
    answer: `"${song.title}" is available on major platforms including Spotify, Apple Music, YouTube Music, Gaana, and JioSaavn.${song.youtubeUrl ? ' The official video is on YouTube.' : ''} For the complete lyrics, you're already in the right place!`
  })

  // Q8: Producer (if available)
  if (song.producer) {
    faqs.push({
      question: `Who produced "${song.title}"?`,
      answer: `${song.producer} handled the production, shaping the final sound you hear. Their work on mixing and arrangement gives the track its polished quality.`
    })
  }

  // Q9: Music Video Cast (if available)
  if (song.starring) {
    faqs.push({
      question: `Who appears in the "${song.title}" music video?`,
      answer: `The visual story features ${song.starring}, bringing the song's narrative to life on screen.`
    })
  }

  // Q10-Q11: Annotation FAQs (only when annotations exist)
  if (song.annotations?.length > 0) {
    const annotationCount = song.annotations.length
    faqs.push({
      question: `What do the highlighted lyrics in "${song.title}" mean?`,
      answer: `"${song.title}" has ${annotationCount} annotated ${annotationCount === 1 ? 'section' : 'sections'} where our editors have broken down the meaning behind specific lines. Look for the highlighted text in the lyrics — tap any highlighted line to reveal a detailed explanation of the wordplay, cultural references, and deeper meaning behind ${firstArtist}'s words.`
    })
    faqs.push({
      question: `Does "${song.title}" have lyrics annotations like Genius?`,
      answer: `Yes! DJYoungster provides Genius-style annotations for "${song.title}." Our editors have analyzed ${annotationCount} key ${annotationCount === 1 ? 'passage' : 'passages'} in the song, explaining the imagery, emotions, and cultural context. Simply click on any highlighted lyric line to read the annotation — no account or login needed.`
    })
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
        <FiBookOpen className="w-5 h-5 text-primary" />
        Frequently Asked Questions about {song.title}
      </h2>
      <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
        {faqs.slice(0, 7).map((faq, index) => (
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

// Live Readers indicator
function LiveReaders({ songTitle }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    setCount(Math.floor(Math.random() * 40) + 12)
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() < 0.5 ? -1 : 1
        return Math.max(8, Math.min(55, prev + delta))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (count === null) return null

  return (
    <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg mb-3 text-center sm:text-left">
      <span className="font-semibold">{count} people</span> reading {songTitle} lyrics right now
    </p>
  )
}

// Share Modal Component
function ShareModal({ isOpen, onClose, song, url, selectedText }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Extract first 4 lines of lyrics as a preview (strip HTML tags)
  const lyricsPreview = song.lyrics
    ? song.lyrics.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).slice(0, 4).join('\n')
    : ''

  const shareText = selectedText
    ? `"${selectedText}"\n\nFrom "${song.title}" - Read full lyrics on DJYoungster!`
    : lyricsPreview
      ? `"${lyricsPreview}"\n\n— ${song.title} | Full lyrics on DJYoungster`
      : `Check out "${song.title}" lyrics on DJYoungster!`

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`
    },
    {
      name: 'X',
      icon: FaXTwitter,
      color: 'bg-black hover:bg-neutral-800',
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedinIn,
      color: 'bg-[#0A66C2] hover:bg-[#094d92]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Pinterest',
      icon: FaPinterest,
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(shareText)}`
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

// YouTube Player Component - Click-to-load for performance
function YouTubePlayer({ url, title }) {
  const [isPlaying, setIsPlaying] = useState(false)

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
      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg relative">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={`${title} - Official Music Video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative group cursor-pointer"
            aria-label={`Play ${title} music video`}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={`${title} - Music Video Thumbnail`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
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
function LyricsDisplay({ song, lyricsMode, lyricsRef, fontSize, isStoryMode, selectedLines, onLineToggle, selectColor = 'purple', openAnnotationId, onAnnotationToggle }) {
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
            {(() => {
              // Strip HTML to get plain text lines for line-based modes
              const plainContent = stripHtml(version.content)
              const contentIsHtml = isHtml(version.content)

              if (isActive && isStoryMode) {
                const lines = plainContent.split('\n')
                return (
                  <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
                    {lines.map((line, idx) => {
                      const trimmed = line.trim()
                      if (!trimmed) return <div key={idx} className="h-4" />
                      const isSelected = selectedLines?.some(l => l.index === idx)
                      const selectedClass = selectColor === 'cyan'
                        ? 'border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-slate-800 dark:text-white'
                        : 'border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-slate-800 dark:text-white'
                      return (
                        <div
                          key={idx}
                          onClick={() => onLineToggle?.(idx, trimmed)}
                          className={`cursor-pointer px-3 py-1 rounded-lg transition-all select-none ${
                            isSelected
                              ? selectedClass
                              : 'border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {trimmed}
                        </div>
                      )
                    })}
                  </div>
                )
              }

              if (isActive && version.id === 'original' && !isStoryMode && song.annotations?.length > 0) {
                const annMap = {}
                song.annotations.forEach(ann => {
                  for (let i = ann.startLine; i <= ann.endLine; i++) {
                    annMap[i] = ann
                  }
                })
                const contentLines = plainContent.split('\n')
                const rendered = []
                let i = 0
                while (i < contentLines.length) {
                  const trimmed = contentLines[i].trim()
                  if (!trimmed) {
                    rendered.push(<div key={i} className="h-4" />)
                    i++
                    continue
                  }
                  const ann = annMap[i]
                  if (ann) {
                    const isOpen = openAnnotationId === ann.id
                    const groupLines = []
                    for (let j = ann.startLine; j <= ann.endLine && j < contentLines.length; j++) {
                      if (contentLines[j].trim()) {
                        groupLines.push(
                          <div
                            key={j}
                            onClick={() => onAnnotationToggle?.(ann.id)}
                            className="cursor-pointer px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 text-slate-700 dark:text-slate-200 underline decoration-dotted decoration-amber-400 underline-offset-4 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                          >
                            {contentLines[j].trim()}
                          </div>
                        )
                      } else {
                        groupLines.push(<div key={j} className="h-4" />)
                      }
                    }
                    rendered.push(
                      <div key={`ann-${ann.id}`}>
                        {groupLines}
                        {isOpen && (
                          <div className="mt-2 mb-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 rounded-r-xl text-sm leading-relaxed">
                            <p className="text-slate-700 dark:text-slate-200">{ann.content}</p>
                            <button onClick={() => onAnnotationToggle?.(null)} className="mt-2 text-xs text-amber-700 dark:text-amber-400 hover:underline">Close</button>
                          </div>
                        )}
                      </div>
                    )
                    i = ann.endLine + 1
                  } else {
                    rendered.push(
                      <div key={i} className="px-3 py-1 text-slate-700 dark:text-slate-200">
                        {trimmed}
                      </div>
                    )
                    i++
                  }
                }
                return (
                  <div style={{ fontSize: isActive ? `${fontSize}px` : '16px', lineHeight: '1.8' }} className="font-sans leading-relaxed">
                    {rendered}
                  </div>
                )
              }

              // Default rendering
              if (contentIsHtml) {
                return (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert font-sans text-slate-700 dark:text-slate-200 leading-relaxed"
                    style={{ fontSize: isActive ? `${fontSize}px` : '16px', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: version.content }}
                  />
                )
              }

              return (
                <p
                  className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-relaxed"
                  style={{ fontSize: isActive ? `${fontSize}px` : '16px', lineHeight: '1.8' }}
                >
                  {version.content}
                </p>
              )
            })()}
          </section>
        )
      })}
    </div>
  )
}


// Comments Section Component
const EMOJI_MAP = {
  fire: { icon: '\uD83D\uDD25', label: 'Fire' },
  heart: { icon: '\u2764\uFE0F', label: 'Love' },
  sad: { icon: '\uD83D\uDE22', label: 'Sad' },
  party: { icon: '\uD83C\uDF89', label: 'Party' },
  hundred: { icon: '\uD83D\uDCAF', label: 'Perfect' }
}

function RatingsAndReactions({ slug, ratingsRef, onRatingChange }) {
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reactions, setReactions] = useState({ fire: 0, heart: 0, sad: 0, party: 0, hundred: 0 })
  const [userReactions, setUserReactions] = useState([])
  const [ratingLoading, setRatingLoading] = useState(true)
  const [reactionsLoading, setReactionsLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch(`/api/public/songs/${slug}/rate`)
        if (res.ok) {
          const data = await res.json()
          setAverageRating(data.averageRating)
          setTotalRatings(data.totalRatings)
          setUserRating(data.userRating)
          onRatingChange?.(data.averageRating, data.totalRatings)
        }
      } catch (err) {
        console.error('Error fetching ratings:', err)
      } finally {
        setRatingLoading(false)
      }
    }
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/public/songs/${slug}/react`)
        if (res.ok) {
          const data = await res.json()
          setReactions(data.reactions)
          setUserReactions(data.userReactions)
        }
      } catch (err) {
        console.error('Error fetching reactions:', err)
      } finally {
        setReactionsLoading(false)
      }
    }
    fetchRatings()
    fetchReactions()
  }, [slug])

  const handleRate = async (rating) => {
    const prevRating = userRating
    const prevAvg = averageRating
    const prevTotal = totalRatings
    // Optimistic update
    setUserRating(rating)
    const newTotal = prevRating === 0 ? prevTotal + 1 : prevTotal
    const newAvg = prevRating === 0
      ? (prevAvg * prevTotal + rating) / newTotal
      : (prevAvg * prevTotal - prevRating + rating) / prevTotal
    const roundedAvg = Math.round(newAvg * 10) / 10
    setAverageRating(roundedAvg)
    setTotalRatings(newTotal)
    onRatingChange?.(roundedAvg, newTotal)

    try {
      const res = await fetch(`/api/public/songs/${slug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })
      if (res.ok) {
        const data = await res.json()
        setAverageRating(data.averageRating)
        setTotalRatings(data.totalRatings)
        setUserRating(data.userRating)
        onRatingChange?.(data.averageRating, data.totalRatings)
      } else {
        // Revert
        setUserRating(prevRating)
        setAverageRating(prevAvg)
        setTotalRatings(prevTotal)
        onRatingChange?.(prevAvg, prevTotal)
      }
    } catch {
      setUserRating(prevRating)
      setAverageRating(prevAvg)
      setTotalRatings(prevTotal)
      onRatingChange?.(prevAvg, prevTotal)
    }
  }

  const handleReact = async (emoji) => {
    const prevReactions = { ...reactions }
    const prevUserReactions = [...userReactions]
    // Optimistic update
    const isActive = userReactions.includes(emoji)
    if (isActive) {
      setUserReactions(prev => prev.filter(e => e !== emoji))
      setReactions(prev => ({ ...prev, [emoji]: Math.max(0, prev[emoji] - 1) }))
    } else {
      setUserReactions(prev => [...prev, emoji])
      setReactions(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }))
    }

    try {
      const res = await fetch(`/api/public/songs/${slug}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      if (res.ok) {
        const data = await res.json()
        setReactions(data.reactions)
        setUserReactions(data.userReactions)
      } else {
        setReactions(prevReactions)
        setUserReactions(prevUserReactions)
      }
    } catch {
      setReactions(prevReactions)
      setUserReactions(prevUserReactions)
    }
  }

  const displayRating = hoverRating || userRating

  return (
    <section ref={ratingsRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      {/* Star Rating */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <FiStar className="w-5 h-5 text-amber-500" />
          Rate this Song
        </h2>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={ratingLoading}
              className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= displayRating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        {!ratingLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalRatings > 0 ? (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{averageRating}</span> out of 5
                <span className="mx-1.5">·</span>
                {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                {userRating > 0 && (
                  <>
                    <span className="mx-1.5">·</span>
                    <span className="text-primary font-medium">You rated {userRating}</span>
                  </>
                )}
              </>
            ) : (
              'Be the first to rate this song!'
            )}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-700 my-5" />

      {/* Emoji Reactions */}
      <div>
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">How does this song make you feel?</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EMOJI_MAP).map(([key, { icon }]) => {
            const isActive = userReactions.includes(key)
            const count = reactions[key] || 0
            return (
              <button
                key={key}
                onClick={() => handleReact(key)}
                disabled={reactionsLoading}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary text-primary shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                } disabled:opacity-50`}
              >
                <span className="text-lg">{icon}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function SongPageClient({ initialSong, initialRelatedSongs = [] }) {
  const params = useParams()
  // Use initial data from server - no loading state needed
  const [song] = useState(initialSong)
  const [relatedSongs] = useState(initialRelatedSongs)
  const [copied, setCopied] = useState(false)
  const [viewCount, setViewCount] = useState(initialSong?.views || 0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [lyricsMode, setLyricsMode] = useState('original')
  const [lyricsFontSize, setLyricsFontSize] = useState(18)
  const [openAnnotationId, setOpenAnnotationId] = useState(null)
  const [headerAvgRating, setHeaderAvgRating] = useState(0)
  const [headerTotalRatings, setHeaderTotalRatings] = useState(0)
  const lyricsRef = useRef(null)
  const ratingsRef = useRef(null)

  // Story mode (dynamically imported)
  const {
    isStoryMode, setIsStoryMode,
    selectedLines, setSelectedLines,
    showTemplatePicker: showStoryTemplatePicker, setShowTemplatePicker: setShowStoryTemplatePicker,
    showStoryPreview, setShowStoryPreview,
    storyImageBlob, setStoryImageBlob,
    isGeneratingStory, storyTemplate,
    handleLineToggle, handlePreviewStory, handleCreateStory,
    handleTemplateChange, exitStoryMode,
  } = useStoryMode({ initialSong })

  // Clip mode
  const {
    isClipMode, setIsClipMode,
    selectedLines: clipSelectedLines, setSelectedLines: setClipSelectedLines,
    showTemplatePicker, setShowTemplatePicker,
    showClipPreview, setShowClipPreview,
    clipVideoBlob, setClipVideoBlob,
    clipPreviewImage,
    isGeneratingClip, clipProgress, clipTemplate,
    handleLineToggle: handleClipLineToggle,
    handlePreviewClip,
    handleCreateClip,
    handleClipTemplateChange,
    exitClipMode,
  } = useClipMode({ initialSong })

  // Mutual exclusivity helpers
  const enterStoryMode = useCallback(() => {
    if (isClipMode) exitClipMode()
    setIsStoryMode(true)
    setSelectedLines([])
  }, [isClipMode, exitClipMode, setIsStoryMode, setSelectedLines])

  const enterClipMode = useCallback(() => {
    if (isStoryMode) exitStoryMode()
    setIsClipMode(true)
    setClipSelectedLines([])
  }, [isStoryMode, exitStoryMode, setIsClipMode, setClipSelectedLines])

  // Active mode state for LyricsDisplay
  const isAnySelectMode = isStoryMode || isClipMode
  const activeSelectedLines = isClipMode ? clipSelectedLines : selectedLines
  const activeLineToggle = isClipMode ? handleClipLineToggle : handleLineToggle

  // Reset selected lines when lyrics mode changes during story/clip mode
  useEffect(() => {
    if (isStoryMode) setSelectedLines([])
    if (isClipMode) setClipSelectedLines([])
  }, [lyricsMode])

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
    navigator.clipboard.writeText(stripHtml(textToCopy))
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      {/* Breadcrumb with Schema */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">
              Home
            </Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li>
            <Link href="/songs" className="text-slate-500 dark:text-slate-400 hover:text-primary transition">
              Songs
            </Link>
          </li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li>
            <span className="text-slate-800 dark:text-white font-medium truncate">{song.title}</span>
          </li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article itemScope itemType="https://schema.org/MusicComposition">
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
                    <h1 itemProp="name" className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                      {song.title} Lyrics
                    </h1>

                    {/* Star Rating Summary */}
                    <button
                      onClick={() => ratingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="inline-flex items-center gap-1.5 mb-3 group cursor-pointer"
                      title="Rate this song"
                    >
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 transition-colors ${
                              star <= Math.round(headerAvgRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600'
                            }`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary transition">
                        {headerTotalRatings > 0
                          ? `${headerAvgRating} (${headerTotalRatings})`
                          : 'Rate this song'}
                      </span>
                    </button>

                    <div itemProp="recordedAs" itemScope itemType="https://schema.org/MusicRecording" className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
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
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
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

                    {/* Live Readers */}
                    <LiveReaders songTitle={song.title} />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
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
                    </div>
                  </div>
                </div>
              </header>

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

                {!isAnySelectMode && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={enterStoryMode}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition"
                    >
                      <FiCamera className="w-4 h-4" />
                      <span className="hidden sm:inline">Create Story</span>
                      <span className="sm:hidden">IG Story</span>
                    </button>
                    <button
                      onClick={enterClipMode}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition"
                    >
                      <FiVideo className="w-4 h-4" />
                      <span className="hidden sm:inline">Create Reel</span>
                      <span className="sm:hidden">IG Reel</span>
                    </button>
                  </div>
                )}

                <hr className="border-slate-200 dark:border-slate-700 my-4" />

                <LyricsToggle
                  lyricsMode={lyricsMode}
                  setLyricsMode={setLyricsMode}
                  hasRomanized={!!song.lyricsRomanized}
                  hasTranslated={!!song.lyricsTranslated}
                  hasHindi={!!song.lyricsHindi}
                  hasPunjabi={!!song.lyricsPunjabi}
                />

                {/* Story Mode Banner */}
                {isStoryMode && (
                  <div className="mb-4 px-4 py-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center gap-2">
                      <FiCamera className="w-4 h-4 flex-shrink-0" />
                      Tap 2-4 lines below to create a shareable story image
                    </p>
                  </div>
                )}

                {/* Clip Mode Banner */}
                {isClipMode && (
                  <div className="mb-4 px-4 py-3 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium flex items-center gap-2">
                      <FiVideo className="w-4 h-4 flex-shrink-0" />
                      Tap 2-8 lines to create an animated lyrics clip
                    </p>
                  </div>
                )}

                <div className={isAnySelectMode ? 'pb-24' : ''}>
                  <LyricsDisplay
                    song={song}
                    lyricsMode={lyricsMode}
                    lyricsRef={lyricsRef}
                    fontSize={lyricsFontSize}
                    isStoryMode={isAnySelectMode}
                    selectedLines={activeSelectedLines}
                    onLineToggle={activeLineToggle}
                    selectColor={isClipMode ? 'cyan' : 'purple'}
                    openAnnotationId={openAnnotationId}
                    onAnnotationToggle={(id) => setOpenAnnotationId(openAnnotationId === id ? null : id)}
                  />
                </div>
              </section>

              {/* Ratings & Reactions */}
              <RatingsAndReactions
                slug={params.slug}
                ratingsRef={ratingsRef}
                onRatingChange={(avg, total) => {
                  setHeaderAvgRating(avg)
                  setHeaderTotalRatings(total)
                }}
              />

              {/* Song Meaning - After Ratings */}
              {song.meaning && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5 text-primary" />
                    {song.title} Song Meaning
                  </h2>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHtml(song.meaning) ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: song.meaning }} />
                    ) : (
                      <p className="whitespace-pre-line">{song.meaning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Lyric Annotations - After Meaning */}
              {song.annotations?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiEdit3 className="w-5 h-5 text-amber-500" />
                    Lyric Annotations
                  </h2>
                  {song.annotations.map(ann => {
                    const plainLyrics = stripHtml(song.lyrics)
                    const lines = plainLyrics.split('\n')
                    const quoted = lines.slice(ann.startLine, ann.endLine + 1).filter(l => l.trim()).join(' / ')
                    return (
                      <details key={ann.id} className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-200 italic">&ldquo;{quoted}&rdquo;</summary>
                        <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{ann.content}</p>
                      </details>
                    )
                  })}
                </div>
              )}

              {/* Report Button - Always visible after lyrics */}
              <div className="mb-6">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  <FiAlertCircle className="w-5 h-5" />
                  <span>Report an Error</span>
                </button>
              </div>

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
            <aside className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-hide">
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
      <StoryTemplatePickerModal
        isOpen={showStoryTemplatePicker}
        onClose={() => setShowStoryTemplatePicker(false)}
        onSelect={handleCreateStory}
        sampleLines={selectedLines.map(l => l.text)}
      />
      <StoryPreviewModal
        isOpen={showStoryPreview}
        onClose={() => { setShowStoryPreview(false); setStoryImageBlob(null) }}
        storyImageBlob={storyImageBlob}
        isGenerating={isGeneratingStory}
        songTitle={song.title}
        onTemplateChange={handleTemplateChange}
        selectedTemplate={storyTemplate}
      />
      <TemplatePickerModal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleCreateClip}
        sampleLines={clipSelectedLines.map(l => l.text)}
      />
      <ClipPreviewModal
        isOpen={showClipPreview}
        onClose={() => { setShowClipPreview(false); setClipVideoBlob(null) }}
        clipVideoBlob={clipVideoBlob}
        clipPreviewImage={clipPreviewImage}
        isGenerating={isGeneratingClip}
        clipProgress={clipProgress}
        songTitle={song.title}
        onTemplateChange={handleClipTemplateChange}
        selectedTemplate={clipTemplate}
      />

      {/* Story Mode Floating Bottom Bar */}
      {isStoryMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {selectedLines.length} / 4 lines selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={exitStoryMode}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewStory}
                disabled={selectedLines.length < 2}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition flex items-center gap-2 ${
                  selectedLines.length >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <FiCamera className="w-4 h-4" />
                Preview Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clip Mode Floating Bottom Bar */}
      {isClipMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {clipSelectedLines.length} / 8 lines selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={exitClipMode}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewClip}
                disabled={clipSelectedLines.length < 2}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition flex items-center gap-2 ${
                  clipSelectedLines.length >= 2
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <FiVideo className="w-4 h-4" />
                Preview Clip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
