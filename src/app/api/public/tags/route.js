import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch popular tags (for sidebar)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        songs: {
          _count: 'desc'
        }
      },
      take: limit
    })

    // Filter out tags with no songs and format response
    const popularTags = tags
      .filter(tag => tag._count.songs > 0)
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        count: tag._count.songs
      }))

    return NextResponse.json(popularTags, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json([])
  }
}
