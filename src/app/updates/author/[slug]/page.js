import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiClock, FiMapPin, FiCalendar, FiTwitter, FiInstagram, FiArrowLeft, FiTag } from 'react-icons/fi'
import { getAuthor, AUTHORS } from '@/lib/authors'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : siteUrl

export async function generateStaticParams() {
  return AUTHORS.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }) {
  const author = getAuthor(params.slug)
  if (!author) return {}
  const description = author.bio.split('\n\n')[0].substring(0, 155) + '…'
  const nameParts = author.name.split(' ')
  return {
    title: `${author.name} — ${author.title} | DJYoungster`,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${siteUrl}/updates/author/${author.slug}` },
    openGraph: {
      title: `${author.name} — ${author.title} | DJYoungster`,
      description,
      siteName: 'DJYoungster',
      locale: 'en_IN',
      type: 'profile',
      url: `${siteUrl}/updates/author/${author.slug}`,
      'profile:first_name': nameParts[0],
      'profile:last_name': nameParts.slice(1).join(' '),
      'profile:username': author.slug,
      images: [{ url: `${siteUrl}/og-updates.jpg`, width: 1200, height: 630, alt: author.name }],
    },
    twitter: {
      card: 'summary',
      site: '@djyoungster',
      title: `${author.name} — ${author.title} | DJYoungster`,
      description,
    },
  }
}

async function getAuthorPosts(authorName) {
  try {
    const res = await fetch(
      `${baseUrl}/api/public/blog?author=${encodeURIComponent(authorName)}&limit=24`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.posts || []
  } catch {
    return []
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function InitialsAvatar({ initials, color, size = 'lg' }) {
  const dim = size === 'lg' ? 'w-28 h-28 text-3xl' : 'w-12 h-12 text-base'
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-extrabold text-white flex-shrink-0 shadow-lg`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default async function AuthorPage({ params }) {
  const author = getAuthor(params.slug)
  if (!author) notFound()

  const posts = await getAuthorPosts(author.name)
  const totalArticles = posts.length

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Updates', item: `${siteUrl}/updates` },
      { '@type': 'ListItem', position: 3, name: 'Authors', item: `${siteUrl}/updates` },
      { '@type': 'ListItem', position: 4, name: author.name, item: `${siteUrl}/updates/author/${author.slug}` },
    ],
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/updates/author/${author.slug}#author`,
    name: author.name,
    jobTitle: author.title,
    url: `${siteUrl}/updates/author/${author.slug}`,
    description: author.bio.split('\n\n')[0],
    knowsAbout: author.specialties,
    worksFor: {
      '@type': 'Organization',
      name: 'DJYoungster',
      url: siteUrl,
    },
    sameAs: [
      author.social?.twitter !== 'https://twitter.com' ? author.social?.twitter : null,
      author.social?.instagram !== 'https://instagram.com' ? author.social?.instagram : null,
    ].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-50">

        {/* Hero */}
        <div className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-14 pb-14 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1DB95422,_transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ background: `radial-gradient(ellipse at bottom left, ${author.color}, transparent 65%)` }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-slate-600">/</span>
              <Link href="/updates" className="hover:text-white transition-colors">Updates</Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">Authors</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">{author.name}</span>
            </nav>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center font-extrabold text-white text-2xl md:text-3xl flex-shrink-0 shadow-xl"
                style={{ backgroundColor: author.color }}
              >
                {author.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: author.color }}>
                  Author
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
                  {author.name}
                </h1>
                <p className="text-slate-300 text-base font-medium mb-4">{author.title}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5" /> {author.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5" /> Writing since {author.joined}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    {totalArticles} article{totalArticles !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {author.specialties.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white/90"
                      style={{ backgroundColor: `${author.color}55` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

            {/* Left — bio + articles */}
            <div className="space-y-8">

              {/* Biography */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span
                    className="w-1 h-5 rounded-full inline-block"
                    style={{ backgroundColor: author.color }}
                  />
                  About {author.name}
                </h2>
                <div className="space-y-4">
                  {author.bio.split('\n\n').map((para, i) => (
                    <p key={i} className="text-slate-600 leading-relaxed text-[15px]">{para}</p>
                  ))}
                </div>
              </div>

              {/* Articles */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-5">
                  {totalArticles > 0 ? `Articles by ${author.name}` : `No published articles yet`}
                </h2>

                {totalArticles === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <FiTag className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400">No published articles yet.</p>
                    <Link href="/updates" className="text-primary text-sm mt-2 inline-block hover:underline">
                      Browse all updates
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {posts.map(post => (
                      <Link
                        key={post.id}
                        href={`/updates/${post.slug}`}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col border border-slate-100 hover:border-slate-200"
                      >
                        {post.coverImage ? (
                          <div className="h-40 overflow-hidden flex-shrink-0">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-40 flex-shrink-0 bg-slate-100 flex items-center justify-center">
                            <FiTag className="w-7 h-7 text-slate-300" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          {post.blogCategory && (
                            <span
                              className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-bold text-white mb-2"
                              style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
                            >
                              {post.blogCategory.name}
                            </span>
                          )}
                          <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug flex-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                            <span>{formatDate(post.publishedAt)}</span>
                            {post.readTime && (
                              <span className="flex items-center gap-1">
                                <FiClock className="w-3 h-3" />{post.readTime} min
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Quick facts */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Facts</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500">Role</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[160px]">{author.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500">Based in</span>
                    <span className="font-semibold text-slate-700">{author.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500">Writing since</span>
                    <span className="font-semibold text-slate-700">{author.joined}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-semibold text-slate-700">{author.stats.yearsActive}+ years</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Articles</span>
                    <span className="font-semibold" style={{ color: author.color }}>{totalArticles}</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Covers</p>
                <div className="flex flex-wrap gap-2">
                  {author.specialties.map(s => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
                      style={{ color: author.color, borderColor: `${author.color}44`, backgroundColor: `${author.color}0d` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meet the team */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Meet the Team</p>
                <div className="space-y-3">
                  {AUTHORS.filter(a => a.slug !== author.slug).map(a => (
                    <Link
                      key={a.slug}
                      href={`/updates/author/${a.slug}`}
                      className="flex items-center gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: a.color }}
                      >
                        {a.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{a.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Back link */}
              <Link
                href="/updates"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium group"
              >
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Updates
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
