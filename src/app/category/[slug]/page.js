import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import PaginationHead from '@/components/PaginationHead'
import CategoryPageClient from './CategoryPageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all categories at build time
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true }
  })
  return categories.map(category => ({ slug: category.slug }))
}

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

    const categoryName = toTitleCase(category.name)
    const title = category.metaTitle || `${categoryName} Songs Lyrics with English Translation - DJYoungster`
    const description = category.metaDescription ||
      `Explore ${categoryName} song lyrics and meanings. Djyoungster provides ${categoryName} lyrics in English Translation, Hindi and Punjabi language variations.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/category/${slug}`
    // Convert relative image URL to absolute URL
    const imageUrl = getAbsoluteUrl(category.imageUrl) || `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        categoryName,
        `${categoryName} songs`,
        `${categoryName} lyrics`,
        `${categoryName} music`,
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
            alt: `${categoryName} Songs`,
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
        description: true,
        metaDescription: true
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
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          views: true,
          createdAt: true,
          artists: {
            select: {
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
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        artists: {
          select: {
            artist: { select: { id: true, name: true, slug: true } }
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
    { name: 'Categories', url: '/songs?tab=categories' },
    { name: category.name, url: `/category/${category.slug}` }
  ])

  // Generate dynamic FAQ schema
  const categoryName = toTitleCase(category.name)
  const topSongNames = data.featuredSongs?.slice(0, 3).map(s => s.title).join(', ')
  const genreNames = data.genres?.slice(0, 3).map(g => g.name).join(', ')
  const faqs = [
    {
      question: `How many ${categoryName} songs are available on DJYoungster?`,
      answer: `DJYoungster has ${category.totalSongs} ${categoryName} songs with full lyrics, English translations, and meanings.`
    },
    {
      question: `What are the top ${categoryName} songs right now?`,
      answer: topSongNames
        ? `Some of the trending ${categoryName} songs include ${topSongNames}, and many more ranked by popularity.`
        : `Browse our ${categoryName} collection to find the most popular songs ranked by views.`
    },
    {
      question: `What genres are available in ${categoryName} songs?`,
      answer: genreNames
        ? `${categoryName} songs on DJYoungster span genres like ${genreNames}, and more. Use the genre filter to find exactly what you like.`
        : `${categoryName} songs are available across multiple genres. Browse the collection to explore.`
    }
  ]
  const faqSchema = generateFAQSchema(faqs)

  return (
    <>
      <PaginationHead
        basePath={`/category/${slug}`}
        currentPage={data.pagination.page}
        totalPages={data.pagination.totalPages}
        searchParams={searchParamsResolved}
      />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900" />}>
        <CategoryPageClient initialData={JSON.parse(JSON.stringify(data))} />
      </Suspense>
    </>
  )
}
