import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined

    const movies = await prisma.movie.findMany({
      where: search ? { title: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        _count: {
          select: { songs: true }
        },
        songs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { coverImage: true }
        }
      }
    })

    return NextResponse.json(movies)
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json(
      { message: 'Error fetching movies' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let counter = 1

    // Check for existing slug and make unique if needed
    while (await prisma.movie.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        slug,
        year: data.year ? parseInt(data.year) : null,
        director: data.director || null,
        posterUrl: data.posterUrl || null,
        description: data.description || null,
        cast: data.cast || null,
        producer: data.producer || null,
        musicDirector: data.musicDirector || null,
        writer: data.writer || null,
        genre: data.genre || null,
        language: data.language || null,
        metaTitle: data.metaTitle || `${data.title}${data.year ? ` (${data.year})` : ''} Songs Lyrics - DJYoungster`,
        metaDescription: data.metaDescription || `All songs from ${data.title}${data.year ? ` (${data.year})` : ''} with lyrics, English translation and Hindi-Punjabi script on DJYoungster.`
      }
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    console.error('Error creating movie:', error)
    return NextResponse.json(
      { message: 'Error creating movie' },
      { status: 500 }
    )
  }
}