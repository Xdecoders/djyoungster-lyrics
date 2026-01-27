import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'

// Default SEO settings for each page
const DEFAULT_SETTINGS = {
  homepage: {
    pageTitle: 'Homepage',
    metaTitle: 'DJYoungster - Song Lyrics | Hindi, Punjabi, English Lyrics with Translations',
    metaDescription: 'DJYoungster is your ultimate destination for song lyrics. Find Hindi, Punjabi, English, Tamil, and Telugu song lyrics with translations.',
    metaKeywords: 'song lyrics, hindi lyrics, punjabi lyrics, english lyrics, bollywood songs',
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

export async function getSeoSettings(pageKey) {
  // Disable caching to always fetch fresh SEO settings from database
  noStore()

  const defaults = {
    metaTitle: DEFAULT_SETTINGS[pageKey]?.metaTitle,
    metaDescription: DEFAULT_SETTINGS[pageKey]?.metaDescription,
    metaKeywords: DEFAULT_SETTINGS[pageKey]?.metaKeywords,
    ogTitle: DEFAULT_SETTINGS[pageKey]?.metaTitle,
    ogDescription: DEFAULT_SETTINGS[pageKey]?.metaDescription,
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
      }
    }

    return defaults
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return defaults
  }
}
