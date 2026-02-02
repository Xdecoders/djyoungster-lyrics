import { prisma } from '@/lib/prisma'
import LanguagesPageClient from './LanguagesPageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

// Fetch initial data for SSR
async function getLanguagesPageData() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { songs: true } }
      },
      orderBy: { name: 'asc' }
    })

    return { categories }
  } catch (error) {
    console.error('Error fetching languages page data:', error)
    return { categories: [] }
  }
}

export async function generateMetadata() {
  const seo = await getSeoSettings('languages')
  const siteSettings = await getSiteSettings()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  return {
    title: seo.metaTitle || 'Browse Songs by Language | DJYoungster',
    description: seo.metaDescription || 'Explore song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu and more on DJYoungster.',
    keywords: seo.metaKeywords || 'Hindi songs, Punjabi songs, English songs, Tamil songs, Telugu songs, song lyrics by language',
    openGraph: {
      title: seo.ogTitle || 'Browse Songs by Language | DJYoungster',
      description: seo.ogDescription || 'Explore song lyrics in multiple languages on DJYoungster.',
      url: `${siteUrl}/languages`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Languages',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || 'Browse Songs by Language | DJYoungster',
      description: seo.ogDescription || 'Explore song lyrics in multiple languages on DJYoungster.',
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/languages`,
    },
  }
}

export default async function LanguagesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  // Fetch data on server
  const data = await getLanguagesPageData()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Languages', url: '/languages' }
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Browse Songs by Language',
    url: `${siteUrl}/languages`,
    description: 'Browse songs by language on DJYoungster. Find Hindi, Punjabi, English, Tamil, Telugu songs and more with lyrics.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DJYoungster',
      url: siteUrl
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <LanguagesPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
