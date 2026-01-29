import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// On-demand cache revalidation API
export async function POST(request) {
  try {
    const { type, slug, all } = await request.json()

    // Revalidate all pages
    if (all) {
      // Revalidate main pages
      revalidatePath('/', 'layout')
      revalidatePath('/songs')
      revalidatePath('/artists')
      revalidatePath('/albums')
      revalidatePath('/movies')
      revalidatePath('/genres')

      console.log('[Revalidate] All pages cache cleared')

      return NextResponse.json({
        success: true,
        message: 'All pages cache cleared successfully',
        revalidated: ['/', '/songs', '/artists', '/albums', '/movies', '/genres']
      })
    }

    // Revalidate specific page type
    if (type && slug) {
      const path = `/${type}/${slug}`
      revalidatePath(path)

      console.log(`[Revalidate] Cache cleared for: ${path}`)

      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${path}`,
        revalidated: [path]
      })
    }

    // Revalidate by type (all songs, all artists, etc.)
    if (type && !slug) {
      const paths = []

      switch (type) {
        case 'songs':
          revalidatePath('/songs')
          revalidatePath('/song', 'page')
          paths.push('/songs', '/song/*')
          break
        case 'artists':
          revalidatePath('/artists')
          revalidatePath('/artist', 'page')
          paths.push('/artists', '/artist/*')
          break
        case 'albums':
          revalidatePath('/albums')
          revalidatePath('/album', 'page')
          paths.push('/albums', '/album/*')
          break
        case 'movies':
          revalidatePath('/movies')
          revalidatePath('/movie', 'page')
          paths.push('/movies', '/movie/*')
          break
        case 'genres':
          revalidatePath('/genres')
          revalidatePath('/genre', 'page')
          paths.push('/genres', '/genre/*')
          break
        case 'categories':
          revalidatePath('/category', 'page')
          paths.push('/category/*')
          break
        case 'tags':
          revalidatePath('/tag', 'page')
          paths.push('/tag/*')
          break
        case 'homepage':
          revalidatePath('/')
          paths.push('/')
          break
        default:
          return NextResponse.json(
            { success: false, message: 'Invalid type' },
            { status: 400 }
          )
      }

      console.log(`[Revalidate] Cache cleared for type: ${type}`)

      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${type}`,
        revalidated: paths
      })
    }

    return NextResponse.json(
      { success: false, message: 'Please specify type, slug, or all=true' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Revalidate] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Error clearing cache: ' + error.message },
      { status: 500 }
    )
  }
}
