import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST() {
  try {
    // Get all movies without slugs
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    })

    const results = []

    for (const movie of movies) {
      const baseSlug = generateSlug(movie.title)
      let slug = baseSlug
      let counter = 1

      // Check for existing slug and make unique if needed
      while (await prisma.movie.findFirst({
        where: {
          slug,
          id: { not: movie.id }
        }
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      await prisma.movie.update({
        where: { id: movie.id },
        data: { slug }
      })

      results.push({ id: movie.id, title: movie.title, slug })
    }

    return NextResponse.json({
      message: `Updated ${results.length} movies with slugs`,
      movies: results
    })
  } catch (error) {
    console.error('Error migrating movie slugs:', error)
    return NextResponse.json(
      { message: 'Error migrating slugs: ' + error.message },
      { status: 500 }
    )
  }
}
