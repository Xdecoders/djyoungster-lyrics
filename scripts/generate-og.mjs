/**
 * Run from project root:
 *   node scripts/generate-og.mjs
 *   node scripts/generate-og.mjs --force   (regenerate even existing)
 */
import { PrismaClient } from '@prisma/client'
import { ImageResponse } from 'next/og'
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

async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch { return null }
}

async function toBase64(buffer) {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

async function blurredBackground(buffer) {
  const out = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .blur(40).modulate({ brightness: 0.3 })
    .jpeg({ quality: 70 }).toBuffer()
  return toBase64(out)
}

async function croppedCover(buffer) {
  const out = await sharp(buffer)
    .resize(300, 300, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 }).toBuffer()
  return toBase64(out)
}

async function loadInterTight(weight) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }
    ).then(r => r.text())
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1]
    if (!fontUrl) return null
    return await fetch(fontUrl).then(r => r.arrayBuffer())
  } catch { return null }
}

async function generateForSong(song) {
  const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
  const coverUrl = song.coverImage
    ? (song.coverImage.startsWith('http') ? song.coverImage : `${SITE_URL}${song.coverImage}`)
    : null

  const [imgBuffer, font500, font700, font800] = await Promise.all([
    coverUrl ? fetchImageBuffer(coverUrl) : Promise.resolve(null),
    loadInterTight(500), loadInterTight(700), loadInterTight(800),
  ])

  const [bgBase64, coverBase64] = await Promise.all([
    imgBuffer ? blurredBackground(imgBuffer) : Promise.resolve(null),
    imgBuffer ? croppedCover(imgBuffer) : Promise.resolve(null),
  ])

  const fonts = []
  if (font500) fonts.push({ name: 'Inter Tight', data: font500, weight: 500, style: 'normal' })
  if (font700) fonts.push({ name: 'Inter Tight', data: font700, weight: 700, style: 'normal' })
  if (font800) fonts.push({ name: 'Inter Tight', data: font800, weight: 800, style: 'normal' })

  const titleSize = song.title.length > 40 ? 48 : song.title.length > 25 ? 56 : 64

  const { createElement: h } = await import('react')

  const imgResponse = new ImageResponse(
    h('div', { style: { width: '1200px', height: '630px', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: '"Inter Tight", sans-serif' } },
      bgBase64
        ? h('img', { src: bgBase64, width: 1200, height: 630, style: { position: 'absolute', inset: 0 } })
        : h('div', { style: { position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex' } }),
      h('div', { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex' } }),
      h('div', { style: { position: 'absolute', top: '44px', right: '60px', color: '#4ade80', fontSize: '22px', fontWeight: 700, letterSpacing: '0.05em', display: 'flex' } }, 'DJYoungster'),
      h('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 80px', gap: '60px' } },
        coverBase64
          ? h('img', { src: coverBase64, width: 260, height: 260, style: { borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.9)', flexShrink: 0 } })
          : h('div', { style: { width: '260px', height: '260px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
              h('span', { style: { color: 'rgba(255,255,255,0.15)', fontSize: '80px' } }, '♪')),
        h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
          h('div', { style: { color: '#ffffff', fontSize: `${titleSize}px`, fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em' } }, song.title),
          h('div', { style: { color: 'rgba(255,255,255,0.65)', fontSize: '28px', fontWeight: 500 } }, artistNames))
      ),
      h('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#4ade80,#22d3ee,#818cf8)', display: 'flex' } })
    ),
    { width: 1200, height: 630, fonts: fonts.length > 0 ? fonts : undefined }
  )

  const pngBuffer = Buffer.from(await imgResponse.arrayBuffer())
  const webpBuffer = await sharp(pngBuffer).webp({ quality: 85, effort: 4 }).toBuffer()

  const ogDir = path.join(UPLOAD_DIR, 'og')
  await mkdir(ogDir, { recursive: true })
  const filename = `${song.slug}-og.webp`
  await writeFile(path.join(ogDir, filename), webpBuffer)

  const publicUrl = `${UPLOAD_URL}/og/${filename}`
  await prisma.song.update({ where: { id: song.id }, data: { ogImage: publicUrl } })
  return publicUrl
}

async function main() {
  const songs = await prisma.song.findMany({
    where: force ? {} : { ogImage: null },
    select: {
      id: true, slug: true, title: true, coverImage: true,
      artists: { select: { artist: { select: { name: true } } } }
    },
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
