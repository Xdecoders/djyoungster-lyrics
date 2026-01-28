import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single song by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params

    // Fetch the song with all relations
    const song = await prisma.song.findUnique({
      where: { slug },
      include: {
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              }
            }
          }
        },
        album: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            releaseDate: true,
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            year: true,
            director: true,
          }
        },
        genres: {
          include: {
            genre: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
      }
    })

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    prisma.song.update({
      where: { id: song.id },
      data: { views: { increment: 1 } }
    }).catch(console.error)

    // Fetch related songs (same artist or genre)
    const artistIds = song.artists.map(sa => sa.artist.id)
    const genreIds = song.genres.map(sg => sg.genre.id)

    const relatedSongs = await prisma.song.findMany({
      where: {
        AND: [
          { id: { not: song.id } },
          { status: 'published' },
          {
            OR: [
              { artists: { some: { artistId: { in: artistIds } } } },
              { genres: { some: { genreId: { in: genreIds } } } },
              { albumId: song.albumId },
            ]
          }
        ]
      },
      include: {
        artists: {
          include: {
            artist: {
              select: { name: true, slug: true }
            }
          }
        }
      },
      take: 8,
      orderBy: { views: 'desc' }
    })

    return NextResponse.json({
      song,
      relatedSongs
    })

  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    )
  }
}
