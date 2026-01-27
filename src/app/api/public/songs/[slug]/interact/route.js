import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// Get client IP address
function getClientIP(headersList) {
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return '127.0.0.1'
}

// POST - Increment view count
export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    // Find the song
    const song = await prisma.song.findUnique({
      where: { slug },
      select: { id: true, views: true, likes: true }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Increment view count
    const updatedSong = await prisma.song.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true, likes: true }
    })

    // Check if this IP has already liked the song
    const existingLike = await prisma.songLike.findUnique({
      where: {
        songId_ipAddress: {
          songId: song.id,
          ipAddress: clientIP
        }
      }
    })

    return NextResponse.json({
      views: updatedSong.views,
      likes: updatedSong.likes,
      hasLiked: !!existingLike
    })

  } catch (error) {
    console.error('Error updating view count:', error)
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 })
  }
}

// PUT - Toggle like (add/remove)
export async function PUT(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    // Find the song
    const song = await prisma.song.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Check if this IP has already liked the song
    const existingLike = await prisma.songLike.findUnique({
      where: {
        songId_ipAddress: {
          songId: song.id,
          ipAddress: clientIP
        }
      }
    })

    let hasLiked = false

    if (existingLike) {
      // Remove like
      await prisma.songLike.delete({
        where: { id: existingLike.id }
      })
      await prisma.song.update({
        where: { slug },
        data: { likes: { decrement: 1 } }
      })
      hasLiked = false
    } else {
      // Add like
      await prisma.songLike.create({
        data: {
          songId: song.id,
          ipAddress: clientIP
        }
      })
      await prisma.song.update({
        where: { slug },
        data: { likes: { increment: 1 } }
      })
      hasLiked = true
    }

    // Get updated counts
    const updatedSong = await prisma.song.findUnique({
      where: { slug },
      select: { views: true, likes: true }
    })

    return NextResponse.json({
      views: updatedSong.views,
      likes: updatedSong.likes,
      hasLiked
    })

  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
