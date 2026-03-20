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
        relatedBlogPost: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            readTime: true,
            blogCategory: {
              select: {
                name: true,
                color: true,
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

    // Fetch related songs (same category, latest first, exclude current song)
    const categoryIds = song.categories.map(sc => sc.category.id)

    const relatedSongs = await prisma.song.findMany({
      where: {
        AND: [
          { id: { not: song.id } },
          { status: 'published' },
          ...(categoryIds.length > 0
            ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
            : [])
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
      orderBy: { createdAt: 'desc' }
    })

    const response = NextResponse.json({ song, relatedSongs })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response

  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    )
  }
}
