import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined

    const artists = await prisma.artist.findMany({
      where: search ? { name: { contains: search } } : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        _count: {
          select: { songs: true, albums: true }
        }
      }
    })

    return NextResponse.json(artists)
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { message: 'Error fetching artists' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const artist = await prisma.artist.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        country: data.country || null,
        metaTitle: data.metaTitle || `${data.name} Songs Lyrics with English Translation - DJYoungster`,
        metaDescription: data.metaDescription || `${data.name} song lyrics with English translation, Hindi and Punjabi script — all tracks in one place on DJYoungster.`
      }
    })

    return NextResponse.json(artist, { status: 201 })
  } catch (error) {
    console.error('Error creating artist:', error)
    return NextResponse.json(
      { message: 'Error creating artist' },
      { status: 500 }
    )
  }
}