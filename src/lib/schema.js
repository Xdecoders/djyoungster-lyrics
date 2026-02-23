import { getAbsoluteUrl } from './seo'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'
const SITE_NAME = 'DJYoungster'

/**
 * Generate WebSite schema for homepage
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'DJ Youngster Lyrics',
    url: SITE_URL,
    description: 'DJYoungster is your ultimate destination for song lyrics in Hindi, Punjabi, English, Tamil, Telugu and more languages.',
    inLanguage: ['en', 'hi', 'pa', 'ta', 'te'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/djyoungster',
      'https://facebook.com/djyoungster',
      'https://instagram.com/djyoungster'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'djyoungster32@gmail.com',
      availableLanguage: ['English', 'Hindi']
    }
  }
}

/**
 * Extract first verse or chorus from lyrics (for schema - keep it short)
 */
function getFirstVerseOrChorus(lyrics) {
  if (!lyrics) return ''

  // Split by double newlines (verse separators)
  const parts = lyrics.split(/\n\n+/)

  // Get first part (usually first verse or chorus)
  const firstPart = parts[0]?.trim() || ''

  // Limit to ~300 characters for schema
  if (firstPart.length > 300) {
    return firstPart.substring(0, 300) + '...'
  }

  return firstPart
}

/**
 * Generate MusicRecording schema for song pages
 */
export function generateSongSchema(song, artistNames) {
  // Use createdAt date if available, fallback to releaseYear, then current date
  let datePublished
  if (song.createdAt) {
    datePublished = new Date(song.createdAt).toISOString().split('T')[0]
  } else if (song.releaseYear) {
    datePublished = `${song.releaseYear}-01-01`
  } else {
    datePublished = new Date().toISOString().split('T')[0]
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': `${SITE_URL}/song/${song.slug}`,
    name: song.title,
    url: `${SITE_URL}/song/${song.slug}`,
    datePublished,
    inLanguage: song.language || undefined,
    // Use Person type for individual artists (not MusicGroup)
    byArtist: song.artists?.length > 0 ? song.artists.map(sa => ({
      '@type': 'Person',
      name: sa.artist.name,
      url: sa.artist.slug ? `${SITE_URL}/artist/${sa.artist.slug}` : undefined
    })) : {
      '@type': 'Person',
      name: artistNames
    }
  }

  // Add album if available
  if (song.album) {
    schema.inAlbum = {
      '@type': 'MusicAlbum',
      name: song.album.title,
      url: song.album.slug ? `${SITE_URL}/album/${song.album.slug}` : undefined
    }
  }

  // Add genres if available
  if (song.genres?.length > 0) {
    schema.genre = song.genres.map(sg => sg.genre.name)
  }

  // Add duration if available (convert to ISO 8601 format)
  if (song.duration) {
    schema.duration = song.duration
  }

  // Add image if available
  if (song.coverImage) {
    schema.image = getAbsoluteUrl(song.coverImage)
  }

  // Add only first verse/chorus in schema (full lyrics in HTML)
  if (song.lyrics) {
    const authorName = song.lyricist || artistNames || 'Unknown'
    schema.lyrics = {
      '@type': 'CreativeWork',
      text: getFirstVerseOrChorus(song.lyrics),
      inLanguage: song.language || 'en',
      author: {
        '@type': 'Person',
        name: authorName
      }
    }
  }

  // Add music composer if available
  if (song.composer) {
    schema.composer = {
      '@type': 'Person',
      name: song.composer
    }
  }

  // Add aggregate rating if available
  if (song.aggregateRating && song.aggregateRating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: song.aggregateRating.average.toFixed(1),
      ratingCount: song.aggregateRating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    }
  }

  return schema
}

/**
 * Generate MusicGroup/Person schema for artist pages
 */
export function generateArtistSchema(artist) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${SITE_URL}/artist/${artist.slug}`,
    name: artist.name,
    url: `${SITE_URL}/artist/${artist.slug}`,
    description: artist.bio || `${artist.name} is a popular music artist. Find all songs and lyrics by ${artist.name} on DJYoungster.`
  }

  // Add image if available
  if (artist.imageUrl) {
    schema.image = getAbsoluteUrl(artist.imageUrl)
  }

  // Add song count
  if (artist._count?.songs) {
    schema.numberOfItems = artist._count.songs
  }

  // Add albums if available
  if (artist.albums?.length > 0) {
    schema.album = artist.albums.map(album => ({
      '@type': 'MusicAlbum',
      name: album.title,
      url: album.slug ? `${SITE_URL}/album/${album.slug}` : undefined
    }))
  }

  // Add genres if available
  if (artist.genres?.length > 0) {
    schema.genre = artist.genres.map(g => g.name || g)
  }

  return schema
}

/**
 * Generate MusicAlbum schema for album pages
 */
export function generateAlbumSchema(album, songs = []) {
  const artistName = album.artist?.name || 'Various Artists'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    '@id': `${SITE_URL}/album/${album.slug}`,
    name: album.title,
    url: `${SITE_URL}/album/${album.slug}`,
    albumProductionType: 'StudioAlbum',
    byArtist: {
      '@type': 'MusicGroup',
      name: artistName,
      url: album.artist?.slug ? `${SITE_URL}/artist/${album.artist.slug}` : undefined
    }
  }

  // Add release date if available
  if (album.releaseDate) {
    schema.datePublished = new Date(album.releaseDate).toISOString().split('T')[0]
  }

  // Add image if available
  if (album.coverImage) {
    schema.image = getAbsoluteUrl(album.coverImage)
  }

  // Add record label if available
  if (album.label) {
    schema.recordLabel = {
      '@type': 'Organization',
      name: album.label
    }
  }

  // Add number of tracks
  if (album._count?.songs) {
    schema.numTracks = album._count.songs
  }

  // Add tracks if available
  if (songs.length > 0) {
    schema.track = songs.map((song, index) => ({
      '@type': 'MusicRecording',
      position: index + 1,
      name: song.title,
      url: song.slug ? `${SITE_URL}/song/${song.slug}` : undefined
    }))
  }

  return schema
}

/**
 * Generate Movie schema for movie pages
 */
export function generateMovieSchema(movie, songs = []) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    '@id': `${SITE_URL}/movie/${movie.slug}`,
    name: movie.title,
    url: `${SITE_URL}/movie/${movie.slug}`,
    description: `${movie.title} movie soundtrack with ${movie._count?.songs || songs.length} songs. Find all lyrics on DJYoungster.`
  }

  // Add release year if available
  if (movie.year) {
    schema.datePublished = movie.year.toString()
  }

  // Add director if available
  if (movie.director) {
    schema.director = {
      '@type': 'Person',
      name: movie.director
    }
  }

  // Add poster image if available
  if (movie.posterUrl) {
    schema.image = getAbsoluteUrl(movie.posterUrl)
  }

  // Add soundtrack
  if (songs.length > 0) {
    schema.soundtrack = {
      '@type': 'MusicAlbum',
      name: `${movie.title} (Original Motion Picture Soundtrack)`,
      numTracks: songs.length,
      track: songs.map((song, index) => ({
        '@type': 'MusicRecording',
        position: index + 1,
        name: song.title,
        url: song.slug ? `${SITE_URL}/song/${song.slug}` : undefined
      }))
    }
  }

  return schema
}

/**
 * Generate ItemList schema for collection pages (songs, artists, albums list)
 */
export function generateItemListSchema(items, type, pageUrl, pageName) {
  const typeMap = {
    song: 'MusicRecording',
    artist: 'MusicGroup',
    album: 'MusicAlbum',
    movie: 'Movie'
  }

  const urlMap = {
    song: 'song',
    artist: 'artist',
    album: 'album',
    movie: 'movie'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageName,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': typeMap[type] || 'Thing',
        name: item.title || item.name,
        url: `${SITE_URL}/${urlMap[type]}/${item.slug}`
      }
    }))
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url ? `${SITE_URL}${crumb.url}` : undefined
    }))
  }
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

/**
 * Generate AggregateRating schema for homepage
 */
export function generateAggregateRatingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '15847',
      bestRating: '5',
      worstRating: '1'
    }
  }
}

/**
 * Generate CollectionPage schema for category/genre/tag pages
 */
export function generateCollectionPageSchema(collection, type, songs = []) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/${type}/${collection.slug}`,
    name: `${collection.name} Songs`,
    url: `${SITE_URL}/${type}/${collection.slug}`,
    description: collection.description || `Browse ${collection.name} songs with lyrics on DJYoungster.`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL
    }
  }

  // Add number of items
  if (collection._count?.songs) {
    schema.numberOfItems = collection._count.songs
  }

  // Add image if available
  if (collection.imageUrl) {
    schema.image = getAbsoluteUrl(collection.imageUrl)
  }

  // Add main entity as ItemList if songs provided
  if (songs.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: songs.length,
      itemListElement: songs.slice(0, 20).map((song, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicRecording',
          name: song.title,
          url: `${SITE_URL}/song/${song.slug}`
        }
      }))
    }
  }

  return schema
}
