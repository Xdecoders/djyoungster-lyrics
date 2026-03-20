import { prisma } from '@/lib/prisma'
import { AUTHORS } from '@/lib/authors'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, title: true, updatedAt: true, publishedAt: true, coverImage: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.blogCategory.findMany({
      where: { posts: { some: { status: 'published' } } },
      select: { slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${siteUrl}/updates</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${categories.map(cat => `<url>
    <loc>${siteUrl}/updates/category/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n  ')}
  ${AUTHORS.map(a => `<url>
    <loc>${siteUrl}/updates/author/${a.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n  ')}
  ${posts.map(post => `<url>
    <loc>${siteUrl}/updates/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${post.coverImage ? `
    <image:image>
      <image:loc>${esc(post.coverImage.startsWith('http') ? post.coverImage : siteUrl + post.coverImage)}</image:loc>
      <image:title>${esc(post.title)}</image:title>
    </image:image>` : ''}
  </url>`).join('\n  ')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
