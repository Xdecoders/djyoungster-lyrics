import axios from 'axios'
import * as cheerio from 'cheerio'
import { generateSlug } from './index'

export async function scrapeLyricsRaag(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    timeout: 15000
  })

  const $ = cheerio.load(html)

  // Extract JSON-LD MusicRecording (most reliable source)
  let jsonLd = null
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html())
      if (parsed['@type'] === 'MusicRecording') {
        jsonLd = parsed
      }
    } catch {}
  })

  // Title from JSON-LD or h1
  let title = ''
  if (jsonLd?.name) {
    title = jsonLd.name
  } else {
    const h1Text = $('h1.entry-title').text().trim()
    // h1 format: "Song Lyrics [English Translation]: Artist"
    title = h1Text.split(' Lyrics')[0]?.trim() || h1Text.split(':')[0]?.trim() || h1Text
  }

  // Artist from JSON-LD or h1
  let artistNames = []
  if (jsonLd?.byArtist) {
    const byArtist = Array.isArray(jsonLd.byArtist) ? jsonLd.byArtist : [jsonLd.byArtist]
    artistNames = byArtist.map(a => a.name || a).filter(Boolean)
  }
  if (artistNames.length === 0) {
    // Try from h1: "Song Lyrics [...]: Artist"
    const h1Text = $('h1.entry-title').text().trim()
    const afterColon = h1Text.split(':').slice(1).join(':').trim()
    if (afterColon) {
      artistNames = afterColon.split(/[,&]/).map(n => n.trim()).filter(Boolean)
    }
  }

  // Credits from JSON-LD recordingOf
  let lyricist = ''
  let composer = ''
  if (jsonLd?.recordingOf) {
    const rec = jsonLd.recordingOf
    if (rec.lyricist) {
      const lyricists = Array.isArray(rec.lyricist) ? rec.lyricist : [rec.lyricist]
      lyricist = lyricists.map(l => l.name || l).filter(Boolean).join(', ')
    }
    if (rec.composer) {
      const composers = Array.isArray(rec.composer) ? rec.composer : [rec.composer]
      composer = composers.map(c => c.name || c).filter(Boolean).join(', ')
    }
  }

  // Also check .lyric-meta-details dt/dd pairs
  let label = ''
  let singers = ''
  let director = ''
  let producer = ''
  let starring = ''
  $('.lyric-meta-details div').each((_, el) => {
    const key = $(el).find('dt').text().trim().toLowerCase()
    const value = $(el).find('dd').text().trim()
    if (!value) return
    if (key === 'lyricist' && !lyricist) lyricist = value
    if (key === 'composer' && !composer) composer = value
    if (key === 'singer' || key === 'singers') singers = value
    if (key === 'label' || key === 'music label') label = value
    if (key === 'director') director = value
    if (key === 'producer') producer = value
    if (key === 'starring') starring = value
  })

  // Language from JSON-LD or article class
  let language = ''
  if (jsonLd?.inLanguage) {
    language = jsonLd.inLanguage
  } else {
    // Article class contains "language-punjabi", "language-hindi" etc
    const articleClass = $('article').attr('class') || ''
    const langMatch = articleClass.match(/language-(\w+)/)
    if (langMatch) {
      language = langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1)
    }
  }

  // Lyrics - original from .lyric-pair__original, translation from .lyric-pair__translated
  let lyrics = ''
  let lyricsTranslated = ''

  const originals = []
  const translated = []
  let lastStanza = -1

  $('.lyric-stanza').each((stanzaIdx, stanza) => {
    const stanzaOriginals = []
    const stanzaTranslated = []
    $(stanza).find('.lyric-pair').each((_, pair) => {
      const orig = $(pair).find('.lyric-pair__original').text().trim()
      const trans = $(pair).find('.lyric-pair__translated').text().trim()
      if (orig) stanzaOriginals.push(orig)
      if (trans) stanzaTranslated.push(trans)
    })
    if (stanzaOriginals.length) originals.push(stanzaOriginals.join('\n'))
    if (stanzaTranslated.length) translated.push(stanzaTranslated.join('\n'))
  })

  lyrics = originals.join('\n\n')
  lyricsTranslated = translated.join('\n\n')

  // If no stanza-based lyrics, try JSON-LD lyrics text
  if (!lyrics && jsonLd?.recordingOf?.lyrics?.text) {
    lyrics = jsonLd.recordingOf.lyrics.text
  }

  // Release year from JSON-LD
  let releaseYear = null
  if (jsonLd?.datePublished) {
    const year = new Date(jsonLd.datePublished).getFullYear()
    if (!isNaN(year)) releaseYear = year
  }

  // Cover image
  const coverImage = $('meta[property="og:image"]').attr('content') || ''

  // Singers default to artist names
  if (!singers) singers = artistNames.join(', ')

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
    language: language || 'Punjabi',
    releaseYear,
    coverImage,
    youtubeUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    lyricsRomanized: '',
    lyricsTranslated,
    artistNames,
    movieName: null,
    albumName: null,
    sourceUrl: url,
    sourceSite: 'lyricsraag.com'
  }
}
