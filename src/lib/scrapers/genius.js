import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

export async function scrapeGenius(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // Extract JSON-LD structured data
  let jsonLd = null
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html())
      if (parsed['@type'] === 'MusicComposition' || parsed['@type'] === 'Song') {
        jsonLd = parsed
      }
    } catch {}
  })

  // Title
  let title = ''
  if (jsonLd?.name) {
    title = jsonLd.name
  } else {
    const ogTitle = $('meta[property="og:title"]').attr('content') || ''
    // og:title is usually "Song Title by Artist"
    title = ogTitle.split(' by ')[0]?.trim() || $('h1').first().text().trim()
  }

  // Artist
  let artistNames = []
  if (jsonLd?.byArtist) {
    const byArtist = Array.isArray(jsonLd.byArtist) ? jsonLd.byArtist : [jsonLd.byArtist]
    artistNames = byArtist.map(a => a.name || a).filter(Boolean)
  }
  if (artistNames.length === 0) {
    const ogTitle = $('meta[property="og:title"]').attr('content') || ''
    const byPart = ogTitle.split(' by ')[1]
    if (byPart) {
      artistNames = byPart.split(/[,&]/).map(n => n.trim()).filter(Boolean)
    }
  }
  // Also check the header artist link
  if (artistNames.length === 0) {
    const headerArtist = $('a[class*="HeaderArtistAndTracklistdesktop"]').first().text().trim()
    if (headerArtist) artistNames = [headerArtist]
  }

  // Lyrics - from data-lyrics-container divs
  let lyrics = ''
  const lyricsContainers = $('[data-lyrics-container="true"]')
  if (lyricsContainers.length > 0) {
    const parts = []
    lyricsContainers.each((_, el) => {
      const container = $(el)
      // Replace <br> with newlines before getting text
      container.find('br').replaceWith('\n')
      // Remove annotation links but keep their text
      container.find('a').each((_, link) => {
        $(link).replaceWith($(link).text())
      })
      parts.push(container.text())
    })
    lyrics = parts.join('\n\n').trim()
  }

  // Credits from sidebar
  let lyricist = ''
  let composer = ''
  let singers = ''
  let label = ''
  let producer = ''

  // Genius uses various patterns for song info
  $('div[class*="SongInfo"]').each((_, el) => {
    const text = $(el).text()
    if (text.includes('Written By') || text.includes('Lyrics By')) {
      const value = extractCreditValue($, el)
      if (value) lyricist = value
    }
    if (text.includes('Produced By') || text.includes('Producer')) {
      const value = extractCreditValue($, el)
      if (value) producer = value
    }
    if (text.includes('Label')) {
      const value = extractCreditValue($, el)
      if (value) label = value
    }
  })

  // Also try expandable credits section
  $('div[class*="SongInfodesktop"]').find('div').each((_, el) => {
    const label_text = $(el).find('span').first().text().trim()
    const value = $(el).find('span').last().text().trim()
    if (!label_text || !value || label_text === value) return
    if (label_text.includes('Written By')) lyricist = lyricist || value
    if (label_text.includes('Produced By')) producer = producer || value
    if (label_text.includes('Label')) label = label || value
  })

  // Cover image
  let coverImage = $('meta[property="og:image"]').attr('content') || ''

  // Release year
  let releaseYear = null
  if (jsonLd?.datePublished) {
    const year = new Date(jsonLd.datePublished).getFullYear()
    if (!isNaN(year)) releaseYear = year
  }
  if (!releaseYear) {
    // Try to find release date in page
    const releaseDateEl = $('span:contains("Release Date")').parent()
    const dateText = releaseDateEl.text().replace('Release Date', '').trim()
    if (dateText) {
      const year = new Date(dateText).getFullYear()
      if (!isNaN(year)) releaseYear = year
    }
  }

  // Streaming URLs
  let spotifyUrl = ''
  let appleMusicUrl = ''
  let youtubeUrl = ''

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (href.includes('spotify.com') && !spotifyUrl) spotifyUrl = href
    if (href.includes('music.apple.com') && !appleMusicUrl) appleMusicUrl = href
    if ((href.includes('youtube.com/watch') || href.includes('youtu.be/')) && !youtubeUrl) youtubeUrl = href
  })

  // Also look in meta tags for media links
  if (!youtubeUrl) {
    const ytEmbed = $('meta[property="twitter:player"]').attr('content') || ''
    if (ytEmbed.includes('youtube')) youtubeUrl = ytEmbed
  }

  // Singers - for Genius, the primary artist is usually the singer
  singers = artistNames.join(', ')

  const slug = generateSlug(title)

  return {
    title,
    slug,
    lyrics,
    lyricist,
    composer,
    singers,
    label,
    starring: '',
    producer,
    director: '',
    releaseYear,
    coverImage,
    youtubeUrl,
    spotifyUrl,
    appleMusicUrl,
    lyricsRomanized: '',
    lyricsTranslated: '',
    artistNames,
    movieName: null,
    albumName: jsonLd?.inAlbum?.name || null,
    sourceUrl: url,
    sourceSite: 'genius.com'
  }
}

function extractCreditValue($, el) {
  const links = $(el).find('a')
  if (links.length > 0) {
    const names = []
    links.each((_, link) => {
      const name = $(link).text().trim()
      if (name) names.push(name)
    })
    return names.join(', ')
  }
  return ''
}
