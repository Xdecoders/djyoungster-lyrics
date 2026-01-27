import { prisma } from '@/lib/prisma'
import SongPageClient from './SongPageClient'

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/song/${slug}`
    const imageUrl = song.coverImage || `${siteUrl}/og-image.jpg`

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
        creator: '@djyoungster',
        site: '@djyoungster',
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

// JSON-LD structured data for rich snippets
function generateJsonLd(song, artistNames) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: artistNames,
    },
    duration: song.duration || undefined,
    inAlbum: song.album ? {
      '@type': 'MusicAlbum',
      name: song.album.title,
    } : undefined,
    datePublished: song.releaseYear?.toString(),
    genre: song.genres?.map(sg => sg.genre.name),
    inLanguage: song.language,
    lyrics: {
      '@type': 'CreativeWork',
      text: song.lyrics?.substring(0, 500) + '...',
      author: song.lyricist || artistNames,
    },
    url: `${siteUrl}/song/${song.slug}`,
    image: song.coverImage,
  }
}

export default function SongPage() {
  return <SongPageClient />
}
