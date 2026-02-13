import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const { success } = rateLimit(`newsletter:${ip}`, 5, 60 * 1000)
    if (!success) return rateLimitResponse()

    const { email, name } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Resubscribe
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            status: 'active',
            subscribedAt: new Date(),
            unsubscribedAt: null
          }
        })
        return NextResponse.json({ message: 'Welcome back! You have been resubscribed.' })
      }
      return NextResponse.json(
        { message: 'This email is already subscribed' },
        { status: 400 }
      )
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        ipAddress: ip
      }
    })

    return NextResponse.json({ message: 'Successfully subscribed to our newsletter!' })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { message: 'Error subscribing to newsletter' },
      { status: 500 }
    )
  }
}
