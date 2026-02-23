import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET all songs
export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        status: true,
        views: true,
        verified: true,
        language: true,
        createdAt: true,
        artists: {
          select: {
            artist: { select: { id: true, name: true, slug: true } }
          }
        },
        album: { select: { id: true, title: true, slug: true } },
        genres: {
          select: {
            genre: { select: { id: true, name: true, slug: true } }
          }
        },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } }
          }
        },
        tags: {
          select: {
            tag: { select: { id: true, name: true, slug: true } }
          }
        },
        movie: { select: { id: true, title: true, slug: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      { message: 'Error fetching songs' },
      { status: 500 }
    )
  }
}

// POST - Create new song
export async function POST(request) {
  try {
    const data = await request.json()

    // Auto-deduplicate slug if it already exists
    let slug = data.slug
    const existingSlug = await prisma.song.findUnique({ where: { slug }, select: { id: true } })
    if (existingSlug) {
      let suffix = 2
      while (await prisma.song.findUnique({ where: { slug: `${data.slug}-${suffix}` }, select: { id: true } })) {
        suffix++
      }
      slug = `${data.slug}-${suffix}`
    }

    // Create song with relations
    const song = await prisma.song.create({
      data: {
        title: data.title,
        slug,
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
          create: data.artistIds.map(artistId => ({
            artist: {
              connect: { id: artistId }
            }
          }))
        },
        genres: {
          create: data.genreIds.map(genreId => ({
            genre: {
              connect: { id: genreId }
            }
          }))
        },
        categories: {
          create: data.categoryIds.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: data.tagIds?.length > 0 ? {
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
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Revalidate caches for new song
    try {
      // Revalidate the new song page
      revalidatePath(`/song/${song.slug}`)
      // Revalidate all artist pages for this song
      for (const sa of song.artists) {
        revalidatePath(`/artist/${sa.artist.slug}`)
      }
      // Revalidate homepage and songs list
      revalidatePath('/')
      revalidatePath('/songs')
      console.log('[Song Create] Cache revalidated for song and artists')
    } catch (revalidateError) {
      console.log('[Song Create] Revalidation note:', revalidateError.message)
    }

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error('Error creating song:', error)
    return NextResponse.json(
      { message: 'Error creating song: ' + error.message },
      { status: 500 }
    )
  }
}
