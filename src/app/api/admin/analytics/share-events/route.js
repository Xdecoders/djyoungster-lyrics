import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Totals by type
    const totals = await prisma.songShareEvent.groupBy({
      by: ['type'],
      _count: { id: true },
    })
    const storyTotal = totals.find(t => t.type === 'story')?._count.id || 0
    const reelTotal = totals.find(t => t.type === 'reel')?._count.id || 0

    // Top songs by story clicks
    const topStoryGroups = await prisma.songShareEvent.groupBy({
      by: ['songId'],
      where: { type: 'story' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })
    // Top songs by reel clicks
    const topReelGroups = await prisma.songShareEvent.groupBy({
      by: ['songId'],
      where: { type: 'reel' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Fetch song details for top songs
    const allSongIds = [...new Set([
      ...topStoryGroups.map(g => g.songId),
      ...topReelGroups.map(g => g.songId),
    ])]
    const songs = await prisma.song.findMany({
      where: { id: { in: allSongIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        artists: { select: { artist: { select: { name: true } } }, take: 1 },
      },
    })
    const songMap = Object.fromEntries(songs.map(s => [s.id, s]))

    const topStory = topStoryGroups.map(g => ({
      song: songMap[g.songId],
      count: g._count.id,
    }))
    const topReel = topReelGroups.map(g => ({
      song: songMap[g.songId],
      count: g._count.id,
    }))

    // Daily breakdown for last `days` days
    const events = await prisma.songShareEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Build a day-by-day map
    const dailyMap = {}
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = { date: key, story: 0, reel: 0 }
    }
    for (const e of events) {
      const key = e.createdAt.toISOString().slice(0, 10)
      if (dailyMap[key]) dailyMap[key][e.type]++
    }
    const daily = Object.values(dailyMap)

    return NextResponse.json({
      totals: { story: storyTotal, reel: reelTotal, combined: storyTotal + reelTotal },
      topStory,
      topReel,
      daily,
    })
  } catch (error) {
    console.error('Share events analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
