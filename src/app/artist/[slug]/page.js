import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateArtistSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import PaginationHead from '@/components/PaginationHead'
import ArtistPageClient from './ArtistPageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all artists at build time
export async function generateStaticParams() {
  const artists = await prisma.artist.findMany({
    select: { slug: true }
  })
  return artists.map(artist => ({ slug: artist.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: { where: { song: { status: 'published' } } }, albums: true } },
        songs: { orderBy: { song: { createdAt: 'desc' } }, take: 1, select: { song: { select: { coverImage: true } } } }
      }
    })

    if (!artist) {
      return {
        title: 'Artist Not Found | DJYoungster',
        description: 'The artist you are looking for does not exist.',
      }
    }

    const artistName = toTitleCase(artist.name)
    const songCount = artist._count?.songs || 0
    const title = artist.metaTitle || `${artistName} All Songs Lyrics & Discography - DJYoungster`
    const description = artist.metaDescription ||
      `Explore ${artistName} complete discography with ${songCount} songs. Read ${artistName} all songs lyrics with English translation, Hindi and Punjabi variations on DJYoungster.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/artist/${slug}`
    // Convert relative image URL to absolute URL
    const latestSongImage = artist.songs?.[0]?.song?.coverImage
    const imageUrl = getAbsoluteUrl(artist.imageUrl) || getAbsoluteUrl(latestSongImage) || 'https://djyoungster.com/uploads/1769674444129-djyoungster.webp'

    return {
      title,
      description,
      keywords: [
        artistName,
        `${artistName} all songs lyrics`,
        `${artistName} songs`,
        `${artistName} lyrics`,
        `${artistName} discography`,
        `${artistName} albums`,
        `${artistName} song list`,
        `${artistName} new songs`,
        `${artistName} latest songs`,
        `${artistName} hits`,
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
            alt: artistName,
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
          select: { songs: { where: { song: { status: 'published' } } } }
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
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          views: true,
          createdAt: true,
          artists: {
            select: {
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          genres: {
            select: {
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
        duration: true,
        datePublished: true,
        artists: {
          select: {
            artist: { select: { id: true, name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    // Get total views across all songs
    const viewsAgg = await prisma.song.aggregate({
      where: { artists: { some: { artistId: artist.id } }, status: 'published' },
      _sum: { views: true }
    })
    const totalViews = viewsAgg._sum.views || 0

    // Get movies linked to this artist's songs
    const artistMovies = await prisma.movie.findMany({
      where: {
        songs: {
          some: {
            artists: { some: { artistId: artist.id } },
            status: 'published'
          }
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        year: true,
        _count: { select: { songs: true } }
      },
      orderBy: { year: 'desc' }
    })

    // Get direct artist rating from ArtistRating table
    const ratingAgg = await prisma.artistRating.aggregate({
      where: { artistId: artist.id },
      _avg: { rating: true },
      _count: { rating: true }
    })
    const averageRating = ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0
    const totalRatings = ratingAgg._count.rating

    return {
      artist: { ...artist, totalSongs, totalViews, averageRating, totalRatings },
      songs,
      featuredSongs,
      movies: artistMovies,
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

  const { artist, featuredSongs, movies } = data

  // Generate structured data
  const artistSchema = generateArtistSchema(artist, featuredSongs)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Artists', url: '/artists' },
    { name: artist.name, url: `/artist/${artist.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  // Generate FAQ schema
  const faqItems = []
  faqItems.push({
    '@type': 'Question',
    name: `How many songs does ${artist.name} have?`,
    acceptedAnswer: { '@type': 'Answer', text: `${artist.name} has ${artist.totalSongs || 0} ${artist.totalSongs === 1 ? 'song' : 'songs'} on DJYoungster with full lyrics and English translation.` }
  })
  if (artist.albums?.length > 0) {
    faqItems.push({
      '@type': 'Question',
      name: `How many albums does ${artist.name} have?`,
      acceptedAnswer: { '@type': 'Answer', text: `${artist.name} has ${artist.albums.length} ${artist.albums.length === 1 ? 'album' : 'albums'}: ${artist.albums.map(a => a.title).join(', ')}.` }
    })
  }
  if (featuredSongs?.length > 0) {
    const topSongs = featuredSongs.map(s => s.title).join(', ')
    faqItems.push({
      '@type': 'Question',
      name: `What are the most popular songs by ${artist.name}?`,
      acceptedAnswer: { '@type': 'Answer', text: `The most popular songs by ${artist.name} include: ${topSongs}.` }
    })
  }
  if (artist.country) {
    faqItems.push({
      '@type': 'Question',
      name: `Where is ${artist.name} from?`,
      acceptedAnswer: { '@type': 'Answer', text: `${artist.name} is from ${artist.country}.` }
    })
  }
  if (movies?.length > 0) {
    const movieNames = movies.map(m => m.title).join(', ')
    faqItems.push({
      '@type': 'Question',
      name: `Which movies has ${artist.name} sung for?`,
      acceptedAnswer: { '@type': 'Answer', text: `${artist.name} has sung songs for the following movies: ${movieNames}.` }
    })
  }
  faqItems.push({
    '@type': 'Question',
    name: `Where can I read ${artist.name} song lyrics?`,
    acceptedAnswer: { '@type': 'Answer', text: `You can read all ${artist.name} song lyrics with English translation, Hindi and Punjabi language variations on DJYoungster.` }
  })

  const faqSchema = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
  } : null

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <PaginationHead
        basePath={`/artist/${slug}`}
        currentPage={data.pagination.page}
        totalPages={data.pagination.totalPages}
        searchParams={searchParamsResolved}
      />
      <ArtistPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
