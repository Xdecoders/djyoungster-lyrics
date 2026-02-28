import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.OMDB_API_KEY) {
      return NextResponse.json({ error: 'OMDB_API_KEY is not configured' }, { status: 500 })
    }

    const { title } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Movie title is required' }, { status: 400 })
    }

    // Search OMDb by title
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title.trim())}&type=movie&apikey=${process.env.OMDB_API_KEY}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error('OMDb API request failed')
    }

    const data = await res.json()

    if (data.Response === 'False') {
      // Try a search query instead of exact title
      const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(title.trim())}&type=movie&apikey=${process.env.OMDB_API_KEY}`
      const searchRes = await fetch(searchUrl)
      const searchData = await searchRes.json()

      if (searchData.Response === 'False' || !searchData.Search?.length) {
        return NextResponse.json({ error: `Movie "${title}" not found on OMDb` }, { status: 404 })
      }

      // Get details for the first result
      const firstResult = searchData.Search[0]
      const detailUrl = `https://www.omdbapi.com/?i=${firstResult.imdbID}&apikey=${process.env.OMDB_API_KEY}`
      const detailRes = await fetch(detailUrl)
      const detailData = await detailRes.json()

      return NextResponse.json(mapOmdbToForm(detailData))
    }

    return NextResponse.json(mapOmdbToForm(data))
  } catch (error) {
    console.error('Autofill movie error:', error)
    return NextResponse.json({ error: error.message || 'Autofill failed' }, { status: 500 })
  }
}

function clean(val) {
  if (!val || val === 'N/A') return ''
  return val.trim()
}

function mapOmdbToForm(data) {
  return {
    year: clean(data.Year)?.replace(/[^0-9]/g, '').slice(0, 4) || '',
    director: clean(data.Director),
    writer: clean(data.Writer),
    cast: clean(data.Actors),
    genre: clean(data.Genre),
    language: clean(data.Language),
    description: clean(data.Plot),
    // OMDb doesn't have producer or music director — leave blank
    producer: '',
    musicDirector: ''
  }
}
