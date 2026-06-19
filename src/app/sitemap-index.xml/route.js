export const revalidate = 3600 // Regenerate every hour

export async function GET() {
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
  const now = new Date().toISOString()

  const sitemaps = [
    { url: `${baseUrl}/sitemap.xml`, name: 'Main' },
    { url: `${baseUrl}/sitemap-songs.xml`, name: 'Songs' },
    { url: `${baseUrl}/sitemap-artists.xml`, name: 'Artists' },
    { url: `${baseUrl}/sitemap-albums.xml`, name: 'Albums' },
    { url: `${baseUrl}/sitemap-genres.xml`, name: 'Genres' },
    { url: `${baseUrl}/sitemap-movies.xml`, name: 'Movies' },
    { url: `${baseUrl}/sitemap-categories.xml`, name: 'Categories' },
    { url: `${baseUrl}/sitemap-tags.xml`, name: 'Tags' },
    { url: `${baseUrl}/sitemap-blog.xml`, name: 'Blog' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
