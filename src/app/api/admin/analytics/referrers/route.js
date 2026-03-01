import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseHostname(referrer) {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function hostnameToLabel(hostname) {
  if (!hostname) return 'Direct'
  if (/^google\./.test(hostname)) return 'Google'
  if (hostname === 'youtube.com') return 'YouTube'
  if (hostname === 'facebook.com' || hostname === 'fb.com') return 'Facebook'
  if (hostname === 'instagram.com') return 'Instagram'
  if (hostname === 'twitter.com' || hostname === 'x.com' || hostname === 't.co') return 'Twitter / X'
  return hostname
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const since = new Date()
    since.setDate(since.getDate() - days)

    const visits = await prisma.appVisit.findMany({
      where: { createdAt: { gte: since } },
      select: { referrer: true },
    })

    const total = visits.length
    const counts = {}

    for (const visit of visits) {
      const hostname = parseHostname(visit.referrer)
      const label = hostnameToLabel(hostname)
      counts[label] = (counts[label] || 0) + 1
    }

    const sources = Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ total, sources })
  } catch (error) {
    console.error('Referrers analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
