import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FiCamera, FiVideo, FiDownload, FiSmartphone, FiZap, FiLayers, FiShare2, FiChevronRight, FiMusic, FiArrowRight, FiCheck, FiGlobe, FiPlay, FiStar, FiHeart, FiSun, FiFeather, FiDroplet, FiMoon } from 'react-icons/fi'
import { FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
const pageSlug = 'lyrics-instagram-story-maker'
const pageUrl = `${siteUrl}/${pageSlug}`

export const revalidate = 3600

// --- SEO Metadata ---
export async function generateMetadata() {
  const title = 'Lyrics Instagram Story Maker - Create Song Lyrics Status Online Free | DJYoungster'
  const description = 'Create beautiful Instagram stories and reels from song lyrics in seconds. Free online lyrics status maker for Instagram, WhatsApp & Snapchat. Choose from 6 stunning templates. No app download needed.'

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'DJYoungster',
      locale: 'en_IN',
      type: 'website',
      images: [{ url: `${siteUrl}/og-lyrics-story-maker.png`, width: 1200, height: 630, alt: 'DJYoungster Lyrics Instagram Story Maker' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  }
}

// --- FAQ Data ---
const faqs = [
  {
    q: 'How do I create an Instagram story from song lyrics?',
    a: 'On DJYoungster, open any song lyrics page and tap the "Create Story" button. Select 2-4 lines you love, pick one of 6 beautiful templates, and download a ready-to-share story image — all in under 10 seconds. No app download or sign-up required.',
  },
  {
    q: 'Is the lyrics status maker free to use?',
    a: 'Yes, the DJYoungster lyrics status maker is 100% free. You can create unlimited Instagram stories, WhatsApp statuses, and video reels from any song lyrics on our platform without paying anything.',
  },
  {
    q: 'Can I create video reels from song lyrics?',
    a: 'Absolutely! DJYoungster lets you create animated video reels from lyrics. Select 2-8 lines, choose from 6 animated templates with particle effects, and download a 20-30 second video clip perfect for Instagram Reels, YouTube Shorts, or TikTok.',
  },
  {
    q: 'What templates are available for lyrics stories?',
    a: 'We offer 6 unique story templates: Moody Bloom, Nostalgic, Deep Rose, Elegant Leaf, Soft Dream, and Blush. Each template features beautiful typography, gradient backgrounds, and glassmorphism effects designed to make your lyrics stand out.',
  },
  {
    q: 'Can I use this for WhatsApp status and Snapchat?',
    a: 'Yes! The story images and video reels you create work perfectly on WhatsApp Status, Snapchat Stories, Facebook Stories, and any other platform that supports image or video sharing.',
  },
  {
    q: 'Do I need to download an app to create lyrics status?',
    a: 'No app download is needed. DJYoungster lyrics status maker works directly in your browser on both mobile and desktop. Just visit any song page, tap Create Story or Create Reel, and your content is ready to download instantly.',
  },
  {
    q: 'Which languages are supported for lyrics stories?',
    a: 'You can create stories from lyrics in Hindi, Punjabi, English, Tamil, Telugu, Bhojpuri, Haryanvi, and more. DJYoungster has a growing library of 10+ languages with romanized versions available for non-native readers.',
  },
  {
    q: 'How is DJYoungster different from other lyrics status makers?',
    a: 'Unlike generic status maker apps, DJYoungster is a complete lyrics platform. You get accurate lyrics, romanized versions for sing-along, English translations, song meanings, and the ability to create stories and reels — all in one place. No switching between apps.',
  },
]

// --- Structured Data ---
function getStructuredData(trendingSongs) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Lyrics Instagram Story Maker - Create Song Lyrics Status Online Free',
    description: 'Create beautiful Instagram stories and reels from song lyrics in seconds. Free online lyrics status maker.',
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: 'DJYoungster', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'DJYoungster', url: siteUrl },
  }

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Create Instagram/WhatsApp Story/Status from Song Lyrics in Seconds',
    description: 'Learn how to create beautiful Instagram stories, WhatsApp statuses, and video reels from song lyrics using DJYoungster — the free online lyrics status maker.',
    thumbnailUrl: 'https://i.ytimg.com/vi/Rq6wRejgqhw/hqdefault.jpg',
    uploadDate: '2025-01-01',
    contentUrl: 'https://www.youtube.com/watch?v=Rq6wRejgqhw',
    embedUrl: 'https://www.youtube.com/embed/Rq6wRejgqhw',
    publisher: { '@type': 'Organization', name: 'DJYoungster Official' },
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Instagram Story from Song Lyrics',
    description: 'Step-by-step guide to creating beautiful lyrics stories and reels for Instagram, WhatsApp, and more using DJYoungster.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Find your song', text: 'Search for any song on DJYoungster and open the lyrics page.' },
      { '@type': 'HowToStep', position: 2, name: 'Tap Create Story or Create Reel', text: 'Click the Create Story button for an image or Create Reel for an animated video clip.' },
      { '@type': 'HowToStep', position: 3, name: 'Select your favorite lines', text: 'Tap on 2-4 lyrics lines for a story or 2-8 lines for a reel.' },
      { '@type': 'HowToStep', position: 4, name: 'Pick a template', text: 'Choose from 6 beautiful templates with unique color schemes and typography.' },
      { '@type': 'HowToStep', position: 5, name: 'Download and share', text: 'Download the image or video and share it directly to Instagram, WhatsApp, or any social platform.' },
    ],
    tool: { '@type': 'HowToTool', name: 'DJYoungster Lyrics Status Maker (browser-based, no app needed)' },
  }

  return [faqSchema, webPageSchema, videoSchema, howToSchema]
}

// --- Page Component ---
export default async function LyricsInstagramStoryMakerPage() {
  // Fetch trending songs for internal linking
  let trendingSongs = []
  let popularArtists = []
  try {
    ;[trendingSongs, popularArtists] = await Promise.all([
      prisma.song.findMany({
        where: { status: 'published' },
        select: { title: true, slug: true, artists: { select: { artist: { select: { name: true } } }, take: 1 } },
        orderBy: { views: 'desc' },
        take: 8,
      }),
      prisma.artist.findMany({
        select: { name: true, slug: true },
        orderBy: { songs: { _count: 'desc' } },
        take: 6,
      }),
    ])
  } catch (e) {
    // Fallback — page still renders without dynamic links
  }

  const schemas = getStructuredData(trendingSongs)

  const features = [
    { icon: FiCamera, title: 'Story Creator', desc: 'Turn 2-4 lines into a stunning Instagram Story image with beautiful typography and backgrounds.' },
    { icon: FiVideo, title: 'Reel Maker', desc: 'Generate animated 20-30 second video reels with particle effects, perfect for Instagram Reels and TikTok.' },
    { icon: FiLayers, title: '6 Premium Templates', desc: 'Choose from Moody Bloom, Nostalgic, Deep Rose, Elegant Leaf, Soft Dream, and Blush — each uniquely designed.' },
    { icon: FiZap, title: 'Instant Download', desc: 'No sign-up, no app download. Create and download your lyrics status in under 10 seconds from your browser.' },
    { icon: FiSmartphone, title: 'Works Everywhere', desc: 'Use on mobile or desktop. Share to Instagram, WhatsApp, Snapchat, Facebook, YouTube Shorts — anywhere.' },
    { icon: FiShare2, title: 'Multi-Platform Ready', desc: 'Story images sized for IG Stories & WhatsApp Status. Reels exported for Instagram Reels, TikTok & Shorts.' },
  ]

  const steps = [
    { num: '1', title: 'Find Your Song', desc: 'Search for any song on DJYoungster. We have lyrics in Hindi, Punjabi, English, Tamil, Telugu, and more.' },
    { num: '2', title: 'Tap Create Story or Reel', desc: 'Hit the Create Story button for an image, or Create Reel for an animated video clip.' },
    { num: '3', title: 'Select Lyrics Lines', desc: 'Tap your favorite 2-4 lines for a story, or up to 8 lines for a reel.' },
    { num: '4', title: 'Pick a Template', desc: 'Choose from 6 beautiful templates — each with unique colors, fonts, and effects.' },
    { num: '5', title: 'Download & Share', desc: 'Download instantly and post to Instagram, WhatsApp, Snapchat, or anywhere you want.' },
  ]

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/10 to-cyan-500/10 dark:from-purple-600/20 dark:via-pink-500/20 dark:to-cyan-500/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-6">
                <FaInstagram className="w-4 h-4" />
                Free Online Tool — No App Needed
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                Lyrics Instagram Story Maker{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text text-transparent">
                  — Create Song Lyrics Status Online Free
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Turn your favorite song lyrics into beautiful <strong>Instagram Stories</strong>, <strong>WhatsApp Statuses</strong>, and <strong>animated video Reels</strong> in seconds.
                Pick lyrics, choose a template, download — it&apos;s that simple. 100% free, no sign-up required.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/songs"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg shadow-purple-500/25"
                >
                  <FiCamera className="w-5 h-5" />
                  Create Lyrics Story Now
                </Link>
                <Link
                  href="/songs"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 transition shadow-lg shadow-cyan-500/25"
                >
                  <FiVideo className="w-5 h-5" />
                  Create Lyrics Reel
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Works on mobile & desktop — no app download needed
              </p>
            </div>
          </div>
        </section>

        {/* Video Tutorial Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Watch: How to Create Lyrics Status in Seconds
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              See how easy it is to create an <strong>Instagram lyrics story</strong> or <strong>WhatsApp lyrics status</strong> with DJYoungster. No apps, no editing skills — just pick, choose, and share.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 aspect-video">
            <iframe
              src="https://www.youtube.com/embed/Rq6wRejgqhw"
              title="Create Instagram Story from Song Lyrics — DJYoungster Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything You Need to Make Lyrics Status
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              DJYoungster is not just a <strong>lyrics website</strong> — it&apos;s a complete <strong>song lyrics status maker</strong> built for creators who love sharing music on social media.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step How It Works */}
        <section className="bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                How to Create Instagram Story from Song Lyrics
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Creating a <strong>lyrics status for Instagram</strong> or <strong>WhatsApp</strong> takes just 5 simple steps. Here&apos;s how the <strong>lyrics status maker</strong> works:
              </p>
            </div>
            <div className="space-y-6">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {s.num}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{s.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/songs"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg shadow-purple-500/25"
              >
                Try It Now — Browse Songs
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Perfect for Every Social Media Platform
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FaInstagram, platform: 'Instagram Stories & Reels', desc: 'Create eye-catching lyrics stories and animated reels sized perfectly for Instagram. Stand out in your followers\' feeds.' },
              { icon: FaWhatsapp, platform: 'WhatsApp Status', desc: 'Make beautiful song lyrics statuses for WhatsApp. Share your mood through music with contacts.' },
              { icon: FaYoutube, platform: 'YouTube Shorts & TikTok', desc: 'Export animated lyrics video clips ideal for YouTube Shorts and TikTok. Grow your audience with music content.' },
            ].map((p, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <p.icon className="w-10 h-10 mx-auto text-slate-700 dark:text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{p.platform}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Try With Popular Songs — Internal Links */}
        {trendingSongs.length > 0 && (
          <section className="bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Try Creating Lyrics Status with Trending Songs
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  Pick a song below and create your first <strong>lyrics Instagram story</strong> or <strong>reel</strong> right now.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingSongs.map((song, i) => {
                  const artistName = song.artists?.[0]?.artist?.name
                  return (
                    <Link
                      key={i}
                      href={`/song/${song.slug}`}
                      className="group bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FiMusic className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                          {song.title}
                        </span>
                      </div>
                      {artistName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{artistName}</p>
                      )}
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Create Status <FiChevronRight className="w-3 h-3" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Browse by Artists — Internal Links */}
        {popularArtists.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Create Lyrics Status by Artist
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Browse lyrics by your favorite artists and create stunning <strong>song lyrics stories</strong> and <strong>reels</strong>.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {popularArtists.map((a, i) => (
                <Link
                  key={i}
                  href={`/artist/${a.slug}`}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:text-primary transition shadow-sm"
                >
                  {a.name}
                </Link>
              ))}
              <Link
                href="/artists"
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-full text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-sm"
              >
                View All Artists
              </Link>
            </div>
          </section>
        )}

        {/* Why Use DJYoungster Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Why Use DJYoungster as Your Lyrics Status Maker?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              If you&apos;ve ever wanted to share a powerful song lyric on your Instagram story or WhatsApp status but didn&apos;t know how to make it look good — DJYoungster solves that problem.
              Our <strong className="text-slate-800 dark:text-slate-200">free lyrics Instagram story maker</strong> lets you turn any song lyrics into a professionally designed image or animated video in seconds, without downloading any app.
            </p>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Whether you&apos;re looking for <Link href="/languages" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Punjabi lyrics</Link>, <Link href="/languages" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Bollywood song lyrics</Link>, <Link href="/languages" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Tamil lyrics</Link>, or <Link href="/languages" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">English song lyrics</Link>,
              DJYoungster has a growing library across 10+ languages. Every song page comes with the built-in <strong className="text-slate-800 dark:text-slate-200">lyrics story creator</strong> and <strong className="text-slate-800 dark:text-slate-200">reel maker</strong> — so you never need to switch between apps or use complicated editing tools.
            </p>
          </div>

          {/* How It Works Detail Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 sm:p-8 border border-purple-100 dark:border-purple-800/40">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center">
                <FiCamera className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">How the Lyrics Instagram Story Maker Works</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Our lyrics status creator is designed to be fast and intuitive. When you visit any <Link href="/songs" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">song lyrics page</Link> on DJYoungster, you&apos;ll see two buttons:
                <strong className="text-slate-800 dark:text-slate-200"> Create Story</strong> and <strong className="text-slate-800 dark:text-slate-200">Create Reel</strong>.
              </p>
              <div className="space-y-2.5">
                {[
                  'Tap to activate selection mode',
                  'Select 2-4 lines for stories, up to 8 for reels',
                  'Choose from 6 premium templates',
                  'Generated in-browser — nothing uploaded to servers',
                  'Your creation is private and instant',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 sm:p-8 border border-cyan-100 dark:border-cyan-800/40">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 flex items-center justify-center">
                <FiVideo className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Create Lyrics Reels for Instagram & TikTok</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Video content gets 2x more engagement than images on Instagram. That&apos;s why DJYoungster includes a <strong className="text-slate-800 dark:text-slate-200">lyrics reel maker</strong> that generates animated video clips from lyrics with smooth text animations, particle effects, and transitions.
              </p>
              <div className="space-y-2.5">
                {[
                  { platform: 'Instagram Reels', color: 'from-pink-500 to-purple-500' },
                  { platform: 'YouTube Shorts', color: 'from-red-500 to-red-600' },
                  { platform: 'TikTok', color: 'from-slate-800 to-slate-900 dark:from-slate-300 dark:to-slate-400' },
                  { platform: 'Snapchat Spotlight', color: 'from-yellow-400 to-yellow-500' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
                      <FiPlay className="w-2.5 h-2.5 text-white dark:text-slate-900" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.platform}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No watermark restrictions — just your favorite lyrics in a beautiful animated format.
              </p>
            </div>
          </div>

          {/* Story Templates Showcase */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Story Templates Available</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Each template features unique color palettes, typography, and effects</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Moody Bloom', desc: 'Dark, atmospheric tones for emotional and deep lyrics', gradient: 'from-slate-800 via-purple-900 to-slate-900', textColor: 'text-purple-300', icon: FiMoon },
                { name: 'Nostalgic', desc: 'Warm, vintage feel for classic and romantic songs', gradient: 'from-amber-700 via-orange-800 to-amber-900', textColor: 'text-amber-200', icon: FiStar },
                { name: 'Deep Rose', desc: 'Rich pink and red gradients for love songs', gradient: 'from-rose-600 via-pink-700 to-rose-800', textColor: 'text-rose-200', icon: FiHeart },
                { name: 'Elegant Leaf', desc: 'Fresh green tones for upbeat and positive lyrics', gradient: 'from-emerald-600 via-green-700 to-teal-800', textColor: 'text-emerald-200', icon: FiFeather },
                { name: 'Soft Dream', desc: 'Pastel and dreamy for soft, aesthetic stories', gradient: 'from-violet-400 via-pink-300 to-sky-300', textColor: 'text-violet-900', icon: FiSun },
                { name: 'Blush', desc: 'Light and minimalist for clean, modern looks', gradient: 'from-pink-200 via-rose-100 to-pink-200', textColor: 'text-pink-800', icon: FiDroplet },
              ].map((t, i) => (
                <div key={i} className="group relative">
                  <div className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${t.gradient} p-4 flex flex-col justify-between shadow-md group-hover:shadow-xl transition-shadow overflow-hidden`}>
                    <div className="relative z-10">
                      <t.icon className={`w-5 h-5 ${t.textColor} opacity-70 mb-2`} />
                    </div>
                    <div className="relative z-10">
                      <div className={`w-full h-[2px] ${t.textColor} opacity-20 mb-2`}></div>
                      <div className={`w-3/4 h-[2px] ${t.textColor} opacity-20 mb-2`}></div>
                      <div className={`w-5/6 h-[2px] ${t.textColor} opacity-20 mb-3`}></div>
                      <p className={`text-[10px] sm:text-xs font-semibold ${t.textColor}`}>{t.name}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Than Just a Status Maker */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 mb-16">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center flex-shrink-0">
                <FiStar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">More Than Just a Status Maker</h3>
                <p className="mt-1 text-slate-600 dark:text-slate-400">DJYoungster is a complete lyrics platform. Beyond the story and reel creator, every song page gives you:</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { text: <><Link href="/songs" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Accurate, verified lyrics</Link> with proper formatting</>, icon: FiCheck },
                { text: <><strong className="text-slate-800 dark:text-slate-200">Romanized lyrics</strong> — sing along even if you don&apos;t read the original script</>, icon: FiGlobe },
                { text: <><strong className="text-slate-800 dark:text-slate-200">English translations</strong> to understand the meaning</>, icon: FiGlobe },
                { text: <><strong className="text-slate-800 dark:text-slate-200">Song meaning & interpretation</strong> — deep analysis of the lyrics</>, icon: FiStar },
                { text: <><strong className="text-slate-800 dark:text-slate-200">Annotations</strong> — line-by-line explanations of wordplay and cultural references</>, icon: FiLayers },
                { text: <>Full <strong className="text-slate-800 dark:text-slate-200">song credits</strong> — singer, lyricist, composer, music director, and more</>, icon: FiMusic },
                { text: <>Links to <Link href="/albums" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">albums</Link>, <Link href="/movies" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">movies</Link>, and <Link href="/artists" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">artist pages</Link></>, icon: FiShare2 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5">
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Supported Languages for Lyrics Status</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              DJYoungster supports lyrics in multiple Indian and international languages. Create lyrics stories and reels from songs in:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { lang: 'Hindi', desc: 'Bollywood songs, indie Hindi music', emoji: '🇮🇳' },
              { lang: 'Punjabi', desc: 'Punjabi pop, Bhangra, Sad songs', emoji: '🎵' },
              { lang: 'English', desc: 'International pop, hip-hop, R&B', emoji: '🌍' },
              { lang: 'Tamil', desc: 'Kollywood, Tamil indie', emoji: '🎶' },
              { lang: 'Telugu', desc: 'Tollywood songs', emoji: '🎬' },
              { lang: 'Bhojpuri & More', desc: 'Bhojpuri, Haryanvi & regional hits', emoji: '🎤' },
            ].map((l, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">{l.emoji}</span>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{l.lang}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{l.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Each language also has <strong className="text-slate-800 dark:text-slate-200">romanized versions</strong> available, so even if you can&apos;t read Gurmukhi, Devanagari, or Tamil script,
            you can still find, read, and create statuses from your favorite songs. <Link href="/languages" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Browse lyrics by language</Link>.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-slate-800 dark:text-white font-medium hover:text-purple-600 dark:hover:text-purple-400 transition list-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <FiChevronRight className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-90 flex-shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Ready to Create Your First Lyrics Status?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Browse thousands of songs, pick your favorite lines, and create stunning Instagram stories and reels — all for free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/songs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg shadow-purple-500/25"
            >
              <FiMusic className="w-5 h-5" />
              Browse Songs
            </Link>
            <Link
              href="/request-song"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-lg hover:border-purple-400 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition"
            >
              Can&apos;t Find a Song? Request It
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
