import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

function getClientIP(headersList) {
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return headersList.get('x-real-ip') || '127.0.0.1'
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    const [aggregation, userRating] = await Promise.all([
      prisma.artistRating.aggregate({
        where: { artistId: artist.id },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.artistRating.findUnique({
        where: {
          artistId_ipAddress: {
            artistId: artist.id,
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
    console.error('Error fetching artist ratings:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    const { success } = rateLimit(`artist-rate:${clientIP}`, 10, 60 * 1000)
    if (!success) return rateLimitResponse()

    const body = await request.json()
    const { rating } = body

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
    }

    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    await prisma.artistRating.upsert({
      where: {
        artistId_ipAddress: {
          artistId: artist.id,
          ipAddress: clientIP
        }
      },
      update: { rating },
      create: {
        artistId: artist.id,
        ipAddress: clientIP,
        rating
      }
    })

    const aggregation = await prisma.artistRating.aggregate({
      where: { artistId: artist.id },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json({
      averageRating: aggregation._avg.rating ? Math.round(aggregation._avg.rating * 10) / 10 : 0,
      totalRatings: aggregation._count.rating,
      userRating: rating
    })
  } catch (error) {
    console.error('Error submitting artist rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
