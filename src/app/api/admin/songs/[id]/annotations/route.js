import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// GET all annotations for a song
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const annotations = await prisma.annotation.findMany({
      where: { songId: id },
      orderBy: { startLine: 'asc' }
    })

    return NextResponse.json(annotations)
  } catch (error) {
    console.error('Error fetching annotations:', error)
    return NextResponse.json(
      { message: 'Error fetching annotations' },
      { status: 500 }
    )
  }
}

// POST create a new annotation
export async function POST(request, { params }) {
  try {
    const { id } = await params
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

    // Check for overlapping annotations
    const overlapping = await prisma.annotation.findFirst({
      where: {
        songId: id,
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

    const annotation = await prisma.annotation.create({
      data: {
        songId: id,
        startLine,
        endLine,
        content: content.trim()
      }
    })

    // Get song slug for revalidation
    const song = await prisma.song.findUnique({
      where: { id },
      select: { slug: true }
    })
    if (song) {
      revalidatePath(`/song/${song.slug}`)
    }

    return NextResponse.json(annotation, { status: 201 })
  } catch (error) {
    console.error('Error creating annotation:', error)
    return NextResponse.json(
      { message: 'Error creating annotation' },
      { status: 500 }
    )
  }
}
