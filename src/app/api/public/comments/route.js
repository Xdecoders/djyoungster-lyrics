import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch approved comments for a specific song
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const songId = searchParams.get('songId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          songId,
          approved: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          comment: true,
          createdAt: true
        }
      }),
      prisma.comment.count({
        where: {
          songId,
          approved: true
        }
      })
    ])

    return NextResponse.json({
      comments,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - Submit a new comment
export async function POST(request) {
  try {
    const body = await request.json()
    const { songId, name, comment } = body

    // Validation
    if (!songId || !name || !comment) {
      return NextResponse.json(
        { error: 'songId, name, and comment are required' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Validate comment length
    if (comment.length < 10 || comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be between 10 and 500 characters' },
        { status: 400 }
      )
    }

    // Check if name contains URLs (basic anti-spam)
    const urlPattern = /https?:\/\//i
    if (urlPattern.test(name)) {
      return NextResponse.json(
        { error: 'Name cannot contain URLs' },
        { status: 400 }
      )
    }

    // Verify song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true }
    })

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting: check if user has posted more than 3 comments in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentComments = await prisma.comment.count({
      where: {
        ipAddress,
        createdAt: {
          gte: oneHourAgo
        }
      }
    })

    if (recentComments >= 3) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      )
    }

    // Create comment (unapproved by default)
    const newComment = await prisma.comment.create({
      data: {
        songId,
        name: name.trim(),
        comment: comment.trim(),
        ipAddress,
        approved: false
      },
      select: {
        id: true,
        name: true,
        comment: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Comment submitted successfully! It will appear after admin approval.',
      comment: newComment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    )
  }
}
