import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch latest songs
    const latestSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        artists: {
          include: { artist: true }
        },
        album: true
      }
    })

    // Fetch trending songs (most viewed)
    const trendingSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 10,
      include: {
        artists: {
          include: { artist: true }
        },
        album: true
      }
    })

    // Fetch categories with their songs
    const categories = await prisma.category.findMany({
      include: {
        songs: {
          include: {
            song: {
              include: {
                artists: {
                  include: { artist: true }
                },
                album: true
              }
            }
          },
          take: 10
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch genres with their songs
    const genres = await prisma.genre.findMany({
      include: {
        songs: {
          include: {
            song: {
              include: {
                artists: {
                  include: { artist: true }
                }
              }
            }
          },
          take: 10
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch popular artists
    const artists = await prisma.artist.findMany({
      take: 10,
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        songs: {
          _count: 'desc'
        }
      }
    })

    // Fetch recent albums
    const albums = await prisma.album.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: true,
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch popular tags
    const tags = await prisma.tag.findMany({
      take: 14,
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        songs: {
          _count: 'desc'
        }
      }
    })

    return NextResponse.json({
      latestSongs,
      trendingSongs,
      categories,
      genres,
      artists,
      albums,
      tags
    })
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return NextResponse.json(
      { message: 'Error fetching homepage data' },
      { status: 500 }
    )
  }
}
