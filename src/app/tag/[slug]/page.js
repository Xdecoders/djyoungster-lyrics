import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import TagPageClient from './TagPageClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug }
  })

  if (!tag) {
    return { title: 'Tag Not Found' }
  }

  const siteSettings = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`
  const pageUrl = `${siteUrl}/tag/${slug}`

  return {
    title: `${tag.name} Songs - Song Lyrics | DJYoungster`,
    description: `Browse all songs tagged with ${tag.name}. Find lyrics for songs in the ${tag.name} category.`,
    openGraph: {
      title: `${tag.name} Songs - Song Lyrics | DJYoungster`,
      description: `Browse all songs tagged with ${tag.name}. Find lyrics for songs in the ${tag.name} category.`,
      url: pageUrl,
      siteName: 'DJYoungster',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tag.name} Songs`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tag.name} Songs - Song Lyrics | DJYoungster`,
      description: `Browse all songs tagged with ${tag.name}. Find lyrics for songs in the ${tag.name} category.`,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function TagPage({ params }) {
  const { slug } = await params

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      songs: {
        include: {
          song: {
            include: {
              artists: {
                include: {
                  artist: true
                }
              },
              album: {
                select: {
                  coverImage: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!tag) {
    notFound()
  }

  const songs = tag.songs
    .map(st => st.song)
    .filter(song => song.status === 'published')

  return <TagPageClient initialTag={tag} initialSongs={songs} />
}
