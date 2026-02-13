import { NextResponse } from 'next/server'
import { getSearchIndexes } from '@/lib/searchIndex'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        songs: [],
        artists: [],
        albums: [],
        movies: []
      })
    }

    const searchTerm = query.trim()
    const { songsFuse, artistsFuse, albumsFuse, moviesFuse } = await getSearchIndexes()

    let songs = []
    let artists = []
    let albums = []
    let movies = []

    // Fuzzy search songs
    if (type === 'all' || type === 'songs') {
      const results = songsFuse.search(searchTerm, { limit: type === 'songs' ? 8 : 4 })
      songs = results.map(r => ({
        id: r.item.id,
        title: r.item.title,
        slug: r.item.slug,
        image: r.item.coverImage,
        artist: r.item.artists[0]?.artist?.name || 'Unknown',
        type: 'song'
      }))
    }

    // Fuzzy search artists
    if (type === 'all' || type === 'artists') {
      const results = artistsFuse.search(searchTerm, { limit: type === 'artists' ? 8 : 3 })
      artists = results.map(r => ({
        id: r.item.id,
        name: r.item.name,
        slug: r.item.slug,
        image: r.item.imageUrl,
        songCount: r.item._count?.songs || 0,
        type: 'artist'
      }))
    }

    // Fuzzy search albums
    if (type === 'all' || type === 'albums') {
      const results = albumsFuse.search(searchTerm, { limit: type === 'albums' ? 8 : 3 })
      albums = results.map(r => ({
        id: r.item.id,
        title: r.item.title,
        slug: r.item.slug,
        image: r.item.coverImage,
        artist: r.item.artist?.name || 'Unknown',
        type: 'album'
      }))
    }

    // Fuzzy search movies
    if (type === 'all' || type === 'movies') {
      const results = moviesFuse.search(searchTerm, { limit: type === 'movies' ? 8 : 3 })
      movies = results.map(r => ({
        id: r.item.id,
        title: r.item.title,
        slug: r.item.slug,
        image: r.item.posterUrl,
        year: r.item.year,
        type: 'movie'
      }))
    }

    return NextResponse.json({ songs, artists, albums, movies }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    })

  } catch (error) {
    console.error('Error in autocomplete:', error)
    return NextResponse.json({ error: 'Autocomplete failed' }, { status: 500 })
  }
}
