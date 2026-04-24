import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import HomeContent from './HomeContent'
import HomeContentV2 from './HomeContentV2'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateWebSiteSchema, generateOrganizationSchema } from '@/lib/schema'

// ISR — rebuild page at most every 5 minutes
// Between rebuilds every visitor gets the pre-built HTML instantly (CDN/edge cache)
export const revalidate = 300

// ─── Deduplicate SEO calls within a single render ───────────────────────────
// React cache() memoises per request — generateMetadata + getHomepageData
// can both call these without hitting the DB twice in the same render cycle.
const getHomepageSeo      = cache(() => getSeoSettings('homepage'))
const getGlobalSettings   = cache(() => getSiteSettings())

// Cached at data layer — revalidated by tag 'homepage' or after 5 min
const getHomepageData = unstable_cache(
  async () => {
    try {
      const recentBlogPosts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImage: true, readTime: true, publishedAt: true, author: true,
          blogCategory: { select: { name: true, color: true, slug: true } },
        }
      })
      return { recentBlogPosts }
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      return { recentBlogPosts: [] }
    }
  },
  ['homepage-data'],
  { revalidate: 300, tags: ['homepage'] }
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
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'DJYoungster - Music News & Updates' }],
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

  const data = await getHomepageData()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <HomeContent data={data} />
    </>
  )
}
