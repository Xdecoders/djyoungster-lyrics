import OpenAI from 'openai'
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

    let movieData
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
      movieData = await detailRes.json()
    } else {
      movieData = data
    }

    const mapped = mapOmdbToForm(movieData)

    // Rewrite the description in human style if we have one
    if (mapped.description && process.env.OPENAI_API_KEY) {
      mapped.description = await rewriteDescription(mapped.description, mapped, title)
    }

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Autofill movie error:', error)
    return NextResponse.json({ error: error.message || 'Autofill failed' }, { status: 500 })
  }
}

async function rewriteDescription(plot, movie, title) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You rewrite movie descriptions for a music lyrics website. Write like a real person, not a Wikipedia editor or press release. Plain text only.'
        },
        {
          role: 'user',
          content: `Rewrite this plot description for the movie "${title}"${movie.year ? ` (${movie.year})` : ''}${movie.director ? `, directed by ${movie.director}` : ''}.

Original: "${plot}"

Write 2-3 sentences max. Keep all the factual details accurate — do not add or invent anything. Just change the tone from dry/robotic to natural and readable, like a friend explaining what the movie is about.

BANNED WORDS: delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, underscore, elevate, heartfelt, captivating, compelling, timeless, soulful, beautifully, seamlessly, profound, nuanced, eloquent, evocative, visceral.
No hyphens as pauses. No marketing language. No "this film...", "this movie..." openers — start with the character or situation directly.

Output only the rewritten description, nothing else.`
        }
      ]
    })

    return completion.choices[0].message.content.trim()
  } catch {
    // If rewrite fails, return original plot
    return plot
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
    producer: '',
    musicDirector: ''
  }
}
