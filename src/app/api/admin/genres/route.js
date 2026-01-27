import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    return NextResponse.json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json(
      { message: 'Error fetching genres' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const genre = await prisma.genre.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null
      }
    })

    return NextResponse.json(genre, { status: 201 })
  } catch (error) {
    console.error('Error creating genre:', error)
    return NextResponse.json(
      { message: 'Error creating genre' },
      { status: 500 }
    )
  }
}