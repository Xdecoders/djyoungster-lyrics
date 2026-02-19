import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

export async function scrapeGaana(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // Extract JSON-LD MusicComposition (Gaana has raw newlines in lyrics text, so sanitize)
  let jsonLd = null
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html()
    if (!raw || !raw.includes('MusicComposition')) return
    try {
      // Gaana's JSON-LD has raw newlines in lyrics text; escape them for valid JSON
      const sanitized = raw
        .replace(/\r\n/g, '\\n')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\n')
        .replace(/\t/g, '\\t')
      const parsed = JSON.parse(sanitized)
      if (parsed['@type'] === 'MusicComposition') {
        jsonLd = parsed
      }
    } catch {}
  })

  // Title
  let title = ''
  if (jsonLd?.name) {
    title = jsonLd.name
  } else {
    title = $('h1.title').text().trim().replace(/\s*Lyrics\s*$/i, '')
  }

  // Lyrics - prefer <pre> in div._inner (preserves formatting), fallback to JSON-LD
  let lyrics = ''
  const preEl = $('div._inner pre')
  if (preEl.length) {
    lyrics = preEl.text().trim()
  }
  if (!lyrics && jsonLd?.lyrics?.text) {
    lyrics = jsonLd.lyrics.text.trim()
  }

  // Credits from Song Artists section (li.card items with role spans)
  let lyricist = ''
  let composer = ''
  let singers = ''
  const artistNames = []
  const singerNames = []

  $('div.tracks_body li.card').each((_, el) => {
    const name = $(el).find('.al.t_over').attr('title') || $(el).find('.al.t_over').text().trim()
    const role = $(el).find('.ar.t_over span').attr('title') || $(el).find('.ar.t_over span').text().trim()
    if (!name) return

    const roleLower = role.toLowerCase()
    if (roleLower === 'singer' || roleLower === 'singers') {
      singerNames.push(name)
    } else if (roleLower === 'lyricist' || roleLower === 'lyricists') {
      lyricist = lyricist ? lyricist + ', ' + name : name
    } else if (roleLower === 'composer' || roleLower === 'music director' || roleLower === 'music') {
      composer = composer ? composer + ', ' + name : name
    }

    if (!artistNames.includes(name)) {
      artistNames.push(name)
    }
  })

  singers = singerNames.join(', ')

  // Fallback: artists from ul.singers in header if Song Artists section is empty
  if (artistNames.length === 0) {
    $('div.info ul.singers li a').each((_, el) => {
      const name = $(el).text().trim()
      if (name && !artistNames.includes(name)) {
        artistNames.push(name)
        singerNames.push(name)
      }
    })
    singers = singerNames.join(', ')
  }

  // Album from p.al_name
  let albumName = null
  const albumLink = $('div.info p.al_name a[href*="/album/"]')
  if (albumLink.length) {
    albumName = albumLink.text().trim() || null
  }

  // Cover image - prefer <source srcset>, upgrade to size_xl for highest quality
  let coverImage = ''
  const srcsetEl = $('section.info_sec source[srcset*="gn_img"]')
  if (srcsetEl.length) {
    coverImage = srcsetEl.first().attr('srcset') || ''
  }
  if (!coverImage && jsonLd?.image) {
    coverImage = jsonLd.image
  }
  if (!coverImage) {
    const songImg = $('section.info_sec img[alt*="Lyrics"]')
    if (songImg.length) {
      coverImage = songImg.attr('src') || ''
    }
  }
  // Upgrade to size_xl for highest quality
  if (coverImage) {
    coverImage = coverImage.replace(/size_[sml]\.(jpg|webp|png)/, 'size_xl.$1')
  }

  // Release year from JSON-LD or aboutInfo
  let releaseYear = null
  if (jsonLd?.releasedEvent?.name) {
    const year = new Date(jsonLd.releasedEvent.name).getFullYear()
    if (!isNaN(year)) releaseYear = year
  }
  if (!releaseYear) {
    $('div.aboutInfo .row').each((_, el) => {
      const rowLabel = $(el).find('strong').text().trim()
      const value = $(el).find('small').text().trim()
      if (rowLabel === 'Released on' && value) {
        const year = new Date(value).getFullYear()
        if (!isNaN(year)) releaseYear = year
      }
    })
  }

  // Release year fallback from info section (year shown next to album)
  if (!releaseYear) {
    const yearText = $('div.info p.al_name').contents().filter(function () {
      return this.type === 'text'
    }).text().trim()
    const yearMatch = yearText.match(/\b(19|20)\d{2}\b/)
    if (yearMatch) releaseYear = parseInt(yearMatch[0])
  }

  // Label from copyright
  let label = ''
  const copyright = $('div.aboutInfo .copyright').text().trim()
  if (copyright) {
    label = copyright.replace(/^©\s*/, '')
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
    starring: '',
    producer: '',
    director: '',
    releaseYear,
    coverImage,
    youtubeUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    lyricsRomanized: '',
    lyricsTranslated: '',
    artistNames,
    movieName: null,
    albumName,
    sourceUrl: url,
    sourceSite: 'gaana.com'
  }
}
