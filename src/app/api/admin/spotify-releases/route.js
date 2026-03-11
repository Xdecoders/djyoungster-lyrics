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

function mapTrack(track, album) {
  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map(a => ({ id: a.id, name: a.name })),
    album: {
      id: album.id,
      name: album.name,
      coverImage: (album.images || [])[0]?.url || null,
      releaseDate: album.release_date,
    },
    durationMs: track.duration_ms,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls?.spotify || null,
    isExplicit: track.explicit,
    popularity: track.popularity || album.popularity || 0,
  }
}

// Fetch 50 new releases via Browse API + batch album detail
async function fetchNewReleases(token, country, offset) {
  const limit = 50
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?country=${country}&limit=${limit}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  )
  if (!albumsRes.ok) throw new Error(`Spotify new-releases error: ${await albumsRes.text()}`)
  const albumsData = await albumsRes.json()
  const albumItems = albumsData.albums?.items || []
  if (albumItems.length === 0) return { tracks: [], total: 0 }

  // Batch fetch full album data (Spotify allows 20 IDs per call)
  const ids = albumItems.map(a => a.id)
  const chunks = []
  for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20))

  const batchResults = await Promise.all(
    chunks.map(chunk =>
      fetch(`https://api.spotify.com/v1/albums?ids=${chunk.join(',')}&market=${country}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }).then(r => r.json())
    )
  )

  const fullAlbums = batchResults.flatMap(r => r.albums || [])

  const tracks = fullAlbums
    .flatMap(album => {
      const track = album.tracks?.items?.[0]
      if (!track) return []
      return [mapTrack(track, album)]
    })
    .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

  return { tracks, total: albumsData.albums?.total || 0 }
}

const GENRE_CONFIGS = {
  hindi:   { q: 'genre:bollywood OR genre:filmi',  market: 'IN' },
  punjabi: { q: 'genre:bhangra OR genre:desi',     market: 'IN' },
  tamil:   { q: 'genre:tamil OR genre:kollywood',  market: 'IN' },
  telugu:  { q: 'genre:telugu OR genre:tollywood', market: 'IN' },
}

// Genre search — 50 results, sorted by release date
async function fetchByGenre(token, language, offset) {
  const config = GENRE_CONFIGS[language]
  const params = new URLSearchParams({
    q: config.q,
    type: 'track',
    market: config.market,
    limit: '50',
    offset: String(offset),
  })
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Spotify search error: ${await res.text()}`)
  const data = await res.json()

  const tracks = (data.tracks?.items || [])
    .map(track => mapTrack(track, track.album))
    .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))

  return { tracks, total: data.tracks?.total || 0 }
}

// Direct Spotify search — used when user types in search box
async function fetchBySearch(token, query, market, offset) {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    market,
    limit: '50',
    offset: String(offset),
  })
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Spotify search error: ${await res.text()}`)
  const data = await res.json()

  const tracks = (data.tracks?.items || []).map(track => mapTrack(track, track.album))
  return { tracks, total: data.tracks?.total || 0 }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'all'
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    const token = await getSpotifyToken()
    const market = language === 'english' ? 'US' : 'IN'

    let result
    if (search) {
      result = await fetchBySearch(token, search, market, offset)
    } else if (language === 'all') {
      result = await fetchNewReleases(token, 'IN', offset)
    } else if (language === 'english') {
      result = await fetchNewReleases(token, 'US', offset)
    } else {
      result = await fetchByGenre(token, language, offset)
    }

    return NextResponse.json({ ...result, offset, limit: 50 })
  } catch (error) {
    console.error('Spotify releases error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch Spotify releases' },
      { status: 500 }
    )
  }
}
