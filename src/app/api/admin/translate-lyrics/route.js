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

    const { lyrics, title, artist } = await request.json()

    if (!lyrics || !lyrics.trim()) {
      return NextResponse.json(
        { error: 'Lyrics text is required' },
        { status: 400 }
      )
    }

    const songTitle = title ? `"${title}"` : 'this song'
    const artistName = artist || ''

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 8192,
      messages: [
        {
          role: 'system',
          content: 'You are a music fan who writes honest, personal song explanations on Reddit and personal blogs. You have strong opinions, you use "I" naturally, and you write the way you actually talk — not like a journalist or a press release. You MUST respond with ONLY raw JSON — no markdown, no code fences, no explanation text before or after. Use \\n for line breaks inside JSON string values. Escape any special characters properly for valid JSON.'
        },
        {
          role: 'user',
          content: `Process the following song lyrics into 4 script variants and write a song meaning. Preserve stanza structure using \\n for line breaks and \\n\\n for stanza breaks inside the JSON string values.

CRITICAL RULES:
- "lyricsHindi" and "lyricsPunjabi" must be TRANSLITERATIONS (script conversion), NOT translations.
- Keep the SAME original words and meaning — only change the script/writing system.
- Example: Punjabi "ਤੇਰੀ ਜਿੰਦ ਦਾ ਨੀ ਮੁੱਲ" → Hindi "तेरी जिंद दा नी मुल्ल" (same words, different script)
- Do NOT replace words with Hindi/Punjabi equivalents. Do NOT change the language.
- IMPORTANT: For ALL script outputs (Romanized, Hindi, Punjabi), you must IMPROVE and CORRECT the spelling. Do NOT just blindly copy the input text. Fix misspellings, use proper matras/vowel signs, correct nukta usage, fix gemination (doubled consonants), and ensure each word is spelled accurately in that script.

Return ONLY a JSON object with these 7 fields:
- "lyricsRomanized": A clean, properly spelled Roman/Latin script transliteration. Even if the input is already in Roman script, you MUST improve and standardize the spelling — fix common transliteration mistakes, use proper vowel lengths (e.g. "aa" not "a" for long vowels like आ/ਆ), correct shorthand/lazy spellings (e.g. "nhi" → "nahi", "kdi" → "kaddi", "tenu" → "tainu", "bnde" → "bande"), and ensure every word is clearly readable. Do NOT just copy the input — always produce a polished, standardized romanization.
- "lyricsTranslated": English translation (actual meaning translation into English)
- "lyricsHindi": The SAME original lyrics written in Devanagari script (transliteration, NOT translation). IMPORTANT: Use correct Hindi matras, nuktas, and spelling — e.g. proper use of ि vs ी, ु vs ू, ं vs ँ, and conjuncts. Do not produce sloppy or approximate Devanagari — each word must be spelled accurately.
- "lyricsPunjabi": The SAME original lyrics written in Gurmukhi script (transliteration, NOT translation). IMPORTANT: Use correct Gurmukhi matras, tippis, bindis, and adhak — e.g. proper use of ਿ vs ੀ, ੁ vs ੂ, ੰ vs ਂ, and ੱ for gemination. Each word must be spelled accurately in Gurmukhi.
- "meaning": Write a personal, opinionated explanation of ${songTitle}${artistName ? ` by ${artistName}` : ''} in 300-400 words. Think of it as a Reddit comment or a personal blog post where you are telling someone why this song hits the way it does. No bullet points. No headers. Just paragraphs — messy, real, personal.

HARD RULES for the meaning field — break any of these and the output is wrong:

BANNED WORDS (never use any of these): delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, underscore, elevate, heartfelt, moreover, furthermore, in conclusion, profound, captivating, compelling, timeless, soulful, haunting, masterpiece, beautifully, perfectly, seamlessly, intricate, nuanced, eloquent, evocative, visceral, raw emotion, speaks to, speaks volumes, it is worth noting, one can, one cannot, in many ways, at its core, overall, ultimately, in essence, throughout the song, throughout the track, the listener, the audience.

BANNED SENTENCE STARTERS — never begin a paragraph or sentence with: "The song...", "The track...", "This song...", "This track...", "What makes...", "At its core...", "Overall...", "Ultimately...", "In conclusion...", "The lyrics...", "The music...".

STRUCTURE RULES:
- Do NOT start with the song title or artist name in the first sentence. Open with a feeling, a situation, a question, or a direct statement that pulls the reader in.
- Use "I" at least twice. Share what you personally feel about specific moments — which line got you, which part of the beat surprised you.
- Talk directly to the reader using "you" at least once — like "if you have ever felt..." or "you know that feeling when...".
- Pick 2 or 3 specific lines from the lyrics and quote them. Talk about why those lines work, not just what they mean.
- Add one angle a casual listener would miss — something about the cultural background, the way the artist usually writes vs this song, the production choice, or a double meaning in a word.
- Do NOT wrap up with a neat conclusion. End mid-thought or with a personal reaction, the way real writing ends.
- Mix sentence lengths aggressively. One sentence can be two words. The next can run for a while and build on itself before landing.
- Include exactly 1 natural spelling mistake somewhere (e.g. "definitly", "truely", "acheive", "recieve", "beleive") — just one, keep it subtle.
- No hyphens used as pauses or em dashes anywhere.
- "metaTitle": An SEO-optimized page title. EXACT format: "${title || '[Song Name]'} Lyrics - ${artistName || '[Artist Name]'} [Meaning & Translation] - DJYoungster". Use the exact song name and artist name provided, do not abbreviate or change them.
- "metaDescription": A meta description between 150-160 characters for this song page. Include the song name and a short hook or key phrase from the lyrics. Mention lyrics and translation. End with "- DJYoungster". RULES: NEVER start with "Discover" or "Explore". No hyphens as pauses. No banned words (delve, tapestry, testament, resonate, captivating, compelling, heartfelt). Sound like a real person wrote it, not an SEO bot.


IMPORTANT: For lyricsHindi, lyricsPunjabi, and lyricsRomanized — you are doing SCRIPT CONVERSION only. The words and meaning must remain the same as the original, just written in a different script. However, you MUST fix and improve the spelling in each script — do not copy mistakes from the input. Only lyricsTranslated should be an actual language translation (into English).

Lyrics:
${lyrics}`
        }
      ]
    })

    const choice = completion.choices[0]

    // Check if response was truncated
    if (choice.finish_reason === 'length') {
      throw new Error('Translation response was too long and got truncated. Try with shorter lyrics.')
    }

    let responseText = choice.message.content.trim()

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
