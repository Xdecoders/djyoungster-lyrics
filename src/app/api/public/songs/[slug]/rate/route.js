import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

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

// GET - Get rating data for a song
export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    const song = await prisma.song.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    const [aggregation, userRating] = await Promise.all([
      prisma.songRating.aggregate({
        where: { songId: song.id },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.songRating.findUnique({
        where: {
          songId_ipAddress: {
            songId: song.id,
            ipAddress: clientIP
          }
        },
        select: { rating: true }
      })
    ])

    return NextResponse.json({
      averageRating: aggregation._avg.rating ? Math.round(aggregation._avg.rating * 10) / 10 : 0,
      totalRatings: aggregation._count.rating,
      userRating: userRating?.rating || 0
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

// POST - Submit or update a rating
export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    const { success } = rateLimit(`song-rate:${clientIP}`, 10, 60 * 1000)
    if (!success) return rateLimitResponse()

    const body = await request.json()
    const { rating } = body

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
    }

    const song = await prisma.song.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Upsert the rating
    await prisma.songRating.upsert({
      where: {
        songId_ipAddress: {
          songId: song.id,
          ipAddress: clientIP
        }
      },
      update: { rating },
      create: {
        songId: song.id,
        ipAddress: clientIP,
        rating
      }
    })

    // Get updated aggregates
    const aggregation = await prisma.songRating.aggregate({
      where: { songId: song.id },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json({
      averageRating: aggregation._avg.rating ? Math.round(aggregation._avg.rating * 10) / 10 : 0,
      totalRatings: aggregation._count.rating,
      userRating: rating
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
