import { prisma } from '@/lib/prisma'
import GenrePageClient from './GenrePageClient'

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
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Genre | DJYoungster',
      description: 'Browse songs by genre on DJYoungster.',
    }
  }
}

export default function GenrePage() {
  return <GenrePageClient />
}
