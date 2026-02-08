import Link from 'next/link'
import Image from '@/components/OptimizedImage'
import { FiMusic, FiPlay, FiUser, FiTrendingUp, FiClock, FiTag, FiCheckCircle, FiUsers, FiGlobe, FiCamera } from 'react-icons/fi'
import SearchWithAutocomplete from './SearchClient'

// Server-Side Rendered Song Card
function SongCard({ song, index, priority = false }) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const pastelColors = [
    'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40',
    'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40',
    'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    'from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40',
    'from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40',
  ]
  const bgColor = pastelColors[index % pastelColors.length]

  return (
    <Link href={`/song/${song.slug}`} className="flex-shrink-0 w-44 group">
      <div className={`aspect-square rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center mb-3 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300`}>
        {song.coverImage ? (
          <Image src={song.coverImage} alt={song.title} fill sizes="176px" className="object-cover" priority={priority} />
        ) : (
          <FiMusic className="w-12 h-12 text-slate-400" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <FiPlay className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm">{song.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{artistNames}</p>
    </Link>
  )
}

// Server-Side Rendered Artist Card
function ArtistCard({ artist, index }) {
  const pastelBgs = [
    'bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40',
    'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
    'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-900/40',
    'bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-900/40',
    'bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
  ]

  return (
    <Link href={`/artist/${artist.slug}`} className="flex-shrink-0 w-36 group text-center">
      <div className={`w-28 h-28 mx-auto rounded-full ${pastelBgs[index % pastelBgs.length]} flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 relative`}>
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt={artist.name} fill sizes="112px" className="object-cover" />
        ) : (
          <FiUser className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <h3 className="font-medium text-slate-800 dark:text-white text-sm truncate">{artist.name}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{artist._count?.songs || 0} songs</p>
    </Link>
  )
}

// Pure CSS Horizontal Scrollable Container
function ScrollableSection({ children, title, icon: Icon, iconBg, viewAllLink }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-xl ${iconBg || 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h2>
        </div>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary hover:text-primary-hover font-medium">
            View All
          </Link>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-hide pb-2 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex gap-4 w-max">
          {children}
        </div>
      </div>
    </section>
  )
}

// Main Server Component for Homepage Content
export default function HomeContent({ data, siteSettings }) {
  return (
    <div className="bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section - Server Rendered */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent pb-2">
              {siteSettings.heroHeading}
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            {siteSettings.heroDescription}
          </p>

          {/* Trust Indicators - Server Rendered */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-primary" />
              <span className="font-medium">15,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Verified Lyrics</span>
            </div>
            <div className="flex items-center gap-2">
              <FiGlobe className="w-5 h-5 text-blue-500" />
              <span className="font-medium">10+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCamera className="w-5 h-5 text-purple-500" />
              <span className="font-medium">IG Story Creator</span>
            </div>
          </div>

          {/* Search Component - Only Client Component */}
          <SearchWithAutocomplete />
        </div>
      </section>

      {/* Main Content - All Server Rendered */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Trending Songs - SSR */}
        {data?.trendingSongs?.length > 0 && (
          <ScrollableSection
            title="Trending Now"
            icon={FiTrendingUp}
            iconBg="bg-rose-100"
            viewAllLink="/songs?sort=trending"
          >
            {data.trendingSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} priority={index < 4} />
            ))}
          </ScrollableSection>
        )}

        {/* Latest Songs - SSR */}
        {data?.latestSongs?.length > 0 && (
          <ScrollableSection
            title="Latest Songs"
            icon={FiClock}
            iconBg="bg-blue-100"
            viewAllLink="/songs?sort=latest"
          >
            {data.latestSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </ScrollableSection>
        )}

        {/* Popular Artists - SSR */}
        {data?.artists?.length > 0 && (
          <ScrollableSection
            title="Popular Artists"
            icon={FiUser}
            iconBg="bg-emerald-100"
            viewAllLink="/artists"
          >
            {data.artists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
          </ScrollableSection>
        )}

        {/* Browse by Tags - SSR */}
        {data?.tags?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <FiTag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Browse by Tags</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {data.tags.slice(0, 14).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <p className="font-medium text-slate-800 dark:text-white group-hover:text-primary transition capitalize truncate">
                    {tag.name} Songs
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {tag._count?.songs || 0} songs
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
