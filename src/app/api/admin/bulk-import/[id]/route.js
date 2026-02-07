import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Single import with paginated URL list and status counts
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const statusFilter = searchParams.get('status') || null
    const skip = (page - 1) * limit

    const bulkImport = await prisma.bulkImport.findUnique({
      where: { id }
    })

    if (!bulkImport) {
      return NextResponse.json({ message: 'Import not found' }, { status: 404 })
    }

    // Get URL list with pagination
    const urlWhere = { importId: id }
    if (statusFilter) {
      urlWhere.status = statusFilter
    }

    const [urls, totalUrlCount] = await Promise.all([
      prisma.bulkImportUrl.findMany({
        where: urlWhere,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.bulkImportUrl.count({ where: urlWhere })
    ])

    // Get status counts
    const statusCounts = await prisma.bulkImportUrl.groupBy({
      by: ['status'],
      where: { importId: id },
      _count: { status: true }
    })

    const counts = { pending: 0, scraped: 0, failed: 0, skipped: 0 }
    statusCounts.forEach(s => {
      counts[s.status] = s._count.status
    })

    return NextResponse.json({
      import: bulkImport,
      urls,
      counts,
      pagination: {
        page,
        limit,
        total: totalUrlCount,
        totalPages: Math.ceil(totalUrlCount / limit)
      }
    })
  } catch (error) {
    console.error('Bulk import detail error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// DELETE - Remove import
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.bulkImport.delete({ where: { id } })
    return NextResponse.json({ status: 'deleted' })
  } catch (error) {
    console.error('Bulk import delete error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
