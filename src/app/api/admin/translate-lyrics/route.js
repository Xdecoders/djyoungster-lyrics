import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const { lyrics } = await request.json()

    if (!lyrics || !lyrics.trim()) {
      return NextResponse.json(
        { error: 'Lyrics text is required' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a professional lyrics translator. Translate the following song lyrics into 4 variants. Preserve line breaks, stanza structure, and keep the same number of lines in each translation.

Return ONLY valid JSON (no markdown, no code fences) with these 4 fields:
- "lyricsRomanized": Latin script transliteration of the original lyrics
- "lyricsTranslated": English translation
- "lyricsHindi": Hindi translation in Devanagari script
- "lyricsPunjabi": Punjabi translation in Gurmukhi script

If the lyrics are already in one of these languages, still provide all 4 variants. For the romanized version, transliterate the original script to Latin characters.

Lyrics:
${lyrics}`
        }
      ]
    })

    const responseText = message.content[0].text

    let translations
    try {
      translations = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        translations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse translation response as JSON')
      }
    }

    return NextResponse.json(translations)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}
