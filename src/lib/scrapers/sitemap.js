import axios from 'axios'
import * as cheerio from 'cheerio'
import { createGunzip } from 'zlib'

const UA = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  timeout: 30000
}

/**
 * Fetch a sitemap URL and return all <loc> entries.
 * Handles sitemap index files (nested sitemaps) recursively.
 * Handles gzipped sitemaps (.xml.gz).
 */
async function fetchSitemap(url) {
  let xml

  if (url.endsWith('.gz')) {
    // Fetch gzipped sitemap
    const response = await axios.get(url, {
      ...UA,
      responseType: 'arraybuffer'
    })
    xml = await new Promise((resolve, reject) => {
      const chunks = []
      const gunzip = createGunzip()
      gunzip.on('data', chunk => chunks.push(chunk))
      gunzip.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      gunzip.on('error', reject)
      gunzip.end(Buffer.from(response.data))
    })
  } else {
    const response = await axios.get(url, UA)
    xml = response.data
  }

  const $ = cheerio.load(xml, { xmlMode: true })

  // Check if this is a sitemap index (contains <sitemap> tags)
  const nestedSitemaps = []
  $('sitemap > loc').each((_, el) => {
    nestedSitemaps.push($(el).text().trim())
  })

  if (nestedSitemaps.length > 0) {
    // Recursively fetch all nested sitemaps
    const allUrls = []
    for (const nestedUrl of nestedSitemaps) {
      try {
        const urls = await fetchSitemap(nestedUrl)
        allUrls.push(...urls)
      } catch (e) {
        console.error(`Failed to fetch nested sitemap ${nestedUrl}:`, e.message)
      }
    }
    return allUrls
  }

  // Regular sitemap - extract all <loc> URLs
  const urls = []
  $('url > loc').each((_, el) => {
    urls.push($(el).text().trim())
  })
  return urls
}

/**
 * Filter URLs for lyricsmint.com
 * Keep: /{artist}/{song} (2-segment paths)
 * Exclude: /artists, /albums, /category/, /tag/, /page/, homepage
 */
function filterLyricsMint(urls) {
  return urls.filter(url => {
    try {
      const path = new URL(url).pathname.replace(/\/$/, '')
      if (!path || path === '') return false
      const segments = path.split('/').filter(Boolean)
      if (segments.length !== 2) return false
      const excludePrefixes = ['artists', 'albums', 'category', 'tag', 'page', 'author', 'wp-content', 'wp-admin']
      if (excludePrefixes.includes(segments[0])) return false
      return true
    } catch {
      return false
    }
  })
}

/**
 * Filter URLs for lyricsraag.com
 * Exclude: category indexes, tag pages, author pages, pagination
 */
function filterLyricsRaag(urls) {
  return urls.filter(url => {
    try {
      const path = new URL(url).pathname.replace(/\/$/, '')
      if (!path || path === '') return false
      const segments = path.split('/').filter(Boolean)
      if (segments.length === 0) return false
      const excludePrefixes = ['category', 'tag', 'author', 'page', 'wp-content', 'wp-admin', 'wp-json']
      if (excludePrefixes.includes(segments[0])) return false
      if (path.includes('/page/')) return false
      return true
    } catch {
      return false
    }
  })
}

/**
 * Filter URLs for tamil2lyrics.com
 * Keep: /lyrics/* pattern only
 * Exclude: /movie/, /singers-list/, /category/, homepage
 */
function filterTamil2Lyrics(urls) {
  return urls.filter(url => {
    try {
      const path = new URL(url).pathname.replace(/\/$/, '')
      if (!path || path === '') return false
      const segments = path.split('/').filter(Boolean)
      if (segments.length === 0) return false
      if (segments[0] !== 'lyrics') return false
      if (segments.length < 2) return false
      return true
    } catch {
      return false
    }
  })
}

/**
 * Filter URLs for gaana.com
 * Keep: /lyrics/{slug} pattern only
 * Exclude: /lyrics/ index, non-lyrics pages
 */
function filterGaana(urls) {
  return urls.filter(url => {
    try {
      const path = new URL(url).pathname.replace(/\/$/, '')
      if (!path) return false
      const segments = path.split('/').filter(Boolean)
      if (segments.length !== 2) return false
      if (segments[0] !== 'lyrics') return false
      return true
    } catch {
      return false
    }
  })
}

/**
 * Filter URLs for bharatlyrics.com
 * Keep: URLs ending in -lyrics/ pattern (song pages)
 * Exclude: /singer/, /category/, /tag/, /page/, /releases/, language index pages
 */
function filterBharatLyrics(urls) {
  return urls.filter(url => {
    try {
      const path = new URL(url).pathname
      if (!path || path === '/') return false
      // Must end with -lyrics/ or -lyrics
      if (!/-lyrics\/?$/.test(path)) return false
      // Exclude taxonomy/archive pages
      const excludePrefixes = ['singer', 'category', 'tag', 'page', 'author', 'releases', 'wp-content', 'wp-admin', 'wp-json', 'lyricist', 'composer', 'music-director', 'mood', 'language']
      const segments = path.split('/').filter(Boolean)
      if (segments.length === 0) return false
      if (excludePrefixes.includes(segments[0])) return false
      if (path.includes('/page/')) return false
      return true
    } catch {
      return false
    }
  })
}

/**
 * Main entry: discover all song URLs from a supported site
 */
export async function discoverSongUrls(site) {
  const sitemapUrls = {
    'lyricsmint.com': [
      'https://www.lyricsmint.com/sitemap.xml.gz',
      'https://www.lyricsmint.com/sitemap-old.xml',
      'https://www.lyricsmint.com/sitemap_index.xml',
      'https://www.lyricsmint.com/sitemap.xml'
    ],
    'lyricsraag.com': [
      'https://lyricsraag.com/sitemap_index.xml',
      'https://lyricsraag.com/sitemap.xml',
      'https://lyricsraag.com/post-sitemap.xml'
    ],
    'tamil2lyrics.com': [
      'https://www.tamil2lyrics.com/sitemap_index.xml',
      'https://www.tamil2lyrics.com/sitemap.xml'
    ],
    'gaana.com': [
      'https://gaana.com/sitemap_v1/index.xml'
    ],
    'bharatlyrics.com': [
      'https://bharatlyrics.com/sitemap_index.xml',
      'https://bharatlyrics.com/post-sitemap.xml'
    ]
  }

  const filters = {
    'lyricsmint.com': filterLyricsMint,
    'lyricsraag.com': filterLyricsRaag,
    'tamil2lyrics.com': filterTamil2Lyrics,
    'gaana.com': filterGaana,
    'bharatlyrics.com': filterBharatLyrics
  }

  const urls = sitemapUrls[site]
  if (!urls) {
    throw new Error(`No sitemap configured for ${site}. Use manual URL entry instead.`)
  }

  // Try each sitemap URL until one works
  let allUrls = []
  let lastError = null
  for (const sitemapUrl of urls) {
    try {
      allUrls = await fetchSitemap(sitemapUrl)
      if (allUrls.length > 0) break
    } catch (e) {
      lastError = e
      console.error(`Sitemap ${sitemapUrl} failed:`, e.message)
    }
  }

  if (allUrls.length === 0 && lastError) {
    throw new Error(`Could not fetch sitemap for ${site}: ${lastError.message}`)
  }

  const filterFn = filters[site]
  if (filterFn) {
    allUrls = filterFn(allUrls)
  }

  return allUrls
}
