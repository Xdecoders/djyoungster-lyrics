import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 18
    const sort = searchParams.get('sort') || 'popular'
    const skip = (page - 1) * limit

    let orderBy = {}
    switch (sort) {
      case 'alphabetical':
        orderBy = { name: 'asc' }
        break
      case 'latest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
      default:
        orderBy = { songs: { _count: 'desc' } }
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        include: {
          _count: { select: { songs: true } },
          songs: {
            select: {
              song: {
                select: {
                  coverImage: true,
                  album: { select: { coverImage: true } }
                }
              }
            },
            take: 1
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.artist.count()
    ])

    // Add thumbnail from first song's cover image if no artist image
    const artistsWithThumbnail = artists.map(artist => ({
      ...artist,
      thumbnail: artist.imageUrl || artist.songs?.[0]?.song?.coverImage || artist.songs?.[0]?.song?.album?.coverImage || null
    }))

    return NextResponse.json({
      artists: artistsWithThumbnail,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}
