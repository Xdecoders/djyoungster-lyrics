import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scrapeUrl } from '@/lib/scrapers'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ message: 'Invalid URL format' }, { status: 400 })
    }

    // Scrape the URL
    const scraped = await scrapeUrl(url)

    // Fuzzy-match artist names against DB, auto-create if not found
    const dbArtists = await prisma.artist.findMany({ select: { id: true, name: true, slug: true } })
    const matchedArtists = []

    for (const name of scraped.artistNames) {
      const lower = name.toLowerCase()
      let wasCreated = false
      // Exact match first
      let match = dbArtists.find(a => a.name.toLowerCase() === lower)
      // Contains match
      if (!match) {
        match = dbArtists.find(a =>
          a.name.toLowerCase().includes(lower) || lower.includes(a.name.toLowerCase())
        )
      }
      // Auto-create if no match found
      if (!match) {
        wasCreated = true
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        try {
          match = await prisma.artist.create({
            data: { name, slug },
            select: { id: true, name: true, slug: true }
          })
        } catch (e) {
          // Slug conflict - try with suffix
          match = await prisma.artist.create({
            data: { name, slug: slug + '-' + Date.now() },
            select: { id: true, name: true, slug: true }
          })
        }
      }
      matchedArtists.push({
        scrapedName: name,
        matched: match,
        created: wasCreated
      })
    }

    // Map language to matching category
    let matchedCategory = null
    if (scraped.language) {
      const dbCategories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } })
      const langLower = scraped.language.toLowerCase()
      matchedCategory = dbCategories.find(c => c.name.toLowerCase().includes(langLower))
    }

    // Fuzzy-match movie name against DB
    let matchedMovie = null
    if (scraped.movieName) {
      const dbMovies = await prisma.movie.findMany({ select: { id: true, title: true } })
      const lower = scraped.movieName.toLowerCase()
      matchedMovie = dbMovies.find(m => m.title.toLowerCase() === lower)
      if (!matchedMovie) {
        matchedMovie = dbMovies.find(m =>
          m.title.toLowerCase().includes(lower) || lower.includes(m.title.toLowerCase())
        )
      }
    }

    // Check for duplicate slug
    let duplicateWarning = null
    if (scraped.slug) {
      const existing = await prisma.song.findUnique({
        where: { slug: scraped.slug },
        select: { id: true, title: true, slug: true }
      })
      if (existing) {
        duplicateWarning = `A song with slug "${scraped.slug}" already exists: "${existing.title}"`
      }
    }

    return NextResponse.json({
      scraped,
      matchedArtists,
      matchedMovie,
      matchedCategory,
      duplicateWarning
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to scrape URL' },
      { status: 500 }
    )
  }
}
