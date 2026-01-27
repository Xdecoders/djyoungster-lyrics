import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get single report
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            lyrics: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { message: 'Error fetching report' },
      { status: 500 }
    )
  }
}

// Update report status
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: data.status
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { message: 'Error updating report' },
      { status: 500 }
    )
  }
}

// Delete report
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.report.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { message: 'Error deleting report' },
      { status: 500 }
    )
  }
}
