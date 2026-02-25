import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalSongs, totalArtists, totalAlbums, totalGenres] = await Promise.all([
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.genre.count(),
    ])

    return NextResponse.json({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: 'Error fetching stats' },
      { status: 500 }
    )
  }
}
