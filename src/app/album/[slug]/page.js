import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateAlbumSchema, generateBreadcrumbSchema } from '@/lib/schema'
import AlbumPageClient from './AlbumPageClient'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const album = await prisma.album.findUnique({
      where: { slug },
      include: {
        artist: { select: { name: true } },
        _count: { select: { songs: true } }
      }
    })

    if (!album) {
      return {
        title: 'Album Not Found | DJYoungster',
        description: 'The album you are looking for does not exist.',
      }
    }

    const artistName = album.artist?.name || 'Various Artists'
    const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''

    const title = album.metaTitle || `${album.title} - ${artistName} Album${releaseYear ? ` (${releaseYear})` : ''} | DJYoungster`
    const description = album.metaDescription ||
      `Listen to ${album.title} by ${artistName}. ${album._count.songs} songs with full lyrics. ${album.label ? `Released by ${album.label}.` : ''} Find all album tracks and lyrics on DJYoungster.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/album/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(album.coverImage) || `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        album.title,
        `${album.title} album`,
        `${album.title} songs`,
        `${album.title} lyrics`,
        artistName,
        `${artistName} albums`,
        album.label,
        'album',
        'lyrics',
        'songs',
        'music',
      ].filter(Boolean).join(', '),
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'music.album',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${album.title} by ${artistName}`,
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
      include: {
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
          include: {
            artists: {
              include: {
                artist: {
                  select: { id: true, name: true, slug: true }
                }
              }
            },
            genres: {
              include: {
                genre: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
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

    return {
      album: {
        ...album,
        totalSongs: album.songs.length,
        totalViews
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

  // Generate structured data
  const albumSchema = generateAlbumSchema(album, album.songs)

  // Generate breadcrumb
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Albums', url: '/albums' },
    { name: album.title, url: `/album/${album.slug}` }
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

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
      <AlbumPageClient
        initialAlbum={JSON.parse(JSON.stringify(album))}
        initialMoreAlbums={JSON.parse(JSON.stringify(moreAlbums))}
      />
    </>
  )
}
