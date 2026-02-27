import SearchPageClient from './SearchPageClient'
import { getSiteSettings, getAbsoluteUrl } from '@/lib/seo'
import { toTitleCase } from '@/lib/utils'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const query = params?.q || ''
  const type = params?.type || 'all'

  const siteSettings = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
  const ogImageUrl = getAbsoluteUrl(siteSettings.ogImage) || `${siteUrl}/og-image.jpg`

  if (!query) {
    return {
      title: 'Search Songs, Artists, Albums & Movies | DJYoungster',
      description: 'Search for song lyrics, artists, albums, and movies on DJYoungster. Find Hindi, Punjabi, English, Tamil, and Telugu song lyrics with just a few keystrokes.',
      keywords: 'search lyrics, find songs, search artists, search albums, lyrics search, DJYoungster search',
      openGraph: {
        title: 'Search Songs, Artists, Albums & Movies | DJYoungster',
        description: 'Search for song lyrics, artists, albums, and movies on DJYoungster.',
        url: `${siteUrl}/search`,
        siteName: 'DJYoungster',
        type: 'website',
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'DJYoungster Search' }],
        locale: 'en_IN',
        alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Search | DJYoungster',
        description: 'Search for song lyrics, artists, albums, and movies on DJYoungster.',
        images: [ogImageUrl],
        creator: '@djyoungstercom',
        site: '@djyoungstercom',
      },
      alternates: {
        canonical: `${siteUrl}/search`,
      },
    }
  }

  const typeLabels = {
    all: 'Songs, Artists, Albums & Movies',
    songs: 'Songs',
    artists: 'Artists',
    albums: 'Albums',
    movies: 'Movies',
  }

  const typeLabel = typeLabels[type] || typeLabels.all
  const displayQuery = toTitleCase(query)

  return {
    title: `${displayQuery} - Search ${typeLabel} | DJYoungster`,
    description: `Search results for "${displayQuery}" on DJYoungster. Find ${typeLabel.toLowerCase()} matching "${displayQuery}" with complete lyrics, artist info, album details, and more.`,
    keywords: `${displayQuery}, ${displayQuery} lyrics, ${displayQuery} song, ${displayQuery} artist, search ${displayQuery}, DJYoungster`,
    openGraph: {
      title: `${displayQuery} - Search ${typeLabel} | DJYoungster`,
      description: `Search results for "${displayQuery}" on DJYoungster. Find ${typeLabel.toLowerCase()} matching your search.`,
      url: `${siteUrl}/search?q=${encodeURIComponent(query)}`,
      siteName: 'DJYoungster',
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Search: ${displayQuery}` }],
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayQuery} - Search | DJYoungster`,
      description: `Search results for "${displayQuery}" on DJYoungster.`,
      images: [ogImageUrl],
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function SearchPage() {
  return <SearchPageClient />
}
