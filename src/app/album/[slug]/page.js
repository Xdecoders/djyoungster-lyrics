import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'
import AlbumPageClient from './AlbumPageClient'

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
        creator: '@djyoungster',
        site: '@djyoungster',
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

export default function AlbumPage() {
  return <AlbumPageClient />
}
