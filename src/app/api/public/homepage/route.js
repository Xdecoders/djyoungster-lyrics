import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Select only fields needed for homepage display (exclude lyrics)
    const songSelectFields = {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      views: true,
      createdAt: true,
      artists: {
        select: {
          artist: {
            select: { id: true, name: true, slug: true, imageUrl: true }
          }
        }
      },
      album: {
        select: { id: true, title: true, slug: true, coverImage: true }
      }
    }

    // Fetch latest songs
    const latestSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: songSelectFields
    })

    // Fetch trending songs (most viewed)
    const trendingSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 10,
      select: songSelectFields
    })

    // Fetch categories with their songs
    const categories = await prisma.category.findMany({
      include: {
        songs: {
          select: {
            song: {
              select: songSelectFields
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
          select: {
            song: {
              select: songSelectFields
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
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
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
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        releaseDate: true,
        artist: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch popular tags
    const tags = await prisma.tag.findMany({
      take: 14,
      select: {
        id: true,
        name: true,
        slug: true,
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
