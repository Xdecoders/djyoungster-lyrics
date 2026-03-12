import { NextResponse } from 'next/server'

const JIOSAAVN = 'https://www.jiosaavn.com/api.php'

const BASE_PARAMS = '_format=json&_marker=0&api_version=4&ctx=web6dot0'

async function jiosaavnSearch(query, n = 50, p = 1) {
  const url = `${JIOSAAVN}?__call=search.getResults&${BASE_PARAMS}&n=${n}&p=${p}&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.jiosaavn.com/',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`JioSaavn API error: ${res.status}`)
  const data = await res.json()
  return data
}

function mapTrack(song) {
  const more = song.more_info || {}
  // JioSaavn returns 150x150 images — upgrade to 500x500
  const image = (song.image || '').replace('150x150', '500x500')
  const artists = (more.primaryartists || song.subtitle || '')
    .split(',').map(n => ({ name: n.trim() })).filter(a => a.name)

  return {
    id: song.id,
    title: song.title?.replace(/&amp;/g, '&').replace(/&#039;/g, "'") || '',
    artists,
    album: {
      id: more.album_id || '',
      name: (more.album || '').replace(/&amp;/g, '&').replace(/&#039;/g, "'"),
      coverImage: image || null,
      releaseDate: more.release_date || (more.year ? `${more.year}-01-01` : ''),
    },
    duration: more.duration ? parseInt(more.duration) * 1000 : null,
    jiosaavnUrl: song.perma_url || null,
    label: more.label || null,
  }
}

const LANG_QUERIES = {
  hindi:   ['new hindi songs 2026', 'bollywood 2026 new', 'hindi 2026'],
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
  const page = Math.floor(offset / 50) + 1

  if (language === 'all') {
    const results = await Promise.allSettled(
      queries.map(q => jiosaavnSearch(q, 15, 1))
    )
    const seen = new Set()
    const combined = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => {
        const songs = r.value?.results || r.value?.songs?.data || []
        return songs.map(mapTrack)
      })
      .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
      .sort((a, b) => new Date(b.album.releaseDate) - new Date(a.album.releaseDate))
    return { tracks: combined.slice(offset, offset + 50), total: combined.length }
  }

  for (const q of queries) {
    try {
      const data = await jiosaavnSearch(q, 50, page)
      const songs = data?.results || data?.songs?.data || []
      if (songs.length > 0) {
        return {
          tracks: songs.map(mapTrack),
          total: data?.total || songs.length,
        }
      }
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
      const data = await jiosaavnSearch(search, 50, Math.floor(offset / 50) + 1)
      const songs = data?.results || data?.songs?.data || []
      result = { tracks: songs.map(mapTrack), total: data?.total || songs.length }
    } else {
      result = await fetchByLanguage(language, offset)
    }

    return NextResponse.json({ ...result, offset, limit: 50 })
  } catch (error) {
    console.error('JioSaavn releases error:', error)
    return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 })
  }
}
