import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { title, language } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Movie title is required' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a movie database assistant with deep knowledge of Bollywood, Punjabi cinema, and South Asian films. You respond only with raw JSON — no markdown, no code fences, no explanation.'
        },
        {
          role: 'user',
          content: `Look up the movie "${title}"${language ? ` (${language} film)` : ''} and return all known details.

Return ONLY a JSON object with these fields (use empty string "" if unknown):
- "year": release year as a number (e.g. 2023), or 0 if unknown
- "director": director name(s), comma-separated if multiple
- "producer": producer name(s), comma-separated if multiple
- "musicDirector": music director / composer name(s)
- "writer": screenplay/story writer name(s)
- "cast": main cast / starring actors, comma-separated (top 5-6 names)
- "genre": genre(s), comma-separated (e.g. "Drama, Romance, Action")
- "language": primary language(s) of the film
- "description": 2-3 sentence factual description of the movie — plot synopsis, what it is about, notable aspects. Plain text, no marketing language.

IMPORTANT: Only fill in details you are confident about. If you are not sure about a field, use empty string. Do not guess or hallucinate credits.`
        }
      ]
    })

    let responseText = completion.choices[0].message.content.trim()

    // Strip markdown code fences if present
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim()

    let movieData
    try {
      movieData = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          movieData = JSON.parse(jsonMatch[0])
        } catch {
          throw new Error('Failed to parse movie data response')
        }
      } else {
        throw new Error('No valid JSON in response')
      }
    }

    // Normalize year to string or empty
    if (movieData.year === 0 || movieData.year === null) {
      movieData.year = ''
    } else if (typeof movieData.year === 'number') {
      movieData.year = String(movieData.year)
    }

    // Ensure all string fields
    const fields = ['director', 'producer', 'musicDirector', 'writer', 'cast', 'genre', 'language', 'description']
    for (const field of fields) {
      if (typeof movieData[field] !== 'string') {
        movieData[field] = movieData[field] ? String(movieData[field]) : ''
      }
    }

    return NextResponse.json(movieData)
  } catch (error) {
    console.error('Autofill movie error:', error)
    return NextResponse.json({ error: error.message || 'Autofill failed' }, { status: 500 })
  }
}
