import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const allGenres = await prisma.genre.findMany({
      include: {
        _count: { select: { songs: true } }
      },
      orderBy: { name: 'asc' }
    })

    // Only return genres that have at least one song
    const genres = allGenres.filter(genre => genre._count.songs > 0)

    return NextResponse.json({ genres }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 })
  }
}
