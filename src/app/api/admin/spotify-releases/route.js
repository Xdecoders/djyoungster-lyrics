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

// Use Browse New Releases for true latest-first ordering
async function fetchNewReleases(token, country, offset, limit) {
  // Step 1: get new album IDs
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?country=${country}&limit=${limit}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )
  if (!albumsRes.ok) throw new Error(`Spotify new-releases error: ${await albumsRes.text()}`)
  const albumsData = await albumsRes.json()
  const albums = albumsData.albums?.items || []
  if (albums.length === 0) return { tracks: [], total: 0 }

  // Step 2: batch-fetch full album data (up to 20 IDs per call)
  const ids = albums.map(a => a.id).join(',')
  const fullRes = await fetch(
    `https://api.spotify.com/v1/albums?ids=${ids}&market=${country}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )
  if (!fullRes.ok) throw new Error(`Spotify albums batch error: ${await fullRes.text()}`)
  const fullData = await fullRes.json()

  // Step 3: take first track from each album
  const tracks = (fullData.albums || []).flatMap(album => {
    const track = album.tracks?.items?.[0]
    if (!track) return []
    return [{
      id: track.id,
      title: track.name,
      artists: track.artists.map(a => ({ id: a.id, name: a.name })),
      album: {
        id: album.id,
        name: album.name,
        coverImage: album.images?.[0]?.url || null,
        releaseDate: album.release_date,
      },
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls?.spotify || null,
      isExplicit: track.explicit,
      popularity: album.popularity || 0,
    }]
  })
  // Already ordered by Spotify's new-release date
  .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

  return { tracks, total: albumsData.albums?.total || 0 }
}

// Genre-based search (no year restriction — rely on date sort)
// Validated Spotify genre slugs for Indian music
const GENRE_CONFIGS = {
  hindi:   { q: 'genre:bollywood OR genre:filmi',   market: 'IN' },
  punjabi: { q: 'genre:bhangra OR genre:desi',      market: 'IN' },
  tamil:   { q: 'genre:tamil OR genre:kollywood',   market: 'IN' },
  telugu:  { q: 'genre:telugu OR genre:tollywood',  market: 'IN' },
}

async function fetchByGenre(token, language, offset, limit) {
  const config = GENRE_CONFIGS[language]

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
  if (!res.ok) throw new Error(`Spotify search error: ${await res.text()}`)
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
    .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

  return { tracks, total: data.tracks?.total || 0 }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'all'
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = 20

    const token = await getSpotifyToken()

    let result
    if (language === 'all') {
      result = await fetchNewReleases(token, 'IN', offset, limit)
    } else if (language === 'english') {
      result = await fetchNewReleases(token, 'US', offset, limit)
    } else {
      result = await fetchByGenre(token, language, offset, limit)
    }

    return NextResponse.json({ ...result, offset, limit })
  } catch (error) {
    console.error('Spotify releases error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch Spotify releases' },
      { status: 500 }
    )
  }
}
