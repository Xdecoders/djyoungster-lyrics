import { prisma } from '@/lib/prisma'

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || 'https://djyoungster.com'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/songs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/albums`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Fetch all songs
  const songs = await prisma.song.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const songPages = songs.map((song) => ({
    url: `${baseUrl}/song/${song.slug}`,
    lastModified: song.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch all artists
  const artists = await prisma.artist.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const artistPages = artists.map((artist) => ({
    url: `${baseUrl}/artist/${artist.slug}`,
    lastModified: artist.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch all albums
  const albums = await prisma.album.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const albumPages = albums.map((album) => ({
    url: `${baseUrl}/album/${album.slug}`,
    lastModified: album.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Fetch all genres
  const genres = await prisma.genre.findMany({
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const genrePages = genres.map((genre) => ({
    url: `${baseUrl}/genre/${genre.slug}`,
    lastModified: genre.createdAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Fetch all movies
  const movies = await prisma.movie.findMany({
    where: { slug: { not: null } },
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const moviePages = movies.map((movie) => ({
    url: `${baseUrl}/movie/${movie.slug}`,
    lastModified: movie.createdAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Fetch all categories
  let categoryPages = []
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.createdAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (e) {
    // Category model might not exist
  }

  return [
    ...staticPages,
    ...songPages,
    ...artistPages,
    ...albumPages,
    ...genrePages,
    ...moviePages,
    ...categoryPages,
  ]
}
