import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Backfill artists: update those with bare name as metaTitle or null metaDescription
    const artists = await prisma.artist.findMany({
      select: { id: true, name: true, metaTitle: true, metaDescription: true }
    })

    let artistsUpdated = 0
    for (const artist of artists) {
      const updates = {}
      if (!artist.metaTitle || artist.metaTitle === artist.name) {
        updates.metaTitle = `${artist.name} Songs Lyrics with English Translation - DJYoungster`
      }
      if (!artist.metaDescription) {
        updates.metaDescription = `Explore ${artist.name} song lyrics with meanings and translations. Read ${artist.name} lyrics in English, Hindi, and Punjabi on DJYoungster.`
      }
      if (Object.keys(updates).length > 0) {
        await prisma.artist.update({ where: { id: artist.id }, data: updates })
        artistsUpdated++
      }
    }

    // Backfill albums: update those with bare title as metaTitle or null metaDescription
    const albums = await prisma.album.findMany({
      select: { id: true, title: true, metaTitle: true, metaDescription: true }
    })

    let albumsUpdated = 0
    for (const album of albums) {
      const updates = {}
      if (!album.metaTitle || album.metaTitle === album.title) {
        updates.metaTitle = `${album.title} Songs Lyrics with English Translation - DJYoungster`
      }
      if (!album.metaDescription) {
        updates.metaDescription = `Explore ${album.title} album song lyrics with meanings and translations on DJYoungster.`
      }
      if (Object.keys(updates).length > 0) {
        await prisma.album.update({ where: { id: album.id }, data: updates })
        albumsUpdated++
      }
    }

    // Backfill movies: update those with null metaTitle or null metaDescription
    const movies = await prisma.movie.findMany({
      select: { id: true, title: true, year: true, metaTitle: true, metaDescription: true }
    })

    let moviesUpdated = 0
    for (const movie of movies) {
      const updates = {}
      if (!movie.metaTitle) {
        updates.metaTitle = `${movie.title}${movie.year ? ` (${movie.year})` : ''} Songs Lyrics - DJYoungster`
      }
      if (!movie.metaDescription) {
        updates.metaDescription = `Explore ${movie.title} movie song lyrics with meanings and translations on DJYoungster.`
      }
      if (Object.keys(updates).length > 0) {
        await prisma.movie.update({ where: { id: movie.id }, data: updates })
        moviesUpdated++
      }
    }

    return NextResponse.json({
      message: 'Meta backfill completed',
      artistsUpdated,
      albumsUpdated,
      moviesUpdated
    })
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}
