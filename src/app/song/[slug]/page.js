import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateSongSchema, generateBreadcrumbSchema } from '@/lib/schema'
import SongPageClient from './SongPageClient'

// ISR: Revalidate song pages every 1 hour
export const revalidate = 3600

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

    const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
    const genres = song.genres?.map(sg => sg.genre.name).join(', ')

    // Build SEO title: Song Name + Lyrics + Artist Name + Movie Name (if available)
    let title = `${song.title} Lyrics - ${artistNames}`
    if (song.movie?.title) {
      title += ` | ${song.movie.title}`
    }
    title += ' | DJYoungster'

    // Build meta description
    let description = `Read ${song.title} lyrics by ${artistNames}.`
    if (song.movie?.title) {
      description += ` From the movie ${song.movie.title}${song.movie.year ? ` (${song.movie.year})` : ''}.`
    } else if (song.album?.title) {
      description += ` From the album ${song.album.title}.`
    }
    if (genres) {
      description += ` Genre: ${genres}.`
    }
    if (song.lyricist) {
      description += ` Written by ${song.lyricist}.`
    }
    description += ' Full lyrics with music video on DJYoungster.'

    // Use custom meta if available
    const metaTitle = song.metaTitle || title
    const metaDescription = song.metaDescription || description

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/song/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(song.coverImage) || `${siteUrl}/og-image.jpg`

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        song.title,
        `${song.title} lyrics`,
        artistNames,
        `${artistNames} songs`,
        song.movie?.title,
        song.album?.title,
        genres,
        song.language,
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
            alt: `${song.title} by ${artistNames}`,
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
    return {
      title: 'Song Lyrics | DJYoungster',
      description: 'Find song lyrics on DJYoungster - Your favorite lyrics destination.',
    }
  }
}

export default async function SongPage({ params }) {
  const { slug } = await params

  // Fetch song data for structured data
  let songSchema = null
  let breadcrumbSchema = null

  try {
    const song = await prisma.song.findUnique({
      where: { slug },
      include: {
        artists: {
          include: {
            artist: { select: { name: true, slug: true } }
          }
        },
        album: { select: { title: true, slug: true } },
        genres: {
          include: {
            genre: { select: { name: true } }
          }
        }
      }
    })

    if (song) {
      const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
      songSchema = generateSongSchema(song, artistNames)

      // Generate breadcrumb
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Songs', url: '/songs' },
        { name: song.title, url: `/song/${song.slug}` }
      ]
      breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)
    }
  } catch (error) {
    console.error('Error generating song schema:', error)
  }

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
      <SongPageClient />
    </>
  )
}
