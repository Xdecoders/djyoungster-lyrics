import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient({})

    const [totalSongs, totalArtists, totalAlbums, totalGenres, pwaInstalls, pushSubscribers, totalVisits, uniqueVisitors] = await Promise.all([
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.genre.count(),
      prisma.pwaInstall.count(),
      prisma.pushSubscription.count({ where: { status: 'active' } }),
      prisma.appVisit.count(),
      prisma.appVisit.groupBy({ by: ['ipAddress'] }).then(r => r.length)
    ])

    await prisma.$disconnect()

    return NextResponse.json({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres,
      pwaInstalls,
      pushSubscribers,
      totalVisits,
      uniqueVisitors
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: 'Error fetching stats' },
      { status: 500 }
    )
  }
}
