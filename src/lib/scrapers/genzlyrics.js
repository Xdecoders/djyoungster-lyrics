import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

const UA = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  timeout: 30000
}

export async function scrapeGenzLyrics(url) {
  const response = await axios.get(url, UA)
  const $ = cheerio.load(response.data)

  // --- Title, Credits & Release Year from JSON-LD ---
  let title = ''
  let lyricist = ''
  let composer = ''
  let producer = ''
  let releaseYear = null

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html())
      const nodes = data['@graph'] ? data['@graph'] : [data]
      for (const node of nodes) {
        if (node['@type'] === 'MusicComposition') {
          if (!title) title = node.name || ''
          if (!lyricist) lyricist = node.lyricist || ''
          if (!composer) composer = node.composer || ''
          if (!producer) producer = node.producer || ''
          if (!releaseYear && node.datePublished) {
            const year = parseInt(node.datePublished.slice(0, 4))
            if (year > 2000 && year <= new Date().getFullYear() + 1) {
              releaseYear = year
            }
          }
        }
      }
    } catch {}
  })

  // Fallback title from og:title
  if (!title) {
    title = ($('meta[property="og:title"]').attr('content') || '')
      .replace(/\s+lyrics\s*$/i, '')
      .replace(/\s*[-–|]\s*.*$/i, '')
      .trim()
  }

  // Fallback title from h1
  if (!title) {
    title = $('h1').first().text()
      .replace(/\s+lyrics\s*$/i, '')
      .replace(/\s*[-–]\s*.+$/, '')
      .trim()
  }

  if (!title) throw new Error('Could not extract song title')

  // --- Credits from info table/divs ---
  // genzlyrics uses WordPress with a details section
  let singers = ''
  let label = ''
  let starring = ''
  let director = ''
  let albumName = null
  let movieName = null

  // Try table rows first
  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th')
    if (cells.length < 2) return
    const key = $(cells[0]).text().trim().toLowerCase().replace(/:$/, '')
    const val = $(cells[1]).text().trim()
    if (!val) return
    if (key.includes('singer') || key.includes('artist') || key.includes('vocals')) singers = singers || val
    else if (key.includes('writer') || key.includes('lyricist')) lyricist = lyricist || val
    else if (key.includes('composer') || key.includes('music')) composer = composer || val
    else if (key.includes('producer')) producer = producer || val
    else if (key.includes('label')) label = label || val
    else if (key.includes('cast') || key.includes('starring')) starring = starring || val
    else if (key.includes('director')) director = director || val
    else if (key.includes('album')) albumName = albumName || val
    else if (key.includes('movie') || key.includes('film')) movieName = movieName || val
  })

  // Fallback: parse "Label: Value" lines anywhere in .entry-content
  if (!singers || !label) {
    const creditMap = {
      'singer': 'singers', 'singers': 'singers', 'artist': 'singers', 'artists': 'singers',
      'vocalist': 'singers', 'vocals': 'singers', 'sung by': 'singers',
      'lyricist': 'lyricist', 'lyricists': 'lyricist', 'written by': 'lyricist', 'writer': 'lyricist',
      'composer': 'composer', 'music': 'composer', 'music director': 'composer',
      'producer': 'producer', 'produced by': 'producer',
      'label': 'label', 'music label': 'label', 'record label': 'label',
      'cast': 'starring', 'starring': 'starring',
      'director': 'director', 'directed by': 'director',
      'album': 'albumName', 'movie': 'movieName', 'film': 'movieName'
    }

    $('.entry-content p, .entry-content li, .song-detail p, .song-info p, .post-content p').each((_, el) => {
      const text = $(el).text().trim()
      const colonIdx = text.indexOf(':')
      if (colonIdx === -1 || colonIdx > 30) return
      const rawKey = text.substring(0, colonIdx).trim().toLowerCase()
      const mapped = creditMap[rawKey]
      if (!mapped) return
      const val = text.substring(colonIdx + 1).trim()
      if (!val) return
      if (mapped === 'singers') singers = singers || val
      else if (mapped === 'lyricist') lyricist = lyricist || val
      else if (mapped === 'composer') composer = composer || val
      else if (mapped === 'producer') producer = producer || val
      else if (mapped === 'label') label = label || val
      else if (mapped === 'starring') starring = starring || val
      else if (mapped === 'director') director = director || val
      else if (mapped === 'albumName') albumName = albumName || val
      else if (mapped === 'movieName') movieName = movieName || val
    })
  }

  // Fallback singer from og:title or page title artist part
  if (!singers) {
    const ogTitle = $('meta[property="og:title"]').attr('content') || ''
    // "Song Name Lyrics – Artist Name" pattern
    const dashMatch = ogTitle.match(/[-–]\s*(.+?)\s*(?:lyrics|$)/i)
    if (dashMatch) singers = dashMatch[1].trim()
  }

  // --- Lyrics ---
  // #hindiLyrics = original script (Punjabi/Hindi)
  // #englishLyrics = romanized
  // #translationLyrics = translation
  const extractText = (selector) => {
    const el = $(selector)
    if (!el.length) return ''
    // Replace <br> with newline, then get text
    el.find('br').replaceWith('\n')
    el.find('p').each((_, p) => {
      $(p).after('\n')
    })
    const lines = el.text()
      .split('\n')
      .map(l => l.trim())

    // Trim trailing/leading blank lines but preserve inner blank lines
    let start = 0
    let end = lines.length - 1
    while (start <= end && !lines[start]) start++
    while (end >= start && !lines[end]) end--
    return lines.slice(start, end + 1).join('\n')
  }

  const lyricsOriginal = extractText('#hindiLyrics')
  const lyricsRomanized = extractText('#englishLyrics')
  const lyricsTranslated = extractText('#translationLyrics')

  // Use whichever is available as main lyrics (prefer original, then romanized)
  const lyrics = lyricsOriginal || lyricsRomanized

  if (!lyrics || lyrics.trim().length < 20) {
    throw new Error('Could not extract lyrics from this page')
  }

  // --- Cover Image ---
  const coverImage = $('meta[property="og:image"]').attr('content') || ''

  // --- YouTube ---
  let youtubeUrl = ''
  const ytIframe = $('iframe[src*="youtube.com/embed/"], iframe[data-src*="youtube.com/embed/"]')
  const ytSrc = ytIframe.attr('src') || ytIframe.attr('data-src') || ''
  const ytMatch = ytSrc.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (ytMatch) youtubeUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`

  if (!youtubeUrl) {
    $('a[href*="youtube.com/watch"], a[href*="youtu.be/"]').each((_, el) => {
      if (!youtubeUrl) youtubeUrl = $(el).attr('href') || ''
    })
  }

  // --- Spotify / Apple Music ---
  let spotifyUrl = ''
  let appleMusicUrl = ''
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (href.includes('spotify.com') && !spotifyUrl) spotifyUrl = href
    if (href.includes('music.apple.com') && !appleMusicUrl) appleMusicUrl = href
  })

  // --- Artist Names ---
  const artistNames = singers
    ? singers.split(/,|&|feat\.|ft\.|featuring/i).map(n => n.trim()).filter(Boolean)
    : []

  return {
    title,
    slug: generateSlug(title),
    sourceUrl: url,
    sourceSite: 'genzlyrics.com',
    lyrics,
    lyricsRomanized: lyricsOriginal ? lyricsRomanized : '',
    lyricsTranslated,
    lyricist,
    composer,
    singers,
    label,
    producer,
    director,
    starring,
    coverImage,
    youtubeUrl,
    spotifyUrl,
    appleMusicUrl,
    releaseYear,
    albumName,
    movieName,
    artistNames
  }
}
