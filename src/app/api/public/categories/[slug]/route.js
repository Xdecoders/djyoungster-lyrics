import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const sort = searchParams.get('sort') || 'latest'
    const genre = searchParams.get('genre') || ''
    const skip = (page - 1) * limit

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Build song query
    const songWhere = {
      categories: { some: { categoryId: category.id } },
      status: 'published'
    }

    if (genre) {
      songWhere.genres = { some: { genre: { slug: genre } } }
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

    const [songs, totalSongs] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
        include: {
          artists: {
            include: {
              artist: { select: { id: true, name: true, slug: true } }
            }
          },
          album: { select: { id: true, title: true, slug: true, coverImage: true } },
          genres: {
            include: {
              genre: { select: { id: true, name: true, slug: true } }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where: songWhere })
    ])

    // Get genres for filter
    const categoryGenres = await prisma.genre.findMany({
      where: {
        songs: {
          some: {
            song: {
              categories: { some: { categoryId: category.id } }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { songs: true } }
      }
    })

    // Get featured songs
    const featuredSongs = await prisma.song.findMany({
      where: {
        categories: { some: { categoryId: category.id } },
        status: 'published'
      },
      include: {
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
      category: {
        ...category,
        totalSongs
      },
      songs,
      featuredSongs,
      genres: categoryGenres,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit),
        hasMore: skip + songs.length < totalSongs
      }
    })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}
