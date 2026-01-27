import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET() {
  try {
    // Get all existing settings
    const settings = await prisma.siteSeoSettings.findMany({
      orderBy: { pageKey: 'asc' }
    })

    // Create a map of existing settings
    const settingsMap = {}
    settings.forEach(s => {
      settingsMap[s.pageKey] = s
    })

    // Merge with defaults for any missing pages
    const allPages = Object.keys(DEFAULT_SETTINGS)
    const result = allPages.map(pageKey => {
      if (settingsMap[pageKey]) {
        return settingsMap[pageKey]
      }
      return {
        id: null,
        pageKey,
        ...DEFAULT_SETTINGS[pageKey],
        ogTitle: DEFAULT_SETTINGS[pageKey].metaTitle,
        ogDescription: DEFAULT_SETTINGS[pageKey].metaDescription,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO settings' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { pageKey, metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription } = data

    if (!pageKey) {
      return NextResponse.json({ error: 'Page key is required' }, { status: 400 })
    }

    // Upsert the settings
    const settings = await prisma.siteSeoSettings.upsert({
      where: { pageKey },
      update: {
        pageTitle: DEFAULT_SETTINGS[pageKey]?.pageTitle || pageKey,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
      },
      create: {
        pageKey,
        pageTitle: DEFAULT_SETTINGS[pageKey]?.pageTitle || pageKey,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving SEO settings:', error)
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 })
  }
}
