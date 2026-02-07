import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

export async function scrapeLyricsMint(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // Title from h1 (strip artist link text)
  let title = ''
  const h1 = $('h1').first()
  if (h1.length) {
    // h1 contains title + artist link, get just the text node before the link
    const h1Clone = h1.clone()
    h1Clone.find('a').remove()
    title = h1Clone.text().replace(/\s*lyrics\s*$/i, '').trim()
  }
  if (!title) {
    const ogTitle = $('meta[property="og:title"]').attr('content') || ''
    title = ogTitle.split(' LYRICS')[0]?.split(' - ')[0]?.trim() || ogTitle
  }

  // Artist from h1 link or og:title
  let artistNames = []
  const h1ArtistLink = h1.find('a')
  if (h1ArtistLink.length) {
    artistNames = [h1ArtistLink.text().trim()]
  }
  if (artistNames.length === 0) {
    const ogTitle = $('meta[property="og:title"]').attr('content') || ''
    // og:title format: "SONG LYRICS - Artist1, Artist2"
    const afterDash = ogTitle.split(' - ').slice(1).join(' - ')
    if (afterDash) {
      artistNames = afterDash.split(/[,&]/).map(n => n.trim()).filter(Boolean)
    }
  }

  // Credits from section.credits table
  let singers = ''
  let lyricist = ''
  let composer = ''
  let director = ''
  let label = ''

  $('section.credits table tr').each((_, tr) => {
    const key = $(tr).find('td').eq(0).text().trim().toLowerCase()
    const value = $(tr).find('td').eq(1).text().trim()
    if (!value) return
    if (key === 'singer') singers = value
    if (key === 'lyricist') lyricist = value
    if (key === 'music') composer = value
    if (key === 'director') director = value
    if (key === 'music label') label = value
  })

  // If multiple singers from credits, use those as artist names
  if (singers && artistNames.length <= 1) {
    artistNames = singers.split(/[,&]/).map(n => n.trim()).filter(Boolean)
  }

  // Lyrics from #lyrics - get p tags, strip scripts/ads
  let lyrics = ''
  const lyricsEl = $('#lyrics')
  if (lyricsEl.length) {
    lyricsEl.find('script, ins, style, .adsbygoogle, h2, h3, .related').remove()
    const parts = []
    lyricsEl.find('p').each((_, p) => {
      const text = $(p).text().trim()
      // Skip the "Written by:" paragraph and empty/script content
      if (text && !text.startsWith('Written by') && !text.includes('function(') && text.length > 5) {
        parts.push(text)
      }
    })
    lyrics = parts.join('\n\n')
  }

  // Cover image
  const coverImage = $('meta[property="og:image"]').attr('content') || ''

  // Release year - not typically in credits, skip

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
    producer: '',
    director,
    releaseYear: null,
    coverImage,
    youtubeUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    lyricsRomanized: '',
    lyricsTranslated: '',
    artistNames,
    movieName: null,
    albumName: null,
    sourceUrl: url,
    sourceSite: 'lyricsmint.com'
  }
}
