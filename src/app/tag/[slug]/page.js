import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { toTitleCase } from '@/lib/utils'
import TagPageClient from './TagPageClient'

// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

// Pre-render all tags at build time
export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({
    select: { slug: true }
  })
  return tags.map(tag => ({ slug: tag.slug }))
}

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

  const capitalizedName = toTitleCase(tag.name)
  const title = tag.metaTitle || `${capitalizedName} Songs Lyrics with English Translation - DJYoungster`
  const description = tag.metaDescription || `Explore ${capitalizedName} song lyrics and meanings. DJYoungster provides ${capitalizedName} lyrics in English Translation, Hindi and Punjabi language variations.`

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
          alt: `${capitalizedName} Songs`,
        },
      ],
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
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
                    select: { id: true, name: true, slug: true, imageUrl: true }
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
    { name: 'Tags', url: '/songs?tab=tags' },
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
      <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900" />}>
        <TagPageClient initialTag={JSON.parse(JSON.stringify(tag))} initialSongs={JSON.parse(JSON.stringify(songs))} />
      </Suspense>
    </>
  )
}
