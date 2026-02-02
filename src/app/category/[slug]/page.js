import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import CategoryPageClient from './CategoryPageClient'

// Dynamic SSR - always fetch fresh data on each request
export const dynamic = 'force-dynamic'

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

// Fetch category data for SSR with searchParams
async function getCategoryData(slug, searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const genreSlug = searchParams?.genre || ''
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    })

    if (!category) return null

    // Build where clause
    let songWhere = {
      categories: { some: { categoryId: category.id } },
      status: 'published'
    }

    // Filter by genre if provided
    if (genreSlug) {
      const genre = await prisma.genre.findUnique({
        where: { slug: genreSlug },
        select: { id: true }
      })
      if (genre) {
        songWhere.genres = { some: { genreId: genre.id } }
      }
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }
    else if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    const [songs, totalSongs, genres] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
        include: {
          artists: {
            include: {
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          album: { select: { id: true, title: true, slug: true, coverImage: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where: songWhere }),
      prisma.genre.findMany({
        where: {
          songs: {
            some: {
              song: {
                categories: { some: { categoryId: category.id } },
                status: 'published'
              }
            }
          }
        },
        select: { id: true, name: true, slug: true }
      })
    ])

    // Get featured songs
    const featuredSongs = await prisma.song.findMany({
      where: {
        categories: { some: { categoryId: category.id } },
        status: 'published'
      },
      include: {
        artists: {
          include: {
            artist: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    return {
      category: { ...category, totalSongs },
      songs,
      featuredSongs,
      genres,
      pagination: {
        page,
        limit,
        total: totalSongs,
        totalPages: Math.ceil(totalSongs / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams

  // Fetch category data on server
  const data = await getCategoryData(slug, searchParamsResolved)

  if (!data || !data.category) {
    notFound()
  }

  const { category, songs } = data

  const collectionSchema = generateCollectionPageSchema(category, 'category', songs.slice(0, 20))

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/songs' },
    { name: category.name, url: `/category/${category.slug}` }
  ])

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
      <CategoryPageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
