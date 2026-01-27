import { prisma } from '@/lib/prisma'
import CategoryPageClient from './CategoryPageClient'

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { songs: true } }
      }
    })

    if (!category) {
      return {
        title: 'Category Not Found | DJYoungster',
        description: 'The category you are looking for does not exist.',
      }
    }

    const title = category.metaTitle || `${category.name} Songs & Lyrics | DJYoungster`
    const description = category.metaDescription ||
      `Browse ${category._count.songs} ${category.name} songs with lyrics. Find all ${category.name} language songs, albums, and artists on DJYoungster.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/category/${slug}`
    const imageUrl = category.imageUrl || `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        category.name,
        `${category.name} songs`,
        `${category.name} lyrics`,
        `${category.name} music`,
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
            alt: `${category.name} Songs`,
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
      title: 'Category | DJYoungster',
      description: 'Browse songs by category on DJYoungster.',
    }
  }
}

export default function CategoryPage() {
  return <CategoryPageClient />
}
