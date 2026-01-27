import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all songs to extract unique credit values
    const songs = await prisma.song.findMany({
      select: {
        lyricist: true,
        composer: true,
        singers: true,
        label: true,
        starring: true,
        producer: true,
        director: true,
      }
    })

    // Helper function to extract unique values from comma-separated strings
    const extractUnique = (field) => {
      const values = new Set()
      songs.forEach(song => {
        if (song[field]) {
          // Split by comma and trim each value
          song[field].split(',').forEach(v => {
            const trimmed = v.trim()
            if (trimmed) values.add(trimmed)
          })
        }
      })
      return Array.from(values).sort((a, b) => a.localeCompare(b))
    }

    // Extract unique values for each field
    const credits = {
      lyricists: extractUnique('lyricist'),
      composers: extractUnique('composer'),
      singers: extractUnique('singers'),
      labels: extractUnique('label'),
      starring: extractUnique('starring'),
      producers: extractUnique('producer'),
      directors: extractUnique('director'),
    }

    return NextResponse.json(credits)
  } catch (error) {
    console.error('Error fetching song credits:', error)
    return NextResponse.json(
      { message: 'Error fetching song credits' },
      { status: 500 }
    )
  }
}
