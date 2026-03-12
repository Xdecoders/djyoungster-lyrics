import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const songSelectFields = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  views: true,
  createdAt: true,
  artists: {
    select: { artist: { select: { id: true, name: true, slug: true, imageUrl: true } } }
  },
  album: {
    select: { id: true, title: true, slug: true, coverImage: true }
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'all'

  let dateFilter = {}
  const now = new Date()

  if (period === 'day') {
    const since = new Date(now)
    since.setDate(since.getDate() - 1)
    dateFilter = { createdAt: { gte: since } }
  } else if (period === 'week') {
    const since = new Date(now)
    since.setDate(since.getDate() - 7)
    dateFilter = { createdAt: { gte: since } }
  } else if (period === 'month') {
    const since = new Date(now)
    since.setMonth(since.getMonth() - 1)
    dateFilter = { createdAt: { gte: since } }
  }

  try {
    const songs = await prisma.song.findMany({
      where: { status: 'published', ...dateFilter },
      orderBy: { views: 'desc' },
      take: 10,
      select: songSelectFields
    })

    return NextResponse.json(songs, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })
  } catch (error) {
    console.error('Charts API error:', error)
    return NextResponse.json({ message: 'Error fetching charts' }, { status: 500 })
  }
}
