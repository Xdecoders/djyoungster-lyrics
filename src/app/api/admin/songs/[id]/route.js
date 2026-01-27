import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single song
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        album: true,
        movie: true,
        genres: {
          include: {
            genre: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    if (!song) {
      return NextResponse.json(
        { message: 'Song not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json(
      { message: 'Error fetching song' },
      { status: 500 }
    )
  }
}

// PUT - Update song
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    // First, delete existing relations
    await prisma.$transaction([
      prisma.songArtist.deleteMany({ where: { songId: id } }),
      prisma.songGenre.deleteMany({ where: { songId: id } }),
      prisma.songCategory.deleteMany({ where: { songId: id } }),
    ])

    // Update song with new data
    const song = await prisma.song.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        lyrics: data.lyrics,
        lyricsRomanized: data.lyricsRomanized || null,
        lyricsTranslated: data.lyricsTranslated || null,
        lyricsHindi: data.lyricsHindi || null,
        lyricsPunjabi: data.lyricsPunjabi || null,
        meaning: data.meaning || null,
        duration: data.duration || null,
        language: data.language || null,
        releaseYear: data.releaseYear ? parseInt(data.releaseYear) : null,
        albumId: data.albumId || null,
        movieId: data.movieId || null,
        coverImage: data.coverImage || null,
        youtubeUrl: data.youtubeUrl || null,
        spotifyUrl: data.spotifyUrl || null,
                lyricist: data.lyricist || null,
        singers: data.singers || null,
        composer: data.composer || null,
        producer: data.producer || null,
        director: data.director || null,
        starring: data.starring || null,
        label: data.label || null,
        verified: data.verified || false,
        status: data.status || 'published',
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || null,
        artists: {
          create: (data.artistIds || []).map(artistId => ({
            artist: {
              connect: { id: artistId }
            }
          }))
        },
        genres: {
          create: (data.genreIds || []).map(genreId => ({
            genre: {
              connect: { id: genreId }
            }
          }))
        },
        categories: {
          create: (data.categoryIds || []).map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        }
      },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        genres: {
          include: {
            genre: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error updating song:', error)
    return NextResponse.json(
      { message: 'Error updating song: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete song
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.song.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json(
      { message: 'Error deleting song' },
      { status: 500 }
    )
  }
}
