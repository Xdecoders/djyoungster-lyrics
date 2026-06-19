import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiClock, FiTag } from 'react-icons/fi'

async function getCategory(slug) {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com')
  const [catRes, postsRes] = await Promise.all([
    fetch(`${baseUrl}/api/public/blog/categories`, { next: { revalidate: 300 } }),
    fetch(`${baseUrl}/api/public/blog?category=${slug}&limit=24`, { next: { revalidate: 60 } }),
  ])
  const categories = catRes.ok ? await catRes.json() : []
  const cat = categories.find(c => c.slug === slug)
  const postsData = postsRes.ok ? await postsRes.json() : { posts: [] }
  return { cat, posts: postsData.posts }
}

export async function generateMetadata({ params }) {
  const { cat } = await getCategory(params.slug)
  if (!cat) return {}
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
  const description = cat.description || `Read the latest ${cat.name} articles — movie reviews, box office, artist news and more on DJYoungster.`
  return {
    title: `${cat.name} — DJYoungster Updates`,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${siteUrl}/updates/category/${cat.slug}` },
    openGraph: {
      title: `${cat.name} — DJYoungster Updates`,
      description,
      siteName: 'DJYoungster',
      locale: 'en_IN',
      type: 'website',
      url: `${siteUrl}/updates/category/${cat.slug}`,
      images: [{ url: `${siteUrl}/og-updates.jpg`, width: 1200, height: 630, alt: `${cat.name} — DJYoungster` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@djyoungster',
      title: `${cat.name} — DJYoungster Updates`,
      description,
    },
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function BlogCategoryPage({ params }) {
  const { cat, posts } = await getCategory(params.slug)
  if (!cat) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Updates', item: `${siteUrl}/updates` },
      { '@type': 'ListItem', position: 3, name: cat.name, item: `${siteUrl}/updates/category/${cat.slug}` },
    ],
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/updates/category/${cat.slug}`,
    name: `${cat.name} — DJYoungster Updates`,
    description: cat.description || `Read the latest ${cat.name} articles on DJYoungster.`,
    url: `${siteUrl}/updates/category/${cat.slug}`,
    inLanguage: 'en-IN',
    publisher: {
      '@type': 'Organization',
      name: 'DJYoungster',
      url: siteUrl,
    },
    ...(posts.length > 0 && {
      hasPart: posts.slice(0, 10).map(p => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${siteUrl}/updates/${p.slug}`,
        datePublished: p.publishedAt,
        ...(p.coverImage && { image: p.coverImage }),
      })),
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-50">

        {/* Hero — matches blog post / updates page style */}
        <div className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-14 pb-12 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1DB95422,_transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-slate-600">/</span>
              <Link href="/updates" className="hover:text-white transition-colors">Updates</Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">{cat.name}</span>
            </nav>

            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Category</p>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
              {cat.name}
            </h1>
            {cat.description && (
              <p className="text-slate-400 mt-3 max-w-xl text-sm md:text-base leading-relaxed">{cat.description}</p>
            )}
            <p className="text-slate-500 text-sm mt-4">{cat._count?.posts || posts.length} articles</p>
          </div>
        </div>

        {/* Meta bar */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 text-sm text-slate-500">
            <Link href="/updates" className="hover:text-primary transition-colors font-medium">← All Updates</Link>
            <span className="text-slate-300">|</span>
            <span>{cat._count?.posts || posts.length} articles in <strong className="text-slate-700">{cat.name}</strong></span>
          </div>
        </div>

        {/* Posts grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {posts.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <FiTag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No articles yet in this category.</p>
              <Link href="/updates" className="text-primary text-sm mt-2 inline-block hover:underline">Browse all updates</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/updates/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col border border-slate-100 hover:border-slate-200"
                >
                  {post.coverImage ? (
                    <div className="h-44 overflow-hidden flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-44 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${cat.color}18` || '#f1f5f9' }}>
                      <FiTag className="w-8 h-8 opacity-20" style={{ color: cat.color }} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-bold text-white mb-3"
                      style={{ backgroundColor: cat.color || '#6b7280' }}
                    >
                      {cat.name}
                    </span>
                    <h2 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug flex-1">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
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
    </>
  )
}
