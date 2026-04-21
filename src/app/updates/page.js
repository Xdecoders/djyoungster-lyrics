import { Suspense } from 'react'
import BlogIndexClient from './BlogIndexClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL

export const metadata = {
  title: 'Updates — Movie Reviews, Box Office, Bollywood News | DJYoungster',
  description: 'Latest Bollywood movie reviews, box office collections, upcoming releases, artist profiles and entertainment updates on DJYoungster.',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: `${SITE_URL}/updates` },
  openGraph: {
    title: 'Updates — Movie Reviews, Box Office, Bollywood News | DJYoungster',
    description: 'Latest Bollywood movie reviews, box office collections, upcoming releases, artist profiles and entertainment updates.',
    siteName: 'DJYoungster',
    locale: 'en_IN',
    type: 'website',
    url: `${SITE_URL}/updates`,
    images: [{ url: `${SITE_URL}/og-updates.jpg`, width: 1200, height: 630, alt: 'DJYoungster Updates' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@djyoungster',
    title: 'Updates — DJYoungster',
    description: 'Latest Bollywood movie reviews, box office, artist news and entertainment updates.',
    images: [`${SITE_URL}/og-updates.jpg`],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'DJYoungster',
  url: SITE_URL,
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/updates?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SITE_URL}/updates#blog`,
  name: 'DJYoungster Updates',
  description: 'Latest Bollywood movie reviews, box office collections, upcoming releases, artist news and entertainment updates.',
  url: `${SITE_URL}/updates`,
  inLanguage: 'en-IN',
  publisher: {
    '@type': 'Organization',
    name: 'DJYoungster',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 600,
      height: 60,
    },
  },
}

export const revalidate = 300

async function getInitialData() {
  try {
    const [postsRes, catsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/public/blog?page=1&limit=12`, { next: { revalidate: 300 } }),
      fetch(`${BASE_URL}/api/public/blog/categories`, { next: { revalidate: 300 } }),
    ])
    const postsData = postsRes.ok ? await postsRes.json() : { posts: [], total: 0, totalPages: 1 }
    const categories = catsRes.ok ? await catsRes.json() : []
    return {
      posts: postsData.posts || [],
      total: postsData.total || 0,
      totalPages: postsData.totalPages || 1,
      categories: Array.isArray(categories) ? categories : [],
    }
  } catch {
    return { posts: [], total: 0, totalPages: 1, categories: [] }
  }
}

export default async function BlogPage() {
  const initialData = await getInitialData()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
        <BlogIndexClient initialData={initialData} />
      </Suspense>
    </>
  )
}
