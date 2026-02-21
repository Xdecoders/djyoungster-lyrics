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

    const { lyrics, language } = await request.json()

    if (!lyrics || !lyrics.trim()) {
      return NextResponse.json(
        { error: 'Lyrics text is required' },
        { status: 400 }
      )
    }

    if (!language || !['hindi', 'punjabi'].includes(language)) {
      return NextResponse.json(
        { error: 'Language must be "hindi" or "punjabi"' },
        { status: 400 }
      )
    }

    const scriptName = language === 'hindi' ? 'Devanagari (Hindi)' : 'Gurmukhi (Punjabi)'

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: `You are a ${scriptName} script spelling expert. You MUST respond with ONLY raw JSON — no markdown, no code fences, no explanation text before or after.`
        },
        {
          role: 'user',
          content: `Analyze the following ${scriptName} lyrics for spelling errors. Check for:
- Incorrect matras/vowel signs
- Missing or wrong nukta usage
- Incorrect gemination (adhak/doubled consonants)
- Wrong tippi/bindi usage (Punjabi)
- Common transliteration errors
- Words that are misspelled or use wrong characters

For each misspelled word, provide 2-4 correction suggestions ranked by likelihood.

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    {
      "word": "the misspelled word exactly as it appears",
      "line": 1,
      "charOffset": 0,
      "suggestions": ["most likely correct spelling", "alternative 1", "alternative 2"]
    }
  ]
}

Rules:
- "line" is 1-based line number where the word appears
- "charOffset" is the 0-based character position of the word's first character within that line
- If a word appears multiple times and is misspelled each time, include separate entries for each occurrence with their specific line and charOffset
- If no spelling issues are found, return { "suggestions": [] }
- Only flag genuine spelling errors — do not flag proper nouns, stylistic choices, or uncommon but valid words
- Be precise with line numbers and character offsets

Lyrics:
${lyrics}`
        }
      ]
    })

    const choice = completion.choices[0]

    if (choice.finish_reason === 'length') {
      throw new Error('Spell check response was truncated. Try with shorter lyrics.')
    }

    let responseText = choice.message.content.trim()

    // Strip markdown code fences if present
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '')
    responseText = responseText.trim()

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0])
        } catch {
          console.error('Spell check JSON parse failed. Response preview:', responseText.substring(0, 500))
          throw new Error('Failed to parse spell check response as JSON.')
        }
      } else {
        console.error('No JSON found in spell check response. Response preview:', responseText.substring(0, 500))
        throw new Error('Failed to parse spell check response. No valid JSON found.')
      }
    }

    if (!Array.isArray(result.suggestions)) {
      result.suggestions = []
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Spell check error:', error)
    return NextResponse.json(
      { error: error.message || 'Spell check failed' },
      { status: 500 }
    )
  }
}
