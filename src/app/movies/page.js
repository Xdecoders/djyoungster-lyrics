import { prisma } from '@/lib/prisma'
import MoviesPageClient from './MoviesPageClient'
import PaginationHead from '@/components/PaginationHead'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Fetch data for SSR based on search params
async function getMoviesPageData(searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const limit = 24
  const skip = (page - 1) * limit

  try {
    // Build orderBy based on sort
    let orderBy = { createdAt: 'desc' }
    if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'year') orderBy = { year: 'desc' }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          year: true,
          posterUrl: true,
          songs: {
            select: { coverImage: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: { select: { songs: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.movie.count()
    ])

    return {
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching movies page data:', error)
    return {
      movies: [],
      pagination: { page: 1, limit: 24, total: 0, totalPages: 0 }
    }
  }
}

export async function generateMetadata() {
  const seo = await getSeoSettings('movies')
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
      url: `${siteUrl}/movies`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster Movies',
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
      canonical: `${siteUrl}/movies`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function MoviesPage({ searchParams }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const params = await searchParams

  // Fetch data on server with search params
  const data = await getMoviesPageData(params)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'All Movies', url: '/movies' }
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Movies - Movie Soundtracks Collection',
    url: `${siteUrl}/movies`,
    description: 'Browse all movie soundtracks on DJYoungster. Find complete movie song lists with lyrics from Bollywood, Hollywood, and regional cinema.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DJYoungster',
      url: siteUrl
    }
  }

  return (
    <>
      <PaginationHead
        basePath="/movies"
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
      <MoviesPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
