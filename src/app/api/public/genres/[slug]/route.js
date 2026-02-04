import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const sort = searchParams.get('sort') || 'latest'
    const skip = (page - 1) * limit

    const genre = await prisma.genre.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true
      }
    })

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 })
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
        orderBy = { createdAt: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    const songWhere = {
      genres: { some: { genreId: genre.id } },
      status: 'published'
    }

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
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          album: { select: { id: true, title: true, slug: true, coverImage: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where: songWhere })
    ])

    // Get featured songs
    const featuredSongs = await prisma.song.findMany({
      where: songWhere,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        artists: {
          select: {
            artist: { select: { id: true, name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    })

    return NextResponse.json({
      genre: {
        ...genre,
        totalSongs
      },
      songs,
      featuredSongs,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit),
        hasMore: skip + songs.length < totalSongs
      }
    })

  } catch (error) {
    console.error('Error fetching genre:', error)
    return NextResponse.json({ error: 'Failed to fetch genre' }, { status: 500 })
  }
}
