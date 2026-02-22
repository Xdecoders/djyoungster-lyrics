import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

export async function scrapeBharatLyrics(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // ===== TITLE =====
  let title = ''
  const h1 = $('h1.page-title, h1').first().text().trim()
  if (h1) {
    // Strip artist name after " - " first, then "Lyrics" suffix
    title = h1
      .replace(/\s*-\s*[^-]+$/, '')
      .replace(/\s*lyrics\s*$/i, '')
      .trim()
  }

  // ===== CREDITS from blockquote =====
  let lyricist = ''
  let composer = ''
  let singers = ''
  let label = ''
  let starring = ''
  let producer = ''
  let director = ''
  let movieName = null
  let albumName = null
  let releaseYear = null

  const creditMap = {
    'singers': 'singers',
    'singer': 'singers',
    'sung by': 'singers',
    'vocals': 'singers',
    'music directors': 'composer',
    'music director': 'composer',
    'music by': 'composer',
    'music': 'composer',
    'composer': 'composer',
    'composers': 'composer',
    'lyricists': 'lyricist',
    'lyricist': 'lyricist',
    'lyrics by': 'lyricist',
    'written by': 'lyricist',
    'label': 'label',
    'music label': 'label',
    'record label': 'label',
    'starring': 'starring',
    'star cast': 'starring',
    'cast': 'starring',
    'producer': 'producer',
    'produced by': 'producer',
    'director': 'director',
    'directed by': 'director',
    'hindi': 'movieName',
    'tamil': 'movieName',
    'telugu': 'movieName',
    'punjabi': 'movieName',
    'malayalam': 'movieName',
    'kannada': 'movieName',
    'gujarati': 'movieName',
    'marathi': 'movieName',
    'bhojpuri': 'movieName',
    'bengali': 'movieName',
    'film': 'movieName',
    'movie': 'movieName',
    'album': 'albumName'
  }

  $('blockquote li').each((_, el) => {
    const li = $(el)
    const fullText = li.text().trim()
    // Format: "Label: Value" — split on first colon
    const colonIdx = fullText.indexOf(':')
    if (colonIdx === -1) return

    const rawLabel = fullText.substring(0, colonIdx).trim().toLowerCase()
    const mapped = creditMap[rawLabel]
    if (!mapped) return

    // Prefer link text for better names, fall back to raw text
    const links = li.find('a')
    let value = ''
    if (links.length > 0) {
      const names = []
      links.each((_, link) => {
        const name = $(link).text().trim()
        if (name) names.push(name)
      })
      value = names.join(', ')
    } else {
      value = fullText.substring(colonIdx + 1).trim()
    }

    if (!value) return

    switch (mapped) {
      case 'singers': singers = singers || value; break
      case 'composer': composer = composer || value; break
      case 'lyricist': lyricist = lyricist || value; break
      case 'label': label = label || value; break
      case 'starring': starring = starring || value; break
      case 'producer': producer = producer || value; break
      case 'director': director = director || value; break
      case 'movieName':
        if (!movieName) {
          // Extract year from "Movie Name (2024)" pattern
          const yearMatch = value.match(/\((\d{4})\)/)
          if (yearMatch) {
            releaseYear = parseInt(yearMatch[1])
            movieName = value.replace(/\s*\(\d{4}\)\s*/, '').trim()
          } else {
            movieName = value
          }
        }
        break
      case 'albumName': albumName = albumName || value; break
    }
  })

  // ===== LYRICS from entry-content =====
  let lyrics = ''
  let lyricsRomanized = ''

  const contentEl = $('.entry-content')
  if (contentEl.length) {
    const paragraphs = []
    // Collect paragraphs, skip credits blockquote and non-lyric content
    contentEl.find('p').each((_, el) => {
      const p = $(el)
      // Skip if inside blockquote (credits)
      if (p.closest('blockquote').length) return
      // Skip empty or very short
      const text = p.text().trim()
      if (!text || text.length < 3) return
      // Skip "Song Credits:" heading-like lines
      if (/song\s*credits?\s*:?$/i.test(text)) return
      // Skip "Music Video" heading
      if (/music\s*video/i.test(text) && text.length < 40) return
      // Skip navigation/CTA lines
      if (/read\s*also|check\s*out|click\s*here|share\s*this/i.test(text)) return
      // Skip intro/description paragraphs
      if (/^lyrics\s+of\s+/i.test(text)) return
      if (/the\s+song\s+is\s+sung\s+by/i.test(text) && text.length > 100) return
      // Skip watermark (bharatlyrics.com in Devanagari or Latin)
      if (/bharatlyrics|भारतलिरिक्स/i.test(text) && text.length < 40) return

      // Get HTML, replace <br> with newlines
      p.find('br').replaceWith('\n')
      const lineText = p.text().trim()
      if (lineText) paragraphs.push(lineText)
    })

    // Separate Hindi (Devanagari) and English/Romanized lines
    const hindiParagraphs = []
    const romanizedParagraphs = []

    for (const para of paragraphs) {
      // Check if paragraph contains Devanagari script
      if (/[\u0900-\u097F]/.test(para)) {
        hindiParagraphs.push(para)
      } else {
        romanizedParagraphs.push(para)
      }
    }

    // Hindi original lyrics are the main lyrics, romanized is secondary
    if (hindiParagraphs.length > 0 && romanizedParagraphs.length > 0) {
      lyrics = hindiParagraphs.join('\n\n')
      lyricsRomanized = romanizedParagraphs.join('\n\n')
    } else {
      // All in one language
      lyrics = paragraphs.join('\n\n')
    }
  }

  // ===== COVER IMAGE =====
  let coverImage = $('meta[property="og:image"]').attr('content') || ''

  // ===== YOUTUBE URL =====
  let youtubeUrl = ''
  const ytIframe = $('iframe[src*="youtube.com/embed/"]').attr('src') || ''
  if (ytIframe) {
    const match = ytIframe.match(/youtube\.com\/embed\/([^?"]+)/)
    if (match) youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`
  }
  // Also check for youtube links in content
  if (!youtubeUrl) {
    $('a[href*="youtube.com/watch"], a[href*="youtu.be/"]').each((_, el) => {
      if (!youtubeUrl) youtubeUrl = $(el).attr('href') || ''
    })
  }

  // ===== SPOTIFY / APPLE MUSIC =====
  let spotifyUrl = ''
  let appleMusicUrl = ''
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (href.includes('spotify.com') && !spotifyUrl) spotifyUrl = href
    if (href.includes('music.apple.com') && !appleMusicUrl) appleMusicUrl = href
  })

  // ===== ARTIST NAMES from singers =====
  let artistNames = []
  if (singers) {
    artistNames = singers.split(/[,&]/).map(n => n.trim()).filter(Boolean)
  }

  const slug = generateSlug(title)

  return {
    title,
    slug,
    lyrics,
    lyricist,
    composer,
    singers,
    label,
    starring,
    producer,
    director,
    releaseYear,
    coverImage,
    youtubeUrl,
    spotifyUrl,
    appleMusicUrl,
    lyricsRomanized,
    lyricsTranslated: '',
    artistNames,
    movieName,
    albumName,
    sourceUrl: url,
    sourceSite: 'bharatlyrics.com'
  }
}
