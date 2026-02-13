import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 18
    const sort = searchParams.get('sort') || 'latest'
    const category = searchParams.get('category') || ''
    const skip = (page - 1) * limit

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

    // Build where clause with optional category filter
    const where = { status: 'published' }
    if (category) {
      where.categories = {
        some: {
          category: { slug: category }
        }
      }
    }

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
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
          album: { select: { id: true, title: true, slug: true, coverImage: true } },
          categories: {
            select: {
              category: { select: { id: true, name: true, slug: true } }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.song.count({ where })
    ])

    return NextResponse.json({
      songs,
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
    console.error('Error fetching songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}
