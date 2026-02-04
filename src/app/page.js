import { prisma } from '@/lib/prisma'
import HomePageClient from './HomePageClient'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateWebSiteSchema, generateOrganizationSchema, generateFAQSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = false

export async function generateMetadata() {
  const seo = await getSeoSettings('homepage')
  const siteSettings = await getSiteSettings()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  // Use page-specific OG image, fall back to global, then default
  const ogImageUrl = getAbsoluteUrl(seo.ogImage) || getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: siteUrl,
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'DJYoungster - Song Lyrics',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Homepage FAQs for structured data
const homepageFAQs = [
  {
    question: 'What is DJYoungster?',
    answer: 'DJYoungster is a comprehensive lyrics platform where you can find song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more. We provide accurate lyrics, artist information, album details, and music streaming links all in one place.'
  },
  {
    question: 'How can I search for lyrics on DJYoungster?',
    answer: 'Simply use the search bar at the top of the page to search by song title, artist name, album, or even a few words from the lyrics. DJYoungster\'s smart search will help you find the exact song you\'re looking for.'
  },
  {
    question: 'Is DJYoungster free to use?',
    answer: 'Yes! DJYoungster is completely free to use. You can browse, search, and read unlimited lyrics without any subscription or hidden charges.'
  },
  {
    question: 'How often is DJYoungster updated?',
    answer: 'We update DJYoungster regularly with new song releases, trending tracks, and classic favorites. Our team works to add the latest lyrics as soon as songs are released.'
  },
  {
    question: 'Can I request lyrics on DJYoungster?',
    answer: 'Absolutely! If you can\'t find a song on DJYoungster, you can contact us through our contact page and we\'ll do our best to add it to our collection.'
  }
]

// Fetch homepage data on server
async function getHomepageData() {
  try {
    // Select only fields needed for homepage display (exclude lyrics)
    const songSelectFields = {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      views: true,
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

    // Fetch latest songs
    const latestSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: songSelectFields
    })

    // Fetch trending songs (most viewed)
    const trendingSongs = await prisma.song.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 10,
      select: songSelectFields
    })

    // Fetch categories with their songs
    const categories = await prisma.category.findMany({
      include: {
        songs: {
          select: {
            song: {
              select: songSelectFields
            }
          },
          take: 10
        },
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch popular artists
    const artists = await prisma.artist.findMany({
      take: 10,
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        songs: {
          _count: 'desc'
        }
      }
    })

    // Fetch recent albums
    const albums = await prisma.album.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: true,
        _count: {
          select: { songs: true }
        }
      }
    })

    // Fetch popular tags
    const tags = await prisma.tag.findMany({
      take: 14,
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: {
        songs: {
          _count: 'desc'
        }
      }
    })

    // Fetch site settings for hero
    const siteSettings = await getSiteSettings()

    return {
      latestSongs,
      trendingSongs,
      categories,
      artists,
      albums,
      tags,
      siteSettings: {
        heroHeading: siteSettings.heroHeading || 'Discover Your Favorite Song Lyrics',
        heroDescription: siteSettings.heroDescription || 'Explore thousands of song lyrics from your favorite artists. Search, discover, and sing along!'
      }
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      latestSongs: [],
      trendingSongs: [],
      categories: [],
      artists: [],
      albums: [],
      tags: [],
      siteSettings: {
        heroHeading: 'Discover Your Favorite Song Lyrics',
        heroDescription: 'Explore thousands of song lyrics from your favorite artists. Search, discover, and sing along!'
      }
    }
  }
}

export default async function Home() {
  const websiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()
  const faqSchema = generateFAQSchema(homepageFAQs)

  // Fetch data on server
  const data = await getHomepageData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
