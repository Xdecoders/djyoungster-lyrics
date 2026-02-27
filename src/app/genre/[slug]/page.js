import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import PaginationHead from '@/components/PaginationHead'
import GenrePageClient from './GenrePageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all genres at build time
export async function generateStaticParams() {
  const genres = await prisma.genre.findMany({
    select: { slug: true }
  })
  return genres.map(genre => ({ slug: genre.slug }))
}

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

    const capitalizedName = toTitleCase(genre.name)
    const title = genre.metaTitle || `${capitalizedName} Songs Lyrics with English Translation - DJYoungster`
    const description = genre.metaDescription ||
      `Explore ${capitalizedName} song lyrics and meanings. DJYoungster provides ${capitalizedName} lyrics in English Translation, Hindi and Punjabi language variations.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
    const pageUrl = `${siteUrl}/genre/${slug}`
    const imageUrl = genre.imageUrl ? getAbsoluteUrl(genre.imageUrl) : `${siteUrl}/og-image.jpg`

    return {
      title,
      description,
      keywords: [
        capitalizedName,
        `${capitalizedName} songs`,
        `${capitalizedName} lyrics`,
        `${capitalizedName} music`,
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
            alt: `${capitalizedName} Songs`,
          },
        ],
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
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Genre | DJYoungster',
      description: 'Browse songs by genre on DJYoungster.',
    }
  }
}

// Fetch genre data for SSR with searchParams
async function getGenreData(slug, searchParams) {
  const page = parseInt(searchParams?.page) || 1
  const sort = searchParams?.sort || 'latest'
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        metaDescription: true
      }
    })

    if (!genre) return null

    const songWhere = {
      genres: { some: { genreId: genre.id } },
      status: 'published'
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }
    else if (sort === 'alphabetical') orderBy = { title: 'asc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }

    const [songs, totalSongs] = await Promise.all([
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
      prisma.song.count({ where: songWhere })
    ])

    // Get featured songs
    const featuredSongs = await prisma.song.findMany({
      where: songWhere,
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
      genre: { ...genre, totalSongs },
      songs,
      featuredSongs,
      pagination: {
        page,
        limit,
        total: totalSongs,
        totalPages: Math.ceil(totalSongs / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching genre data:', error)
    return null
  }
}

export default async function GenrePage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams

  // Fetch genre data on server
  const data = await getGenreData(slug, searchParamsResolved)

  if (!data || !data.genre) {
    notFound()
  }

  const { genre, songs } = data

  // Generate structured data
  const collectionSchema = generateCollectionPageSchema(genre, 'genre', songs)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Genres', url: '/genres' },
    { name: genre.name, url: `/genre/${genre.slug}` }
  ])

  // Generate dynamic FAQ schema
  const genreName = toTitleCase(genre.name)
  const topSongNames = data.featuredSongs?.slice(0, 3).map(s => s.title).join(', ')
  const faqs = [
    {
      question: `How many ${genreName} songs are on DJYoungster?`,
      answer: `DJYoungster has ${genre.totalSongs} ${genreName} songs with full lyrics, translations, and meanings.`
    },
    {
      question: `What are the most popular ${genreName} songs?`,
      answer: topSongNames
        ? `Some of the most popular ${genreName} songs on DJYoungster include ${topSongNames}, and more.`
        : `Browse our ${genreName} collection to discover the most popular songs ranked by views.`
    },
    {
      question: `Can I read ${genreName} song lyrics in English?`,
      answer: `Yes, DJYoungster provides ${genreName} song lyrics with English translations, romanized lyrics, and meanings to help you understand every song.`
    }
  ]
  const faqSchema = generateFAQSchema(faqs)

  return (
    <>
      <PaginationHead
        basePath={`/genre/${slug}`}
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
        <GenrePageClient initialData={JSON.parse(JSON.stringify(data))} />
      </Suspense>
    </>
  )
}
