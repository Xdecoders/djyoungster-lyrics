import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!genre) {
      return NextResponse.json(
        { message: 'Genre not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(genre)
  } catch (error) {
    console.error('Error fetching genre:', error)
    return NextResponse.json(
      { message: 'Error fetching genre' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const genre = await prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null
      }
    })

    return NextResponse.json(genre)
  } catch (error) {
    console.error('Error updating genre:', error)
    return NextResponse.json(
      { message: 'Error updating genre' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.genre.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Genre deleted successfully' })
  } catch (error) {
    console.error('Error deleting genre:', error)
    return NextResponse.json(
      { message: 'Error deleting genre' },
      { status: 500 }
    )
  }
}
