import { scrapeGenius } from './genius'
import { scrapeTamil2Lyrics } from './tamil2lyrics'
import { scrapeLyricsMint } from './lyricsmint'
import { scrapeLyricsRaag } from './lyricsraag'
import { scrapeGaana } from './gaana'

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function scrapeUrl(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL format')
  }

  const hostname = parsed.hostname.replace('www.', '')

  switch (hostname) {
    case 'genius.com':
      return scrapeGenius(url)
    case 'tamil2lyrics.com':
      return scrapeTamil2Lyrics(url)
    case 'lyricsmint.com':
      return scrapeLyricsMint(url)
    case 'lyricsraag.com':
      return scrapeLyricsRaag(url)
    case 'gaana.com':
      return scrapeGaana(url)
    default:
      throw new Error(`Unsupported site: ${hostname}. Supported: genius.com, tamil2lyrics.com, lyricsmint.com, lyricsraag.com, gaana.com`)
  }
}
