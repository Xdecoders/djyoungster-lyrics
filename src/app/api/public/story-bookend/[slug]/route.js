import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SITE_URL = 'https://djyoungster.com'
const PUBLISHER = 'DJYoungster'

function toCoverStoryImg(coverImage) {
  if (!coverImage) return `${SITE_URL}/og-default.jpg`
  const src = coverImage.startsWith('/uploads/') && coverImage.endsWith('.webp')
    ? coverImage.replace(/\.webp$/, '-story.webp')
    : coverImage
  return src.startsWith('/') ? `${SITE_URL}${src}` : src
}

export async function GET(request, { params }) {
  const { slug } = await params

  const song = await prisma.song.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      artists: {
        select: { artist: { select: { id: true, name: true } } }
      }
    }
  })

  if (!song) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const artistIds = song.artists.map(sa => sa.artist.id)

  // Same-artist stories first
  let relatedStories = []
  if (artistIds.length > 0) {
    relatedStories = await prisma.song.findMany({
      where: {
        slug: { not: slug },
        hasWebStory: true,
        status: 'published',
        artists: { some: { artistId: { in: artistIds } } }
      },
      select: {
        title: true,
        slug: true,
        coverImage: true,
        artists: { select: { artist: { select: { name: true } } }, take: 1 }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    })
  }

  // Fill remainder with latest stories
  if (relatedStories.length < 6) {
    const exclude = [slug, ...relatedStories.map(s => s.slug)]
    const latest = await prisma.song.findMany({
      where: {
        slug: { notIn: exclude },
        hasWebStory: true,
        status: 'published'
      },
      select: {
        title: true,
        slug: true,
        coverImage: true,
        artists: { select: { artist: { select: { name: true } } }, take: 1 }
      },
      take: 6 - relatedStories.length,
      orderBy: { createdAt: 'desc' }
    })
    relatedStories = [...relatedStories, ...latest]
  }

  const components = [
    { type: 'heading', text: 'More Lyric Stories' },
    ...relatedStories.map(s => ({
      type: 'small',
      title: `${s.title} - ${s.artists[0]?.artist.name || PUBLISHER}`,
      url: `${SITE_URL}/web-stories/${s.slug}`,
      image: toCoverStoryImg(s.coverImage)
    })),
    {
      type: 'cta-link',
      text: 'Browse All Lyric Stories',
      url: `${SITE_URL}/web-stories`
    }
  ]

  const bookend = {
    bookendVersion: 'v1.0',
    shareProviders: [
      { provider: 'twitter' },
      { provider: 'facebook' },
      { provider: 'whatsapp' },
      { provider: 'system' }
    ],
    components
  }

  return new NextResponse(JSON.stringify(bookend), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
