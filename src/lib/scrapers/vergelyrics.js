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

export async function scrapeVergeLyrics(url) {
  const response = await axios.get(url, UA)
  const $ = cheerio.load(response.data)

  // --- Title & Release Year from JSON-LD ---
  let title = ''
  let releaseYear = null

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html())
      const graph = data['@graph'] || [data]
      for (const node of graph) {
        if (!title && (node['@type'] === 'WebPage' || node['@type'] === 'BlogPosting')) {
          title = node.name || node.headline || ''
        }
        if (!releaseYear && node['@type'] === 'BlogPosting' && node.datePublished) {
          const year = parseInt(node.datePublished.slice(0, 4))
          if (year > 2000 && year <= new Date().getFullYear() + 1) {
            releaseYear = year
          }
        }
      }
    } catch {}
  })

  // Strip " Lyrics" suffix (case-insensitive)
  title = title.replace(/\s+lyrics\s*$/i, '').trim()

  // Fallback: og:title
  if (!title) {
    title = ($('meta[property="og:title"]').attr('content') || '')
      .replace(/\s+lyrics\s*$/i, '')
      .replace(/\s*[-|]\s*VergeLyrics.*$/i, '')
      .trim()
  }

  // Fallback: h1
  if (!title) {
    title = $('h1').first().text().replace(/\s+lyrics\s*$/i, '').trim()
  }

  if (!title) throw new Error('Could not extract song title')

  // --- Cover Image ---
  let coverImage = $('.firstImage img').attr('src') || ''
  if (!coverImage) {
    coverImage = $('meta[property="og:image"]').attr('content') || ''
  }

  // --- Credits Table ---
  let singers = ''
  let lyricist = ''
  let composer = ''
  let starring = ''
  let director = ''
  let label = ''

  $('.tableVL table tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 2) return
    const key = $(cells[0]).text().trim().toLowerCase()
    const value = $(cells[1]).text().trim()
    if (!value) return

    if (key === 'singer' || key === 'singers') singers = value
    else if (key === 'writer' || key === 'lyricist') lyricist = value
    else if (key === 'composer' || key === 'music') composer = value
    else if (key === 'cast') starring = value
    else if (key === 'video director' || key === 'director') director = value
    else if (key === 'label' || key === 'music label') label = value
  })

  // --- Artist Names ---
  const artistNames = singers
    ? singers.split(/,|&|feat\.|ft\.|featuring/i).map(n => n.trim()).filter(Boolean)
    : []

  // --- Lyrics ---
  // lyricsContainer children:
  //   .hLB[data-head="Section Name"] → section header
  //   .hLT[data-time="M:SS"]         → lyric line text
  //   <br>                           → line separator
  const lyricsLines = []

  $('.lyricsContainer').contents().each((_, node) => {
    if (node.type !== 'tag') return
    const el = $(node)

    if (node.name === 'span') {
      if (el.hasClass('hLB')) {
        // data-head already contains bracket notation e.g. "[Verse 1]"
        const head = el.attr('data-head') || ''
        if (head.trim()) {
          if (lyricsLines.length > 0) lyricsLines.push('')
          lyricsLines.push(head.trim())
        }
      } else if (el.hasClass('hLT')) {
        const line = el.text().trim()
        if (line) lyricsLines.push(line)
      }
    } else if (node.name === 'br') {
      // Only push blank line if last line isn't already blank
      if (lyricsLines.length > 0 && lyricsLines[lyricsLines.length - 1] !== '') {
        lyricsLines.push('')
      }
    }
  })

  // Trim trailing blank lines
  while (lyricsLines.length > 0 && lyricsLines[lyricsLines.length - 1] === '') {
    lyricsLines.pop()
  }

  const lyrics = lyricsLines.join('\n')

  if (!lyrics || lyrics.trim().length < 20) {
    throw new Error('Could not extract lyrics from this page')
  }

  // --- YouTube ---
  let youtubeUrl = ''
  const ytSrc = $('div.videoYt iframe').attr('data-src') || $('div.videoYt iframe').attr('src') || ''
  const ytMatch = ytSrc.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    youtubeUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`
  }
  // Fallback: data-audio attribute on the wrapper div
  if (!youtubeUrl) {
    const dataAudio = $('div.videoYt').attr('data-audio')
    if (dataAudio) {
      youtubeUrl = `https://www.youtube.com/watch?v=${dataAudio}`
    }
  }

  return {
    title,
    slug: generateSlug(title),
    sourceUrl: url,
    sourceSite: 'vergelyrics.com',
    lyrics,
    lyricsRomanized: '',
    lyricsTranslated: '',
    lyricist,
    composer,
    singers,
    label,
    producer: '',
    director,
    starring,
    coverImage,
    youtubeUrl,
    spotifyUrl: '',
    appleMusicUrl: '',
    releaseYear,
    albumName: null,
    movieName: null,
    artistNames
  }
}
