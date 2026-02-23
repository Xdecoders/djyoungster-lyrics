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
    description: 'Multilingual song lyrics platform - Punjabi, Hindi, English lyrics with translations',
    inLanguage: ['en', 'pa', 'hi'],
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
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512
    },
    sameAs: [
      'https://x.com/djyoungstercom',
      'https://www.facebook.com/djyoungster',
      'https://www.instagram.com/djyoungster_com',
      'https://www.linkedin.com/in/djyoungsterofficial',
      'https://youtube.com/@Djyoungstercom'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'contact@djyoungster.com'
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
 * Generate MusicComposition schema for song pages
 */
export function generateSongSchema(song, artistNames) {
  // Use datePublished field if available, fallback to createdAt, then current date
  let datePublished
  if (song.datePublished) {
    datePublished = new Date(song.datePublished).toISOString().split('T')[0]
  } else if (song.createdAt) {
    datePublished = new Date(song.createdAt).toISOString().split('T')[0]
  } else {
    datePublished = new Date().toISOString().split('T')[0]
  }

  // Use dateModified field, fallback to updatedAt
  const dateModified = song.dateModified
    ? new Date(song.dateModified).toISOString().split('T')[0]
    : song.updatedAt
      ? new Date(song.updatedAt).toISOString().split('T')[0]
      : undefined

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    '@id': `${SITE_URL}/song/${song.slug}`,
    name: song.title,
    url: `${SITE_URL}/song/${song.slug}`,
    datePublished,
    ...(dateModified && { dateModified }),
    inLanguage: song.language || undefined,
  }

  // Add lyricist (valid for MusicComposition)
  if (song.lyricist) {
    schema.lyricist = {
      '@type': 'Person',
      name: song.lyricist
    }
  }

  // Add composer (valid for MusicComposition)
  if (song.composer) {
    schema.composer = {
      '@type': 'Person',
      name: song.composer
    }
  }

  // Add iswcCode if available
  // Link artists via recordedAs → MusicRecording → byArtist
  const artistEntries = song.artists?.length > 0
    ? song.artists.map(sa => ({
        '@type': 'Person',
        name: sa.artist.name,
        url: sa.artist.slug ? `${SITE_URL}/artist/${sa.artist.slug}` : undefined
      }))
    : artistNames
      ? [{ '@type': 'Person', name: artistNames }]
      : undefined

  // Build recordedAs (MusicRecording) — holds byArtist, inAlbum, aggregateRating
  const recording = {
    '@type': 'MusicRecording',
    name: song.title,
    url: `${SITE_URL}/song/${song.slug}`,
  }

  if (artistEntries) {
    recording.byArtist = artistEntries
  }

  // inAlbum is valid on MusicRecording, not MusicComposition
  if (song.album) {
    recording.inAlbum = {
      '@type': 'MusicAlbum',
      name: song.album.title,
      url: song.album.slug ? `${SITE_URL}/album/${song.album.slug}` : undefined
    }
  }

  // aggregateRating is valid on MusicRecording for Google rich results
  if (song.aggregateRating && song.aggregateRating.count > 0) {
    recording.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: song.aggregateRating.average.toFixed(1),
      ratingCount: song.aggregateRating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    }
  }

  schema.recordedAs = recording

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

  // Add multilingual lyrics versions
  const lyricsVersions = []
  const authorName = song.lyricist || artistNames || 'Unknown'

  if (song.lyrics) {
    lyricsVersions.push({
      '@type': 'CreativeWork',
      name: `${song.title} - Original Lyrics`,
      inLanguage: song.language || 'en',
      text: getFirstVerseOrChorus(song.lyrics),
      author: { '@type': 'Person', name: authorName }
    })
  }
  if (song.lyricsRomanized) {
    lyricsVersions.push({
      '@type': 'CreativeWork',
      name: `${song.title} - Romanized Lyrics`,
      inLanguage: 'en',
      text: getFirstVerseOrChorus(song.lyricsRomanized)
    })
  }
  if (song.lyricsTranslated) {
    lyricsVersions.push({
      '@type': 'CreativeWork',
      name: `${song.title} - English Translation`,
      inLanguage: 'en',
      text: getFirstVerseOrChorus(song.lyricsTranslated)
    })
  }
  if (song.lyricsHindi) {
    lyricsVersions.push({
      '@type': 'CreativeWork',
      name: `${song.title} - Hindi Lyrics`,
      inLanguage: 'hi',
      text: getFirstVerseOrChorus(song.lyricsHindi)
    })
  }
  if (song.lyricsPunjabi) {
    lyricsVersions.push({
      '@type': 'CreativeWork',
      name: `${song.title} - Punjabi Lyrics`,
      inLanguage: 'pa',
      text: getFirstVerseOrChorus(song.lyricsPunjabi)
    })
  }

  if (lyricsVersions.length === 1) {
    schema.lyrics = lyricsVersions[0]
  } else if (lyricsVersions.length > 1) {
    schema.lyrics = lyricsVersions
  }

  return schema
}

/**
 * Generate MusicGroup/Person schema for artist pages
 */
export function generateArtistSchema(artist, featuredSongs = []) {
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

  // Add albums if available
  if (artist.albums?.length > 0) {
    schema.album = artist.albums.map(album => {
      const a = {
        '@type': 'MusicAlbum',
        name: album.title,
        url: album.slug ? `${SITE_URL}/album/${album.slug}` : undefined,
      }
      if (album.releaseDate) {
        a.datePublished = new Date(album.releaseDate).toISOString().split('T')[0]
      }
      if (album._count?.songs) {
        a.numTracks = album._count.songs
      }
      if (album.coverImage) {
        a.image = getAbsoluteUrl(album.coverImage)
      }
      return a
    })
  }

  // Add featured tracks
  if (featuredSongs.length > 0) {
    schema.track = featuredSongs.map(song => {
      const track = {
        '@type': 'MusicRecording',
        name: song.title,
        url: `${SITE_URL}/song/${song.slug}`,
      }
      if (song.duration) track.duration = song.duration
      if (song.datePublished) {
        track.datePublished = new Date(song.datePublished).toISOString().split('T')[0]
      }
      return track
    })
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
  const releaseDateStr = album.releaseDate
    ? new Date(album.releaseDate).toISOString().split('T')[0]
    : undefined

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    '@id': `${SITE_URL}/album/${album.slug}`,
    name: album.title,
    url: `${SITE_URL}/album/${album.slug}`,
    albumProductionType: 'https://schema.org/StudioAlbum',
    albumReleaseType: 'https://schema.org/AlbumRelease',
    numTracks: songs.length || album._count?.songs || undefined,
    byArtist: {
      '@type': 'MusicGroup',
      name: artistName,
      url: album.artist?.slug ? `${SITE_URL}/artist/${album.artist.slug}` : undefined,
      ...(album.artist?.imageUrl && { image: getAbsoluteUrl(album.artist.imageUrl) })
    }
  }

  if (releaseDateStr) {
    schema.datePublished = releaseDateStr
  }

  if (album.coverImage) {
    schema.image = getAbsoluteUrl(album.coverImage)
  }

  // Add record label as publisher
  if (album.label) {
    schema.publisher = {
      '@type': 'Organization',
      name: album.label
    }
  }

  // Add tracks as ItemList
  if (songs.length > 0) {
    schema.track = {
      '@type': 'ItemList',
      numberOfItems: songs.length,
      itemListElement: songs.map((song, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicRecording',
          name: song.title,
          url: song.slug ? `${SITE_URL}/song/${song.slug}` : undefined,
          ...(song.duration && { duration: song.duration }),
          ...(releaseDateStr && { datePublished: releaseDateStr })
        }
      }))
    }
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

  // Add songs as hasPart (soundtrack is not valid on Movie)
  if (songs.length > 0) {
    schema.hasPart = songs.map((song, index) => ({
      '@type': 'MusicRecording',
      position: index + 1,
      name: song.title,
      url: song.slug ? `${SITE_URL}/song/${song.slug}` : undefined
    }))
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
