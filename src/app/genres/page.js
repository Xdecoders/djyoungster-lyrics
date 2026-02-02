import { prisma } from '@/lib/prisma'
import GenresPageClient from './GenresPageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
export const dynamic = 'force-dynamic'

// Fetch initial data for SSR
async function getGenresPageData() {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: { select: { songs: true } }
      },
      orderBy: { name: 'asc' }
    })

    return { genres }
  } catch (error) {
    console.error('Error fetching genres page data:', error)
    return { genres: [] }
  }
}

export async function generateMetadata() {
  const seo = await getSeoSettings('genres')
  const siteSettings = await getSiteSettings()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  // Use page-specific OG image, fall back to global, then default
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: `${siteUrl}/genres`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Genres',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/genres`,
    },
  }
}

export default async function GenresPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  // Fetch data on server
  const data = await getGenresPageData()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'All Genres', url: '/genres' }
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Genres - Music Genres Collection',
    url: `${siteUrl}/genres`,
    description: 'Browse songs by music genre on DJYoungster. Find Pop, Rock, Hip-Hop, Classical, Romantic, Sad songs and more with lyrics.',
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
      <GenresPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
