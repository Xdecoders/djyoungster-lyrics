import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all reports (admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const reports = await prisma.report.findMany({
      where,
      include: {
        song: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get counts by status
    const counts = await prisma.report.groupBy({
      by: ['status'],
      _count: true
    })

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      resolved: 0,
      total: 0
    }

    counts.forEach(c => {
      statusCounts[c.status] = c._count
      statusCounts.total += c._count
    })

    return NextResponse.json({ reports, counts: statusCounts })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { message: 'Error fetching reports' },
      { status: 500 }
    )
  }
}
