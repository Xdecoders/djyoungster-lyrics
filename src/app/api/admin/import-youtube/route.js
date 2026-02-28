import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { scrapeGenius } from '@/lib/scrapers/genius'

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function searchGeniusForLyrics(songTitle, artistName) {
  try {
    const query = encodeURIComponent(`${songTitle} ${artistName}`.trim())
    const res = await fetch(`https://genius.com/api/search?q=${query}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000)
    })
    if (!res.ok) return null

    const data = await res.json()
    const hits = data?.response?.hits
    if (!hits?.length) return null

    // Find first song hit
    const songHit = hits.find(h => h.type === 'song')
    if (!songHit?.result?.url) return null

    // Scrape that Genius page
    const scraped = await scrapeGenius(songHit.result.url)
    return scraped?.lyrics || null
  } catch {
    return null
  }
}

export async function POST(request) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY is not configured' }, { status: 500 })
    }

    const { url } = await request.json()

    if (!url?.trim()) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
    }

    const videoId = extractVideoId(url.trim())
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Paste the full video link.' }, { status: 400 })
    }

    // ── Step 1: Fetch video metadata from YouTube Data API ──
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`
    )
    const ytData = await ytRes.json()

    if (!ytData.items?.length) {
      return NextResponse.json({ error: 'Video not found. Check the URL and try again.' }, { status: 404 })
    }

    const snippet = ytData.items[0].snippet
    const videoTitle = snippet.title
    const description = snippet.description || ''
    const channelTitle = snippet.channelTitle || ''
    const publishedAt = snippet.publishedAt || ''
    const thumbnail =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      ''

    // ── Step 2: GPT-4o parses description for credits + lyrics ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const extraction = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: 'You extract structured song data from YouTube video descriptions of Indian/Punjabi/Hindi music videos. Respond with raw JSON only — no markdown, no code fences.'
        },
        {
          role: 'user',
          content: `Extract all available information from this YouTube video description.

Video title: "${videoTitle}"
Channel: "${channelTitle}"

Description:
"""
${description.substring(0, 4000)}
"""

Return a JSON object with these exact fields (empty string if not found):
- "songTitle": clean song name only — remove artist name, "(Official Video)", "(Official Music Video)", "| Full Video", "ft.", featured tags, label names, brackets, and any other fluff. Just the song title.
- "artistNames": array of main artist name(s). Use channel name as fallback.
- "lyrics": if full lyrics are present in the description, extract them exactly as-is with line breaks preserved (use \\n for line breaks, \\n\\n for stanza breaks). If no lyrics present, return empty string "".
- "lyricist": lyricist / writer / penned by name
- "composer": music director / composed by / music by name
- "singers": singer(s) name if listed separately from main artist (e.g. "Vocals:", "Singer:")
- "label": music label / presenting company / under the banner of
- "starring": actor/actress names if mentioned
- "producer": producer name
- "director": video director name (not music director)
- "releaseDate": if an explicit release date is mentioned, return as YYYY-MM-DD, else empty string

IMPORTANT: Only extract what is actually written in the description. Do not guess or invent any credits.`
        }
      ]
    })

    let extracted = {}
    try {
      let text = extraction.choices[0].message.content.trim()
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim()
      extracted = JSON.parse(text)
    } catch {
      extracted = {}
    }

    let lyrics = typeof extracted.lyrics === 'string' ? extracted.lyrics.trim() : ''
    let lyricsSource = lyrics ? 'description' : null

    // ── Step 3: Genius fallback if no lyrics in description ──
    if (!lyrics) {
      const searchTitle = extracted.songTitle || videoTitle
      const searchArtist = extracted.artistNames?.[0] || channelTitle
      const geniusLyrics = await searchGeniusForLyrics(searchTitle, searchArtist)
      if (geniusLyrics) {
        lyrics = geniusLyrics
        lyricsSource = 'genius'
      }
    }

    const songTitle = extracted.songTitle || videoTitle
    const artistNames = Array.isArray(extracted.artistNames) && extracted.artistNames.length
      ? extracted.artistNames
      : [channelTitle]

    return NextResponse.json({
      title: songTitle,
      artistNames,
      lyrics,
      lyricsSource, // 'description' | 'genius' | null
      lyricist: extracted.lyricist || '',
      composer: extracted.composer || '',
      singers: extracted.singers || '',
      label: extracted.label || '',
      starring: extracted.starring || '',
      producer: extracted.producer || '',
      director: extracted.director || '',
      coverImage: thumbnail,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      datePublished: extracted.releaseDate || (publishedAt ? publishedAt.split('T')[0] : '')
    })
  } catch (error) {
    console.error('YouTube import error:', error)
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
  }
}
