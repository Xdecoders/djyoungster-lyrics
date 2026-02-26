import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: true,
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(albums)
  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json(
      { message: 'Error fetching albums' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const album = await prisma.album.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        coverImage: data.coverImage || null,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        label: data.label || null,
        artistId: data.artistId,
        metaTitle: data.metaTitle || `${data.title} Songs Lyrics with English Translation - DJYoungster`,
        metaDescription: data.metaDescription || `Explore ${data.title} album song lyrics with meanings and translations on DJYoungster.`
      }
    })

    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    console.error('Error creating album:', error)
    return NextResponse.json(
      { message: 'Error creating album' },
      { status: 500 }
    )
  }
}