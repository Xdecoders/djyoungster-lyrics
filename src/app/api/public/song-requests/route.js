import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    const { success } = rateLimit(`song-request:${ip}`, 5, 60 * 1000)
    if (!success) return rateLimitResponse()

    const data = await request.json()

    if (!data.songName || !data.songName.trim()) {
      return NextResponse.json({ message: 'Song name is required' }, { status: 400 })
    }
    if (!data.artistName || !data.artistName.trim()) {
      return NextResponse.json({ message: 'Artist name is required' }, { status: 400 })
    }
    if (!data.email || !data.email.trim() || !data.email.includes('@')) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 })
    }

    const songRequest = await prisma.songRequest.create({
      data: {
        songName: data.songName.trim(),
        artistName: data.artistName.trim(),
        lyrics: data.lyrics || null,
        youtubeUrl: data.youtubeUrl || null,
        spotifyUrl: data.spotifyUrl || null,
        email: data.email.trim().toLowerCase(),
        newsletterOptIn: !!data.newsletterOptIn,
        ipAddress: ip
      }
    })

    // Handle newsletter opt-in
    if (data.newsletterOptIn) {
      try {
        const existingSub = await prisma.newsletterSubscriber.findUnique({
          where: { email: data.email.trim().toLowerCase() }
        })
        if (existingSub) {
          if (existingSub.status === 'unsubscribed') {
            await prisma.newsletterSubscriber.update({
              where: { id: existingSub.id },
              data: { status: 'active', unsubscribedAt: null }
            })
          }
        } else {
          await prisma.newsletterSubscriber.create({
            data: {
              email: data.email.trim().toLowerCase(),
              ipAddress: ip
            }
          })
        }
      } catch (err) {
        // Newsletter errors should not fail the request
        console.error('Newsletter opt-in error:', err)
      }
    }

    return NextResponse.json(
      { message: 'Song request submitted successfully', id: songRequest.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating song request:', error)
    return NextResponse.json(
      { message: 'Error submitting song request' },
      { status: 500 }
    )
  }
}
