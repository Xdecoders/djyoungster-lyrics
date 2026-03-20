import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { generateSongOgImage } from '@/lib/generateSongOgImage'

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
        },
        tags: {
          include: {
            tag: true
          }
        },
        relatedBlogPost: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
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
      prisma.songTag.deleteMany({ where: { songId: id } }),
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
        datePublished: data.datePublished ? new Date(data.datePublished) : null,
        dateModified: new Date(),
        albumId: data.albumId || null,
        movieId: data.movieId || null,
        relatedBlogPostId: data.relatedBlogPostId || null,
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
        },
        tags: (data.tagIds?.length > 0) ? {
          create: data.tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
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
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Revalidate cache for the updated song and related pages
    try {
      revalidatePath(`/song/${song.slug}`)
      // Revalidate all artist pages for this song
      for (const sa of song.artists) {
        revalidatePath(`/artist/${sa.artist.slug}`)
      }
      revalidatePath('/songs')
      revalidatePath('/')
      revalidateTag('homepage')
      console.log('[Song Update] Cache revalidated for song and artists')
    } catch (revalidateError) {
      console.log('[Song Update] Revalidation note:', revalidateError.message)
    }

    // Regenerate OG image in background (non-blocking)
    generateSongOgImage(song.id).catch(e => console.error('[OG] Update failed:', e))

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

    // Get song with artists before deleting for cache revalidation
    const song = await prisma.song.findUnique({
      where: { id },
      select: {
        slug: true,
        artists: {
          include: {
            artist: { select: { slug: true } }
          }
        }
      }
    })

    await prisma.song.delete({
      where: { id }
    })

    // Revalidate cache
    try {
      if (song?.slug) {
        revalidatePath(`/song/${song.slug}`)
      }
      // Revalidate all artist pages for this song
      if (song?.artists) {
        for (const sa of song.artists) {
          revalidatePath(`/artist/${sa.artist.slug}`)
        }
      }
      revalidatePath('/songs')
      revalidatePath('/')
      revalidateTag('homepage')
      console.log('[Song Delete] Cache revalidated for song and artists')
    } catch (revalidateError) {
      console.log('[Song Delete] Revalidation note:', revalidateError.message)
    }

    return NextResponse.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json(
      { message: 'Error deleting song' },
      { status: 500 }
    )
  }
}
