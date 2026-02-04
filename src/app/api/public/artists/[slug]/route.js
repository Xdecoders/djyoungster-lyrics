import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single artist by slug with their songs
export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Pagination and filters
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const sort = searchParams.get('sort') || 'latest' // latest, popular, alphabetical
    const genre = searchParams.get('genre') || ''
    const skip = (page - 1) * limit

    // Fetch the artist with basic info
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        albums: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            releaseDate: true,
          },
          orderBy: { releaseDate: 'desc' }
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // Build song query with filters
    const songWhere = {
      artists: {
        some: { artistId: artist.id }
      },
      status: 'published'
    }

    // Genre filter
    if (genre) {
      songWhere.genres = {
        some: {
          genre: { slug: genre }
        }
      }
    }

    // Sort options
    let orderBy = {}
    switch (sort) {
      case 'popular':
        orderBy = { views: 'desc' }
        break
      case 'alphabetical':
        orderBy = { title: 'asc' }
        break
      case 'oldest':
        orderBy = { releaseYear: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Fetch songs with pagination
    const [songs, totalSongs] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          views: true,
          createdAt: true,
          artists: {
            select: {
              artist: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          genres: {
            select: {
              genre: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          album: {
            select: { id: true, title: true, slug: true, coverImage: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where: songWhere })
    ])

    // Get all genres for this artist's songs (for filter dropdown)
    const artistGenres = await prisma.genre.findMany({
      where: {
        songs: {
          some: {
            song: {
              artists: {
                some: { artistId: artist.id }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { songs: true }
        }
      }
    })

    // Get featured/popular songs (top 5 by views)
    const featuredSongs = await prisma.song.findMany({
      where: {
        artists: { some: { artistId: artist.id } },
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        artists: {
          include: {
            artist: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    return NextResponse.json({
      artist: {
        ...artist,
        totalSongs: totalSongs
      },
      songs,
      featuredSongs,
      genres: artistGenres,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit),
        hasMore: skip + songs.length < totalSongs
      }
    })

  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}
