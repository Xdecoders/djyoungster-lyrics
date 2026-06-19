import { FiUsers, FiGlobe, FiCamera, FiVideo } from 'react-icons/fi'
import SearchWithAutocomplete from './SearchClient'
import FreshDropsSection from './FreshDropsSection'
import ChartsSection from './ChartsSection'
import LatestUpdatesSection from './LatestUpdatesSection'

// Main Server Component for Homepage Content
export default function HomeContent({ data, siteSettings }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] dark:bg-slate-900" />

      {/* Hero Banner */}
      <section className="px-4 pt-8 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-visible">

            {/* Actual clipped background — separate from content so dropdown can escape */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 sm:py-16 w-full">
              <h1 className="w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-[1.15] tracking-tight">
                {siteSettings.heroHeading.split(/(\*[^*]+\*)/).map((part, i) =>
                  part.startsWith('*') && part.endsWith('*')
                    ? <span key={i} className="text-white/80">{part.slice(1, -1)}</span>
                    : <span key={i}>{part}</span>
                )}
              </h1>

              <p className="text-white/75 text-sm sm:text-base mb-8 w-full leading-relaxed">
                {siteSettings.heroDescription}
              </p>

              <div className="w-full max-w-xl mb-6">
                <SearchWithAutocomplete />
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: FiUsers,  text: '35K+ Users' },
                  { icon: FiCamera, text: 'IG Story Creator' },
                  { icon: FiVideo,  text: 'Reel Creator' },
                  { icon: FiGlobe,  text: 'Translations' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
                    <item.icon className="w-3 h-3 opacity-80" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FreshDropsSection data={data} />
        <ChartsSection songs={data.chartSongs} />
        <LatestUpdatesSection posts={data.recentBlogPosts} />
      </main>
    </div>
  )
}
