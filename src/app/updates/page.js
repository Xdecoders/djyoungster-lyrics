import { Suspense } from 'react'
import BlogIndexClient from './BlogIndexClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

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

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
        <BlogIndexClient />
      </Suspense>
    </>
  )
}
