import { FiMusic, FiGlobe, FiCamera, FiVideo, FiUsers, FiCheckCircle } from 'react-icons/fi'
import FAQAccordion from './FAQAccordion'

const FEATURES = [
  {
    icon: FiMusic,
    title: 'Verified Lyrics',
    desc: 'Accurate, hand-checked lyrics in Hindi, Punjabi, English, Tamil, Telugu & more.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: FiGlobe,
    title: 'Translations & Meaning',
    desc: 'Romanized versions and English translations so every listener understands.',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-900/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: FiCamera,
    title: 'IG Story Creator',
    desc: 'Turn favourite lines into beautiful story images — multiple templates, free.',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-100 dark:border-pink-900/40',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    icon: FiVideo,
    title: 'Reel Creator',
    desc: 'Animated lyric videos ready to post on Instagram Reels, TikTok & YouTube Shorts.',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-900/40',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: FiUsers,
    title: '35,000+ Monthly Users',
    desc: 'A trusted community of music lovers from across India and worldwide.',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-900/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: FiCheckCircle,
    title: 'Always Up-To-Date',
    desc: 'New releases added within hours of launch — stay ahead of every trend.',
    color: 'cyan',
    gradient: 'from-cyan-500 to-sky-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-100 dark:border-cyan-900/40',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
]

export default function AboutSection({ faqs, aboutHtml }) {
  return (
    <div className="w-full">

      {/* ── About ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="about-heading"
        className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

          {/* Top: headline + intro */}
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">About DJYoungster</p>
            <h2
              id="about-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-5"
            >
              India's Most Trusted Lyrics Platform
            </h2>
            {aboutHtml ? (
              <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: aboutHtml }}
              />
            ) : (
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                <p>
                  Welcome to <strong className="text-slate-800 dark:text-slate-100">DJYoungster</strong> — your ultimate destination for song lyrics from around the world. We bring together a vast, continuously updated collection spanning <strong className="text-slate-800 dark:text-slate-100">Hindi, Punjabi, English, Tamil, Telugu, Bhojpuri, Haryanvi</strong> and many more regional languages.
                </p>
                <p>
                  Whether you're searching for the latest Bollywood chart-toppers, trending Punjabi bangers, timeless English classics, or regional gems, DJYoungster delivers accurate lyrics instantly. Every entry is verified, romanised for easy reading, and paired with an English translation so you truly understand the music you love.
                </p>
                <p>
                  Beyond lyrics, our free <strong className="text-slate-800 dark:text-slate-100">Instagram Story Creator</strong> and <strong className="text-slate-800 dark:text-slate-100">Reel Creator</strong> let you transform favourite lines into shareable visual content — perfect for expressing your mood across Instagram, WhatsApp, TikTok, and YouTube Shorts. Trusted by over <strong className="text-slate-800 dark:text-slate-100">35,000 monthly users</strong>, DJYoungster is the go-to platform for music lovers who want more than just words on a page.
                </p>
              </div>
            )}
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`relative flex gap-4 p-5 rounded-2xl border ${f.bg} ${f.border} overflow-hidden group`}
              >
                {/* Subtle gradient accent top-right */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${f.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                <div className={`relative flex-shrink-0 w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center shadow-sm`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div className="relative">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1.5">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="faq-heading"
        className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">FAQ</p>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight"
            >
              Frequently Asked Questions
            </h2>
          </div>

          {/* Two-column FAQ grid on desktop */}
          <FAQAccordion faqs={faqs} />

        </div>
      </section>

    </div>
  )
}
