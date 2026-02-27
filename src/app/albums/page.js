import { prisma } from '@/lib/prisma'
import AlbumsPageClient from './AlbumsPageClient'
import PaginationHead from '@/components/PaginationHead'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Fetch data for SSR based on search params
async function getAlbumsPageData(searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const limit = 24
  const skip = (page - 1) * limit

  try {
    // Build orderBy based on sort
    let orderBy = { createdAt: 'desc' }
    if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    const [rawAlbums, total] = await Promise.all([
      prisma.album.findMany({
        include: {
          artist: { select: { id: true, name: true, slug: true } },
          _count: { select: { songs: true } },
          songs: {
            select: { coverImage: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.album.count()
    ])

    // Add thumbnail fallback from latest song cover
    const albums = rawAlbums.map(album => {
      const { songs, ...rest } = album
      const latestCover = songs?.[0]?.coverImage || null
      return { ...rest, thumbnail: latestCover }
    })

    return {
      albums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching albums page data:', error)
    return {
      albums: [],
      pagination: { page: 1, limit: 24, total: 0, totalPages: 0 }
    }
  }
}

export async function generateMetadata() {
  const seo = await getSeoSettings('albums')
  const siteSettings = await getSiteSettings()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  // Use page-specific OG image, fall back to global, then default
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: `${siteUrl}/albums`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Albums',
        },
      ],
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: {
      canonical: `${siteUrl}/albums`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function AlbumsPage({ searchParams }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const params = await searchParams

  // Fetch data on server with search params
  const data = await getAlbumsPageData(params)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'All Albums', url: '/albums' }
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Albums - Music Albums Collection',
    url: `${siteUrl}/albums`,
    description: 'Browse all music albums on DJYoungster. Find album tracklists, song lyrics, and release information.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DJYoungster',
      url: siteUrl
    }
  }

  return (
    <>
      <PaginationHead
        basePath="/albums"
        currentPage={data.pagination.page}
        totalPages={data.pagination.totalPages}
        searchParams={params}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <AlbumsPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
