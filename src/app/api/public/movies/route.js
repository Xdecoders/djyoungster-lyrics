import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 18
    const sort = searchParams.get('sort') || 'latest'
    const skip = (page - 1) * limit

    let orderBy = {}
    switch (sort) {
      case 'alphabetical':
        orderBy = { title: 'asc' }
        break
      case 'oldest':
        orderBy = { year: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { year: 'desc' }
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        include: {
          _count: { select: { songs: true } },
          songs: {
            select: {
              coverImage: true
            },
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.movie.count()
    ])

    // Add thumbnail from first song's cover image
    const moviesWithThumbnail = movies.map(movie => ({
      ...movie,
      thumbnail: movie.posterUrl || movie.songs?.[0]?.coverImage || null
    }))

    return NextResponse.json({
      movies: moviesWithThumbnail,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}
