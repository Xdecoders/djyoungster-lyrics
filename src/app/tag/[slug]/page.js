import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import TagPageClient from './TagPageClient'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

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

  // Capitalize tag name for display
  const capitalizedName = tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
  const title = tag.metaTitle || `${capitalizedName} Songs Lyrics with English Translation - DJYoungster`
  const description = tag.metaDescription || `Explore ${capitalizedName} song lyrics and meanings. Djyoungster provides ${capitalizedName} lyrics in English Translation, Hindi and Punjabi language variations.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
      title,
      description,
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
      _count: { select: { songs: true } },
      songs: {
        select: {
          song: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              views: true,
              status: true,
              createdAt: true,
              artists: {
                select: {
                  artist: {
                    select: { id: true, name: true, slug: true, image: true }
                  }
                }
              },
              album: {
                select: { id: true, title: true, slug: true, coverImage: true }
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

  // Generate structured data
  const collectionSchema = generateCollectionPageSchema(tag, 'tag', songs.slice(0, 20))
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tags', url: '/songs' },
    { name: tag.name, url: `/tag/${tag.slug}` }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TagPageClient initialTag={JSON.parse(JSON.stringify(tag))} initialSongs={JSON.parse(JSON.stringify(songs))} />
    </>
  )
}
