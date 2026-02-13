import { prisma } from '@/lib/prisma'
import HomeContent from './HomeContent'
import AboutSection from './AboutSection'
import { getSeoSettings, getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { generateWebSiteSchema, generateOrganizationSchema, generateFAQSchema } from '@/lib/schema'

// Dynamic SSR - always fetch fresh data on each request
// ISR - Cache pages and revalidate every 60 seconds
export const revalidate = 60

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
    answer: 'DJYoungster is a comprehensive lyrics platform where you can find song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more. We provide accurate lyrics, artist information, album details, music streaming links, and an innovative Instagram Story creator all in one place.'
  },
  {
    question: 'How can I search for lyrics on DJYoungster?',
    answer: 'Simply use the search bar at the top of the page to search by song title, artist name, album, or even a few words from the lyrics. DJYoungster\'s smart search will help you find the exact song you\'re looking for.'
  },
  {
    question: 'Can I create Instagram Stories with lyrics on DJYoungster?',
    answer: 'Yes! DJYoungster features a unique Instagram Story creator that allows you to select your favorite lyrics (2-4 lines) from any song and generate beautiful, shareable story images. Choose from multiple stunning templates including Sad, Happy, Romantic, and Neon styles. Simply click the "Create Story" button on any song page, select your lines, preview with different templates, and download or share directly to Instagram.'
  },
  {
    question: 'Is DJYoungster free to use?',
    answer: 'Yes! DJYoungster is completely free to use. You can browse, search, and read unlimited lyrics, create Instagram story images, and access all features without any subscription or hidden charges.'
  },
  {
    question: 'How often is DJYoungster updated?',
    answer: 'We update DJYoungster regularly with new song releases, trending tracks, and classic favorites. Our team works to add the latest lyrics as soon as songs are released, ensuring you always have access to fresh content.'
  },
  {
    question: 'Can I request lyrics on DJYoungster?',
    answer: 'Absolutely! If you can\'t find a song on DJYoungster, you can contact us through our contact page and we\'ll do our best to add it to our collection within 24-48 hours.'
  },
  {
    question: 'Does DJYoungster provide lyrics in multiple languages?',
    answer: 'Yes! DJYoungster offers lyrics in multiple formats: original lyrics, romanized/transliterated versions for easier reading, and English translations. We support Hindi, Punjabi, Tamil, Telugu, Bhojpuri, Haryanvi, English, and many more regional Indian languages to help you understand and enjoy music from diverse cultures.'
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
            select: { id: true, name: true, slug: true, imageUrl: true }
          }
        }
      },
      album: {
        select: { id: true, title: true, slug: true, coverImage: true }
      }
    }

    // Run all queries in parallel
    const [latestSongs, trendingSongs, categories, artists, tags, siteSettings] = await Promise.all([
      prisma.song.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: songSelectFields
      }),
      prisma.song.findMany({
        where: { status: 'published' },
        orderBy: { views: 'desc' },
        take: 10,
        select: songSelectFields
      }),
      prisma.category.findMany({
        include: {
          songs: {
            select: { song: { select: songSelectFields } },
            take: 10
          },
          _count: { select: { songs: true } }
        }
      }),
      prisma.artist.findMany({
        take: 10,
        include: { _count: { select: { songs: true } } },
        orderBy: { songs: { _count: 'desc' } }
      }),
      prisma.tag.findMany({
        take: 14,
        include: { _count: { select: { songs: true } } },
        orderBy: { songs: { _count: 'desc' } }
      }),
      getSiteSettings()
    ])

    return {
      latestSongs,
      trendingSongs,
      categories,
      artists,
      tags,
      siteSettings: {
        heroHeading: siteSettings.heroHeading || 'Discover Your Favorite Song Lyrics',
        heroDescription: siteSettings.heroDescription || 'Your trusted source for verified song lyrics in Hindi, Punjabi, English, Tamil & Telugu. Get accurate lyrics with translations and create beautiful Instagram stories for free!'
      }
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      latestSongs: [],
      trendingSongs: [],
      categories: [],
      artists: [],
      tags: [],
      siteSettings: {
        heroHeading: 'Discover Your Favorite Song Lyrics',
        heroDescription: 'Your trusted source for verified song lyrics in Hindi, Punjabi, English, Tamil & Telugu. Get accurate lyrics with translations and create beautiful Instagram stories for free!'
      }
    }
  }
}

export default async function Home() {
  const websiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()
  const faqSchema = generateFAQSchema(homepageFAQs)

  // Fetch data on server - Pure SSR
  const data = await getHomepageData()

  return (
    <>
      {/* Schema Markup - Server Rendered */}
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
      {/* Main Content - Server Rendered */}
      <HomeContent data={data} siteSettings={data.siteSettings} />

      {/* About & FAQs - Server Rendered */}
      <AboutSection faqs={homepageFAQs} />
    </>
  )
}
