import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all comments (admin only)
export async function GET(request) {
  try {
    // Auth check
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'all'
    const songId = searchParams.get('songId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where = {}
    if (status === 'pending') {
      where.approved = false
    } else if (status === 'approved') {
      where.approved = true
    }
    if (songId) {
      where.songId = songId
    }

    const [comments, total, pendingCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          song: {
            select: {
              id: true,
              title: true,
              slug: true,
              artists: {
                select: {
                  artist: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.comment.count({ where }),
      prisma.comment.count({ where: { approved: false } })
    ])

    return NextResponse.json({
      comments,
      total,
      pendingCount,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching admin comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete comments
export async function DELETE(request) {
  try {
    // Auth check
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    await prisma.comment.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return NextResponse.json({
      message: `${ids.length} comment(s) deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting comments:', error)
    return NextResponse.json(
      { error: 'Failed to delete comments' },
      { status: 500 }
    )
  }
}
