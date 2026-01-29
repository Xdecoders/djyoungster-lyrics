import { prisma } from '@/lib/prisma'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import GenrePageClient from './GenrePageClient'

// ISR: Revalidate genre pages every 1 hour
export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true } }
      }
    })

    if (!genre) {
      return {
        title: 'Genre Not Found | DJYoungster',
        description: 'The genre you are looking for does not exist.',
      }
    }

    const title = genre.metaTitle || `${genre.name} Songs & Lyrics | DJYoungster`
    const description = genre.metaDescription ||
      `Explore ${genre._count.songs} ${genre.name} songs with lyrics. ${genre.description || `Find the best ${genre.name} music on DJYoungster.`}`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/genre/${slug}`
    const imageUrl = `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        genre.name,
        `${genre.name} songs`,
        `${genre.name} lyrics`,
        `${genre.name} music`,
        'lyrics',
        'songs',
        'music',
      ].join(', '),
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'DJYoungster',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${genre.name} Songs`,
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
      title: 'Genre | DJYoungster',
      description: 'Browse songs by genre on DJYoungster.',
    }
  }
}

export default async function GenrePage({ params }) {
  const { slug } = await params

  let collectionSchema = null
  let breadcrumbSchema = null

  try {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true } },
        songs: {
          take: 20,
          orderBy: { song: { views: 'desc' } },
          include: {
            song: { select: { title: true, slug: true } }
          }
        }
      }
    })

    if (genre) {
      const songs = genre.songs.map(sg => sg.song)
      collectionSchema = generateCollectionPageSchema(genre, 'genre', songs)

      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Genres', url: '/genres' },
        { name: genre.name, url: `/genre/${genre.slug}` }
      ])
    }
  } catch (error) {
    console.error('Error generating genre schema:', error)
  }

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <GenrePageClient />
    </>
  )
}
