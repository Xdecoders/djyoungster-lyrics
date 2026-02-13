import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

const VALID_EMOJIS = ['fire', 'heart', 'sad', 'party', 'hundred']

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

// GET - Get reaction counts for a song
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

    const [reactionCounts, userReactions] = await Promise.all([
      prisma.songReaction.groupBy({
        by: ['emoji'],
        where: { songId: song.id },
        _count: { emoji: true }
      }),
      prisma.songReaction.findMany({
        where: {
          songId: song.id,
          ipAddress: clientIP
        },
        select: { emoji: true }
      })
    ])

    // Build reactions object with all emojis defaulting to 0
    const reactions = {}
    for (const emoji of VALID_EMOJIS) {
      reactions[emoji] = 0
    }
    for (const r of reactionCounts) {
      reactions[r.emoji] = r._count.emoji
    }

    return NextResponse.json({
      reactions,
      userReactions: userReactions.map(r => r.emoji)
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST - Toggle a reaction
export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    const { success } = rateLimit(`song-react:${clientIP}`, 20, 60 * 1000)
    if (!success) return rateLimitResponse()

    const body = await request.json()
    const { emoji } = body

    if (!emoji || !VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: `Invalid emoji. Must be one of: ${VALID_EMOJIS.join(', ')}` }, { status: 400 })
    }

    const song = await prisma.song.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Check if reaction already exists
    const existing = await prisma.songReaction.findUnique({
      where: {
        songId_ipAddress_emoji: {
          songId: song.id,
          ipAddress: clientIP,
          emoji
        }
      }
    })

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.songReaction.delete({
        where: { id: existing.id }
      })
    } else {
      // Add reaction (toggle on)
      await prisma.songReaction.create({
        data: {
          songId: song.id,
          ipAddress: clientIP,
          emoji
        }
      })
    }

    // Get updated counts and user reactions
    const [reactionCounts, userReactions] = await Promise.all([
      prisma.songReaction.groupBy({
        by: ['emoji'],
        where: { songId: song.id },
        _count: { emoji: true }
      }),
      prisma.songReaction.findMany({
        where: {
          songId: song.id,
          ipAddress: clientIP
        },
        select: { emoji: true }
      })
    ])

    const reactions = {}
    for (const e of VALID_EMOJIS) {
      reactions[e] = 0
    }
    for (const r of reactionCounts) {
      reactions[r.emoji] = r._count.emoji
    }

    return NextResponse.json({
      reactions,
      userReactions: userReactions.map(r => r.emoji),
      toggled: emoji,
      action: existing ? 'removed' : 'added'
    })
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}
