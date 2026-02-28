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
          content: 'You are a music fan who annotates lyrics on Genius.com. You have strong opinions, you know the culture, and you write the way you actually talk. No academic tone, no press release language. Plain text only, no markdown, no bullet points.'
        },
        {
          role: 'user',
          content: `Write an annotation for these lyrics from "${songTitle || 'this song'}" by ${artistNames || 'the artist'}${language ? ` (${language} song)` : ''}.
${singers ? `Singer(s): ${singers}` : ''}
${lyricist ? `Lyricist/Writer: ${lyricist}` : ''}

Lyrics:
"${lyricsText}"

${songMeaning ? `Song context: ${songMeaning.substring(0, 500)}` : ''}

Write 60-100 words. These specific lines only — not a summary of the whole song.

HARD RULES — all of them apply:

BANNED WORDS (never use): delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, underscore, elevate, heartfelt, moreover, furthermore, profound, captivating, compelling, timeless, soulful, beautifully, perfectly, seamlessly, speaks to, speaks volumes, the listener, overall, ultimately, at its core, in many ways, it is worth noting, one can, evocative, visceral, raw emotion, eloquent, nuanced.

BANNED OPENERS — never start with: "These lines", "In these lines", "This line", "The lyrics", "The writer", "The song", "Here", "What makes".

VOICE RULES:
- Always use the real names (${artistNames || 'the artist'}${lyricist ? `, ${lyricist}` : ''}) — never "the singer", "the artist", "the writer"
- No hyphens as pauses or em dashes
- Write like you are explaining this to a friend who just heard the song for the first time, not like you are grading a poem
- Be specific — quote or reference the actual words in these lines and say what they actually mean in plain language
- If there is a cultural reference, regional slang, double meaning, or wordplay in these lines, point it out directly — that is the most valuable thing an annotation can do
- Vary sentence length. Short is fine. Do not make every sentence the same rhythm.
- Do NOT wrap up with a neat conclusion or summary sentence
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
