import { prisma } from '@/lib/prisma'
import GenresPageClient from './GenresPageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

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
  const [seo, siteSettings, topGenres, totalGenres] = await Promise.all([
    getSeoSettings('genres'),
    getSiteSettings(),
    prisma.genre.findMany({
      where: { songs: { some: {} } },
      select: { name: true },
      orderBy: { songs: { _count: 'desc' } },
      take: 5,
    }),
    prisma.genre.count({ where: { songs: { some: {} } } }),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  // Build description from real genre names so it never lies about what exists
  const genreNames = topGenres.map(g => g.name)
  let description
  if (genreNames.length === 0) {
    description = 'Browse music genres on DJYoungster. Find complete song lyrics with English translations and Hindi/Punjabi versions.'
  } else if (totalGenres <= genreNames.length) {
    const last = genreNames[genreNames.length - 1]
    const rest = genreNames.slice(0, -1)
    const list = rest.length > 0 ? `${rest.join(', ')} and ${last}` : last
    description = `Browse ${totalGenres} music genre${totalGenres !== 1 ? 's' : ''} on DJYoungster — ${list}. Find complete song lyrics with English translations and Hindi/Punjabi versions.`
  } else {
    description = `Browse ${totalGenres} music genres on DJYoungster including ${genreNames.join(', ')} and more. Find complete song lyrics with English translations and Hindi/Punjabi versions.`
  }

  const keywords = genreNames.length > 0
    ? `${genreNames.map(n => `${n} songs`).join(', ')}, music genres, song lyrics, DJYoungster`
    : 'music genres, song lyrics, DJYoungster'

  return {
    title: seo.metaTitle,
    description,
    keywords,
    openGraph: {
      title: seo.ogTitle,
      description,
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
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: {
      canonical: `${siteUrl}/genres`,
    },
    robots: {
      index: true,
      follow: true,
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

  const genreNameList = data.genres.map(g => g.name)
  const schemaDesc = genreNameList.length > 0
    ? `Browse songs by music genre on DJYoungster. Find ${genreNameList.slice(0, 5).join(', ')} songs and more with lyrics.`
    : 'Browse songs by music genre on DJYoungster. Find complete song lyrics with English translations.'

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Genres - Music Genres Collection',
    url: `${siteUrl}/genres`,
    description: schemaDesc,
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
