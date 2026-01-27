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
        orderBy = { releaseDate: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { releaseDate: 'desc' }
    }

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        include: {
          artist: { select: { id: true, name: true, slug: true } },
          _count: { select: { songs: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.album.count()
    ])

    return NextResponse.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 })
  }
}
