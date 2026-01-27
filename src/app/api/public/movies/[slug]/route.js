import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        songs: {
          where: { status: 'published' },
          include: {
            artists: {
              include: {
                artist: { select: { id: true, name: true, slug: true } }
              }
            },
            genres: {
              include: {
                genre: { select: { id: true, name: true, slug: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    const totalViews = movie.songs.reduce((sum, song) => sum + (song.views || 0), 0)

    return NextResponse.json({
      movie: {
        ...movie,
        totalSongs: movie.songs.length,
        totalViews
      }
    })

  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}
