import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Unsubscribe from newsletter
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Email not found in our subscriber list' },
        { status: 404 }
      )
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { success: true, message: 'You are already unsubscribed' }
      )
    }

    // Update subscriber status
    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter'
    })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}

// GET - Check subscription status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!subscriber) {
      return NextResponse.json({
        success: true,
        subscribed: false,
        message: 'Email not found'
      })
    }

    return NextResponse.json({
      success: true,
      subscribed: subscriber.status === 'active',
      status: subscriber.status
    })
  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    )
  }
}
