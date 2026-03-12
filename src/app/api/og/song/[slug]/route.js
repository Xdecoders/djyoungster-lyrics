import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    .blur(36)
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

export async function GET(request, { params }) {
  const { slug } = await params

  try {
    const song = await prisma.song.findUnique({
      where: { slug },
      select: {
        title: true,
        coverImage: true,
        artists: { select: { artist: { select: { name: true } } } }
      }
    })

    if (!song) return new Response('Not found', { status: 404 })

    const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djyoungster.com'
    const coverUrl = song.coverImage
      ? (song.coverImage.startsWith('http') ? song.coverImage : `${siteUrl}${song.coverImage}`)
      : null

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

    const titleSize = song.title.length > 40 ? 48 : song.title.length > 25 ? 56 : 64

    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', display: 'flex', position: 'relative', overflow: 'hidden', fontFamily: '"Inter Tight", sans-serif' }}>

          {/* Blurred background */}
          {bgBase64 ? (
            <img src={bgBase64} width={1200} height={630} style={{ position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex' }} />
          )}

          {/* Heavy dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex' }} />

          {/* DJYoungster — top right */}
          <div style={{
            position: 'absolute', top: '44px', right: '60px',
            color: '#4ade80', fontSize: '22px', fontWeight: 700,
            letterSpacing: '0.05em', fontFamily: '"Inter Tight", sans-serif', display: 'flex',
          }}>
            DJYoungster
          </div>

          {/* Centered main content */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            padding: '0 80px', gap: '60px',
          }}>
            {/* Cover */}
            <div style={{ flexShrink: 0, display: 'flex' }}>
              {coverBase64 ? (
                <img src={coverBase64} width={280} height={280}
                  style={{ borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }} />
              ) : (
                <div style={{
                  width: '280px', height: '280px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.06)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '80px' }}>♪</span>
                </div>
              )}
            </div>

            {/* Song name + artist — vertically centered */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{
                color: '#ffffff', fontSize: `${titleSize}px`, fontWeight: 800,
                lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.02em',
                fontFamily: '"Inter Tight", sans-serif',
              }}>
                {song.title}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.60)', fontSize: '28px', fontWeight: 500,
                fontFamily: '"Inter Tight", sans-serif',
              }}>
                {artistNames}
              </div>
            </div>
          </div>

          {/* Bottom gradient bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg,#4ade80,#22d3ee,#818cf8)', display: 'flex',
          }} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fonts.length > 0 ? fonts : undefined,
        headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
      }
    )
  } catch (error) {
    console.error('OG image error:', error)
    return new Response('Error generating image', { status: 500 })
  }
}
