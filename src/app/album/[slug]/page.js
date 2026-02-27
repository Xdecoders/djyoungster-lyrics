import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateAlbumSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import AlbumPageClient from './AlbumPageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all albums at build time
export async function generateStaticParams() {
  const albums = await prisma.album.findMany({
    select: { slug: true }
  })
  return albums.map(album => ({ slug: album.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const album = await prisma.album.findUnique({
      where: { slug },
      include: {
        artist: { select: { name: true } },
        _count: { select: { songs: true } },
        songs: { orderBy: { createdAt: 'desc' }, take: 1, select: { coverImage: true } }
      }
    })

    if (!album) {
      return {
        title: 'Album Not Found | DJYoungster',
        description: 'The album you are looking for does not exist.',
      }
    }

    const artistName = toTitleCase(album.artist?.name) || 'Various Artists'
    const albumTitle = toTitleCase(album.title)
    const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''
    const songCount = album._count?.songs || 0
    const label = album.label || ''

    const title = album.metaTitle || `${albumTitle} Album Tracklist, Songs Lyrics & Info - DJYoungster`

    let description
    if (album.metaDescription) {
      description = album.metaDescription
    } else if (releaseYear && label && songCount > 0) {
      description = `${albumTitle} is a ${releaseYear} ${artistName} album released on ${label} — ${songCount} track${songCount !== 1 ? 's' : ''} with full lyrics and English translations on DJYoungster.`
    } else if (releaseYear && songCount > 0) {
      description = `${artistName}'s ${releaseYear} album ${albumTitle} features ${songCount} track${songCount !== 1 ? 's' : ''} — read every song's full lyrics with English translation on DJYoungster.`
    } else if (releaseYear) {
      description = `${albumTitle} by ${artistName} was released in ${releaseYear}. Explore the full tracklist with complete lyrics and English translations on DJYoungster.`
    } else if (label && songCount > 0) {
      description = `${albumTitle} by ${artistName} — ${songCount} track${songCount !== 1 ? 's' : ''} from ${label} with full lyrics, English translations and Hindi/Punjabi versions on DJYoungster.`
    } else if (songCount > 1) {
      description = `${albumTitle} by ${artistName} features ${songCount} songs — full lyrics with English translations and Hindi/Punjabi versions on DJYoungster.`
    } else if (songCount === 1) {
      description = `${albumTitle} by ${artistName} — read the song lyrics with English translation, Hindi and Punjabi versions on DJYoungster.`
    } else {
      description = `Explore ${albumTitle} by ${artistName} on DJYoungster. Browse the complete tracklist with lyrics, English translations, and Hindi/Punjabi versions.`
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/album/${slug}`
    // Convert relative image URL to absolute URL
    const latestSongImage = album.songs?.[0]?.coverImage
    const imageUrl = getAbsoluteUrl(album.coverImage) || getAbsoluteUrl(latestSongImage) || 'https://djyoungster.com/uploads/1769674444129-djyoungster.webp'

    return {
      title,
      description,
        locale: 'en_IN',
        alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
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
        'music:musician': artistName,
        'music:release_date': album.releaseDate?.toISOString() || undefined,
        'music:song_count': album._count.songs.toString(),
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Album | DJYoungster',
      description: 'Find album songs and lyrics on DJYoungster.',
    }
  }
}

// Fetch album data for SSR
async function getAlbumData(slug) {
  try {
    const album = await prisma.album.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        releaseDate: true,
        label: true,
        metaDescription: true,
        artistId: true,
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true
          }
        },
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
                artist: {
                  select: { id: true, name: true, slug: true }
                }
              }
            },
            genres: {
              select: {
                genre: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
      },
    })

    if (!album) return null

    // Get more albums from same artist
    const moreAlbums = await prisma.album.findMany({
      where: {
        artistId: album.artistId,
        slug: { not: slug }
      },
      include: {
        artist: {
          select: { name: true, slug: true }
        },
        _count: {
          select: { songs: true }
        }
      },
      take: 6,
      orderBy: { releaseDate: 'desc' }
    })

    // Calculate total views
    const totalViews = album.songs.reduce((sum, song) => sum + (song.views || 0), 0)

    // Get direct album rating from AlbumRating table
    const ratingAgg = await prisma.albumRating.aggregate({
      where: { albumId: album.id },
      _avg: { rating: true },
      _count: { rating: true }
    })
    const averageRating = ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0
    const totalRatings = ratingAgg._count.rating

    return {
      album: {
        ...album,
        totalSongs: album.songs.length,
        totalViews,
        averageRating,
        totalRatings
      },
      moreAlbums
    }
  } catch (error) {
    console.error('Error fetching album data:', error)
    return null
  }
}

export default async function AlbumPage({ params }) {
  const { slug } = await params

  // Fetch album data on server
  const data = await getAlbumData(slug)

  if (!data || !data.album) {
    notFound()
  }

  const { album, moreAlbums } = data
  const artistName = album.artist?.name || 'Various Artists'

  // Generate structured data
  const albumSchema = generateAlbumSchema(album, album.songs)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Albums', url: '/albums' },
    { name: album.title, url: `/album/${album.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  // Generate FAQ schema
  const faqItems = []
  faqItems.push({
    '@type': 'Question',
    name: `How many songs are in ${album.title} album?`,
    acceptedAnswer: { '@type': 'Answer', text: `${album.title} by ${artistName} has ${album.totalSongs} ${album.totalSongs === 1 ? 'song' : 'songs'} in its tracklist.` }
  })
  if (album.artist?.name) {
    faqItems.push({
      '@type': 'Question',
      name: `Who is the artist of ${album.title}?`,
      acceptedAnswer: { '@type': 'Answer', text: `${album.title} is an album by ${artistName}.${album.label ? ` It was released under ${album.label}.` : ''}` }
    })
  }
  if (album.releaseDate) {
    const year = new Date(album.releaseDate).getFullYear()
    faqItems.push({
      '@type': 'Question',
      name: `When was ${album.title} released?`,
      acceptedAnswer: { '@type': 'Answer', text: `${album.title} by ${artistName} was released in ${year}.` }
    })
  }
  if (album.label) {
    faqItems.push({
      '@type': 'Question',
      name: `Which label released ${album.title}?`,
      acceptedAnswer: { '@type': 'Answer', text: `${album.title} was released under the ${album.label} label.` }
    })
  }
  if (album.songs?.length > 0) {
    const songNames = album.songs.map(s => s.title).join(', ')
    faqItems.push({
      '@type': 'Question',
      name: `What are the songs in ${album.title}?`,
      acceptedAnswer: { '@type': 'Answer', text: `The songs in ${album.title} are: ${songNames}.` }
    })
  }
  faqItems.push({
    '@type': 'Question',
    name: `Where can I read ${album.title} song lyrics?`,
    acceptedAnswer: { '@type': 'Answer', text: `You can read all ${album.title} song lyrics with English translation and meanings on DJYoungster.` }
  })

  const faqSchema = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
  } : null

  return (
    <>
      {albumSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(albumSchema) }}
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
      <AlbumPageClient
        initialAlbum={JSON.parse(JSON.stringify(album))}
      />
    </>
  )
}
