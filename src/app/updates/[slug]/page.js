import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL

async function getPost(slug) {
  const res = await fetch(`${BASE_URL}/api/public/blog/${slug}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  return res.json()
}

async function getRecentPosts(excludeSlug) {
  try {
    const res = await fetch(`${BASE_URL}/api/public/blog?limit=6`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.posts || []).filter(p => p.slug !== excludeSlug).slice(0, 5)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const data = await getPost(params.slug)
  if (!data) return {}

  const { post } = data
  const image = post.ogImage || post.coverImage
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt

  return {
    title,
    description,
    keywords: post.metaKeywords || undefined,
    authors: [{ name: post.author }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: `${SITE_URL}/updates/${post.slug}` },
    openGraph: {
      title,
      description,
      siteName: 'DJYoungster',
      locale: 'en_IN',
      type: 'article',
      url: `${SITE_URL}/updates/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: post.blogCategory?.name,
      tags: post.metaKeywords ? post.metaKeywords.split(',').map(k => k.trim()) : undefined,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@djyoungster',
      creator: '@djyoungster',
      title,
      description,
      images: image ? [{ url: image, alt: title }] : [],
    },
  }
}

export default async function BlogPostPage({ params }) {
  const data = await getPost(params.slug)
  if (!data) notFound()

  const { post, relatedPosts } = data
  const recentPosts = await getRecentPosts(params.slug)

  const image = post.ogImage || post.coverImage
  const plainText = post.content ? post.content.replace(/<[^>]*>/g, '') : ''
  const wordCount = plainText.split(/\s+/).filter(Boolean).length

  // ── BlogPosting schema ────────────────────────────────────────────────────
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/updates/${post.slug}#article`,
    headline: post.title.substring(0, 110),
    description: post.metaDescription || post.excerpt,
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
    }),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${SITE_URL}/updates/author/${post.author?.toLowerCase().replace(/\s+/g, '-')}`,
    },
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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/updates/${post.slug}`,
    },
    articleSection: post.blogCategory?.name,
    keywords: post.metaKeywords || undefined,
    wordCount: wordCount || undefined,
    timeRequired: post.readTime ? `PT${post.readTime}M` : undefined,
    url: `${SITE_URL}/updates/${post.slug}`,
  }

  // ── BreadcrumbList ────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Updates', item: `${SITE_URL}/updates` },
  ]
  if (post.blogCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: post.blogCategory.name,
      item: `${SITE_URL}/updates/category/${post.blogCategory.slug}`,
    })
    breadcrumbItems.push({ '@type': 'ListItem', position: 4, name: post.title, item: `${SITE_URL}/updates/${post.slug}` })
  } else {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/updates/${post.slug}` })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BlogPostClient post={post} relatedPosts={relatedPosts} recentPosts={recentPosts} siteUrl={SITE_URL} />
    </>
  )
}
