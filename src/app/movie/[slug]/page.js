import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateMovieSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import MoviePageClient from './MoviePageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all movies at build time
export async function generateStaticParams() {
  const movies = await prisma.movie.findMany({
    where: { slug: { not: null } },
    select: { slug: true }
  })
  return movies.map(movie => ({ slug: movie.slug }))
}

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

    const movieTitle = toTitleCase(movie.title)
    const title = movie.metaTitle || `${movieTitle}${movie.year ? ` (${movie.year})` : ''} Songs Lyrics with English Translation - DJYoungster`
    const description = movie.metaDescription ||
      `Explore ${movieTitle} movie song lyrics and meanings. Djyoungster provides ${movieTitle} lyrics in English Translation, Hindi and Punjabi language variations.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/movie/${slug}`
    // Use latest song's cover image or posterUrl or default - convert to absolute URL
    const latestSongImage = movie.songs?.[0]?.coverImage
    const imageUrl = getAbsoluteUrl(movie.posterUrl) || getAbsoluteUrl(latestSongImage) || 'https://djyoungster.com/uploads/1769674444129-djyoungster.webp'

    return {
      title,
      description,
      keywords: [
        movieTitle,
        `${movieTitle} songs`,
        `${movieTitle} lyrics`,
        `${movieTitle} soundtrack`,
        `${movieTitle} movie songs`,
        toTitleCase(movie.director),
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
            alt: `${movieTitle} Soundtrack`,
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!movie) return null

    const totalViews = movie.songs.reduce((sum, song) => sum + (song.views || 0), 0)

    // Get direct movie rating from MovieRating table
    const ratingAgg = await prisma.movieRating.aggregate({
      where: { movieId: movie.id },
      _avg: { rating: true },
      _count: { rating: true }
    })
    const averageRating = ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0
    const totalRatings = ratingAgg._count.rating

    return {
      movie: {
        ...movie,
        totalSongs: movie.songs.length,
        totalViews,
        averageRating,
        totalRatings
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
