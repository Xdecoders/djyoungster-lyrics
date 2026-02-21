import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter
const rateLimitMap = new Map()
const RATE_LIMIT = 5
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    const { endpoint, authKey, p256dh, userAgent } = await request.json()

    if (!endpoint || !authKey || !p256dh) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        authKey,
        p256dh,
        userAgent: userAgent || null,
        ipAddress: ip,
        status: 'active',
      },
      create: {
        endpoint,
        authKey,
        p256dh,
        userAgent: userAgent || null,
        ipAddress: ip,
        status: 'active',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ message: 'Error saving subscription' }, { status: 500 })
  }
}
