import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateArtistSchema, generateBreadcrumbSchema } from '@/lib/schema'
import ArtistPageClient from './ArtistPageClient'

// ISR: Revalidate artist pages every 1 hour
export const revalidate = 3600

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

    const title = artist.metaTitle || `${artist.name} Songs & Lyrics | DJYoungster`
    const description = artist.metaDescription ||
      `Explore ${artist.name}'s complete collection of ${artist._count.songs} songs with lyrics. ${artist.bio ? artist.bio.substring(0, 100) + '...' : `Find all ${artist.name} songs, albums, and lyrics on DJYoungster.`}`

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

export default async function ArtistPage({ params }) {
  const { slug } = await params

  let artistSchema = null
  let breadcrumbSchema = null

  try {
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true, albums: true } },
        albums: {
          take: 10,
          select: { title: true, slug: true }
        }
      }
    })

    if (artist) {
      artistSchema = generateArtistSchema(artist)

      // Generate breadcrumb
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Artists', url: '/artists' },
        { name: artist.name, url: `/artist/${artist.slug}` }
      ]
      breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)
    }
  } catch (error) {
    console.error('Error generating artist schema:', error)
  }

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
      <ArtistPageClient />
    </>
  )
}
