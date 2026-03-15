import { prisma } from '@/lib/prisma'
// Get global site settings (favicon, ogImage, etc.)
export async function getSiteSettings() {

  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'global' }
    })

    if (settings?.metaKeywords) {
      try {
        return JSON.parse(settings.metaKeywords)
      } catch (e) {
        return { favicon: null, ogImage: null }
      }
    }

    return { favicon: null, ogImage: null }
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return { favicon: null, ogImage: null }
  }
}

// Helper function to convert relative URLs to absolute URLs
export function getAbsoluteUrl(url) {
  if (!url) return null
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Convert relative URL to absolute
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  // Remove leading slash if present to avoid double slashes
  const path = url.startsWith('/') ? url : `/${url}`
  return `${siteUrl}${path}`
}

// Default SEO settings for each page
const DEFAULT_SETTINGS = {
  homepage: {
    pageTitle: 'Homepage',
    metaTitle: 'DJYoungster - Trusted Song Lyrics | Hindi, Punjabi, English with Translations & Instagram Story Creator',
    metaDescription: 'DJYoungster is your trusted destination for verified song lyrics in Hindi, Punjabi, English, Tamil, Telugu & more. Get accurate lyrics with translations and create stunning Instagram stories with our free lyrics story maker. 35,000+ satisfied users.',
    metaKeywords: 'song lyrics, hindi lyrics, punjabi lyrics, english lyrics, lyrics translation, romanized lyrics, instagram story lyrics, bollywood songs, verified lyrics, accurate lyrics',
  },
  songs: {
    pageTitle: 'All Songs',
    metaTitle: 'All Songs - Latest Hindi, Punjabi & English Song Lyrics | DJYoungster',
    metaDescription: 'Browse all song lyrics on DJYoungster. Find the latest Hindi, Punjabi, English, Tamil, and Telugu song lyrics with translations.',
    metaKeywords: 'song lyrics, hindi songs, punjabi songs, english songs, latest songs',
  },
  artists: {
    pageTitle: 'All Artists',
    metaTitle: 'All Artists - Hindi, Punjabi & English Singers | DJYoungster',
    metaDescription: 'Explore all artists on DJYoungster. Find lyrics from your favorite Hindi, Punjabi, and English singers.',
    metaKeywords: 'music artists, hindi singers, punjabi singers, bollywood artists',
  },
  albums: {
    pageTitle: 'All Albums',
    metaTitle: 'All Albums - Latest Music Albums & Song Lyrics | DJYoungster',
    metaDescription: 'Browse all music albums on DJYoungster. Find complete album lyrics from Bollywood, Punjabi, and English music.',
    metaKeywords: 'music albums, bollywood albums, punjabi albums, english albums',
  },
  movies: {
    pageTitle: 'All Movies',
    metaTitle: 'Movie Soundtracks - Bollywood & Hindi Movie Songs Lyrics | DJYoungster',
    metaDescription: 'Explore movie soundtracks and film songs on DJYoungster. Find complete lyrics from Bollywood movies and Hindi films.',
    metaKeywords: 'movie songs, bollywood songs, film soundtracks, hindi movie lyrics',
  },
  genres: {
    pageTitle: 'All Genres',
    metaTitle: 'All Genres - Browse Songs by Music Genre | DJYoungster',
    metaDescription: 'Browse songs by genre on DJYoungster. Explore Pop, Rock, Hip-Hop, Romantic, Sad, Party, and more music genres.',
    metaKeywords: 'music genres, song genres, pop songs, rock songs, romantic songs',
  },
}


// Get header/footer code snippets
export async function getCodeSnippets() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'code-snippets' }
    })
    if (settings?.metaKeywords) {
      try {
        return JSON.parse(settings.metaKeywords)
      } catch {}
    }
    return { headerCode: '', footerCode: '' }
  } catch (error) {
    console.error('Error fetching code snippets:', error)
    return { headerCode: '', footerCode: '' }
  }
}

export async function getSeoSettings(pageKey) {

  const defaults = {
    metaTitle: DEFAULT_SETTINGS[pageKey]?.metaTitle,
    metaDescription: DEFAULT_SETTINGS[pageKey]?.metaDescription,
    metaKeywords: DEFAULT_SETTINGS[pageKey]?.metaKeywords,
    ogTitle: DEFAULT_SETTINGS[pageKey]?.metaTitle,
    ogDescription: DEFAULT_SETTINGS[pageKey]?.metaDescription,
    ogImage: null,
  }

  try {
    // Check if the model exists in the Prisma client
    if (!prisma?.siteSeoSettings) {
      return defaults
    }

    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey }
    })

    if (settings) {
      return {
        metaTitle: settings.metaTitle || defaults.metaTitle,
        metaDescription: settings.metaDescription || defaults.metaDescription,
        metaKeywords: settings.metaKeywords || defaults.metaKeywords,
        ogTitle: settings.ogTitle || settings.metaTitle || defaults.ogTitle,
        ogDescription: settings.ogDescription || settings.metaDescription || defaults.ogDescription,
        ogImage: settings.ogImage || null,
      }
    }

    return defaults
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return defaults
  }
}
