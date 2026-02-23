import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { generateBreadcrumbSchema } from '@/lib/schema'
import { FiMusic, FiPlay } from 'react-icons/fi'

export const revalidate = 60

export async function generateStaticParams() {
  const topLists = await prisma.topList.findMany({
    where: { isPublished: true },
    select: { slug: true }
  })
  return topLists.map(tl => ({ slug: tl.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  const topList = await prisma.topList.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true } }
    }
  })

  if (!topList || !topList.isPublished) {
    return {
      title: 'Top List Not Found | DJYoungster',
      description: 'The top list you are looking for does not exist.',
    }
  }

  const title = topList.metaTitle || `${topList.title} - Lyrics & Meanings | DJYoungster`
  const description = topList.metaDescription ||
    `Discover the ${topList.title} with lyrics, meanings, and translations. ${topList.category ? `Best ${topList.category.name} songs` : 'Best songs across all categories'} ranked by popularity on DJYoungster.`
  const pageUrl = `${siteUrl}/list/${slug}`

  return {
    title,
    description,
    keywords: [
      topList.title,
      topList.category?.name,
      'top songs',
      'best songs',
      'popular songs',
      'song lyrics',
      'lyrics',
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'DJYoungster',
      type: 'website',
      images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

async function getTopListData(slug) {
  const topList = await prisma.topList.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tag: { select: { id: true, name: true, slug: true } }
    }
  })

  if (!topList || !topList.isPublished) return null

  // Build the song query
  const where = { status: 'published' }
  if (topList.categoryId) {
    where.categories = {
      some: { categoryId: topList.categoryId }
    }
  }
  if (topList.tagId) {
    where.tags = {
      some: { tagId: topList.tagId }
    }
  }

  const songs = await prisma.song.findMany({
    where,
    orderBy: { views: 'desc' },
    take: topList.count,
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      coverImage: true,
      language: true,
      artists: {
        include: {
          artist: {
            select: { name: true, slug: true }
          }
        }
      },
      album: { select: { coverImage: true } }
    }
  })

  return { topList, songs }
}

export default async function TopListPage({ params }) {
  const { slug } = await params
  const data = await getTopListData(slug)

  if (!data) notFound()

  const { topList, songs } = data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Top Lists', url: '/list' },
    { name: topList.title }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: topList.title,
    description: topList.description || `${topList.title} ranked by popularity.`,
    url: `${siteUrl}/list/${topList.slug}`,
    numberOfItems: songs.length,
    itemListElement: songs.map((song, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: song.title,
      url: `${siteUrl}/song/${song.slug}`,
      item: {
        '@type': 'MusicRecording',
        name: song.title,
        url: `${siteUrl}/song/${song.slug}`,
        ...(song.artists?.[0] && {
          byArtist: {
            '@type': 'MusicGroup',
            name: song.artists[0].artist.name
          }
        })
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
        {/* Breadcrumb Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <Link href="/list" className="hover:text-primary transition">Top Lists</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{topList.title}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">{topList.title}</h1>
          {topList.description && (
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">{topList.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{songs.length} Songs</span>
            {topList.category && (
              <Link
                href={`/category/${topList.category.slug}`}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition"
              >
                {topList.category.name}
              </Link>
            )}
            {topList.tag && (
              <Link
                href={`/tag/${topList.tag.slug}`}
                className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium hover:bg-amber-100 transition"
              >
                {topList.tag.name}
              </Link>
            )}
          </div>
        </div>

        {/* Songs Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {songs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-500">No songs found for this list yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {songs.map((song, index) => {
                const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
                const coverImg = song.coverImage || song.album?.coverImage

                return (
                  <Link
                    key={song.id}
                    href={`/song/${song.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[3/4]"
                  >
                    {/* Cover Image or Fallback */}
                    {coverImg ? (
                      <Image
                        src={coverImg}
                        alt={song.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <FiMusic className="w-12 h-12 text-slate-400/50" />
                      </div>
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index < 3
                          ? 'bg-amber-400 text-amber-900'
                          : 'bg-black/40 backdrop-blur-sm text-white border border-white/20'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <FiPlay className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Glass Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                        <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                        <p className="text-white/70 text-xs truncate mt-0.5">{artistNames}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
