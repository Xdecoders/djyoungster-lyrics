/**
 * Run from project root:
 *   node scripts/generate-og.mjs
 *   node scripts/generate-og.mjs --force   (regenerate even existing)
 */
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const force = process.argv.includes('--force')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads')
const UPLOAD_URL = process.env.UPLOAD_URL || '/uploads'
const CONCURRENCY = 3

async function generateForSong(song) {
  // Fetch the dynamic OG image from the live route
  const res = await fetch(`${SITE_URL}/api/og/song/${song.slug}`, {
    headers: { 'User-Agent': 'OG-Generator/1.0' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from OG route`)

  const pngBuffer = Buffer.from(await res.arrayBuffer())

  // Convert PNG → WebP for smaller file size
  const webpBuffer = await sharp(pngBuffer)
    .webp({ quality: 85, effort: 4 })
    .toBuffer()

  // Save to disk
  const ogDir = path.join(UPLOAD_DIR, 'og')
  await mkdir(ogDir, { recursive: true })
  const filename = `${song.slug}-og.webp`
  await writeFile(path.join(ogDir, filename), webpBuffer)

  // Update DB using raw SQL (Prisma client may not have ogImage if not regenerated)
  const publicUrl = `${UPLOAD_URL}/og/${filename}`
  await prisma.$executeRaw`UPDATE Song SET ogImage = ${publicUrl} WHERE id = ${song.id}`
  return publicUrl
}

async function main() {
  // Fetch all songs (ogImage may not exist on older schema — filter in JS)
  const songs = await prisma.song.findMany({
    select: { id: true, slug: true, title: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Found ${songs.length} songs to process (force=${force})`)
  if (songs.length === 0) { await prisma.$disconnect(); return }

  let done = 0, failed = 0
  for (let i = 0; i < songs.length; i += CONCURRENCY) {
    const batch = songs.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map(s => generateForSong(s)))
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      const slug = batch[j].slug
      if (r.status === 'fulfilled') {
        done++
        process.stdout.write(`\r✓ ${done}/${songs.length} — ${slug}                    `)
      } else {
        failed++
        console.error(`\n✗ ${slug}: ${r.reason?.message}`)
      }
    }
  }

  console.log(`\n\nDone! Generated: ${done}, Failed: ${failed}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
