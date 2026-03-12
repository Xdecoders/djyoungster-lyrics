import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

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

    const titleSize = song.title.length > 40 ? 44 : song.title.length > 25 ? 52 : 60

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(74,222,128,0.06)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(34,211,238,0.04)', display: 'flex' }} />

          {/* Cover image */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0 60px 70px', flexShrink: 0 }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                width={280}
                height={280}
                style={{ borderRadius: '20px', objectFit: 'cover', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
              />
            ) : (
              <div style={{ width: '280px', height: '280px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '80px', color: 'rgba(255,255,255,0.2)' }}>♪</span>
              </div>
            )}
          </div>

          {/* Right content */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '55px 70px 55px 55px', justifyContent: 'space-between' }}>

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #4ade80, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '900' }}>♪</span>
              </div>
              <span style={{ color: '#4ade80', fontSize: '18px', fontWeight: '700', letterSpacing: '0.08em' }}>DJYoungster</span>
            </div>

            {/* Song info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ color: '#ffffff', fontSize: `${titleSize}px`, fontWeight: '800', lineHeight: '1.15', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                {song.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '24px', fontWeight: '500', marginBottom: '28px' }}>
                {artistNames}
              </div>

              {lyricsPreview && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '48px', height: '3px', background: 'linear-gradient(90deg, #4ade80, #22d3ee)', marginBottom: '18px', borderRadius: '2px' }} />
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '18px', lineHeight: '1.75', fontStyle: 'italic' }}>
                    {lyricsPreview}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '15px', fontWeight: '500', letterSpacing: '0.03em' }}>
              djyoungster.com · Lyrics
            </div>
          </div>

          {/* Bottom gradient bar */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px', background: 'linear-gradient(90deg, #4ade80, #22d3ee, #818cf8)', display: 'flex' }} />
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (error) {
    console.error('OG image error:', error)
    return new Response('Error generating image', { status: 500 })
  }
}
