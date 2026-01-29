import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import CategoryPageClient from './CategoryPageClient'

// ISR: Revalidate category pages every 1 hour
export const revalidate = 3600

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/category/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(category.imageUrl) || `${siteUrl}/og-image.jpg`

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
      title: 'Category | DJYoungster',
      description: 'Browse songs by category on DJYoungster.',
    }
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params

  let collectionSchema = null
  let breadcrumbSchema = null

  try {
    const category = await prisma.category.findUnique({
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

    if (category) {
      const songs = category.songs.map(sc => sc.song)
      collectionSchema = generateCollectionPageSchema(category, 'category', songs)

      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Categories', url: '/songs' },
        { name: category.name, url: `/category/${category.slug}` }
      ])
    }
  } catch (error) {
    console.error('Error generating category schema:', error)
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
      <CategoryPageClient />
    </>
  )
}
