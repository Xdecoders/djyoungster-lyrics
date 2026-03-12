import { NextResponse } from 'next/server'

const SAAVN_API = 'https://saavn.dev/api'

function mapTrack(song) {
  const image = song.image || []
  const coverImage = image[image.length - 1]?.url || image[0]?.url || null
  const primaryArtists = song.artists?.primary || song.artists?.all || []
  return {
    id: song.id,
    title: song.name,
    artists: primaryArtists.map(a => ({ id: a.id, name: a.name })),
    album: {
      id: song.album?.id || '',
      name: song.album?.name || '',
      coverImage,
      releaseDate: song.releaseDate || (song.year ? `${song.year}-01-01` : ''),
    },
    duration: song.duration ? parseInt(song.duration) * 1000 : null,
    jiosaavnUrl: song.url || null,
    label: song.label || null,
  }
}

async function searchSongs(query, page = 1, limit = 20) {
  const params = new URLSearchParams({ query, page: String(page), limit: String(limit) })
  const res = await fetch(`${SAAVN_API}/search/songs?${params}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`JioSaavn API error: ${res.status}`)
  const data = await res.json()
  const results = data?.data?.results || []
  return {
    tracks: results.map(mapTrack),
    total: data?.data?.total || results.length,
  }
}

const LANG_QUERIES = {
  hindi:   ['new hindi songs 2026', 'bollywood 2026', 'hindi 2026'],
  punjabi: ['new punjabi songs 2026', 'punjabi 2026'],
  tamil:   ['new tamil songs 2026', 'kollywood 2026', 'tamil 2026'],
  telugu:  ['new telugu songs 2026', 'tollywood 2026', 'telugu 2026'],
  english: ['new english songs 2026', 'english pop 2026'],
}

const ALL_QUERIES = [
  'new hindi songs 2026',
  'new punjabi songs 2026',
  'new tamil songs 2026',
  'new telugu songs 2026',
]

async function fetchByLanguage(language, offset) {
  const queries = language === 'all' ? ALL_QUERIES : (LANG_QUERIES[language] || LANG_QUERIES.hindi)
  const page = Math.floor(offset / 20) + 1

  if (language === 'all') {
    // Fetch all languages in parallel, deduplicate
    const results = await Promise.all(
      queries.map(q => searchSongs(q, 1, 15).catch(() => ({ tracks: [], total: 0 })))
    )
    const seen = new Set()
    const combined = results
      .flatMap(r => r.tracks)
      .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
      .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))
    return { tracks: combined.slice(offset, offset + 50), total: combined.length }
  }

  // Try each query until we get results
  for (const q of queries) {
    try {
      const result = await searchSongs(q, page, 50)
      if (result.tracks.length > 0) return result
    } catch {}
  }
  return { tracks: [], total: 0 }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'all'
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    let result
    if (search) {
      result = await searchSongs(search, Math.floor(offset / 50) + 1, 50)
    } else {
      result = await fetchByLanguage(language, offset)
    }

    return NextResponse.json({ ...result, offset, limit: 50 })
  } catch (error) {
    console.error('JioSaavn releases error:', error)
    return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 })
  }
}
