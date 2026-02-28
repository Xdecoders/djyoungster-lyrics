import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!movie) {
      return NextResponse.json(
        { message: 'Movie not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json(
      { message: 'Error fetching movie' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        year: data.year ? parseInt(data.year) : null,
        director: data.director || null,
        description: data.description || null,
        cast: data.cast || null,
        producer: data.producer || null,
        musicDirector: data.musicDirector || null,
        writer: data.writer || null,
        genre: data.genre || null,
        language: data.language || null,
        posterUrl: data.posterUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null
      }
    })

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json(
      { message: 'Error updating movie' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.movie.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { message: 'Error deleting movie' },
      { status: 500 }
    )
  }
}
