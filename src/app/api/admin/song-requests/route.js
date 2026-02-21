import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [requests, total] = await Promise.all([
      prisma.songRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.songRequest.count({ where })
    ])

    const counts = await prisma.songRequest.groupBy({
      by: ['status'],
      _count: true
    })

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      completed: 0,
      rejected: 0,
      total: 0
    }

    counts.forEach(c => {
      statusCounts[c.status] = c._count
      statusCounts.total += c._count
    })

    return NextResponse.json({
      requests,
      counts: statusCounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching song requests:', error)
    return NextResponse.json(
      { message: 'Error fetching song requests' },
      { status: 500 }
    )
  }
}
