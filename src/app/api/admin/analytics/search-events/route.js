import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const recentPage = Math.max(1, parseInt(searchParams.get('recentPage') || '1'))
    const recentLimit = 25
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Total count
    const total = await prisma.searchEvent.count({
      where: { createdAt: { gte: since } },
    })

    // Zero-result count
    const zeroResults = await prisma.searchEvent.count({
      where: { createdAt: { gte: since }, resultCount: 0 },
    })

    // Top queries by frequency with avg result count
    const topQueriesRaw = await prisma.searchEvent.groupBy({
      by: ['query'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      _avg: { resultCount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    })
    const topQueries = topQueriesRaw.map(r => ({
      query: r.query,
      count: r._count.id,
      avgResults: Math.round(r._avg.resultCount ?? 0),
    }))

    // Zero-result queries
    const zeroResultQueriesRaw = await prisma.searchEvent.groupBy({
      by: ['query'],
      where: { createdAt: { gte: since }, resultCount: 0 },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })
    const zeroResultQueries = zeroResultQueriesRaw.map(r => ({
      query: r.query,
      count: r._count.id,
    }))

    // Daily breakdown
    const events = await prisma.searchEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const dailyMap = {}
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = { date: key, count: 0 }
    }
    for (const e of events) {
      const key = e.createdAt.toISOString().slice(0, 10)
      if (dailyMap[key]) dailyMap[key].count++
    }
    const daily = Object.values(dailyMap)

    // Paginated recent individual queries
    const recentRaw = await prisma.searchEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { query: true, resultCount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (recentPage - 1) * recentLimit,
      take: recentLimit,
    })
    const recentQueries = recentRaw.map(r => ({
      query: r.query,
      resultCount: r.resultCount,
      createdAt: r.createdAt,
    }))
    const recentTotalPages = Math.ceil(total / recentLimit)

    return NextResponse.json({ total, zeroResults, topQueries, zeroResultQueries, daily, recentQueries, recentPage, recentTotalPages, recentLimit })
  } catch (error) {
    console.error('Search events analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
