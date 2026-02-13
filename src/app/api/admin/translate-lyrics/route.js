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

    const { lyrics, title } = await request.json()

    if (!lyrics || !lyrics.trim()) {
      return NextResponse.json(
        { error: 'Lyrics text is required' },
        { status: 400 }
      )
    }

    const songTitle = title ? `"${title}"` : 'this song'

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: 'You are a professional lyrics translator and music analyst. You MUST respond with ONLY raw JSON — no markdown, no code fences, no explanation text before or after. Use \\n for line breaks inside JSON string values. Escape any special characters properly for valid JSON.',
      messages: [
        {
          role: 'user',
          content: `Process the following song lyrics into 4 script variants and write a song meaning. Preserve stanza structure using \\n for line breaks and \\n\\n for stanza breaks inside the JSON string values.

CRITICAL RULES:
- "lyricsHindi" and "lyricsPunjabi" must be TRANSLITERATIONS (script conversion), NOT translations.
- Keep the EXACT SAME original words — only change the script/writing system.
- Example: Punjabi "ਤੇਰੀ ਜਿੰਦ ਦਾ ਨੀ ਮੁੱਲ" → Hindi "तेरी जिंद दा नी मुल्ल" (same words, different script)
- Do NOT replace words with Hindi/Punjabi equivalents. Do NOT change the language.

Return ONLY a JSON object with these 7 fields:
- "lyricsRomanized": Latin script transliteration of the original lyrics (same words, Roman characters)
- "lyricsTranslated": English translation (actual meaning translation into English)
- "lyricsHindi": The SAME original lyrics written in Devanagari script (transliteration, NOT translation)
- "lyricsPunjabi": The SAME original lyrics written in Gurmukhi script (transliteration, NOT translation)
- "meaning": A detailed explanation of the song ${songTitle}'s meaning in 300-400 words in English. Include the song name and reference key hook lines or phrases from the lyrics. Cover the themes, emotions, story, and cultural context. Write it as flowing paragraphs, not bullet points.
- "metaTitle": An SEO-optimized page title under 60 characters. Format: "${title || '[Song Name]'} Lyrics, Meaning & Translation - DjYoungster". Keep it concise, include the song name first.
- "metaDescription": An SEO-optimized meta description between 150-160 characters. Include the song name, a catchy hook line or key phrase quoted from the lyrics, and mention lyrics/meaning/translation. End with "- DjYoungster".

IMPORTANT: For lyricsHindi and lyricsPunjabi, you are doing SCRIPT CONVERSION only — the words must remain identical to the original, just written in a different script. Only lyricsTranslated should be an actual language translation (into English).

Lyrics:
${lyrics}`
        }
      ]
    })

    // Check if response was truncated
    if (message.stop_reason === 'max_tokens') {
      throw new Error('Translation response was too long and got truncated. Try with shorter lyrics.')
    }

    let responseText = message.content[0].text.trim()

    // Strip markdown code fences if present
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '')
    responseText = responseText.trim()

    let translations
    try {
      translations = JSON.parse(responseText)
    } catch (parseError) {
      // Try to extract JSON object from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          translations = JSON.parse(jsonMatch[0])
        } catch {
          console.error('JSON parse failed. Response preview:', responseText.substring(0, 500))
          throw new Error('Failed to parse translation response as JSON. The AI response was malformed.')
        }
      } else {
        console.error('No JSON found in response. Response preview:', responseText.substring(0, 500))
        throw new Error('Failed to parse translation response as JSON. No valid JSON found in response.')
      }
    }

    // Validate expected fields exist
    const requiredFields = ['lyricsRomanized', 'lyricsTranslated', 'lyricsHindi', 'lyricsPunjabi', 'meaning', 'metaTitle', 'metaDescription']
    for (const field of requiredFields) {
      if (typeof translations[field] !== 'string') {
        translations[field] = translations[field] ? String(translations[field]) : ''
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
