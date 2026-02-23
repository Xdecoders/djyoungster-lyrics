import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'

export const revalidate = 3600 // Regenerate every hour

export async function GET() {
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  try {
    const movies = await prisma.movie.findMany({
      where: { slug: { not: null } },
      select: { slug: true, title: true, posterUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${movies.map(movie => {
  const imageUrl = getAbsoluteUrl(movie.posterUrl)
  return `  <url>
    <loc>${baseUrl}/movie/${movie.slug}</loc>
    <lastmod>${(movie.createdAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(movie.title)}</image:title>
    </image:image>` : ''}
  </url>`
}).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating movies sitemap:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
}

function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
