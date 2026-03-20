import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { posts: { where: { status: 'published' } } } }
    },
  })

  // Only expose categories that have at least one published post
  const nonEmpty = categories.filter(c => c._count.posts > 0)

  return NextResponse.json(nonEmpty, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
  })
}
