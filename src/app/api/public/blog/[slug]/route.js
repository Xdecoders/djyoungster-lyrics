import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: 'published' },
    select: {
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
      readTime: true,
      views: true,
      isFeatured: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
      blogCategory: { select: { id: true, name: true, slug: true, color: true } },
      relatedSong: {
        select: {
          id: true, title: true, slug: true, coverImage: true,
          artists: { select: { artist: { select: { name: true, slug: true } } } }
        }
      },
      relatedMovie: { select: { id: true, title: true, slug: true, posterUrl: true, year: true } },
      relatedArtist: { select: { id: true, name: true, slug: true, imageUrl: true, bio: true } },
      relatedAlbum: {
        select: {
          id: true, title: true, slug: true, coverImage: true,
          artist: { select: { name: true, slug: true } }
        }
      },
    },
  })

  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  // Increment views (fire-and-forget)
  prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {})

  // Fetch related posts from same category
  const relatedPosts = await prisma.blogPost.findMany({
    where: { status: 'published', blogCategoryId: post.blogCategory?.id, NOT: { slug: params.slug } },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    select: {
      id: true, title: true, slug: true, excerpt: true,
      coverImage: true, readTime: true, publishedAt: true,
      blogCategory: { select: { name: true, slug: true, color: true } },
    },
  })

  return NextResponse.json(
    { post, relatedPosts },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  )
}
