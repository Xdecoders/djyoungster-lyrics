import { NextResponse } from 'next/server'
import { scrapeGenius } from '@/lib/scrapers/genius'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const scrape = searchParams.get('scrape') === 'true'

    if (!q) {
      return NextResponse.json({ message: 'Query required' }, { status: 400 })
    }

    // Search Genius unofficial search API
    const searchUrl = `https://genius.com/api/search?q=${encodeURIComponent(q)}`
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ found: false })
    }

    const data = await res.json()
    const hits = data?.response?.hits || []
    const songHit = hits.find(h => h.type === 'song')

    if (!songHit) {
      return NextResponse.json({ found: false })
    }

    const result = songHit.result
    const geniusUrl = result.url

    if (!scrape) {
      return NextResponse.json({
        found: true,
        url: geniusUrl,
        title: result.full_title,
        artist: result.primary_artist?.name,
        coverImage: result.song_art_image_thumbnail_url,
      })
    }

    // Full scrape for lyrics
    const scraped = await scrapeGenius(geniusUrl)
    return NextResponse.json({
      found: true,
      url: geniusUrl,
      lyrics: scraped.lyrics || '',
      title: scraped.title || result.full_title,
      artist: scraped.artists?.[0] || result.primary_artist?.name,
    })
  } catch (error) {
    console.error('Genius search error:', error)
    return NextResponse.json({ found: false, message: error.message })
  }
}
