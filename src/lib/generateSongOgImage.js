import { ImageResponse } from 'next/og'
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function toBase64(buffer) {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

async function blurredBackground(buffer) {
  const out = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .blur(40)
    .modulate({ brightness: 0.3 })
    .jpeg({ quality: 70 })
    .toBuffer()
  return toBase64(out)
}

async function croppedCover(buffer) {
  const out = await sharp(buffer)
    .resize(300, 300, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toBuffer()
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
  } catch {
    return null
  }
}

// Load the bundled Noto Sans font (fallback for when Google Fonts is unavailable)
async function loadBundledFont() {
  try {
    const fontPath = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og', 'noto-sans-v27-latin-regular.ttf')
    const buffer = await readFile(fontPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  } catch {
    return null
  }
}

/**
 * Generates a 1200x630 OG card image for a song, saves it to disk,
 * and updates the song's ogImage field in the database.
 *
 * @param {string} songId
 * @returns {Promise<string|null>} the public URL path saved, or null on failure
 */
export async function generateSongOgImage(songId) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: {
        slug: true,
        title: true,
        coverImage: true,
        artists: { select: { artist: { select: { name: true } } } }
      }
    })

    if (!song) return null

    const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
    const coverUrl = song.coverImage
      ? (song.coverImage.startsWith('http') ? song.coverImage : `${siteUrl}${song.coverImage}`)
      : null

    const [imgBuffer, font500, font700, font800] = await Promise.all([
      coverUrl ? fetchImageBuffer(coverUrl) : Promise.resolve(null),
      loadInterTight(500),
      loadInterTight(700),
      loadInterTight(800),
    ])

    const [bgBase64, coverBase64] = await Promise.all([
      imgBuffer ? blurredBackground(imgBuffer) : Promise.resolve(null),
      imgBuffer ? croppedCover(imgBuffer) : Promise.resolve(null),
    ])

    const fonts = []
    if (font500) fonts.push({ name: 'Inter Tight', data: font500, weight: 500, style: 'normal' })
    if (font700) fonts.push({ name: 'Inter Tight', data: font700, weight: 700, style: 'normal' })
    if (font800) fonts.push({ name: 'Inter Tight', data: font800, weight: 800, style: 'normal' })

    // Fallback: use bundled Noto Sans if Google Fonts failed (avoids broken file:// URL on Windows)
    if (fonts.length === 0) {
      const fallbackFont = await loadBundledFont()
      if (fallbackFont) {
        fonts.push({ name: 'Inter Tight', data: fallbackFont, weight: 400, style: 'normal' })
        fonts.push({ name: 'Inter Tight', data: fallbackFont, weight: 700, style: 'normal' })
        fonts.push({ name: 'Inter Tight', data: fallbackFont, weight: 800, style: 'normal' })
      }
    }

    const titleSize = song.title.length > 40 ? 48 : song.title.length > 25 ? 56 : 64

    const imgResponse = new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: '"Inter Tight", sans-serif' }}>

          {bgBase64 ? (
            <img src={bgBase64} width={1200} height={630} style={{ position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex' }} />
          )}

          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex' }} />

          {/* DJYoungster — top right */}
          <div style={{
            position: 'absolute', top: '44px', right: '60px',
            color: '#4ade80', fontSize: '22px', fontWeight: 700,
            letterSpacing: '0.05em', fontFamily: '"Inter Tight", sans-serif', display: 'flex',
          }}>
            DJYoungster
          </div>

          {/* Centered content — explicit top/left/right/bottom so alignItems works in Satori */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 80px', gap: '60px' }}>
            {coverBase64 ? (
              <img src={coverBase64} width={260} height={260}
                style={{ borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.9)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '260px', height: '260px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '80px' }}>♪</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ color: '#ffffff', fontSize: `${titleSize}px`, fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em', fontFamily: '"Inter Tight", sans-serif' }}>
                {song.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '28px', fontWeight: 500, fontFamily: '"Inter Tight", sans-serif' }}>
                {artistNames}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#4ade80,#22d3ee,#818cf8)', display: 'flex' }} />
        </div>
      ),
      { width: 1200, height: 630, fonts: fonts.length > 0 ? fonts : undefined }
    )

    // Capture PNG buffer from ImageResponse, then convert to WebP for smaller size
    const pngBuffer = Buffer.from(await imgResponse.arrayBuffer())
    const webpBuffer = await sharp(pngBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer()

    // Save to uploads/og/ directory
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
    const ogDir = path.join(uploadDir, 'og')
    await mkdir(ogDir, { recursive: true })

    const filename = `${song.slug}-og.webp`
    const filepath = path.join(ogDir, filename)
    await writeFile(filepath, webpBuffer)

    // Determine the public URL
    const baseUploadUrl = process.env.UPLOAD_DIR
      ? (process.env.UPLOAD_URL || '/uploads')
      : '/uploads'
    const publicUrl = `${baseUploadUrl}/og/${filename}`

    // Update song record
    await prisma.song.update({
      where: { id: songId },
      data: { ogImage: publicUrl }
    })

    console.log(`[OG Image] Generated for ${song.slug}: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error('[OG Image] Generation failed:', error)
    return null
  }
}
