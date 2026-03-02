import Link from 'next/link'
import Image from 'next/image'
import { FiBookOpen, FiMusic, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Song Lyrics Stories – Hindi, Punjabi & More | DJYoungster',
  description: 'Browse tap-through lyric stories for Hindi, Punjabi, English, Tamil & Telugu songs on DJYoungster. Swipe slide-by-slide through your favourite song lyrics.',
}

export const revalidate = 60

const PER_PAGE = 24

function getLyricPreview(rawLyrics) {
  return (rawLyrics || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join('\n')
}

async function getStories(page) {
  const skip = (page - 1) * PER_PAGE

  const [total, rows] = await Promise.all([
    prisma.song.count({ where: { hasWebStory: true, status: 'published' } }),
    prisma.song.findMany({
      where: { hasWebStory: true, status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        lyrics: true,
        artists: { select: { artist: { select: { name: true } } } }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: PER_PAGE,
    })
  ])

  const stories = rows.map(({ lyrics, ...rest }) => ({
    ...rest,
    lyricsPreview: getLyricPreview(lyrics)
  }))

  return { stories, total, totalPages: Math.ceil(total / PER_PAGE) }
}

export default async function WebStoriesPage({ searchParams }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam) || 1)
  const { stories, total, totalPages } = await getStories(page)

  const startIndex = (page - 1) * PER_PAGE + 1
  const endIndex = Math.min(page * PER_PAGE, total)

  // Build page numbers to show (current ±2, always show first & last)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Lyric Stories</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {total > 0 ? `${total} stories · Showing ${startIndex}–${endIndex}` : 'Tap-through lyrics in Google Web Stories format'}
              </p>
            </div>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-500">No Lyric Stories yet. Enable them from the admin songs list.</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
              {stories.map((song) => {
                const artistNames = song.artists.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
                return (
                  <Link
                    key={song.id}
                    href={`/web-stories/${song.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-900 shadow-sm hover:shadow-xl transition-shadow"
                  >
                    {/* Blurred cover bg */}
                    {song.coverImage ? (
                      <Image
                        src={song.coverImage}
                        alt={song.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                        className="object-cover scale-110 blur-sm"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-black/65" />

                    {/* Story badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow">Story</span>
                    </div>

                    {/* Lyrics preview */}
                    {song.lyricsPreview && (
                      <div className="absolute inset-0 flex items-center justify-center px-3 pt-7 pb-14">
                        <p className="text-white text-[11px] leading-[1.7] text-center font-medium whitespace-pre-line" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                          {song.lyricsPreview}
                        </p>
                      </div>
                    )}

                    {/* Title / artist */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <div className="bg-white/15 backdrop-blur-md rounded-xl px-2.5 py-2 border border-white/20">
                        <h2 className="font-semibold text-white text-xs truncate">{song.title}</h2>
                        <p className="text-white/70 text-[10px] truncate mt-0.5">{artistNames}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  {page > 1 ? (
                    <Link
                      href={`/web-stories?page=${page - 1}`}
                      className="p-2 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </Link>
                  ) : (
                    <span className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
                      <FiChevronLeft className="w-5 h-5" />
                    </span>
                  )}

                  {/* Page numbers */}
                  {pageNumbers.map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-400 text-sm">…</span>
                      )}
                      <Link
                        href={`/web-stories?page=${p}`}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition flex items-center justify-center ${
                          p === page
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}

                  {/* Next */}
                  {page < totalPages ? (
                    <Link
                      href={`/web-stories?page=${page + 1}`}
                      className="p-2 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <span className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
                      <FiChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
