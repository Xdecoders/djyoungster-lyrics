import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter — 1 visit per IP per 30 minutes
const visitMap = new Map()
const VISIT_COOLDOWN = 30 * 60 * 1000

function shouldTrack(ip) {
  const now = Date.now()
  const lastVisit = visitMap.get(ip)
  if (lastVisit && now - lastVisit < VISIT_COOLDOWN) return false
  visitMap.set(ip, now)
  // Cleanup old entries every 1000 entries
  if (visitMap.size > 1000) {
    for (const [key, time] of visitMap) {
      if (now - time > VISIT_COOLDOWN) visitMap.delete(key)
    }
  }
  return true
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'

    if (!shouldTrack(ip)) {
      return NextResponse.json({ tracked: false })
    }

    const { userAgent, platform, referrer } = await request.json()

    await prisma.appVisit.create({
      data: {
        ipAddress: ip,
        userAgent: userAgent || null,
        platform: platform || null,
        referrer: referrer || null,
      },
    })

    return NextResponse.json({ tracked: true })
  } catch (error) {
    console.error('Track visit error:', error)
    return NextResponse.json({ message: 'Error tracking visit' }, { status: 500 })
  }
}
