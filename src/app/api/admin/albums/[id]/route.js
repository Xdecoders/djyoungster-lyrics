import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single album
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!album) {
      return NextResponse.json(
        { message: 'Album not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { message: 'Error fetching album' },
      { status: 500 }
    )
  }
}

// UPDATE album
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const album = await prisma.album.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        artistId: data.artistId,
        coverImage: data.coverImage || null,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        label: data.label || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null
      },
      include: {
        artist: true
      }
    })

    return NextResponse.json(album)
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json(
      { message: 'Error updating album' },
      { status: 500 }
    )
  }
}

// DELETE album
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Check if album has songs
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!album) {
      return NextResponse.json(
        { message: 'Album not found' },
        { status: 404 }
      )
    }

    if (album._count.songs > 0) {
      return NextResponse.json(
        { message: 'Cannot delete album with associated songs. Remove songs first.' },
        { status: 400 }
      )
    }

    await prisma.album.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Album deleted successfully' })
  } catch (error) {
    console.error('Error deleting album:', error)
    return NextResponse.json(
      { message: 'Error deleting album' },
      { status: 500 }
    )
  }
}
