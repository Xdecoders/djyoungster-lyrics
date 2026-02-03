import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import GenrePageClient from './GenrePageClient'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true } }
      }
    })

    if (!genre) {
      return {
        title: 'Genre Not Found | DJYoungster',
        description: 'The genre you are looking for does not exist.',
      }
    }

    // Capitalize genre name for display
    const capitalizedName = genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
    const title = genre.metaTitle || `${capitalizedName} Songs Lyrics with English Translation - DJYoungster`
    const description = genre.metaDescription ||
      `Explore ${capitalizedName} song lyrics and meanings. Djyoungster provides ${capitalizedName} lyrics in English Translation, Hindi and Punjabi language variations.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/genre/${slug}`
    const imageUrl = `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        genre.name,
        `${genre.name} songs`,
        `${genre.name} lyrics`,
        `${genre.name} music`,
        'lyrics',
        'songs',
        'music',
      ].join(', '),
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${genre.name} Songs`,
          },
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@djyoungstercom',
        site: '@djyoungstercom',
      },
      alternates: {
        canonical: pageUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Genre | DJYoungster',
      description: 'Browse songs by genre on DJYoungster.',
    }
  }
}

// Fetch genre data for SSR with searchParams
async function getGenreData(slug, searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        metaDescription: true
      }
    })

    if (!genre) return null

    const songWhere = {
      genres: { some: { genreId: genre.id } },
      status: 'published'
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }
    else if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    const [songs, totalSongs] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
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
      prisma.song.count({ where: songWhere })
    ])

    // Get featured songs
    const featuredSongs = await prisma.song.findMany({
      where: songWhere,
      include: {
        artists: {
          include: {
            artist: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    return {
      genre: { ...genre, totalSongs },
      songs,
      featuredSongs,
      pagination: {
        page,
        limit,
        total: totalSongs,
        totalPages: Math.ceil(totalSongs / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching genre data:', error)
    return null
  }
}

export default async function GenrePage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams

  // Fetch genre data on server
  const data = await getGenreData(slug, searchParamsResolved)

  if (!data || !data.genre) {
    notFound()
  }

  const { genre, songs } = data

  // Generate structured data
  const collectionSchema = generateCollectionPageSchema(genre, 'genre', songs)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Genres', url: '/genres' },
    { name: genre.name, url: `/genre/${genre.slug}` }
  ])

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <GenrePageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
