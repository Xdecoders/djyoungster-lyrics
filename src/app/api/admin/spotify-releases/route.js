import { NextResponse } from 'next/server'

// In-memory token cache (persists across warm requests)
let tokenCache = { token: null, expiry: 0 }

async function getSpotifyToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    return tokenCache.token
  }

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

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Spotify token error: ${err}`)
  }

  const data = await res.json()
  tokenCache = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in - 60) * 1000,
  }

  return tokenCache.token
}

const LANGUAGE_CONFIG = {
  all:     { q: 'year:2025-2026',                     market: 'IN' },
  hindi:   { q: 'genre:bollywood year:2025-2026',      market: 'IN' },
  punjabi: { q: 'genre:bhangra year:2025-2026',        market: 'IN' },
  tamil:   { q: 'genre:kollywood year:2025-2026',      market: 'IN' },
  telugu:  { q: 'genre:tollywood year:2025-2026',      market: 'IN' },
  english: { q: 'tag:new year:2025-2026',              market: 'US' },
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'all'
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = 30

    const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.all
    const token = await getSpotifyToken()

    const params = new URLSearchParams({
      q: config.q,
      type: 'track',
      market: config.market,
      limit: String(limit),
      offset: String(offset),
    })

    const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Spotify search error: ${err}`)
    }

    const data = await res.json()

    const tracks = (data.tracks?.items || [])
      .map(track => ({
        id: track.id,
        title: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: {
          id: track.album.id,
          name: track.album.name,
          coverImage: track.album.images[0]?.url || null,
          releaseDate: track.album.release_date,
        },
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify || null,
        isExplicit: track.explicit,
        popularity: track.popularity,
      }))
      // Sort newest first
      .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

    return NextResponse.json({
      tracks,
      total: data.tracks?.total || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Spotify releases error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch Spotify releases' },
      { status: 500 }
    )
  }
}
