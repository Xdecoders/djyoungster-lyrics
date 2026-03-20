import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  author: true,
  readTime: true,
  views: true,
  isFeatured: true,
  publishedAt: true,
  createdAt: true,
  tags: true,
  blogCategory: { select: { id: true, name: true, slug: true, color: true } },
  relatedSong: { select: { id: true, title: true, slug: true } },
  relatedMovie: { select: { id: true, title: true, slug: true } },
  relatedArtist: { select: { id: true, name: true, slug: true } },
  relatedAlbum: { select: { id: true, title: true, slug: true } },
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const featured = searchParams.get('featured') === 'true'
  const author = searchParams.get('author') || ''

  const where = { status: 'published' }
  if (category) where.blogCategory = { slug: category }
  if (search) where.title = { contains: search }
  if (featured) where.isFeatured = true
  if (author) where.author = author

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: cardSelect,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ])

  return NextResponse.json(
    { posts, total, page, limit, totalPages: Math.ceil(total / limit) },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  )
}
