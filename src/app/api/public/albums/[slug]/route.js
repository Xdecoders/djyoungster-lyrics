import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    const album = await prisma.album.findUnique({
      where: { slug },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true
          }
        },
        songs: {
          where: { status: 'published' },
          include: {
            artists: {
              include: {
                artist: {
                  select: { id: true, name: true, slug: true }
                }
              }
            },
            genres: {
              include: {
                genre: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    // Get more albums from same artist
    const moreAlbums = await prisma.album.findMany({
      where: {
        artistId: album.artistId,
        slug: { not: slug }
      },
      include: {
        artist: {
          select: { name: true, slug: true }
        },
        _count: {
          select: { songs: true }
        }
      },
      take: 6,
      orderBy: { releaseDate: 'desc' }
    })

    // Calculate total duration and views
    const totalViews = album.songs.reduce((sum, song) => sum + (song.views || 0), 0)

    return NextResponse.json({
      album: {
        ...album,
        totalSongs: album.songs.length,
        totalViews
      },
      moreAlbums
    })

  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 })
  }
}
