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

  // Extract JSON-LD - handle @graph format (Yoast) and flat format
  let jsonLd = null
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html())
      if (parsed['@type'] === 'MusicRecording') {
        jsonLd = parsed
      } else if (parsed['@graph']) {
        const music = parsed['@graph'].find(item => item['@type'] === 'MusicRecording')
        if (music) jsonLd = music
      }
    } catch {}
  })

  // Title from JSON-LD or h1
  let title = ''
  if (jsonLd?.name) {
    title = jsonLd.name
  } else {
    const h1Text = $('h1.entry-title').text().trim()
    // h1 format: "Song Lyrics – Movie | Composer | Artist"
    title = h1Text.split(' Lyrics')[0]?.trim() || h1Text.split('–')[0]?.trim() || h1Text
  }

  // Artist from JSON-LD or h1
  let artistNames = []
  if (jsonLd?.byArtist) {
    const byArtist = Array.isArray(jsonLd.byArtist) ? jsonLd.byArtist : [jsonLd.byArtist]
    artistNames = byArtist.map(a => a.name || a).filter(Boolean)
  }
  if (artistNames.length === 0) {
    const h1Text = $('h1.entry-title').text().trim()
    // Try "Song Lyrics – Movie | Composer | Artist1, Artist2"
    const parts = h1Text.split('|')
    if (parts.length >= 3) {
      // Last part often has artists
      artistNames = parts[parts.length - 1].split(/[,&]/).map(n => n.trim()).filter(Boolean)
    } else {
      const afterColon = h1Text.split(':').slice(1).join(':').trim()
      if (afterColon) {
        artistNames = afterColon.split(/[,&]/).map(n => n.trim()).filter(Boolean)
      }
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

  // Also check credits from table (older page format)
  if (!singers || !lyricist || !composer) {
    $('.entry-content table tr').each((_, tr) => {
      const cells = $(tr).find('td')
      if (cells.length >= 2) {
        const key = cells.eq(0).text().trim().toLowerCase().replace(/[:\s]+$/, '')
        const value = cells.eq(1).text().trim()
        if (!value) return
        if ((key.includes('singer') || key === 'sung by') && !singers) singers = value
        if ((key.includes('lyrics') || key.includes('lyricist') || key.includes('written by')) && !lyricist) lyricist = value
        if ((key.includes('music') || key.includes('composer')) && !key.includes('label') && !composer) composer = value
        if (key.includes('label') && !label) label = value
        if ((key.includes('actor') || key.includes('starring') || key.includes('cast')) && !starring) starring = value
        if (key.includes('director') && !director) director = value
        if (key.includes('producer') && !producer) producer = value
      }
    })
  }

  // ===== LYRICS EXTRACTION =====
  let lyrics = ''
  let lyricsTranslated = ''

  // Method 1: .lyric-stanza structure (new format)
  const originals = []
  const translated = []
  $('.lyric-stanza').each((_, stanza) => {
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

  // Method 2: <p> tags from .entry-content after <h2> (older format)
  if (!lyrics) {
    const entryContent = $('.entry-content')
    if (entryContent.length) {
      const lyricsParas = []
      let foundH2 = false
      entryContent.children().each((_, el) => {
        const tag = el.tagName
        if (tag === 'h2') foundH2 = true
        if (foundH2 && tag === 'p') {
          const html = $(el).html()
          if (html && !html.includes('adsbygoogle') && !html.includes('Song Lyrics')) {
            const text = html.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').trim()
            if (text) lyricsParas.push(text)
          }
        }
      })
      lyrics = lyricsParas.join('\n\n')
    }
  }

  // Method 3: JSON-LD lyrics text fallback
  if (!lyrics && jsonLd?.recordingOf?.lyrics?.text) {
    lyrics = jsonLd.recordingOf.lyrics.text
  }

  // YouTube URL from embed
  let youtubeUrl = ''
  const ytPlayer = $('[data-src*="youtube.com/embed/"]').attr('data-src') ||
                   $('iframe[src*="youtube.com/embed/"]').attr('src') || ''
  if (ytPlayer) {
    const match = ytPlayer.match(/youtube\.com\/embed\/([^?"]+)/)
    if (match) youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`
  }

  // Release year from JSON-LD
  let releaseYear = null
  if (jsonLd?.datePublished) {
    const year = new Date(jsonLd.datePublished).getFullYear()
    if (!isNaN(year)) releaseYear = year
  }

  // Cover image
  const coverImage = $('meta[property="og:image"]').attr('content') || ''

  // Movie name from h1 pattern "Song Lyrics – MovieName | ..."
  let movieName = null
  const h1Text = $('h1.entry-title').text().trim()
  const h1Parts = h1Text.split('|')
  if (h1Parts.length >= 2) {
    // Part after "Lyrics –" and before first | is usually the movie
    const afterLyrics = h1Text.split(/Lyrics\s*[–\-]\s*/)[1]
    if (afterLyrics) {
      const movie = afterLyrics.split('|')[0].trim()
      if (movie && movie.length < 50) movieName = movie
    }
  }

  // Singers default to artist names
  if (!singers) singers = artistNames.join(', ')
  // If we have singers but no artist names, extract from singers
  if (artistNames.length === 0 && singers) {
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
    sourceSite: 'lyricsraag.com'
  }
}
