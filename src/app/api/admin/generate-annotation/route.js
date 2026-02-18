import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const { selectedLines, songTitle, artistNames, lyricist, singers, language, songMeaning } = await request.json()

    if (!selectedLines?.length) {
      return NextResponse.json(
        { error: 'Selected lyrics lines are required' },
        { status: 400 }
      )
    }

    const lyricsText = selectedLines.join('\n')

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a music analyst and lyrics annotator, similar to Genius.com contributors. Write concise, insightful annotations that explain the meaning, imagery, wordplay, and cultural significance of song lyrics. Your annotations should be 40-120 words, written in a knowledgeable but accessible tone. Do not use markdown formatting. Write plain text only.'
        },
        {
          role: 'user',
          content: `Write an annotation for the following lyrics from "${songTitle || 'this song'}" by ${artistNames || 'the artist'}${language ? ` (${language} song)` : ''}.
${singers ? `Singer(s): ${singers}` : ''}
${lyricist ? `Lyricist/Writer: ${lyricist}` : ''}

Lyrics to annotate:
"${lyricsText}"

${songMeaning ? `Context about the song's meaning: ${songMeaning.substring(0, 500)}` : ''}

IMPORTANT: Always refer to the singer/artist and lyricist by their actual names provided above. Never use generic terms like "the singer", "the artist", "the writer", or "the lyricist" — use the real names instead.

Explain the meaning, imagery, wordplay, metaphors, cultural references, or emotional significance of these specific lines. Be specific to these lyrics — don't give a general song overview.`
        }
      ]
    })

    const annotation = completion.choices[0].message.content.trim()

    return NextResponse.json({ annotation })
  } catch (error) {
    console.error('Annotation generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Annotation generation failed' },
      { status: 500 }
    )
  }
}
