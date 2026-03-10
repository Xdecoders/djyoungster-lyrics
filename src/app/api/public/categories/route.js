import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { songs: true }
        }
      }
    })

    // Only return categories that have songs
    const categoriesWithSongs = categories.filter(cat => cat._count.songs > 0)

    return NextResponse.json(categoriesWithSongs, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Error fetching categories' },
      { status: 500 }
    )
  }
}
