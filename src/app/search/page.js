import SearchPageClient from './SearchPageClient'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const query = params?.q || ''
  const type = params?.type || 'all'

  if (!query) {
    return {
      title: 'Search Songs, Artists, Albums & Movies | DJYoungster',
      description: 'Search for song lyrics, artists, albums, and movies on DJYoungster. Find Hindi, Punjabi, English, Tamil, and Telugu song lyrics with just a few keystrokes.',
      keywords: 'search lyrics, find songs, search artists, search albums, lyrics search, DJYoungster search',
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

  return {
    title: `${query} - Search ${typeLabel} | DJYoungster`,
    description: `Search results for "${query}" on DJYoungster. Find ${typeLabel.toLowerCase()} matching "${query}" with complete lyrics, artist info, album details, and more.`,
    keywords: `${query}, ${query} lyrics, ${query} song, ${query} artist, search ${query}, DJYoungster`,
    openGraph: {
      title: `${query} - Search ${typeLabel} | DJYoungster`,
      description: `Search results for "${query}" on DJYoungster. Find ${typeLabel.toLowerCase()} matching your search.`,
      url: `https://djyoungster.com/search?q=${encodeURIComponent(query)}`,
      siteName: 'DJYoungster',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${query} - Search | DJYoungster`,
      description: `Search results for "${query}" on DJYoungster.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function SearchPage() {
  return <SearchPageClient />
}
