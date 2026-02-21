import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const updateData = {}
    if (data.status) updateData.status = data.status
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes

    const songRequest = await prisma.songRequest.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(songRequest)
  } catch (error) {
    console.error('Error updating song request:', error)
    return NextResponse.json(
      { message: 'Error updating song request' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.songRequest.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Song request deleted successfully' })
  } catch (error) {
    console.error('Error deleting song request:', error)
    return NextResponse.json(
      { message: 'Error deleting song request' },
      { status: 500 }
    )
  }
}
