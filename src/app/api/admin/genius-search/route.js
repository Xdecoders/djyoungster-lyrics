import { NextResponse } from 'next/server'
import { scrapeGenius } from '@/lib/scrapers/genius'

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

// Score a Genius hit against expected artist + title (higher = better match)
function scoreHit(result, artistName, title) {
  const hitTitle = normalize(result.title)
  const hitArtist = normalize(result.primary_artist?.name)
  const wantTitle = normalize(title)
  const wantArtist = normalize(artistName)

  let score = 0
  if (hitTitle === wantTitle) score += 10
  else if (hitTitle.includes(wantTitle) || wantTitle.includes(hitTitle)) score += 5
  if (hitArtist === wantArtist) score += 8
  else if (hitArtist.includes(wantArtist) || wantArtist.includes(hitArtist)) score += 4
  return score
}

async function searchGenius(query) {
  const url = `https://genius.com/api/search?q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.response?.hits || []).filter(h => h.type === 'song').map(h => h.result)
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || ''
    const artist = searchParams.get('artist') || ''
    const scrape = searchParams.get('scrape') === 'true'

    if (!title) {
      return NextResponse.json({ message: 'title parameter required' }, { status: 400 })
    }

    // Try two queries: "Artist Title" and "Title Artist" — pick the best scored hit
    const queries = [
      `${artist} ${title}`.trim(),
      `${title} ${artist}`.trim(),
    ].filter(Boolean)

    let bestResult = null
    let bestScore = -1

    for (const q of queries) {
      const hits = await searchGenius(q)
      for (const hit of hits) {
        const score = scoreHit(hit, artist, title)
        if (score > bestScore) {
          bestScore = score
          bestResult = hit
        }
      }
      // Good enough match found — stop searching
      if (bestScore >= 14) break
    }

    if (!bestResult) {
      return NextResponse.json({ found: false })
    }

    const geniusUrl = bestResult.url

    if (!scrape) {
      return NextResponse.json({
        found: true,
        url: geniusUrl,
        title: bestResult.full_title,
        artist: bestResult.primary_artist?.name,
        score: bestScore,
      })
    }

    // Full scrape for lyrics
    const scraped = await scrapeGenius(geniusUrl)
    return NextResponse.json({
      found: true,
      url: geniusUrl,
      lyrics: scraped.lyrics || '',
      title: scraped.title || bestResult.full_title,
      artist: scraped.artists?.[0] || bestResult.primary_artist?.name,
      score: bestScore,
    })
  } catch (error) {
    console.error('Genius search error:', error)
    return NextResponse.json({ found: false, message: error.message })
  }
}
