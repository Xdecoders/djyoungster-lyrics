import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateArtistSchema, generateBreadcrumbSchema } from '@/lib/schema'
import ArtistPageClient from './ArtistPageClient'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true, albums: true } }
      }
    })

    if (!artist) {
      return {
        title: 'Artist Not Found | DJYoungster',
        description: 'The artist you are looking for does not exist.',
      }
    }

    const title = artist.metaTitle || `${artist.name} Songs Lyrics with English Translation - DJYoungster`
    const description = artist.metaDescription ||
      `${artist.name} through his song lyrics and meanings. Djyoungster provides ${artist.name} lyrics in English Translation, Hindi and Punjabi language variations.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/artist/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(artist.imageUrl) || `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        artist.name,
        `${artist.name} songs`,
        `${artist.name} lyrics`,
        `${artist.name} albums`,
        'lyrics',
        'songs',
        'music',
      ].join(', '),
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'profile',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: artist.name,
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
      title: 'Artist | DJYoungster',
      description: 'Find artist songs and lyrics on DJYoungster.',
    }
  }
}

// Fetch artist data for SSR with searchParams
async function getArtistData(slug, searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const genreSlug = searchParams?.genre || ''
  const limit = 20
  const skip = (page - 1) * limit

  try {
    // Fetch the artist with basic info
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        albums: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            releaseDate: true,
          },
          orderBy: { releaseDate: 'desc' }
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!artist) return null

    // Build where clause
    let songWhere = {
      artists: { some: { artistId: artist.id } },
      status: 'published'
    }

    // Filter by genre if provided
    if (genreSlug) {
      const genre = await prisma.genre.findUnique({
        where: { slug: genreSlug },
        select: { id: true }
      })
      if (genre) {
        songWhere.genres = { some: { genreId: genre.id } }
      }
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }
    else if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    // Fetch songs (with pagination)
    const [songs, totalSongs] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
        include: {
          artists: {
            include: {
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          genres: {
            include: {
              genre: { select: { id: true, name: true, slug: true } }
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

    // Get all genres for this artist's songs (for filter dropdown)
    const artistGenres = await prisma.genre.findMany({
      where: {
        songs: {
          some: {
            song: {
              artists: { some: { artistId: artist.id } }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { songs: true } }
      }
    })

    // Get featured/popular songs (top 5 by views)
    const featuredSongs = await prisma.song.findMany({
      where: {
        artists: { some: { artistId: artist.id } },
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
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
      artist: { ...artist, totalSongs },
      songs,
      featuredSongs,
      genres: artistGenres,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching artist data:', error)
    return null
  }
}

export default async function ArtistPage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams

  // Fetch artist data on server
  const data = await getArtistData(slug, searchParamsResolved)

  if (!data || !data.artist) {
    notFound()
  }

  const { artist } = data

  // Generate structured data
  const artistSchema = generateArtistSchema(artist)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Artists', url: '/artists' },
    { name: artist.name, url: `/artist/${artist.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      {artistSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artistSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ArtistPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
