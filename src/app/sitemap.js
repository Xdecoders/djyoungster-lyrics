import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  const staticPages = [
    { url: baseUrl,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/updates`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/about-us`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact-us`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const [blogPosts, blogCategories] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, coverImage: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.blogCategory.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ])

  const blogPostPages = blogPosts.map(post => ({
    url: `${baseUrl}/updates/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
    ...(post.coverImage && { images: [getAbsoluteUrl(post.coverImage)] }),
  }))

  const blogCategoryPages = blogCategories.map(cat => ({
    url: `${baseUrl}/updates?category=${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...blogCategoryPages,
    ...blogPostPages,
  ]
}
