import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, songs, artists, albums, movies

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        songs: [],
        artists: [],
        albums: [],
        movies: []
      })
    }

    const searchTerm = query.trim()
    let songs = []
    let artists = []
    let albums = []
    let movies = []

    // Search songs
    if (type === 'all' || type === 'songs') {
      songs = await prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { artists: { some: { artist: { name: { contains: searchTerm } } } } },
          ],
          status: 'published'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          artists: {
            select: {
              artist: { select: { name: true } }
            },
            take: 1
          }
        },
        orderBy: { views: 'desc' },
        take: type === 'songs' ? 8 : 4
      })
    }

    // Search artists
    if (type === 'all' || type === 'artists') {
      artists = await prisma.artist.findMany({
        where: {
          name: { contains: searchTerm }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          _count: { select: { songs: true } }
        },
        orderBy: { name: 'asc' },
        take: type === 'artists' ? 8 : 3
      })
    }

    // Search albums
    if (type === 'all' || type === 'albums') {
      albums = await prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { artist: { name: { contains: searchTerm } } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          artist: { select: { name: true } }
        },
        orderBy: { releaseDate: 'desc' },
        take: type === 'albums' ? 8 : 3
      })
    }

    // Search movies
    if (type === 'all' || type === 'movies') {
      movies = await prisma.movie.findMany({
        where: {
          title: { contains: searchTerm }
        },
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          year: true
        },
        orderBy: { year: 'desc' },
        take: type === 'movies' ? 8 : 3
      })
    }

    return NextResponse.json({
      songs: songs.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        image: s.coverImage,
        artist: s.artists[0]?.artist?.name || 'Unknown',
        type: 'song'
      })),
      artists: artists.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        image: a.imageUrl,
        songCount: a._count?.songs || 0,
        type: 'artist'
      })),
      albums: albums.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        image: a.coverImage,
        artist: a.artist?.name || 'Unknown',
        type: 'album'
      })),
      movies: movies.map(m => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        image: m.posterUrl,
        year: m.year,
        type: 'movie'
      }))
    })

  } catch (error) {
    console.error('Error in autocomplete:', error)
    return NextResponse.json({ error: 'Autocomplete failed' }, { status: 500 })
  }
}
