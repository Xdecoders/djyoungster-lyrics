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
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            views: true,
            createdAt: true,
            artists: {
              select: {
                artist: { select: { id: true, name: true, slug: true } }
              }
            },
            genres: {
              select: {
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

    const response = NextResponse.json({
      movie: {
        ...movie,
        totalSongs: movie.songs.length,
        totalViews
      }
    })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response

  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}
