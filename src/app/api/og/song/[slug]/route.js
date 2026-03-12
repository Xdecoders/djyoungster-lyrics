import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').trim() || ''
}

function getLyricsPreview(lyrics) {
  if (!lyrics) return ''
  const lines = stripHtml(lyrics).split('\n').map(l => l.trim()).filter(l => l.length > 3)
  return lines.slice(0, 2).join('  ·  ')
}

async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function imageToBase64(buffer, mimeType = 'image/jpeg') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

async function blurredBackground(buffer) {
  const blurred = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .blur(28)
    .jpeg({ quality: 75 })
    .toBuffer()
  return imageToBase64(blurred)
}

async function croppedCover(buffer) {
  const cover = await sharp(buffer)
    .resize(280, 280, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return imageToBase64(cover)
}

async function loadInterTight(weight) {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }
    )
    const css = await cssRes.text()
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1]
    if (!fontUrl) return null
    const fontRes = await fetch(fontUrl)
    return await fontRes.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(request, { params }) {
  const { slug } = await params

  try {
    const song = await prisma.song.findUnique({
      where: { slug },
      select: {
        title: true,
        lyrics: true,
        coverImage: true,
        artists: { select: { artist: { select: { name: true } } } }
      }
    })

    if (!song) return new Response('Not found', { status: 404 })

    const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
    const lyricsPreview = getLyricsPreview(song.lyrics)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'

    const coverUrl = song.coverImage
      ? (song.coverImage.startsWith('http') ? song.coverImage : `${siteUrl}${song.coverImage}`)
      : null

    // Load everything in parallel
    const [imgBuffer, font700, font800, font500] = await Promise.all([
      coverUrl ? fetchImageBuffer(coverUrl) : Promise.resolve(null),
      loadInterTight(700),
      loadInterTight(800),
      loadInterTight(500),
    ])

    const [bgBase64, coverBase64] = await Promise.all([
      imgBuffer ? blurredBackground(imgBuffer) : Promise.resolve(null),
      imgBuffer ? croppedCover(imgBuffer) : Promise.resolve(null),
    ])

    const fonts = []
    if (font500) fonts.push({ name: 'Inter Tight', data: font500, weight: 500, style: 'normal' })
    if (font700) fonts.push({ name: 'Inter Tight', data: font700, weight: 700, style: 'normal' })
    if (font800) fonts.push({ name: 'Inter Tight', data: font800, weight: 800, style: 'normal' })

    const titleSize = song.title.length > 40 ? 46 : song.title.length > 25 ? 54 : 62

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Inter Tight", sans-serif',
          }}
        >
          {/* Blurred background image */}
          {bgBase64 ? (
            <img
              src={bgBase64}
              width={1200}
              height={630}
              style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0f172a', display: 'flex' }} />
          )}

          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.72)', display: 'flex' }} />

          {/* DJYoungster — top right */}
          <div style={{
            position: 'absolute',
            top: '44px',
            right: '60px',
            color: '#4ade80',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            fontFamily: '"Inter Tight", sans-serif',
            display: 'flex',
          }}>
            DJYoungster
          </div>

          {/* Main content */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '60px 70px',
            gap: '55px',
          }}>
            {/* Cover image */}
            <div style={{ flexShrink: 0, display: 'flex' }}>
              {coverBase64 ? (
                <img
                  src={coverBase64}
                  width={260}
                  height={260}
                  style={{ borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
                />
              ) : (
                <div style={{
                  width: '260px', height: '260px', borderRadius: '18px',
                  background: 'rgba(255,255,255,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '72px' }}>♪</span>
                </div>
              )}
            </div>

            {/* Text content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0' }}>
              {/* Title */}
              <div style={{
                color: '#ffffff',
                fontSize: `${titleSize}px`,
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '14px',
                letterSpacing: '-0.02em',
                fontFamily: '"Inter Tight", sans-serif',
              }}>
                {song.title}
              </div>

              {/* Artist */}
              <div style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '26px',
                fontWeight: 500,
                marginBottom: '26px',
                fontFamily: '"Inter Tight", sans-serif',
              }}>
                {artistNames}
              </div>

              {/* Accent line */}
              <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg,#4ade80,#22d3ee)', borderRadius: '2px', marginBottom: '22px', display: 'flex' }} />

              {/* Lyrics */}
              {lyricsPreview && (
                <div style={{
                  color: 'rgba(255,255,255,0.40)',
                  fontSize: '19px',
                  fontWeight: 500,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  fontFamily: '"Inter Tight", sans-serif',
                }}>
                  {lyricsPreview}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg,#4ade80,#22d3ee,#818cf8)',
            display: 'flex',
          }} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fonts.length > 0 ? fonts : undefined,
      }
    )
  } catch (error) {
    console.error('OG image error:', error)
    return new Response('Error generating image', { status: 500 })
  }
}
