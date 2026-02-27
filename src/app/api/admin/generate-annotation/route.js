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
          content: 'You annotate song lyrics the way a real fan would — someone who knows the culture, listens carefully, and writes like a person not a press release. Plain text only, no markdown, no bullet points.'
        },
        {
          role: 'user',
          content: `Write an annotation for these lyrics from "${songTitle || 'this song'}" by ${artistNames || 'the artist'}${language ? ` (${language} song)` : ''}.
${singers ? `Singer(s): ${singers}` : ''}
${lyricist ? `Lyricist/Writer: ${lyricist}` : ''}

Lyrics:
"${lyricsText}"

${songMeaning ? `Song context: ${songMeaning.substring(0, 500)}` : ''}

Write 50-100 words. Be specific to these lines only, not the whole song.

RULES — follow all of them:
- Always use the real names (${artistNames || 'the artist'}${lyricist ? `, ${lyricist}` : ''}) instead of "the singer", "the artist", "the writer"
- BANNED words: delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, underscore, elevate, heartfelt, moreover, furthermore, profound, captivating, compelling, it is worth noting
- No hyphens used as pauses or em dashes
- Do not start with "These lines" or "In these lines" or "This line" — find a more natural entry point
- Write like a Genius.com contributor who actually gets the culture, not like someone summarizing a Wikipedia article
- One specific observation about word choice, double meaning, cultural slang, or regional reference if relevant — something that adds real value
- Short sentences are fine. You don't need to sound academic
- Plain text only, no formatting`
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
