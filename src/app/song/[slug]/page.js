import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateSongSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import SongPageClient from './SongPageClient'

// ISR - Cache pages and revalidate every 60 seconds for fresh data
export const revalidate = 60

// Pre-render top 50 songs by views at build time
export async function generateStaticParams() {
  const songs = await prisma.song.findMany({
    where: { status: 'published' },
    select: { slug: true },
    orderBy: { views: 'desc' },
    take: 200
  })
  return songs.map(song => ({ slug: song.slug }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const song = await prisma.song.findUnique({
      where: { slug },
      include: {
        artists: {
          include: {
            artist: { select: { name: true } }
          }
        },
        movie: { select: { title: true, year: true } },
        album: { select: { title: true } },
        genres: {
          include: {
            genre: { select: { name: true } }
          }
        }
      }
    })

    if (!song) {
      return {
        title: 'Song Not Found | DJYoungster',
        description: 'The song you are looking for does not exist.',
      }
    }

    const artistNames = song.artists?.map(sa => toTitleCase(sa.artist.name)).join(', ') || 'Unknown Artist'
    const genres = song.genres?.map(sg => toTitleCase(sg.genre.name)).join(', ')
    const songTitle = toTitleCase(song.title)
    const movieTitle = toTitleCase(song.movie?.title)
    const albumTitle = toTitleCase(song.album?.title)

    // Build SEO title: Song Name + Lyrics + Artist Name + Movie Name (if available)
    let title = `${songTitle} Lyrics - ${artistNames}`
    if (movieTitle) {
      title += ` | ${movieTitle}`
    }
    title += ' | DJYoungster'

    // Build meta description
    let description = `Read ${songTitle} lyrics by ${artistNames}.`
    if (movieTitle) {
      description += ` From the movie ${movieTitle}${song.movie.year ? ` (${song.movie.year})` : ''}.`
    } else if (albumTitle) {
      description += ` From the album ${albumTitle}.`
    }
    if (genres) {
      description += ` Genre: ${genres}.`
    }
    if (song.lyricist) {
      description += ` Written by ${toTitleCase(song.lyricist)}.`
    }
    description += ' Full lyrics with music video on DJYoungster.'

    // Use custom meta if available
    const metaTitle = song.metaTitle || title
    const metaDescription = song.metaDescription || description

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/song/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(song.coverImage) || 'https://djyoungster.com/uploads/1769674444129-djyoungster.webp'

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        songTitle,
        `${songTitle} lyrics`,
        artistNames,
        `${artistNames} songs`,
        movieTitle,
        albumTitle,
        genres,
        'lyrics',
        'song lyrics',
        'music',
      ].filter(Boolean).join(', '),
      authors: [{ name: artistNames }],
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'music.song',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${songTitle} by ${artistNames}`,
          },
        ],
        locale: 'en_US',
        audio: song.spotifyUrl ? [{ url: song.spotifyUrl }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
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
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      other: {
        'music:musician': artistNames,
        'music:duration': song.duration || undefined,
        'music:album': song.album?.title || undefined,
        'music:release_date': song.releaseYear?.toString() || undefined,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    return {
      title: 'Song Lyrics | DJYoungster',
      description: 'Find song lyrics on DJYoungster - Your favorite lyrics destination.',
      alternates: {
        canonical: `${siteUrl}/song/${slug}`,
      },
    }
  }
}

// Fetch song data for SSR
async function getSongData(slug) {
  try {
    const song = await prisma.song.findUnique({
      where: { slug },
      include: {
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              }
            }
          }
        },
        album: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            releaseDate: true,
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            year: true,
            director: true,
          }
        },
        genres: {
          select: {
            genre: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        annotations: {
          orderBy: { startLine: 'asc' },
          select: { id: true, startLine: true, endLine: true, content: true }
        },
        ratings: {
          select: { rating: true }
        },
      }
    })

    if (!song) return null

    // Fetch related songs
    const artistIds = song.artists.map(sa => sa.artist.id)
    const genreIds = song.genres.map(sg => sg.genre.id)

    const relatedSongs = await prisma.song.findMany({
      where: {
        AND: [
          { id: { not: song.id } },
          { status: 'published' },
          {
            OR: [
              { artists: { some: { artistId: { in: artistIds } } } },
              { genres: { some: { genreId: { in: genreIds } } } },
              { albumId: song.albumId },
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        artists: {
          select: {
            artist: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
      take: 8,
      orderBy: { views: 'desc' }
    })

    return { song, relatedSongs }
  } catch (error) {
    console.error('Error fetching song data:', error)
    return null
  }
}

export default async function SongPage({ params }) {
  const { slug } = await params

  // Fetch song data on server
  const data = await getSongData(slug)

  if (!data || !data.song) {
    notFound()
  }

  const { song, relatedSongs } = data

  // Increment view count (fire and forget) - don't await
  prisma.song.update({
    where: { id: song.id },
    data: { views: { increment: 1 } }
  }).catch(console.error)

  // Compute aggregate rating from individual ratings
  const ratings = song.ratings || []
  if (ratings.length > 0) {
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
    song.aggregateRating = {
      average: sum / ratings.length,
      count: ratings.length
    }
  }

  // Generate structured data
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const songSchema = generateSongSchema(song, artistNames)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Songs', url: '/songs' },
    { name: song.title, url: `/song/${song.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      {songSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(songSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <SongPageClient
        initialSong={JSON.parse(JSON.stringify(song))}
        initialRelatedSongs={JSON.parse(JSON.stringify(relatedSongs))}
      />
    </>
  )
}
