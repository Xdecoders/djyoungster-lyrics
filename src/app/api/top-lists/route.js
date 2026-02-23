import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const topLists = await prisma.topList.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        count: true,
      }
    })

    return NextResponse.json(topLists)
  } catch (error) {
    console.error('Error fetching top lists:', error)
    return NextResponse.json([], { status: 500 })
  }
}
