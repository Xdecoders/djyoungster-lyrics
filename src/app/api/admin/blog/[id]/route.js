import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/verifyAdmin'
import { revalidatePath } from 'next/cache'

function estimateReadTime(content) {
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  ogImage: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  author: true,
  status: true,
  isFeatured: true,
  readTime: true,
  views: true,
  tags: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  blogCategoryId: true,
  blogCategory: { select: { id: true, name: true, slug: true, color: true } },
  relatedSongId: true,
  relatedSong: { select: { id: true, title: true, slug: true } },
  relatedMovieId: true,
  relatedMovie: { select: { id: true, title: true, slug: true } },
  relatedArtistId: true,
  relatedArtist: { select: { id: true, name: true, slug: true } },
  relatedAlbumId: true,
  relatedAlbum: { select: { id: true, title: true, slug: true } },
}

export async function GET(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    select: postSelect,
  })
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const data = await request.json()

    const current = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { slug: true, status: true, publishedAt: true } })
    if (!current) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    const readTime = data.content ? estimateReadTime(data.content) : undefined
    const wasPublished = current.status === 'published'
    const nowPublished = data.status === 'published'
    const publishedAt = nowPublished && !wasPublished
      ? new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : current.publishedAt

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content, readTime }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
        ...(data.author !== undefined && { author: data.author }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.tags !== undefined && { tags: data.tags ? JSON.stringify(data.tags) : null }),
        ...(data.blogCategoryId !== undefined && { blogCategoryId: data.blogCategoryId }),
        relatedSongId: data.relatedSongId ?? null,
        relatedMovieId: data.relatedMovieId ?? null,
        relatedArtistId: data.relatedArtistId ?? null,
        relatedAlbumId: data.relatedAlbumId ?? null,
        publishedAt,
      },
      select: postSelect,
    })

    try {
      revalidatePath(`/updates/${post.slug}`)
      revalidatePath('/updates')
    } catch {}

    return NextResponse.json(post)
  } catch (err) {
    console.error('[Blog PATCH]', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  await prisma.blogPost.delete({ where: { id: params.id } })

  try {
    revalidatePath('/blog')
  } catch {}

  return NextResponse.json({ message: 'Deleted' })
}
