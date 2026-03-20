import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/verifyAdmin'

function estimateReadTime(content) {
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  status: true,
  isFeatured: true,
  views: true,
  readTime: true,
  author: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  blogCategory: { select: { id: true, name: true, slug: true, color: true } },
  relatedSong: { select: { id: true, title: true, slug: true } },
  relatedMovie: { select: { id: true, title: true, slug: true } },
  relatedArtist: { select: { id: true, name: true, slug: true } },
  relatedAlbum: { select: { id: true, title: true, slug: true } },
}

export async function GET(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const categoryId = searchParams.get('categoryId') || ''

  const where = {}
  if (search) where.title = { contains: search }
  if (status) where.status = status
  if (categoryId) where.blogCategoryId = categoryId

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, limit })
}

export async function POST(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const data = await request.json()

    // Generate slug
    let slug = data.slug || generateSlug(data.title)
    const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })
    if (existing) {
      let suffix = 2
      while (await prisma.blogPost.findUnique({ where: { slug: `${slug}-${suffix}` }, select: { id: true } })) {
        suffix++
      }
      slug = `${slug}-${suffix}`
    }

    const readTime = data.content ? estimateReadTime(data.content) : null
    const publishedAt = data.status === 'published' ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || '',
        content: data.content || '',
        coverImage: data.coverImage || null,
        ogImage: data.ogImage || null,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        author: data.author || 'Admin',
        status: data.status || 'draft',
        isFeatured: data.isFeatured || false,
        readTime,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        blogCategoryId: data.blogCategoryId,
        relatedSongId: data.relatedSongId || null,
        relatedMovieId: data.relatedMovieId || null,
        relatedArtistId: data.relatedArtistId || null,
        relatedAlbumId: data.relatedAlbumId || null,
        publishedAt,
      },
      select: postSelect,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    console.error('[Blog POST]', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
