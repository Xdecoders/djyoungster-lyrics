import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, songs, artists, albums, movies
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({
        songs: [],
        artists: [],
        albums: [],
        movies: [],
        totalResults: 0
      })
    }

    const searchTerm = query.trim()

    let songs = []
    let artists = []
    let albums = []
    let movies = []
    let totalSongs = 0
    let totalArtists = 0
    let totalAlbums = 0
    let totalMovies = 0

    // Search songs - search in title, lyrics, artist names, lyricist, composer
    if (type === 'all' || type === 'songs') {
      const songWhere = {
        OR: [
          { title: { contains: searchTerm } },
          { lyrics: { contains: searchTerm } },
          { lyricsRomanized: { contains: searchTerm } },
          { lyricsTranslated: { contains: searchTerm } },
          { lyricist: { contains: searchTerm } },
          { composer: { contains: searchTerm } },
          { singers: { contains: searchTerm } },
          { artists: { some: { artist: { name: { contains: searchTerm } } } } },
          { album: { title: { contains: searchTerm } } },
          { movie: { title: { contains: searchTerm } } },
        ],
        status: 'published'
      }

      ;[songs, totalSongs] = await Promise.all([
        prisma.song.findMany({
          where: songWhere,
          include: {
            artists: {
              include: {
                artist: { select: { id: true, name: true, slug: true } }
              }
            },
            album: { select: { id: true, title: true, slug: true, coverImage: true } },
            movie: { select: { id: true, title: true, slug: true } },
            genres: {
              include: {
                genre: { select: { id: true, name: true, slug: true } }
              }
            }
          },
          orderBy: [
            { views: 'desc' }
          ],
          skip: type === 'songs' ? skip : 0,
          take: type === 'songs' ? limit : 10
        }),
        prisma.song.count({ where: songWhere })
      ])
    }

    // Search artists
    if (type === 'all' || type === 'artists') {
      const artistWhere = {
        OR: [
          { name: { contains: searchTerm } },
          { bio: { contains: searchTerm } },
        ]
      }

      ;[artists, totalArtists] = await Promise.all([
        prisma.artist.findMany({
          where: artistWhere,
          include: {
            _count: { select: { songs: true } }
          },
          orderBy: { name: 'asc' },
          skip: type === 'artists' ? skip : 0,
          take: type === 'artists' ? limit : 6
        }),
        prisma.artist.count({ where: artistWhere })
      ])
    }

    // Search albums
    if (type === 'all' || type === 'albums') {
      const albumWhere = {
        OR: [
          { title: { contains: searchTerm } },
          { artist: { name: { contains: searchTerm } } },
        ]
      }

      ;[albums, totalAlbums] = await Promise.all([
        prisma.album.findMany({
          where: albumWhere,
          include: {
            artist: { select: { id: true, name: true, slug: true } },
            _count: { select: { songs: true } }
          },
          orderBy: { releaseDate: 'desc' },
          skip: type === 'albums' ? skip : 0,
          take: type === 'albums' ? limit : 6
        }),
        prisma.album.count({ where: albumWhere })
      ])
    }

    // Search movies
    if (type === 'all' || type === 'movies') {
      const movieWhere = {
        OR: [
          { title: { contains: searchTerm } },
          { director: { contains: searchTerm } },
          { cast: { contains: searchTerm } },
          { musicDirector: { contains: searchTerm } },
        ]
      }

      ;[movies, totalMovies] = await Promise.all([
        prisma.movie.findMany({
          where: movieWhere,
          include: {
            _count: { select: { songs: true } },
            songs: {
              select: { coverImage: true },
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { year: 'desc' },
          skip: type === 'movies' ? skip : 0,
          take: type === 'movies' ? limit : 6
        }),
        prisma.movie.count({ where: movieWhere })
      ])

      // Add thumbnail to movies
      movies = movies.map(movie => ({
        ...movie,
        thumbnail: movie.posterUrl || movie.songs?.[0]?.coverImage || null
      }))
    }

    const totalResults = totalSongs + totalArtists + totalAlbums + totalMovies

    return NextResponse.json({
      query: searchTerm,
      songs,
      artists,
      albums,
      movies,
      counts: {
        songs: totalSongs,
        artists: totalArtists,
        albums: totalAlbums,
        movies: totalMovies,
        total: totalResults
      },
      pagination: type !== 'all' ? {
        page,
        limit,
        total: type === 'songs' ? totalSongs : type === 'artists' ? totalArtists : type === 'albums' ? totalAlbums : totalMovies,
        totalPages: Math.ceil((type === 'songs' ? totalSongs : type === 'artists' ? totalArtists : type === 'albums' ? totalAlbums : totalMovies) / limit)
      } : null
    })

  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
