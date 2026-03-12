import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSongOgImage } from '@/lib/generateSongOgImage'

// POST /api/admin/regenerate-og
// Body: { force: false }  — force=true regenerates even songs that already have ogImage
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const force = body.force === true

    const songs = await prisma.song.findMany({
      where: force ? {} : { ogImage: null },
      select: { id: true, slug: true, ogImage: true },
      orderBy: { createdAt: 'desc' },
    })

    if (songs.length === 0) {
      return NextResponse.json({ message: 'All songs already have OG images.', generated: 0, failed: 0 })
    }

    console.log(`[OG Bulk] Starting generation for ${songs.length} songs (force=${force})`)

    let generated = 0
    let failed = 0
    const errors = []

    // Process with concurrency of 3 to avoid overloading the server
    const CONCURRENCY = 3
    for (let i = 0; i < songs.length; i += CONCURRENCY) {
      const batch = songs.slice(i, i + CONCURRENCY)
      const results = await Promise.allSettled(
        batch.map(song => generateSongOgImage(song.id))
      )
      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        const song = batch[j]
        if (r.status === 'fulfilled' && r.value) {
          generated++
          console.log(`[OG Bulk] ✓ ${song.slug} (${generated}/${songs.length})`)
        } else {
          failed++
          const reason = r.status === 'rejected' ? r.reason?.message : 'returned null'
          errors.push({ slug: song.slug, error: reason })
          console.error(`[OG Bulk] ✗ ${song.slug}: ${reason}`)
        }
      }
    }

    return NextResponse.json({
      message: `OG image generation complete.`,
      total: songs.length,
      generated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[OG Bulk] Fatal error:', error)
    return NextResponse.json({ message: 'Failed: ' + error.message }, { status: 500 })
  }
}

// GET — just returns counts so you can see how many need generation
export async function GET() {
  try {
    const [total, withOg, withoutOg] = await Promise.all([
      prisma.song.count(),
      prisma.song.count({ where: { ogImage: { not: null } } }),
      prisma.song.count({ where: { ogImage: null } }),
    ])
    return NextResponse.json({ total, withOg, withoutOg })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
