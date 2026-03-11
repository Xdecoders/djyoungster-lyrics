import { NextResponse } from 'next/server'

// In-memory token cache
let tokenCache = { token: null, expiry: 0 }

async function getSpotifyToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) return tokenCache.token
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env')
  }
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Spotify token error: ${await res.text()}`)
  const data = await res.json()
  tokenCache = { token: data.access_token, expiry: Date.now() + (data.expires_in - 60) * 1000 }
  return tokenCache.token
}

function mapTrack(track) {
  const album = track.album || {}
  return {
    id: track.id,
    title: track.name,
    artists: (track.artists || []).map(a => ({ id: a.id, name: a.name })),
    album: {
      id: album.id,
      name: album.name,
      coverImage: (album.images || [])[0]?.url || null,
      releaseDate: album.release_date || '',
    },
    durationMs: track.duration_ms,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls?.spotify || null,
    isExplicit: track.explicit,
    popularity: track.popularity || 0,
  }
}

// Core search helper — tries each query in order, returns first with results
async function searchWithFallback(token, queries, market, offset, limit) {
  for (const q of queries) {
    const params = new URLSearchParams({ q, type: 'track', market, limit: String(limit), offset: String(offset) })
    const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) continue
    const data = await res.json()
    const items = data.tracks?.items || []
    if (items.length > 0) {
      return {
        tracks: items.map(mapTrack).sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate)),
        total: data.tracks?.total || items.length,
      }
    }
  }
  return { tracks: [], total: 0 }
}

// "All" tab — combine multiple Indian genres in parallel, deduplicate, sort newest first
async function fetchAllIndian(token, offset) {
  const perGenre = 15
  const genreQueries = [
    { queries: ['genre:bollywood', 'bollywood hindi new'],          market: 'IN' },
    { queries: ['genre:bhangra', 'punjabi bhangra new'],            market: 'IN' },
    { queries: ['genre:kollywood', 'tamil kollywood new'],          market: 'IN' },
    { queries: ['genre:tollywood', 'telugu tollywood new'],         market: 'IN' },
  ]

  const results = await Promise.all(
    genreQueries.map(({ queries, market }) => searchWithFallback(token, queries, market, 0, perGenre))
  )

  const seen = new Set()
  const combined = results
    .flatMap(r => r.tracks)
    .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
    .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

  // Apply offset for pagination
  const page = combined.slice(offset, offset + 50)
  return { tracks: page, total: combined.length }
}

// Language-specific fallback query chains
const LANG_QUERIES = {
  hindi:   { queries: ['genre:bollywood', 'hindi bollywood',     'bollywood'],                    market: 'IN' },
  punjabi: { queries: ['genre:bhangra',   'punjabi bhangra',     'punjabi pop'],                  market: 'IN' },
  tamil:   { queries: ['genre:kollywood', 'genre:tamil',         'kollywood tamil', 'tamil'],      market: 'IN' },
  telugu:  { queries: ['genre:tollywood', 'genre:telugu',        'tollywood telugu', 'telugu'],    market: 'IN' },
  english: { queries: ['genre:pop',       'new releases english', 'english pop new'],              market: 'US' },
}

// Direct search — used when user types in search box
async function fetchBySearch(token, query, market, offset) {
  const params = new URLSearchParams({ q: query, type: 'track', market, limit: '50', offset: String(offset) })
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Spotify search error: ${await res.text()}`)
  const data = await res.json()
  return {
    tracks: (data.tracks?.items || []).map(mapTrack),
    total: data.tracks?.total || 0,
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'all'
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    const token = await getSpotifyToken()

    let result
    if (search) {
      const market = language === 'english' ? 'US' : 'IN'
      result = await fetchBySearch(token, search, market, offset)
    } else if (language === 'all') {
      result = await fetchAllIndian(token, offset)
    } else {
      const config = LANG_QUERIES[language] || LANG_QUERIES.hindi
      result = await searchWithFallback(token, config.queries, config.market, offset, 50)
    }

    return NextResponse.json({ ...result, offset, limit: 50 })
  } catch (error) {
    console.error('Spotify releases error:', error)
    return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 })
  }
}
