import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// GET single artist
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        _count: {
          select: { songs: true, albums: true }
        }
      }
    })

    if (!artist) {
      return NextResponse.json(
        { message: 'Artist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { message: 'Error fetching artist' },
      { status: 500 }
    )
  }
}

// UPDATE artist
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const artist = await prisma.artist.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        country: data.country || null,
        socialLinks: data.socialLinks || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null
      }
    })

    // Revalidate artist page cache
    try {
      revalidatePath(`/artist/${artist.slug}`)
      revalidatePath('/artists')
      console.log('[Artist Update] Cache revalidated')
    } catch (e) {
      console.log('[Artist Update] Revalidation note:', e.message)
    }

    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json(
      { message: 'Error updating artist' },
      { status: 500 }
    )
  }
}

// DELETE artist
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Check if artist has songs
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    if (!artist) {
      return NextResponse.json(
        { message: 'Artist not found' },
        { status: 404 }
      )
    }

    if (artist._count.songs > 0) {
      return NextResponse.json(
        { message: 'Cannot delete artist with associated songs. Remove songs first.' },
        { status: 400 }
      )
    }

    const artistSlug = artist.slug

    await prisma.artist.delete({
      where: { id }
    })

    // Revalidate cache
    try {
      revalidatePath(`/artist/${artistSlug}`)
      revalidatePath('/artists')
      console.log('[Artist Delete] Cache revalidated')
    } catch (e) {
      console.log('[Artist Delete] Revalidation note:', e.message)
    }

    return NextResponse.json({ message: 'Artist deleted successfully' })
  } catch (error) {
    console.error('Error deleting artist:', error)
    return NextResponse.json(
      { message: 'Error deleting artist' },
      { status: 500 }
    )
  }
}
