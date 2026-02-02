import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateMovieSchema, generateBreadcrumbSchema } from '@/lib/schema'
import MoviePageClient from './MoviePageClient'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true } },
        songs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { coverImage: true }
        }
      }
    })

    if (!movie) {
      return {
        title: 'Movie Not Found | DJYoungster',
        description: 'The movie you are looking for does not exist.',
      }
    }

    const title = movie.metaTitle || `${movie.title}${movie.year ? ` (${movie.year})` : ''} Songs & Lyrics | DJYoungster`
    const description = movie.metaDescription ||
      `Listen to all ${movie._count.songs} songs from ${movie.title}${movie.year ? ` (${movie.year})` : ''} with lyrics. ${movie.director ? `Directed by ${movie.director}.` : ''} Find complete movie soundtrack on DJYoungster.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/movie/${slug}`
    // Use latest song's cover image or posterUrl or default - convert to absolute URL
    const latestSongImage = movie.songs?.[0]?.coverImage
    const imageUrl = getAbsoluteUrl(movie.posterUrl) || getAbsoluteUrl(latestSongImage) || `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        movie.title,
        `${movie.title} songs`,
        `${movie.title} lyrics`,
        `${movie.title} soundtrack`,
        `${movie.title} movie songs`,
        movie.director,
        movie.year?.toString(),
        'movie songs',
        'soundtrack',
        'lyrics',
        'music',
      ].filter(Boolean).join(', '),
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'video.movie',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${movie.title} Soundtrack`,
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
      other: {
        'video:director': movie.director || undefined,
        'video:release_date': movie.year?.toString() || undefined,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Movie Soundtrack | DJYoungster',
      description: 'Find movie songs and lyrics on DJYoungster.',
    }
  }
}

// Fetch movie data for SSR
async function getMovieData(slug) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        songs: {
          where: { status: 'published' },
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!movie) return null

    const totalViews = movie.songs.reduce((sum, song) => sum + (song.views || 0), 0)

    return {
      movie: {
        ...movie,
        totalSongs: movie.songs.length,
        totalViews
      }
    }
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null
  }
}

export default async function MoviePage({ params }) {
  const { slug } = await params

  // Fetch movie data on server
  const data = await getMovieData(slug)

  if (!data || !data.movie) {
    notFound()
  }

  const { movie } = data

  // Generate structured data
  const movieSchema = generateMovieSchema(movie, movie.songs)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Movies', url: '/movies' },
    { name: movie.title, url: `/movie/${movie.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      {movieSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <MoviePageClient initialMovie={JSON.parse(JSON.stringify(movie))} />
    </>
  )
}
