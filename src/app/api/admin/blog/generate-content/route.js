import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/verifyAdmin'

export async function POST(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const body = await request.json()
    const { title, categoryName, type, content } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // ── EXCERPT ONLY ────────────────────────────────────────────────────────
    if (type === 'excerpt') {
      const plainText = content
        ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 600)
        : ''

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 120,
        messages: [
          {
            role: 'system',
            content: 'You write short, punchy blog excerpts. Plain sentences, no fluff, no AI clichés, no em dashes.'
          },
          {
            role: 'user',
            content: `Write a 1-2 sentence excerpt for a blog post titled "${title}".
Keep it under 160 characters. Make it sound like a real person wrote it, not a bot.
Do NOT start with "Discover", "Explore", "Dive", or "Delve".
Return ONLY the excerpt text, nothing else.

Content preview: ${plainText}`
          }
        ]
      })

      const excerpt = completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '')
      return NextResponse.json({ excerpt })
    }

    // ── FULL BLOG POST ───────────────────────────────────────────────────────
    const category = categoryName || 'Entertainment'

    // Step 1 — Web search: gather real, current facts about the topic
    // Uses gpt-4o-search-preview which fetches live Google results
    let research = ''
    try {
      const searchRes = await client.chat.completions.create({
        model: 'gpt-4o-search-preview',
        // eslint-disable-next-line camelcase
        web_search_options: { search_context_size: 'high' },
        messages: [
          {
            role: 'user',
            content: `You are a research assistant. Search the web and find the most current, accurate information about this topic: "${title}"

Gather and summarize:
- Key facts, real numbers, specific dates
- Latest news and recent developments
- Names of people, films, songs, albums, box office figures, ratings involved
- Any official announcements, reviews, or records
- Background context that helps understand why this topic matters right now

Write a factual research brief in 300-400 words. Only include things you actually found via search. Be specific, not vague.`,
          }
        ]
      })
      research = searchRes.choices[0]?.message?.content?.trim() || ''
      console.log('[Blog Generate] Web search completed, research length:', research.length)
    } catch (searchErr) {
      // Search model unavailable or quota issue — fall back to knowledge-only generation
      console.warn('[Blog Generate] Web search step failed, continuing without research:', searchErr.message)
    }

    // Step 2 — Write: humanised blog post grounded in the research
    const researchBlock = research
      ? `RESEARCH BRIEF (write from this — do NOT invent facts not present here):\n${research}`
      : `Note: No live research was available. Write from your training knowledge only, and be careful not to state specific numbers or dates unless you are certain they are correct.`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2500,
      messages: [
        {
          role: 'system',
          content: `You are a writer for DJYoungster, an Indian music and entertainment website. You write in plain, conversational English that sounds like a real person, not a content farm or AI tool. Your readers are fans of Bollywood, Punjabi, Telugu, and Indian music and movies. You know the culture, slang, and what fans care about.

You have just been given a research brief with real facts. Your job is to rewrite those facts as a natural, engaging blog article — in your own words, in your own voice. Do NOT copy sentences from the research. Transform the information into a story a fan would want to read.

OUTPUT FORMAT: Return a single JSON object with three fields:
- "metaTitle": an SEO-optimized page title (50-60 characters max, no site name suffix, derived from the actual content — specific, keyword-rich, clickable)
- "content": the full blog post as an HTML string (use <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <a href="...">...</a> tags only)
- "excerpt": a 1-2 sentence summary, max 160 characters

No markdown. No code fences. No explanation outside the JSON.`
        },
        {
          role: 'user',
          content: `Write a blog post for DJYoungster about: "${title}"
Category: ${category}

${researchBlock}

TARGET LENGTH: 700-900 words

STRUCTURE (HTML):
- Opening paragraph: hook the reader with a bold statement, a question, or the most interesting fact from the research. No generic intros.
- 2 or 3 main sections with <h2> headings. Use <h3> for subsections.
- Use <ul><li> lists only where naturally listing things (not for every point).
- Include exactly 2 links to real external sources you found in the research or that you are certain exist (Wikipedia, official artist/film pages, Spotify, reputable publications). Use <a href="..."> with the actual URL.
- Close with a short paragraph that feels natural, not a formal summary.

VOICE AND STYLE:
- Write like a music/film fan explaining something to a friend, not a journalist filing a report.
- Use "I" at least twice. Share a genuine personal reaction to the news/topic.
- Use "you" at least once to address the reader.
- Mix sentence lengths. Short punchy sentences. Then a longer one that builds into a point.
- Be specific. Use the real names, numbers, and facts from the research brief.
- Do NOT add any facts, numbers, or quotes that are not in the research brief. Stick to what was actually found.

ABSOLUTE BANNED WORDS — never use any of these:
delve, tapestry, testament, poignant, resonate, navigate, journey, showcase, underscore, elevate, heartfelt, moreover, furthermore, in conclusion, profound, captivating, compelling, timeless, soulful, haunting, masterpiece, beautifully, perfectly, seamlessly, intricate, nuanced, eloquent, evocative, visceral, raw emotion, speaks to, speaks volumes, it is worth noting, one can, in many ways, at its core, overall, ultimately, in essence, throughout the song, throughout the track, the listener, the audience, dive into, explore, discover.

BANNED SENTENCE STARTERS:
"The song...", "The track...", "This song...", "This track...", "What makes...", "At its core...", "Overall...", "Ultimately...", "In conclusion...", "The lyrics...", "The music...", "In today's...", "In the world of..."

FORMATTING:
- No em dashes (— or --). Use commas or two sentences instead.
- No hyphens used as pauses.
- Start "content" with <h1> containing the metaTitle. This is the only <h1> on the page.
- Simple language. Simpler word always wins.

META TITLE:
- 50-60 characters maximum
- Specific and keyword-rich — use the actual subject (song name, film name, artist name, specific event)
- Clickable and natural, not stuffed with keywords
- No "DJYoungster" suffix — just the title
- Must reflect the actual content, not just the input title

EXCERPT:
- 1-2 sentences, max 160 characters
- Does not start with "Discover", "Explore", or "Dive"
- Sounds human, not like a meta description

Return ONLY the JSON object. No extra text before or after.`
        }
      ]
    })

    let responseText = completion.choices[0].message.content.trim()
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim()

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        result = { content: responseText, excerpt: '' }
      }
    }

    return NextResponse.json(result)

  } catch (err) {
    console.error('[Blog Generate Content]', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
