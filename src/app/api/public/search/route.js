import { NextResponse } from 'next/server'
import { getSearchIndexes } from '@/lib/searchIndex'
import { prisma } from '@/lib/prisma'

// Words that users append to searches but don't appear in titles/names.
// Stripping these lets "sheera jasvir new song" match artist "Sheera Jasvir".
const NOISE_WORDS = new Set([
  'song', 'songs', 'new', 'latest', 'old', 'best', 'top', 'hit', 'hits',
  'mp3', 'mp4', 'video', 'audio', 'download', 'free', 'full', 'official',
  'lyrics', 'lyric', 'ft', 'feat', 'featuring',
  'punjabi', 'hindi', 'haryanvi', 'bhojpuri', 'english',
])

function cleanQuery(q) {
  const tokens = q.toLowerCase().split(/\s+/).filter(t => !NOISE_WORDS.has(t))
  return tokens.join(' ').trim()
}

// Merge two Fuse result arrays, deduplicating by item.id, original results first.
function mergeResults(primary, secondary) {
  const seen = new Set(primary.map(r => r.item.id))
  const extra = secondary.filter(r => !seen.has(r.item.id))
  return [...primary, ...extra]
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({
        songs: [],
        artists: [],
        albums: [],
        movies: [],
        counts: { songs: 0, artists: 0, albums: 0, movies: 0, total: 0 }
      })
    }

    const searchTerm = query.trim()
    const cleanedTerm = cleanQuery(searchTerm)
    const useClean = cleanedTerm && cleanedTerm !== searchTerm.toLowerCase()

    const { songsFuse, artistsFuse, albumsFuse, moviesFuse } = await getSearchIndexes()

    let songs = []
    let artists = []
    let albums = []
    let movies = []
    let totalSongs = 0
    let totalArtists = 0
    let totalAlbums = 0
    let totalMovies = 0

    // Fuzzy search songs
    if (type === 'all' || type === 'songs') {
      let songResults = songsFuse.search(searchTerm)
      if (useClean) songResults = mergeResults(songResults, songsFuse.search(cleanedTerm))
      totalSongs = songResults.length
      const sliced = type === 'songs'
        ? songResults.slice(skip, skip + limit)
        : songResults.slice(0, 10)
      songs = sliced.map(r => r.item)
    }

    // Fuzzy search artists
    if (type === 'all' || type === 'artists') {
      let artistResults = artistsFuse.search(searchTerm)
      if (useClean) artistResults = mergeResults(artistResults, artistsFuse.search(cleanedTerm))
      totalArtists = artistResults.length
      const sliced = type === 'artists'
        ? artistResults.slice(skip, skip + limit)
        : artistResults.slice(0, 6)
      artists = sliced.map(r => r.item)
    }

    // Fuzzy search albums
    if (type === 'all' || type === 'albums') {
      let albumResults = albumsFuse.search(searchTerm)
      if (useClean) albumResults = mergeResults(albumResults, albumsFuse.search(cleanedTerm))
      totalAlbums = albumResults.length
      const sliced = type === 'albums'
        ? albumResults.slice(skip, skip + limit)
        : albumResults.slice(0, 6)
      albums = sliced.map(r => r.item)
    }

    // Fuzzy search movies
    if (type === 'all' || type === 'movies') {
      let movieResults = moviesFuse.search(searchTerm)
      if (useClean) movieResults = mergeResults(movieResults, moviesFuse.search(cleanedTerm))
      totalMovies = movieResults.length
      const sliced = type === 'movies'
        ? movieResults.slice(skip, skip + limit)
        : movieResults.slice(0, 6)
      movies = sliced.map(r => r.item)
    }

    const totalResults = totalSongs + totalArtists + totalAlbums + totalMovies

    prisma.searchEvent.create({
      data: { query: searchTerm, resultCount: totalResults }
    }).catch(() => {})

    return NextResponse.json({
      query: searchTerm,
      songs,
      artists,
      albums,
      movies,
      counts: {
        songs: totalSongs,
        artists: totalArtists,
        albums: totalAlbums,
        movies: totalMovies,
        total: totalResults
      },
      pagination: type !== 'all' ? {
        page,
        limit,
        total: type === 'songs' ? totalSongs : type === 'artists' ? totalArtists : type === 'albums' ? totalAlbums : totalMovies,
        totalPages: Math.ceil((type === 'songs' ? totalSongs : type === 'artists' ? totalArtists : type === 'albums' ? totalAlbums : totalMovies) / limit)
      } : null
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    })

  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
