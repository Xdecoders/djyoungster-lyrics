import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import HomeContent from './HomeContent'
import HomeContentV2 from './HomeContentV2'
import AboutSection from './AboutSection'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateWebSiteSchema, generateOrganizationSchema, generateFAQSchema } from '@/lib/schema'

// ISR — rebuild page at most every 5 minutes
// Between rebuilds every visitor gets the pre-built HTML instantly (CDN/edge cache)
export const revalidate = 300

// ─── Deduplicate SEO calls within a single render ───────────────────────────
// React cache() memoises per request — generateMetadata + getHomepageData
// can both call these without hitting the DB twice in the same render cycle.
const getHomepageSeo      = cache(() => getSeoSettings('homepage'))
const getGlobalSettings   = cache(() => getSiteSettings())

// ─── Data-layer cache with unstable_cache ────────────────────────────────────
// Caches the Prisma query results in Next.js Data Cache independently of the
// page HTML cache. Even when the page ISR window expires, the data may still
// be served from this cache — no cold DB hit needed.
const FALLBACK_FAQS = [
  {
    question: 'What is DJYoungster?',
    answer: 'DJYoungster is a comprehensive lyrics platform where you can find song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more. We provide accurate lyrics, artist information, album details, music streaming links, and an innovative Instagram Story creator all in one place.'
  },
  {
    question: 'How can I search for lyrics on DJYoungster?',
    answer: 'Simply use the search bar at the top of the page to search by song title, artist name, album, or even a few words from the lyrics. DJYoungster\'s smart search will help you find the exact song you\'re looking for.'
  },
  {
    question: 'Can I create Instagram Stories with lyrics on DJYoungster?',
    answer: 'Yes! DJYoungster features a unique Instagram Story creator that allows you to select your favorite lyrics (2-4 lines) from any song and generate beautiful, shareable story images. Choose from multiple stunning templates including Sad, Happy, Romantic, and Neon styles. Simply click the "Create Story" button on any song page, select your lines, preview with different templates, and download or share directly to Instagram.'
  },
  {
    question: 'What is the IG Reel Creator on DJYoungster?',
    answer: 'The IG Reel Creator is DJYoungster\'s innovative tool that lets you turn your favorite song lyrics into animated video clips perfect for Instagram Reels, TikTok, and YouTube Shorts. Select 2-4 lines from any song, choose from stunning animated templates, and download a ready-to-share video clip. It\'s completely free and a great way to express yourself through music on social media.'
  },
  {
    question: 'Is DJYoungster free to use?',
    answer: 'Yes! DJYoungster is completely free to use. You can browse, search, and read unlimited lyrics, create Instagram story images, and access all features without any subscription or hidden charges.'
  },
  {
    question: 'How often is DJYoungster updated?',
    answer: 'We update DJYoungster regularly with new song releases, trending tracks, and classic favorites. Our team works to add the latest lyrics as soon as songs are released, ensuring you always have access to fresh content.'
  },
  {
    question: 'Can I request lyrics on DJYoungster?',
    answer: 'Absolutely! If you can\'t find a song on DJYoungster, you can contact us through our contact page and we\'ll do our best to add it to our collection within 24-48 hours.'
  },
  {
    question: 'Does DJYoungster provide lyrics in multiple languages?',
    answer: 'Yes! DJYoungster offers lyrics in multiple formats: original lyrics, romanized/transliterated versions for easier reading, and English translations. We support Hindi, Punjabi, Tamil, Telugu, Bhojpuri, Haryanvi, English, and many more regional Indian languages to help you understand and enjoy music from diverse cultures.'
  }
]

const songSelectFields = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  views: true,
  createdAt: true,
  artists: {
    select: { artist: { select: { id: true, name: true, slug: true, imageUrl: true } } }
  },
  album: {
    select: { id: true, title: true, slug: true, coverImage: true }
  }
}

// Cached at data layer — revalidated by tag 'homepage' or after 5 min
const getHomepageData = unstable_cache(
  async () => {
    try {
      const catQuery = (slug) => prisma.song.findMany({
        where: { status: 'published', categories: { some: { category: { slug } } } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: songSelectFields
      })

      const [
        latestSongs, instagramViralSongs,
        hindiSongs, punjabiSongs, englishSongs, teluguSongs, tamilSongs,
        chartSongs,
        recentBlogPosts,
        siteSettings, aboutPage, faqPage
      ] = await Promise.all([
        prisma.song.findMany({
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: songSelectFields
        }),
        prisma.song.findMany({
          where: { status: 'published', categories: { some: { category: { slug: 'instagram-viral' } } } },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: songSelectFields
        }),
        catQuery('hindi'),
        catQuery('punjabi'),
        catQuery('english'),
        catQuery('telugu'),
        catQuery('tamil'),
        prisma.song.findMany({
          where: { status: 'published' },
          orderBy: { views: 'desc' },
          take: 10,
          select: songSelectFields
        }),
        prisma.blogPost.findMany({
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          take: 6,
          select: {
            id: true, title: true, slug: true, excerpt: true,
            coverImage: true, readTime: true, publishedAt: true, author: true,
            blogCategory: { select: { name: true, color: true, slug: true } },
          }
        }),
        getSiteSettings(),
        prisma.page.findUnique({ where: { slug: 'homepage-about' } }),
        prisma.page.findUnique({ where: { slug: 'homepage-faq' } }),
      ])

      let parsedFaqs = FALLBACK_FAQS
      if (faqPage?.content) {
        try { parsedFaqs = JSON.parse(faqPage.content) } catch { parsedFaqs = FALLBACK_FAQS }
      }

      return {
        latestSongs,
        instagramViralSongs,
        hindiSongs,
        punjabiSongs,
        englishSongs,
        teluguSongs,
        tamilSongs,
        chartSongs,
        recentBlogPosts,
        aboutHtml: aboutPage?.content || null,
        faqs: parsedFaqs,
        siteSettings: {
          heroHeading:    siteSettings.heroHeading    || 'Discover Your Favorite *Song Lyrics*',
          heroDescription: siteSettings.heroDescription || 'Your trusted source for verified song lyrics in Hindi, Punjabi, English, Tamil & Telugu. Get accurate lyrics with translations and create beautiful Instagram stories for free!'
        }
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      return {
        latestSongs: [], instagramViralSongs: [],
        hindiSongs: [], punjabiSongs: [], englishSongs: [], teluguSongs: [], tamilSongs: [],
        chartSongs: [], recentBlogPosts: [],
        aboutHtml: null, faqs: FALLBACK_FAQS,
        siteSettings: {
          heroHeading:     'Discover Your Favorite *Song Lyrics*',
          heroDescription: 'Your trusted source for verified song lyrics in Hindi, Punjabi, English, Tamil & Telugu. Get accurate lyrics with translations and create beautiful Instagram stories for free!'
        }
      }
    }
  },
  ['homepage-data'],                          // cache key
  { revalidate: 300, tags: ['homepage'] }     // 5 min TTL + tag for on-demand revalidation
)

// ─── V2 homepage data (blog/entertainment only) ───────────────────────────────
const getHomepageV2Data = unstable_cache(
  async () => {
    try {
      const [blogPosts, blogCategories] = await Promise.all([
        prisma.blogPost.findMany({
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          select: {
            id: true, title: true, slug: true, excerpt: true,
            coverImage: true, readTime: true, publishedAt: true,
            author: true, isFeatured: true,
            blogCategory: { select: { id: true, name: true, color: true, slug: true } },
          }
        }),
        prisma.blogCategory.findMany({
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true, color: true },
        }),
      ])
      return { blogPosts, blogCategories }
    } catch (error) {
      console.error('Error fetching V2 homepage data:', error)
      return { blogPosts: [], blogCategories: [] }
    }
  },
  ['homepage-v2-data'],
  { revalidate: 300, tags: ['homepage'] }
)

// ─── Read active homepage layout (not cached — controls which branch to take) ─
async function getActiveHomepage() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'homepage-layout' }
    })
    if (settings?.metaKeywords) {
      const parsed = JSON.parse(settings.metaKeywords)
      return parsed.activeHomepage || 'v1'
    }
  } catch {}
  return 'v1'
}

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata() {
  // Reuses the same request-scoped memoised calls — no extra DB round-trips
  const [seo, siteSettings] = await Promise.all([
    getHomepageSeo(),
    getGlobalSettings(),
  ])

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || 'https://djyoungster.com/uploads/1769674444129-djyoungster.webp'

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: siteUrl,
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'DJYoungster - Song Lyrics' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: { canonical: siteUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  const websiteSchema      = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()

  const activeHomepage = await getActiveHomepage()

  if (activeHomepage === 'v2') {
    const v2Data = await getHomepageV2Data()
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <HomeContentV2 data={v2Data} />
      </>
    )
  }

  // V1 — default lyrics homepage
  const data      = await getHomepageData()
  const faqSchema = generateFAQSchema(data.faqs)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <HomeContent data={data} siteSettings={data.siteSettings} />
      <AboutSection faqs={data.faqs} aboutHtml={data.aboutHtml} />
    </>
  )
}
