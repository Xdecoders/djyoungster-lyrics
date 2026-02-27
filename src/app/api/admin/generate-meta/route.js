import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { type, name, title, year, language, bio, genre, artistName, label, director, cast, musicDirector } = await request.json()

    if (!type || (!name && !title)) {
      return NextResponse.json({ error: 'type and name/title are required' }, { status: 400 })
    }

    let contextBlock = ''

    if (type === 'artist') {
      contextBlock = `Artist name: ${name}
${language ? `Language: ${language}` : ''}
${bio ? `Bio snippet: ${bio.substring(0, 200)}` : ''}

Write a meta description for ${name}'s page on DJYoungster — a site that has all their song lyrics with English translation, Hindi Devanagari script, and Punjabi Gurmukhi script.`
    } else if (type === 'movie') {
      contextBlock = `Movie title: ${title}${year ? ` (${year})` : ''}
${language ? `Language: ${language}` : ''}
${director ? `Director: ${director}` : ''}
${musicDirector ? `Music: ${musicDirector}` : ''}
${cast ? `Cast: ${cast}` : ''}
${genre ? `Genre: ${genre}` : ''}

Write a meta description for the ${title} movie songs lyrics page on DJYoungster. The page lists all songs from this movie with lyrics, English translation, Hindi and Punjabi script.`
    } else if (type === 'album') {
      contextBlock = `Album title: ${title}
Artist: ${artistName || name}
${year ? `Year: ${year}` : ''}
${label ? `Label: ${label}` : ''}
${language ? `Language: ${language}` : ''}

Write a meta description for the ${title} album page on DJYoungster — all songs from this album with lyrics, English translation, Hindi and Punjabi script.`
    } else {
      return NextResponse.json({ error: 'Invalid type. Use artist, movie, or album.' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You write short meta descriptions for a Punjabi/Hindi music lyrics website. You write like a real person, not a marketing bot. Plain text only — no quotes, no markdown.'
        },
        {
          role: 'user',
          content: `${contextBlock}

RULES — follow every single one:
- Output ONLY the meta description text. No extra text, no labels, no quotes around it.
- Must be between 140-160 characters total (count carefully before outputting)
- NEVER start with "Explore" or "Discover" — too generic and overused
- BANNED words: delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, captivating, compelling, heartfelt, moreover, furthermore, elevate, underscore
- No hyphens used as pauses or dashes in the middle of a sentence
- Sound like a real person typed it, not a template
- Be specific — use the actual name/title, not generic placeholders
- End with "- DJYoungster" (counts toward character limit)`
        }
      ]
    })

    const metaDescription = completion.choices[0].message.content.trim()

    return NextResponse.json({ metaDescription })
  } catch (error) {
    console.error('Generate meta error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}
