import { prisma } from '@/lib/prisma'
import SongsPageClient from './SongsPageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

export async function generateMetadata() {
  const seo = await getSeoSettings('songs')
  const siteSettings = await getSiteSettings()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: `${siteUrl}/songs`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Songs',
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
      canonical: `${siteUrl}/songs`,
    },
  }
}

// Fetch data for SSR based on search params
async function getSongsPageData(searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const categorySlug = searchParams?.category || ''
  const limit = 18
  const skip = (page - 1) * limit

  try {
    // Build where clause
    let where = { status: 'published' }

    // Filter by category if provided
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true }
      })
      if (category) {
        where.categories = { some: { categoryId: category.id } }
      }
    }

    // Build orderBy based on sort
    let orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }
    else if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    const [songs, total, categories] = await Promise.all([
      prisma.song.findMany({
        where,
        include: {
          artists: {
            include: {
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          album: { select: { id: true, title: true, slug: true, coverImage: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where }),
      prisma.category.findMany({
        include: {
          _count: { select: { songs: true } }
        },
        orderBy: { name: 'asc' }
      })
    ])

    return {
      songs,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching songs page data:', error)
    return {
      songs: [],
      categories: [],
      pagination: { page: 1, limit: 18, total: 0, totalPages: 0 }
    }
  }
}

export default async function SongsPage({ searchParams }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const params = await searchParams

  // Fetch data on server with search params
  const data = await getSongsPageData(params)

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'All Songs', url: '/songs' }
  ])

  // Collection page schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Songs - Song Lyrics Collection',
    url: `${siteUrl}/songs`,
    description: 'Browse all song lyrics on DJYoungster. Find Hindi, Punjabi, English, Tamil, Telugu and more language songs with complete lyrics.',
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
      <SongsPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
