import Fuse from 'fuse.js'
import { prisma } from './prisma'

let cache = {
  songsFuse: null,
  artistsFuse: null,
  albumsFuse: null,
  moviesFuse: null,
  songsData: [],
  artistsData: [],
  albumsData: [],
  moviesData: [],
  lastUpdated: 0
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const songFuseOptions = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'artistNames', weight: 0.8 },
    { name: 'categoryNames', weight: 0.9 },
    { name: 'genreNames', weight: 0.7 },
    { name: 'singers', weight: 0.7 },
    { name: 'starring', weight: 0.6 },
    { name: 'lyricist', weight: 0.5 },
    { name: 'composer', weight: 0.5 },
    { name: 'albumTitle', weight: 0.6 },
    { name: 'movieTitle', weight: 0.6 },
    { name: 'label', weight: 0.3 },
    { name: 'lyricsSnippet', weight: 0.3 },
  ],
  threshold: 0.35,
  distance: 300,
  minMatchCharLength: 2,
  includeScore: true,
}

const artistFuseOptions = {
  keys: [
    { name: 'name', weight: 1.0 },
  ],
  threshold: 0.35,
  distance: 300,
  minMatchCharLength: 2,
  includeScore: true,
}

const albumFuseOptions = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'artistName', weight: 0.8 },
  ],
  threshold: 0.35,
  distance: 300,
  minMatchCharLength: 2,
  includeScore: true,
}

const movieFuseOptions = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'director', weight: 0.5 },
    { name: 'cast', weight: 0.4 },
    { name: 'musicDirector', weight: 0.4 },
    { name: 'writer', weight: 0.3 },
    { name: 'producer', weight: 0.3 },
  ],
  threshold: 0.35,
  distance: 300,
  minMatchCharLength: 2,
  includeScore: true,
}

async function loadData() {
  const [songs, artists, albums, movies] = await Promise.all([
    prisma.song.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        views: true,
        createdAt: true,
        lyricist: true,
        composer: true,
        singers: true,
        starring: true,
        label: true,
        lyrics: true,
        artists: {
          select: {
            artist: { select: { id: true, name: true, slug: true } }
          }
        },
        album: { select: { id: true, title: true, slug: true, coverImage: true } },
        movie: { select: { id: true, title: true, slug: true } },
        genres: {
          select: {
            genre: { select: { id: true, name: true, slug: true } }
          }
        },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } }
          }
        }
      },
      orderBy: { views: 'desc' }
    }),
    prisma.artist.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        bio: true,
        _count: { select: { songs: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.album.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        releaseDate: true,
        artist: { select: { id: true, name: true, slug: true } },
        _count: { select: { songs: true } }
      },
      orderBy: { releaseDate: 'desc' }
    }),
    prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        year: true,
        director: true,
        cast: true,
        musicDirector: true,
        writer: true,
        producer: true,
        _count: { select: { songs: true } },
        songs: {
          select: { coverImage: true },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { year: 'desc' }
    })
  ])

  // Flatten fields for Fuse.js searching
  const songsFlat = songs.map(s => {
    // Create a short lyrics snippet for search (strip HTML, first 200 chars)
    const lyricsSnippet = s.lyrics
      ? s.lyrics.replace(/<[^>]*>/g, '').substring(0, 200)
      : ''
    return {
      ...s,
      lyrics: undefined, // Don't store full lyrics in memory
      artistNames: s.artists?.map(sa => sa.artist.name).join(', ') || '',
      categoryNames: s.categories?.map(sc => sc.category.name).join(', ') || '',
      genreNames: s.genres?.map(sg => sg.genre.name).join(', ') || '',
      albumTitle: s.album?.title || '',
      movieTitle: s.movie?.title || '',
      lyricsSnippet,
    }
  })

  const albumsFlat = albums.map(a => ({
    ...a,
    artistName: a.artist?.name || '',
  }))

  const moviesFlat = movies.map(m => ({
    ...m,
    thumbnail: m.posterUrl || m.songs?.[0]?.coverImage || null,
  }))

  return { songsFlat, artists, albumsFlat, moviesFlat }
}

export async function getSearchIndexes() {
  const now = Date.now()
  if (cache.songsFuse && now - cache.lastUpdated < CACHE_TTL) {
    return cache
  }

  const { songsFlat, artists, albumsFlat, moviesFlat } = await loadData()

  cache = {
    songsFuse: new Fuse(songsFlat, songFuseOptions),
    artistsFuse: new Fuse(artists, artistFuseOptions),
    albumsFuse: new Fuse(albumsFlat, albumFuseOptions),
    moviesFuse: new Fuse(moviesFlat, movieFuseOptions),
    songsData: songsFlat,
    artistsData: artists,
    albumsData: albumsFlat,
    moviesData: moviesFlat,
    lastUpdated: now
  }

  return cache
}
