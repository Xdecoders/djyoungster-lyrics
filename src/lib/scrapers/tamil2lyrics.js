import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

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
    // Remove "Lyrics" suffix if present
    title = title.replace(/\s*lyrics\s*$/i, '').trim()
  }
  if (!title) {
    title = $('h1').first().text().trim().replace(/\s*lyrics\s*$/i, '').trim()
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
    'year': 'releaseYear'
  }

  // Parse credit fields
  $('strong, b').each((_, el) => {
    const labelText = $(el).text().trim().replace(/\s*:\s*$/, '').toLowerCase()
    const mapped = creditMap[labelText]
    if (!mapped) return

    // Get the value - text after the strong tag
    const parent = $(el).parent()
    let value = ''

    // Try getting sibling text
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

  // Lyrics - Tamil from first tab content, English from second
  let lyrics = ''
  let lyricsTranslated = ''

  const tabContents = $('.tabcontent')
  if (tabContents.length > 0) {
    // First tab = Tamil lyrics
    const firstTab = tabContents.eq(0)
    firstTab.find('br').replaceWith('\n')
    lyrics = firstTab.text().trim()

    // Second tab = English translation
    if (tabContents.length > 1) {
      const secondTab = tabContents.eq(1)
      secondTab.find('br').replaceWith('\n')
      lyricsTranslated = secondTab.text().trim()
    }
  }

  // If no tabcontent, try other selectors
  if (!lyrics) {
    const lyricsDiv = $('.lyrics-body, .song-lyrics, .entry-content, [class*="lyrics"]').first()
    if (lyricsDiv.length) {
      lyricsDiv.find('br').replaceWith('\n')
      lyrics = lyricsDiv.text().trim()
    }
  }

  // Cover image
  let coverImage = $('meta[property="og:image"]').attr('content') || ''

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
    language: 'Tamil',
    releaseYear,
    coverImage,
    youtubeUrl: '',
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
