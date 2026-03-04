import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all subscribers with stats
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50

    const where = {}
    if (status) where.status = status
    if (search) where.email = { contains: search }

    const [subscribers, total, activeCount, unsubscribedCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { status: 'active' } }),
      prisma.newsletterSubscriber.count({ where: { status: 'unsubscribed' } })
    ])

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: activeCount + unsubscribedCount,
        active: activeCount,
        unsubscribed: unsubscribedCount
      }
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { message: 'Error fetching subscribers' },
      { status: 500 }
    )
  }
}

// Delete subscriber
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Subscriber ID is required' },
        { status: 400 }
      )
    }

    await prisma.newsletterSubscriber.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Subscriber deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json(
      { message: 'Error deleting subscriber' },
      { status: 500 }
    )
  }
}
