import { prisma } from '@/lib/prisma'
import ArtistsPageClient from './ArtistsPageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Fetch data for SSR based on search params
async function getArtistsPageData(searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'popular'
  const limit = 24
  const skip = (page - 1) * limit

  try {
    // Build orderBy based on sort
    let orderBy = { songs: { _count: 'desc' } }
    if (sort === 'alphabetical') orderBy = { name: 'asc' }
    else if (sort === 'latest') orderBy = { createdAt: 'desc' }

    const [rawArtists, total] = await Promise.all([
      prisma.artist.findMany({
        include: {
          _count: { select: { songs: true } },
          songs: {
            select: {
              song: {
                select: { coverImage: true }
              }
            },
            orderBy: { song: { createdAt: 'desc' } },
            take: 1,
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.artist.count()
    ])

    // Add thumbnail fallback from latest song cover
    const artists = rawArtists.map(artist => {
      const { songs, ...rest } = artist
      const latestCover = songs?.[0]?.song?.coverImage || null
      return { ...rest, thumbnail: latestCover }
    })

    return {
      artists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching artists page data:', error)
    return {
      artists: [],
      pagination: { page: 1, limit: 24, total: 0, totalPages: 0 }
    }
  }
}

export async function generateMetadata() {
  const seo = await getSeoSettings('artists')
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
      url: `${siteUrl}/artists`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Artists',
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
      canonical: `${siteUrl}/artists`,
    },
  }
}

export default async function ArtistsPage({ searchParams }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const params = await searchParams

  // Fetch data on server with search params
  const data = await getArtistsPageData(params)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'All Artists', url: '/artists' }
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Artists - Music Artists Directory',
    url: `${siteUrl}/artists`,
    description: 'Browse all music artists on DJYoungster. Find your favorite singers, bands, and musicians with their complete song lyrics collection.',
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
      <ArtistsPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
