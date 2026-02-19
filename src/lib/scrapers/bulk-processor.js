import { prisma } from '@/lib/prisma'
import { scrapeUrl } from '@/lib/scrapers'

/**
 * Scrape a URL and save as a draft song.
 * Returns { status: 'scraped'|'skipped'|'failed', songId?, reason? }
 */
export async function scrapeAndSaveSong(url) {
  try {
    // 1. Scrape the URL
    const scraped = await scrapeUrl(url)

    // 2. Skip if lyrics are empty
    if (!scraped.lyrics || scraped.lyrics.trim().length < 20) {
      return { status: 'failed', reason: 'Empty or too short lyrics' }
    }

    // 3. Auto-deduplicate slug
    let slug = scraped.slug
    if (slug) {
      const existing = await prisma.song.findUnique({ where: { slug }, select: { id: true } })
      if (existing) {
        let suffix = 2
        while (await prisma.song.findUnique({ where: { slug: `${scraped.slug}-${suffix}` }, select: { id: true } })) {
          suffix++
        }
        slug = `${scraped.slug}-${suffix}`
      }
    }

    // 4. Match/create artists
    const dbArtists = await prisma.artist.findMany({ select: { id: true, name: true, slug: true } })
    const artistIds = []

    for (const name of scraped.artistNames) {
      const lower = name.toLowerCase()
      // Exact match first
      let match = dbArtists.find(a => a.name.toLowerCase() === lower)
      // Contains match
      if (!match) {
        match = dbArtists.find(a =>
          a.name.toLowerCase().includes(lower) || lower.includes(a.name.toLowerCase())
        )
      }
      // Auto-create if no match
      if (!match) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        try {
          match = await prisma.artist.create({
            data: { name, slug },
            select: { id: true, name: true, slug: true }
          })
        } catch (e) {
          match = await prisma.artist.create({
            data: { name, slug: slug + '-' + Date.now() },
            select: { id: true, name: true, slug: true }
          })
        }
        // Add to local cache so next iteration can find it
        dbArtists.push(match)
      }
      if (!artistIds.includes(match.id)) {
        artistIds.push(match.id)
      }
    }

    // 5. Match movie if available
    let movieId = null
    if (scraped.movieName) {
      const dbMovies = await prisma.movie.findMany({ select: { id: true, title: true } })
      const lower = scraped.movieName.toLowerCase()
      let matchedMovie = dbMovies.find(m => m.title.toLowerCase() === lower)
      if (!matchedMovie) {
        matchedMovie = dbMovies.find(m =>
          m.title.toLowerCase().includes(lower) || lower.includes(m.title.toLowerCase())
        )
      }
      if (matchedMovie) {
        movieId = matchedMovie.id
      }
    }

    // 6. Create draft song (no revalidation, no Google indexing)
    const song = await prisma.song.create({
      data: {
        title: scraped.title,
        slug,
        lyrics: scraped.lyrics,
        lyricsRomanized: scraped.lyricsRomanized || null,
        lyricsTranslated: scraped.lyricsTranslated || null,
        duration: scraped.duration || null,
        releaseYear: scraped.releaseYear ? parseInt(scraped.releaseYear) : null,
        movieId,
        coverImage: scraped.coverImage || null,
        youtubeUrl: scraped.youtubeUrl || null,
        spotifyUrl: scraped.spotifyUrl || null,
        lyricist: scraped.lyricist || null,
        singers: scraped.singers || null,
        composer: scraped.composer || null,
        producer: scraped.producer || null,
        director: scraped.director || null,
        starring: scraped.starring || null,
        label: scraped.label || null,
        status: 'draft',
        metaTitle: scraped.title,
        artists: artistIds.length > 0 ? {
          create: artistIds.map(artistId => ({
            artist: { connect: { id: artistId } }
          }))
        } : undefined
      },
      select: { id: true, title: true, slug: true }
    })

    return { status: 'scraped', songId: song.id, title: song.title }
  } catch (error) {
    return { status: 'failed', reason: error.message }
  }
}
