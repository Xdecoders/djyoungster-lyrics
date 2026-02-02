import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Regenerate every hour

export async function GET() {
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  try {
    const movies = await prisma.movie.findMany({
      where: { slug: { not: null } },
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${movies.map(movie => `  <url>
    <loc>${baseUrl}/movie/${movie.slug}</loc>
    <lastmod>${(movie.createdAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
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
