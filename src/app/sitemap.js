import { prisma } from '@/lib/prisma'
import { getAbsoluteUrl } from '@/lib/seo'

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/songs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/albums`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/genres`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/languages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Fetch all dynamic content (with image fields for image sitemap)
  const [songs, artists, albums, movies, genres, categories, tags, topLists] = await Promise.all([
    prisma.song.findMany({
      where: { status: 'published' },
      select: { slug: true, coverImage: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.artist.findMany({
      select: { slug: true, imageUrl: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.album.findMany({
      select: { slug: true, coverImage: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.movie.findMany({
      where: { slug: { not: null } },
      select: { slug: true, posterUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.genre.findMany({
      select: { slug: true, imageUrl: true, createdAt: true }
    }),
    prisma.category.findMany({
      select: { slug: true, imageUrl: true, createdAt: true }
    }),
    prisma.tag.findMany({
      select: { slug: true, createdAt: true }
    }),
    prisma.topList.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true }
    }),
  ])

  const songPages = songs.map(song => ({
    url: `${baseUrl}/song/${song.slug}`,
    lastModified: song.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
    ...(song.coverImage && { images: [getAbsoluteUrl(song.coverImage)] }),
  }))

  const artistPages = artists.map(artist => ({
    url: `${baseUrl}/artist/${artist.slug}`,
    lastModified: artist.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
    ...(artist.imageUrl && { images: [getAbsoluteUrl(artist.imageUrl)] }),
  }))

  const albumPages = albums.map(album => ({
    url: `${baseUrl}/album/${album.slug}`,
    lastModified: album.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
    ...(album.coverImage && { images: [getAbsoluteUrl(album.coverImage)] }),
  }))

  const moviePages = movies.map(movie => ({
    url: `${baseUrl}/movie/${movie.slug}`,
    lastModified: movie.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
    ...(movie.posterUrl && { images: [getAbsoluteUrl(movie.posterUrl)] }),
  }))

  const genrePages = genres.map(genre => ({
    url: `${baseUrl}/genre/${genre.slug}`,
    lastModified: genre.createdAt,
    changeFrequency: 'monthly',
    priority: 0.5,
    ...(genre.imageUrl && { images: [getAbsoluteUrl(genre.imageUrl)] }),
  }))

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: cat.createdAt,
    changeFrequency: 'monthly',
    priority: 0.5,
    ...(cat.imageUrl && { images: [getAbsoluteUrl(cat.imageUrl)] }),
  }))

  const tagPages = tags.map(tag => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: tag.createdAt,
    changeFrequency: 'monthly',
    priority: 0.4,
  }))

  const topListPages = [
    { url: `${baseUrl}/list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...topLists.map(tl => ({
      url: `${baseUrl}/list/${tl.slug}`,
      lastModified: tl.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  ]

  return [
    ...staticPages,
    ...songPages,
    ...artistPages,
    ...albumPages,
    ...moviePages,
    ...genrePages,
    ...categoryPages,
    ...tagPages,
    ...topListPages,
  ]
}
