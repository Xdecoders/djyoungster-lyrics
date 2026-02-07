import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

// Check if text contains Tamil unicode characters
function isTamil(text) {
  return /[\u0B80-\u0BFF]/.test(text)
}

// Strip speaker prefixes like "Male : ", "Female : ", "Chorus : ", etc.
function stripSpeakerPrefix(text) {
  return text.replace(/^(?:Male|Female|Chorus|Child|All)\s*:\s*/i, '').trim()
}

export async function scrapeTamil2Lyrics(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // Title
  let title = ''
  const titleEl = $('.lyrics-title h1')
  if (titleEl.length) {
    title = titleEl.text().trim()
    title = title.replace(/\s*lyrics\s*$/i, '').replace(/\s*song\s*$/i, '').trim()
  }
  if (!title) {
    title = $('h1').first().text().trim().replace(/\s*song\s*lyrics\s*$/i, '').replace(/\s*lyrics\s*$/i, '').trim()
  }

  // Credits - extract from <strong>Label :</strong> Value pattern
  let lyricist = ''
  let composer = ''
  let singers = ''
  let label = ''
  let starring = ''
  let producer = ''
  let director = ''
  let movieName = null
  let releaseYear = null

  // Credit label mapping
  const creditMap = {
    'singers': 'singers',
    'singer': 'singers',
    'sung by': 'singers',
    'vocals': 'singers',
    'music by': 'composer',
    'music': 'composer',
    'composer': 'composer',
    'music director': 'composer',
    'lyrics by': 'lyricist',
    'lyricist': 'lyricist',
    'lyrics': 'lyricist',
    'written by': 'lyricist',
    'film': 'movieName',
    'movie': 'movieName',
    'album': 'movieName',
    'label': 'label',
    'record label': 'label',
    'music label': 'label',
    'starring': 'starring',
    'star cast': 'starring',
    'cast': 'starring',
    'producer': 'producer',
    'produced by': 'producer',
    'director': 'director',
    'directed by': 'director',
    'year': 'releaseYear',
    // Tamil credit labels
    'பாடகர்கள்': 'singers',
    'இசையமைப்பாளர்': 'composer',
    'பாடலாசிரியர்': 'lyricist'
  }

  // Parse credit fields from <strong> tags (only top-level credits, not lyrics lines)
  $('article').find('strong, b').each((_, el) => {
    const labelText = $(el).text().trim().replace(/\s*:\s*$/, '').toLowerCase()
    const mapped = creditMap[labelText]
    if (!mapped) return

    const parent = $(el).parent()
    let value = ''
    const fullText = parent.text()
    const labelFull = $(el).text()
    value = fullText.replace(labelFull, '').replace(/^\s*:\s*/, '').trim()

    if (!value) return

    switch (mapped) {
      case 'singers': singers = singers || value; break
      case 'composer': composer = composer || value; break
      case 'lyricist': lyricist = lyricist || value; break
      case 'label': label = label || value; break
      case 'movieName': movieName = movieName || value; break
      case 'starring': starring = starring || value; break
      case 'producer': producer = producer || value; break
      case 'director': director = director || value; break
      case 'releaseYear':
        const year = parseInt(value)
        if (!isNaN(year) && year > 1900 && year < 2100) releaseYear = year
        break
    }
  })

  // Movie name from links
  if (!movieName) {
    const movieLink = $('a[href*="/movies/"], a[href*="/movie/"]').first()
    if (movieLink.length) {
      movieName = movieLink.text().trim()
    }
  }

  // ===== LYRICS EXTRACTION =====
  let lyrics = ''
  let lyricsTranslated = ''

  // Method 1: Tab-based content (.tabcontent)
  const tabContents = $('.tabcontent')
  if (tabContents.length > 0) {
    const firstTab = tabContents.eq(0)
    firstTab.find('br').replaceWith('\n')
    lyrics = firstTab.text().trim()

    if (tabContents.length > 1) {
      const secondTab = tabContents.eq(1)
      secondTab.find('br').replaceWith('\n')
      lyricsTranslated = secondTab.text().trim()
    }
  }

  // Method 2: Extract from <article> <p> tags (current format)
  if (!lyrics) {
    const englishLines = []
    const tamilLines = []

    $('article p').each((_, el) => {
      const text = $(el).text().trim()
      if (!text || text.length < 3) return

      // Skip credit paragraphs (contain known credit labels)
      const lowerText = text.toLowerCase()
      const isCredit = Object.keys(creditMap).some(key =>
        lowerText.startsWith(key + ' :') || lowerText.startsWith(key + ':')
      )
      if (isCredit) return

      // Check if this is a lyrics line (has speaker prefix or is lyrics content)
      const hasSpeaker = /^(?:Male|Female|Chorus|Child|All)\s*:/i.test(text) ||
                         /^(?:பெண்|ஆண்|குழு|குரல்)\s*:/i.test(text)

      if (hasSpeaker || text.length > 10) {
        if (isTamil(text)) {
          // Strip Tamil speaker prefixes
          const cleaned = text.replace(/^(?:பெண்|ஆண்|குழு|குரல்|குழந்தை)\s*:\s*/g, '').trim()
          if (cleaned) tamilLines.push(cleaned)
        } else {
          const cleaned = stripSpeakerPrefix(text)
          if (cleaned) englishLines.push(cleaned)
        }
      }
    })

    // English/romanized = main lyrics, Tamil = translated
    if (englishLines.length > 0) {
      lyrics = englishLines.join('\n\n')
    }
    if (tamilLines.length > 0) {
      lyricsTranslated = tamilLines.join('\n\n')
    }

    // If only Tamil lyrics found, swap
    if (!lyrics && lyricsTranslated) {
      lyrics = lyricsTranslated
      lyricsTranslated = ''
    }
  }

  // Cover image
  let coverImage = $('meta[property="og:image"]').attr('content') || ''

  // YouTube URL
  let youtubeUrl = ''
  const ytEmbed = $('iframe[src*="youtube.com/embed/"]').attr('src') || ''
  if (ytEmbed) {
    const match = ytEmbed.match(/youtube\.com\/embed\/([^?"]+)/)
    if (match) youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`
  }

  // Build artist names from singers
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
    spotifyUrl: '',
    appleMusicUrl: '',
    lyricsRomanized: '',
    lyricsTranslated,
    artistNames,
    movieName,
    albumName: null,
    sourceUrl: url,
    sourceSite: 'tamil2lyrics.com'
  }
}
