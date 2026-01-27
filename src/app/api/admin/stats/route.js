import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient({})
    
    const [totalSongs, totalArtists, totalAlbums, totalGenres] = await Promise.all([
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.genre.count()
    ])

    await prisma.$disconnect()

    return NextResponse.json({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: 'Error fetching stats' },
      { status: 500 }
    )
  }
}