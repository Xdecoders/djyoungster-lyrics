import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// PUT update an annotation
export async function PUT(request, { params }) {
  try {
    const { id, annotationId } = await params
    const { startLine, endLine, content } = await request.json()

    if (startLine == null || endLine == null || !content?.trim()) {
      return NextResponse.json(
        { message: 'startLine, endLine, and content are required' },
        { status: 400 }
      )
    }

    if (startLine > endLine) {
      return NextResponse.json(
        { message: 'startLine must be <= endLine' },
        { status: 400 }
      )
    }

    // Check for overlapping annotations (excluding self)
    const overlapping = await prisma.annotation.findFirst({
      where: {
        songId: id,
        id: { not: annotationId },
        OR: [
          { startLine: { lte: endLine }, endLine: { gte: startLine } }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json(
        { message: 'This line range overlaps with an existing annotation' },
        { status: 409 }
      )
    }

    const annotation = await prisma.annotation.update({
      where: { id: annotationId },
      data: {
        startLine,
        endLine,
        content: content.trim()
      }
    })

    const song = await prisma.song.findUnique({
      where: { id },
      select: { slug: true }
    })
    if (song) {
      revalidatePath(`/song/${song.slug}`)
    }

    return NextResponse.json(annotation)
  } catch (error) {
    console.error('Error updating annotation:', error)
    return NextResponse.json(
      { message: 'Error updating annotation' },
      { status: 500 }
    )
  }
}

// DELETE an annotation
export async function DELETE(request, { params }) {
  try {
    const { id, annotationId } = await params

    await prisma.annotation.delete({
      where: { id: annotationId }
    })

    const song = await prisma.song.findUnique({
      where: { id },
      select: { slug: true }
    })
    if (song) {
      revalidatePath(`/song/${song.slug}`)
    }

    return NextResponse.json({ message: 'Annotation deleted' })
  } catch (error) {
    console.error('Error deleting annotation:', error)
    return NextResponse.json(
      { message: 'Error deleting annotation' },
      { status: 500 }
    )
  }
}
