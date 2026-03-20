'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  FiClock, FiArrowLeft, FiX, FiChevronRight,
  FiLink, FiMusic, FiFilm, FiMic, FiDisc, FiCalendar, FiUser, FiTag, FiExternalLink
} from 'react-icons/fi'
import {
  FaXTwitter, FaFacebookF, FaWhatsapp, FaTumblr, FaPinterestP, FaLinkedinIn
} from 'react-icons/fa6'
import { getAuthorByName } from '@/lib/authors'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Split HTML at the first </p> to inject DB link after first paragraph
function splitAtFirstParagraph(html) {
  const idx = html ? html.indexOf('</p>') : -1
  if (idx === -1) return [html || '', '']
  return [html.slice(0, idx + 4), html.slice(idx + 4)]
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-200/60">
      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-75 shadow-sm" style={{ width: `${progress}%` }} />
    </div>
  )
}

const DB_CONFIG = {
  song: {
    icon: FiMusic,
    label: 'Featured Song',
    getHref: d => `/song/${d.slug}`,
    getTitle: d => d.title,
    getSubtitle: d => d.artists?.map(a => a.artist.name).join(', '),
    getImage: d => d.coverImage,
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 border-violet-100',
    iconBg: 'bg-violet-100 text-violet-600',
    labelColor: 'text-violet-500',
  },
  movie: {
    icon: FiFilm,
    label: 'Featured Movie',
    getHref: d => `/movie/${d.slug}`,
    getTitle: d => d.title,
    getSubtitle: d => d.year ? `${d.year}` : '',
    getImage: d => d.posterUrl,
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50 border-rose-100',
    iconBg: 'bg-rose-100 text-rose-600',
    labelColor: 'text-rose-500',
  },
  artist: {
    icon: FiMic,
    label: 'Featured Artist',
    getHref: d => `/artist/${d.slug}`,
    getTitle: d => d.name,
    getSubtitle: () => null,
    getImage: d => d.imageUrl,
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-100 text-amber-600',
    labelColor: 'text-amber-600',
  },
  album: {
    icon: FiDisc,
    label: 'Featured Album',
    getHref: d => `/album/${d.slug}`,
    getTitle: d => d.title,
    getSubtitle: d => d.artist?.name,
    getImage: d => d.coverImage,
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-600',
    labelColor: 'text-emerald-600',
  },
}

// Inline card — placed between paragraphs, outside prose container
function DBLinkInline({ type, data }) {
  if (!data) return null
  const c = DB_CONFIG[type]
  if (!c) return null
  const Icon = c.icon
  const image = c.getImage(data)
  const subtitle = c.getSubtitle(data)
  const title = c.getTitle(data)
  return (
    <Link
      href={c.getHref(data)}
      style={{ textDecoration: 'none' }}
      className="group flex items-center gap-4 my-0 px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
    >
      {image ? (
        <img src={image} alt={title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" />
      ) : (
        <div className={`w-14 h-14 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${c.labelColor}`} style={{ textDecoration: 'none' }}>
          {c.label}
        </span>
        <p className="font-bold text-slate-800 group-hover:text-primary transition-colors text-[15px] leading-snug mt-0.5 truncate" style={{ textDecoration: 'none' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 truncate" style={{ textDecoration: 'none' }}>
            {subtitle}
          </p>
        )}
      </div>
      <span
        className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${c.gradient} text-white flex-shrink-0 group-hover:opacity-90 transition-opacity`}
        style={{ textDecoration: 'none' }}
      >
        View Details
      </span>
    </Link>
  )
}

// Sidebar card
function DBLinkSidebar({ type, data }) {
  if (!data) return null
  const c = DB_CONFIG[type]
  if (!c) return null
  const Icon = c.icon
  const image = c.getImage(data)
  const subtitle = c.getSubtitle(data)
  return (
    <Link
      href={c.getHref(data)}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
    >
      {image ? (
        <img src={image} alt={c.getTitle(data)} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className={`w-12 h-12 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${c.labelColor} mb-0.5`}>{c.label}</p>
        <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">{c.getTitle(data)}</p>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>
    </Link>
  )
}

function ShareButtons({ title, url, compact = false }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const enc = encodeURIComponent
  const xUrl         = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`
  const fbUrl        = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
  const waUrl        = `https://wa.me/?text=${enc(title + ' ' + url)}`
  const tumblrUrl    = `https://www.tumblr.com/share/link?url=${enc(url)}&name=${enc(title)}`
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(title)}`
  const linkedinUrl  = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`

  const btns = [
    { href: xUrl,         bg: '#000000', label: 'X',         Icon: FaXTwitter },
    { href: fbUrl,        bg: '#1877F2', label: 'Facebook',   Icon: FaFacebookF },
    { href: waUrl,        bg: '#25D366', label: 'WhatsApp',   Icon: FaWhatsapp },
    { href: tumblrUrl,    bg: '#35465C', label: 'Tumblr',     Icon: FaTumblr },
    { href: pinterestUrl, bg: '#E60023', label: 'Pinterest',  Icon: FaPinterestP },
    { href: linkedinUrl,  bg: '#0A66C2', label: 'LinkedIn',   Icon: FaLinkedinIn },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {btns.map(({ href, bg, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold transition-opacity hover:opacity-85 shadow-sm"
          style={{ backgroundColor: bg }}>
          <Icon className="w-3.5 h-3.5" />
          {!compact && <span>{label}</span>}
        </a>
      ))}
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors">
        <FiLink className="w-3.5 h-3.5" /> {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function RelatedCard({ post }) {
  return (
    <Link href={`/updates/${post.slug}`}
      className="group flex gap-3 rounded-xl p-3 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
          <FiTag className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {post.blogCategory && (
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: post.blogCategory.color || '#6b7280' }}>
            {post.blogCategory.name}
          </span>
        )}
        <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <FiClock className="w-3 h-3" /> {post.readTime} min read
        </p>
      </div>
    </Link>
  )
}

const WA_CHANNEL = 'https://whatsapp.com/channel/0029Vb7A52PEAKW8b0wxfV03'

function WhatsAppBanner() {
  return (
    <a
      href={WA_CHANNEL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 my-8 p-4 sm:p-5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0d7d6e] rounded-2xl shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.01] group"
      style={{ textDecoration: 'none' }}
    >
      <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
        <FaWhatsapp className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-base sm:text-lg leading-snug">Join Our WhatsApp Channel</p>
        <p className="text-white/85 text-xs sm:text-sm mt-0.5">Get the latest articles and entertainment updates instantly!</p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#128C7E] font-bold rounded-xl group-hover:bg-white/90 transition text-sm flex-shrink-0">
        <FaWhatsapp className="w-4 h-4" /> Follow Now <FiChevronRight className="w-3.5 h-3.5" />
      </div>
    </a>
  )
}

function ArticleToast({ posts, visible, onDismiss }) {
  const [post, setPost] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (posts && posts.length > 0) {
      setPost(posts[Math.floor(Math.random() * posts.length)])
    }
  }, [posts])

  useEffect(() => {
    if (visible && post) {
      const t = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(t)
    } else {
      setMounted(false)
    }
  }, [visible, post])

  if (!visible || !post) return null

  return (
    <div className="fixed z-50 left-4 bottom-6 w-[calc(100%-2rem)] sm:w-80">
      <div
        style={{
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-24px)',
        }}
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
        role="status"
        aria-live="polite"
      >
        <Link
          href={`/updates/${post.slug}`}
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-2xl transition group"
        >
          {post.coverImage ? (
            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-slate-700">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center">
              <FiTag className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
              {post.blogCategory?.name ? `More in ${post.blogCategory.name}` : 'You might like'}
            </p>
            <p className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-primary transition">
              {post.title}
            </p>
            {post.readTime && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <FiClock className="w-3 h-3" />{post.readTime} min read
              </p>
            )}
          </div>
          <FiChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-primary transition" />
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); onDismiss() }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center hover:bg-slate-500 transition"
          aria-label="Dismiss"
        >
          <FiX className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  )
}

export default function BlogPostClient({ post, relatedPosts, recentPosts = [], siteUrl }) {
  const postUrl = `${siteUrl}/updates/${post.slug}`
  const tags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
  const authorProfile = getAuthorByName(post.author)

  // Determine primary DB link (injected in content) and secondary ones (sidebar)
  const dbEntries = [
    post.relatedMovie  && { type: 'movie',  data: post.relatedMovie },
    post.relatedSong   && { type: 'song',   data: post.relatedSong },
    post.relatedArtist && { type: 'artist', data: post.relatedArtist },
    post.relatedAlbum  && { type: 'album',  data: post.relatedAlbum },
  ].filter(Boolean)

  const primaryDB = dbEntries[0] || null
  const sidebarDBs = dbEntries.slice(1)

  const [contentBefore, contentAfter] = splitAtFirstParagraph(post.content)

  const [showToast, setShowToast] = useState(false)
  const [toastDismissed, setToastDismissed] = useState(false)
  const toastPosts = relatedPosts.length > 0 ? relatedPosts : recentPosts

  // Show article toast after user scrolls 45% down
  useEffect(() => {
    if (toastDismissed || toastPosts.length === 0) return
    let shown = false
    const onScroll = () => {
      if (shown || toastDismissed) return
      const el = document.documentElement
      const pct = (el.scrollTop || document.body.scrollTop) / (el.scrollHeight - el.clientHeight)
      if (pct > 0.45) {
        shown = true
        setTimeout(() => setShowToast(true), 600)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [toastDismissed, toastPosts])

  return (
    <div className="min-h-screen bg-slate-50">
      <ReadingProgressBar />

      {/* Hero — always dark gradient, image shown inside article */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-14 pb-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1DB95422,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.blogCategory && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white mb-4 shadow-md"
              style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
            >
              {post.blogCategory.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Meta bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          {authorProfile ? (
            <Link
              href={`/updates/author/${authorProfile.slug}`}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-primary transition-colors group"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: authorProfile.color }}
              >
                {authorProfile.avatar}
              </div>
              {post.author}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <FiUser className="w-4 h-4 text-slate-400" />{post.author}
            </span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-slate-400" />{formatDate(post.publishedAt)}
            </span>
          )}
          {post.readTime && (
            <span className="flex items-center gap-1.5">
              <FiClock className="w-4 h-4 text-slate-400" />{post.readTime} min read
            </span>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <Link href="/updates" className="hover:text-primary transition-colors">Updates</Link>
          {post.blogCategory && (
            <>
              <span className="text-slate-300">/</span>
              <Link href={`/updates/category/${post.blogCategory.slug}`} className="hover:text-primary transition-colors">
                {post.blogCategory.name}
              </Link>
            </>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 line-clamp-1">{post.title}</span>
        </nav>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Main column ── */}
          <div>
            {/* Cover image — shown here, after the title, never as background */}
            {post.coverImage && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={post.coverImage}
                  alt={post.metaTitle || post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: '480px' }}
                />
              </div>
            )}

            {/* Excerpt callout */}
            <div className="bg-white rounded-2xl border-l-4 border-primary px-6 py-5 mb-6 shadow-sm">
              <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium italic">{post.excerpt}</p>
            </div>

            {/* Article content card */}
            <div className="bg-white rounded-2xl shadow-sm px-6 md:px-10 py-8 md:py-10">
              {/* Prose classes only on the text content, never on the DB card */}
              <article className="
                prose prose-slate prose-base max-w-none

                prose-headings:font-extrabold prose-headings:text-slate-900 prose-headings:leading-snug prose-headings:tracking-tight
                prose-h2:text-[1.45rem] prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-slate-100
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-slate-800

                prose-p:text-slate-700 prose-p:leading-[1.9] prose-p:text-[15.5px] prose-p:my-5

                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/40

                prose-strong:text-slate-900 prose-strong:font-bold
                prose-em:text-slate-600

                prose-ul:my-5 prose-ul:space-y-1.5
                prose-ol:my-5 prose-ol:space-y-1.5
                prose-li:text-slate-700 prose-li:leading-relaxed prose-li:text-[15px]
                prose-li:marker:text-primary

                prose-blockquote:not-italic prose-blockquote:border-l-[5px] prose-blockquote:border-primary
                prose-blockquote:bg-gradient-to-r prose-blockquote:from-emerald-50 prose-blockquote:to-transparent
                prose-blockquote:rounded-r-xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
                prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-blockquote:text-base

                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8

                prose-code:text-primary prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:my-8

                prose-hr:border-slate-200 prose-hr:my-10

                [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-sm [&_table]:text-sm
                [&_thead]:bg-slate-800
                [&_th]:text-white [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:whitespace-nowrap
                [&_td]:px-4 [&_td]:py-3 [&_td]:text-slate-700 [&_td]:border-b [&_td]:border-slate-100 [&_td]:align-top
                [&_tbody_tr:last-child_td]:border-b-0
                [&_tbody_tr:nth-child(even)]:bg-slate-50
                [&_tbody_tr]:hover:bg-emerald-50/50 [&_tbody_tr]:transition-colors
                [&_tfoot_td]:bg-slate-100 [&_tfoot_td]:font-semibold [&_tfoot_td]:text-slate-800 [&_tfoot_td]:px-4 [&_tfoot_td]:py-3 [&_tfoot_td]:border-t-2 [&_tfoot_td]:border-slate-200
              ">
                <div dangerouslySetInnerHTML={{ __html: contentBefore }} />
              </article>

              {/* DB link card — intentionally outside <article> so prose styles never reach it */}
              {primaryDB && (
                <div className="my-6">
                  <DBLinkInline type={primaryDB.type} data={primaryDB.data} />
                </div>
              )}

              <article className="
                prose prose-slate prose-base max-w-none

                prose-headings:font-extrabold prose-headings:text-slate-900 prose-headings:leading-snug prose-headings:tracking-tight
                prose-h2:text-[1.45rem] prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-slate-100
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-slate-800

                prose-p:text-slate-700 prose-p:leading-[1.9] prose-p:text-[15.5px] prose-p:my-5

                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/40

                prose-strong:text-slate-900 prose-strong:font-bold
                prose-em:text-slate-600

                prose-ul:my-5 prose-ul:space-y-1.5
                prose-ol:my-5 prose-ol:space-y-1.5
                prose-li:text-slate-700 prose-li:leading-relaxed prose-li:text-[15px]
                prose-li:marker:text-primary

                prose-blockquote:not-italic prose-blockquote:border-l-[5px] prose-blockquote:border-primary
                prose-blockquote:bg-gradient-to-r prose-blockquote:from-emerald-50 prose-blockquote:to-transparent
                prose-blockquote:rounded-r-xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
                prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-blockquote:text-base

                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8

                prose-code:text-primary prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:my-8

                prose-hr:border-slate-200 prose-hr:my-10

                [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-sm [&_table]:text-sm
                [&_thead]:bg-slate-800
                [&_th]:text-white [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:whitespace-nowrap
                [&_td]:px-4 [&_td]:py-3 [&_td]:text-slate-700 [&_td]:border-b [&_td]:border-slate-100 [&_td]:align-top
                [&_tbody_tr:last-child_td]:border-b-0
                [&_tbody_tr:nth-child(even)]:bg-slate-50
                [&_tbody_tr]:hover:bg-emerald-50/50 [&_tbody_tr]:transition-colors
                [&_tfoot_td]:bg-slate-100 [&_tfoot_td]:font-semibold [&_tfoot_td]:text-slate-800 [&_tfoot_td]:px-4 [&_tfoot_td]:py-3 [&_tfoot_td]:border-t-2 [&_tfoot_td]:border-slate-200
              ">
                <div dangerouslySetInnerHTML={{ __html: contentAfter }} />
              </article>

              {/* WhatsApp channel banner — inside article card, after content */}
              <WhatsAppBanner />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <FiTag className="w-3.5 h-3.5" /> Tags
                </span>
                {tags.map(tag => (
                  <span key={tag}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-sm hover:bg-primary hover:text-white hover:border-primary transition-all cursor-default shadow-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share bar */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm px-6 py-5 border border-slate-100 flex flex-wrap items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Share this article</p>
                <p className="text-xs text-slate-400 mt-0.5">Found it useful? Pass it on.</p>
              </div>
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Related articles — main column */}
            {relatedPosts.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-slate-800 mb-4">
                  More in {post.blogCategory?.name || 'Updates'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPosts.map(r => (
                    <Link
                      key={r.id}
                      href={`/updates/${r.slug}`}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col border border-slate-100 hover:border-slate-200"
                    >
                      {r.coverImage ? (
                        <div className="h-36 overflow-hidden flex-shrink-0">
                          <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-36 flex-shrink-0 bg-slate-100 flex items-center justify-center">
                          <FiTag className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        {r.blogCategory && (
                          <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: r.blogCategory.color || '#6b7280' }}>
                            {r.blogCategory.name}
                          </span>
                        )}
                        <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                          {r.title}
                        </p>
                        {r.readTime && (
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />{r.readTime} min read
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            {authorProfile && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Written by</p>
                <div className="flex items-start gap-4">
                  <Link href={`/updates/author/${authorProfile.slug}`} className="flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: authorProfile.color }}
                    >
                      {authorProfile.avatar}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/updates/author/${authorProfile.slug}`}
                      className="font-bold text-slate-800 hover:text-primary transition-colors text-base"
                    >
                      {authorProfile.name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 mb-2">{authorProfile.title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {authorProfile.bio.split('\n\n')[0]}
                    </p>
                    <Link
                      href={`/updates/author/${authorProfile.slug}`}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline"
                      style={{ color: authorProfile.color }}
                    >
                      View all articles <FiExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-5">
              <Link href="/updates" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium group">
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Updates
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            <div className="lg:sticky lg:top-6 space-y-5">

              {/* Category */}
              {post.blogCategory && (
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Category</p>
                  <Link
                    href={`/updates/category/${post.blogCategory.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
                  >
                    {post.blogCategory.name}
                  </Link>
                </div>
              )}

              {/* Secondary DB links in sidebar */}
              {sidebarDBs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Related Content</p>
                  <div className="space-y-1 -mx-2">
                    {sidebarDBs.map(({ type, data }) => (
                      <DBLinkSidebar key={type} type={type} data={data} />
                    ))}
                  </div>
                </div>
              )}

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    More in {post.blogCategory?.name}
                  </p>
                  <div className="space-y-1 -mx-2">
                    {relatedPosts.map(r => <RelatedCard key={r.id} post={r} />)}
                  </div>
                </div>
              )}

              {/* Recent articles */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Recent Articles</p>
                  <div className="space-y-3">
                    {recentPosts.map(r => (
                      <Link
                        key={r.id}
                        href={`/updates/${r.slug}`}
                        className="flex gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
                      >
                        {r.coverImage ? (
                          <img src={r.coverImage} alt={r.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            <FiTag className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          {r.blogCategory && (
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: r.blogCategory.color || '#6b7280' }}>
                              {r.blogCategory.name}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-slate-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {r.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/updates" className="block text-center text-xs font-semibold text-primary hover:underline mt-4 pt-3 border-t border-slate-100">
                    View all articles
                  </Link>
                </div>
              )}

              {/* Share */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-md">
                <p className="text-sm font-bold text-white mb-1">Enjoyed this article?</p>
                <p className="text-xs text-slate-400 mb-4">Share it with your friends and music fans.</p>
                <ShareButtons title={post.title} url={postUrl} compact />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Article recommendation toast */}
      <ArticleToast
        posts={toastPosts}
        visible={showToast && !toastDismissed}
        onDismiss={() => { setShowToast(false); setToastDismissed(true) }}
      />
    </div>
  )
}
