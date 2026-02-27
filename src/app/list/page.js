import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { generateBreadcrumbSchema } from '@/lib/schema'
import { FiMusic, FiArrowRight, FiTrendingUp } from 'react-icons/fi'

export const revalidate = 60

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  return {
    title: 'Top Song Lists - Best Songs Ranked by Popularity | DJYoungster',
    description: 'Browse curated top song lists across categories. Find the best Hindi, Punjabi, English, Tamil, and Telugu songs ranked by popularity with lyrics and translations.',
    openGraph: {
      title: 'Top Song Lists - Best Songs Ranked by Popularity | DJYoungster',
      description: 'Browse curated top song lists across categories. Find the best songs ranked by popularity with lyrics and translations.',
      url: `${siteUrl}/list`,
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Top Song Lists - Best Songs Ranked by Popularity | DJYoungster',
      description: 'Browse curated top song lists across categories.',
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: {
      canonical: `${siteUrl}/list`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

const cardAccents = [
  { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', gradient: 'from-rose-500 to-pink-600' },
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-orange-600' },
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', gradient: 'from-violet-500 to-purple-600' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700', gradient: 'from-cyan-500 to-blue-600' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700', gradient: 'from-fuchsia-500 to-pink-600' },
  { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200', badge: 'bg-lime-100 text-lime-700', gradient: 'from-lime-500 to-green-600' },
]

export default async function TopListsIndexPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  const topLists = await prisma.topList.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      tag: { select: { name: true, slug: true } }
    }
  })

  // Fetch top 4 songs for each list to show thumbnails
  const listsWithSongs = await Promise.all(
    topLists.map(async (topList) => {
      const where = { status: 'published' }
      if (topList.categoryId) {
        where.categories = { some: { categoryId: topList.categoryId } }
      }
      if (topList.tagId) {
        where.tags = { some: { tagId: topList.tagId } }
      }

      const songs = await prisma.song.findMany({
        where,
        orderBy: { views: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          coverImage: true,
          artists: {
            include: { artist: { select: { name: true } } },
            take: 1
          },
          album: { select: { coverImage: true } }
        }
      })

      // Get total song count
      const totalSongs = await prisma.song.count({ where })

      return { ...topList, previewSongs: songs, totalSongs }
    })
  )

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Top Lists' }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#f8fafc]">
        {/* Hero Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Top Lists</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Top Song Lists</h1>
            </div>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
              Curated lists of the best songs ranked by popularity. Browse by category and discover trending hits.
            </p>
            <div className="mt-4 text-sm text-slate-400">
              {topLists.length} {topLists.length === 1 ? 'list' : 'lists'} available
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {listsWithSongs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No top lists available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listsWithSongs.map((topList, index) => {
                const accent = cardAccents[index % cardAccents.length]
                const previewSongs = topList.previewSongs || []

                return (
                  <Link
                    key={topList.id}
                    href={`/list/${topList.slug}`}
                    className="group block bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Left Accent with Count */}
                      <div className={`hidden sm:flex flex-col items-center justify-center w-24 flex-shrink-0 bg-gradient-to-br ${accent.gradient} text-white`}>
                        <span className="text-3xl font-black">{topList.count}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">Songs</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 sm:p-5 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {/* Mobile count badge */}
                            <div className="sm:hidden mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${accent.badge}`}>
                                Top {topList.count}
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">
                              {topList.title}
                            </h2>
                            {topList.description && (
                              <p className="text-slate-500 text-sm mt-1 line-clamp-1">{topList.description}</p>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              {topList.category && (
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                  {topList.category.name}
                                </span>
                              )}
                              {topList.tag && (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                                  {topList.tag.name}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {topList.totalSongs} {topList.totalSongs === 1 ? 'song' : 'songs'} available
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="hidden sm:flex items-center self-center p-2 rounded-full text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                            <FiArrowRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* Song Thumbnails Preview */}
                        {previewSongs.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                            <div className="flex -space-x-2">
                              {previewSongs.map((song, i) => {
                                const cover = song.coverImage || song.album?.coverImage
                                return (
                                  <div
                                    key={song.id}
                                    className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden flex-shrink-0 bg-slate-100"
                                    style={{ zIndex: previewSongs.length - i }}
                                  >
                                    {cover ? (
                                      <Image
                                        src={cover}
                                        alt={song.title}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                        <FiMusic className="w-3 h-3 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {previewSongs.map(s => s.artists?.[0]?.artist?.name).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(', ')}
                              {previewSongs.length < topList.totalSongs && ` & more`}
                            </p>
                          </div>
                        )}
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
