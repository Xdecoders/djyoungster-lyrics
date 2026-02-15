import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { FiMusic, FiPlay, FiUser, FiTrendingUp, FiClock, FiTag, FiCheckCircle, FiUsers, FiGlobe, FiCamera } from 'react-icons/fi'
import SearchWithAutocomplete from './SearchClient'
import LiveTicker from './LiveTicker'
import Carousel from './Carousel'

// Main Server Component for Homepage Content
export default function HomeContent({ data, siteSettings }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] dark:bg-slate-900" />

      {/* Hero Section */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-[1.15] tracking-tight">
            {siteSettings.heroHeading.split(/(\*[^*]+\*)/).map((part, i) => {
              if (part.startsWith('*') && part.endsWith('*')) {
                return <span key={i} className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">{part.slice(1, -1)}</span>
              }
              return <span key={i}>{part}</span>
            })}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            {siteSettings.heroDescription}
          </p>

          <div className="mb-8">
            <SearchWithAutocomplete />
          </div>

          {/* Trust indicators - glass pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { icon: FiUsers, text: '35,000+ Active Users', color: 'text-primary' },
              { icon: FiCheckCircle, text: 'Verified Lyrics', color: 'text-emerald-500' },
              { icon: FiGlobe, text: '10+ Languages', color: 'text-blue-500' },
              { icon: FiCamera, text: 'IG Story Creator', color: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Ticker */}
      <LiveTicker songs={[
        ...(data?.editorsPicks || []),
        ...(data?.latestSongs || []),
      ].filter((song, i, arr) => arr.findIndex(s => s.id === song.id) === i)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Top Charts */}
        {data?.editorsPicks?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10">
                  <FiTrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Top Charts</h2>
              </div>
              <Link href="/songs?sort=trending" className="text-sm text-primary hover:text-primary-hover font-medium">
                View All
              </Link>
            </div>

            <Carousel>
              <div className="flex gap-3 w-max">
                {data.editorsPicks.map((song, index) => {
                  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
                  const isTop3 = index < 3
                  const accents = [
                    'from-amber-400 to-yellow-500',
                    'from-slate-300 to-slate-400',
                    'from-amber-600 to-amber-700',
                  ]
                  return (
                    <Link
                      key={song.id}
                      href={`/song/${song.slug}`}
                      className="flex-shrink-0 w-40 sm:w-48 group relative rounded-2xl overflow-hidden aspect-[3/4]"
                    >
                      {song.coverImage ? (
                        <Image src={song.coverImage} alt={song.title} fill sizes="192px" className="object-cover group-hover:scale-105 transition-transform duration-500" priority={index < 4} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                          <FiMusic className="w-12 h-12 text-slate-400/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Rank badge */}
                      <div className="absolute top-3 left-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isTop3 ? `bg-gradient-to-br ${accents[index]} text-white shadow-lg` : 'bg-white/20 backdrop-blur-md border border-white/20 text-white'}`}>
                          #{index + 1}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <FiPlay className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Glass info bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                          <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                          <p className="text-white/70 text-xs truncate mt-0.5">{artistNames}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Carousel>
          </section>
        )}

        {/* Fresh Drops */}
        {data?.latestSongs?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10">
                  <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Fresh Drops</h2>
              </div>
              <Link href="/songs?sort=latest" className="text-sm text-primary hover:text-primary-hover font-medium">
                View All
              </Link>
            </div>
            <Carousel>
              <div className="flex gap-3 w-max">
                {data.latestSongs.map((song, index) => {
                  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
                  return (
                    <Link
                      key={song.id}
                      href={`/song/${song.slug}`}
                      className="flex-shrink-0 w-40 sm:w-48 group relative rounded-2xl overflow-hidden aspect-[3/4]"
                    >
                      {song.coverImage ? (
                        <Image src={song.coverImage} alt={song.title} fill sizes="192px" className="object-cover group-hover:scale-105 transition-transform duration-500" priority={index < 4} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                          <FiMusic className="w-12 h-12 text-slate-400/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {index < 3 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">New</span>
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <FiPlay className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Glass info bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                          <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
                          <p className="text-white/70 text-xs truncate mt-0.5">{artistNames}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Carousel>
          </section>
        )}

        {/* Popular Artists */}
        {data?.artists?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10">
                  <FiUser className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Popular Artists</h2>
              </div>
              <Link href="/artists" className="text-sm text-primary hover:text-primary-hover font-medium">
                View All
              </Link>
            </div>
            <Carousel>
              <div className="flex gap-3 w-max">
                {data.artists.map((artist, index) => {
                  const gradients = [
                    'from-rose-500 to-pink-600',
                    'from-emerald-500 to-teal-600',
                    'from-blue-500 to-indigo-600',
                    'from-violet-500 to-purple-600',
                    'from-amber-500 to-orange-600',
                    'from-cyan-500 to-sky-600',
                    'from-fuchsia-500 to-pink-600',
                    'from-lime-500 to-green-600',
                    'from-red-500 to-rose-600',
                    'from-teal-500 to-emerald-600',
                  ]
                  return (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.slug}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full bg-[#e8ecef] dark:bg-slate-800 shadow-[3px_3px_8px_#d1d5d8,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#0f172a,-3px_-3px_8px_#1e293b] hover:shadow-[inset_2px_2px_5px_#d1d5d8,inset_-2px_-2px_5px_#ffffff] dark:hover:shadow-[inset_2px_2px_5px_#0f172a,inset_-2px_-2px_5px_#1e293b] transition-all duration-300">
                        <div className={`w-14 h-14 rounded-full overflow-hidden relative shrink-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                          {artist.imageUrl ? (
                            <Image src={artist.imageUrl} alt={artist.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        <div className="pr-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white text-sm whitespace-nowrap group-hover:text-primary transition">{artist.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{artist._count?.songs || 0} songs</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Carousel>
          </section>
        )}

        {/* Browse by Tags */}
        {data?.tags?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10">
                  <FiTag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Browse by Tags</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.tags.slice(0, 14).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#e8ecef] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm capitalize transition-all duration-200 shadow-[6px_6px_12px_#c5c9cc,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#1e293b] hover:shadow-[inset_4px_4px_8px_#c5c9cc,inset_-4px_-4px_8px_#ffffff] dark:hover:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#1e293b] hover:text-primary"
                >
                  <span>{tag.name}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-white/10 text-[11px] text-slate-500 dark:text-slate-400 font-semibold shadow-[2px_2px_4px_#c5c9cc,-2px_-2px_4px_#ffffff] dark:shadow-none">{tag._count?.songs || 0}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
