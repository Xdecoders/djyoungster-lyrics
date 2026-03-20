import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { verifyAdmin } from '@/lib/verifyAdmin'

// ── Utilities ─────────────────────────────────────────────────────────────────

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapLines(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word
    if (test.length > maxChars) { if (cur) lines.push(cur); cur = word } else { cur = test }
  }
  if (cur) lines.push(cur)
  return lines
}

// Read local /uploads/ files directly from disk — avoids unreliable self-fetch
async function readImageBuffer(url) {
  try {
    if (!url) return null
    if (url.startsWith('/uploads/') || url.startsWith('/public/')) {
      const rel = url.startsWith('/public/') ? url.slice(7) : url
      return await readFile(path.join(process.cwd(), 'public', rel))
    }
    // External URL
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    console.error('[generate-cover] readImageBuffer:', err.message)
    return null
  }
}

// ── Editorial cover — sharp composite (no ImageResponse, no font loading) ─────
//
// Layers (bottom to top):
//   1. Source image resized to 1920×1080 (full bleed)
//   2. Dark gradient SVG overlay (left heavy → transparent right)
//   3. Portrait crop of source image (740×920, right side)
//   4. Text + decoration SVG overlay (transparent bg, Arial system font)

async function buildEditorialCover(title, categoryName, color, excerpt, imgBuffer) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#1DB954'

  // Layer 1 — base: full-bleed source image
  const baseBuffer = await sharp(imgBuffer)
    .resize(1920, 1080, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toBuffer()

  // Layer 3 — portrait panel (right side)
  const panelBuffer = await sharp(imgBuffer)
    .resize(740, 920, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()

  // ── Calculate text layout ──────────────────────────────────────────────────
  // Usable text area: x=160 to x≈1050 (before portrait panel at x=1090)
  // Title: 70px bold, ~21 chars per line in ~870px usable width
  const titleLines = wrapLines(title, 21).slice(0, 3)
  const titleFontSize = 70
  const titleLineGap = 14
  const titleBlockH = titleLines.length * titleFontSize + (titleLines.length - 1) * titleLineGap

  const hasCat = Boolean(categoryName)
  const catSectionH = hasCat ? 66 : 0   // badge height + gap below

  // Excerpt: 26px, ~44 chars per line, max 2 lines
  const excerptLines = excerpt
    ? wrapLines(excerpt.substring(0, 110), 44).slice(0, 2)
    : []
  const excerptSectionH = excerptLines.length > 0 ? 30 + excerptLines.length * 34 : 0 // divider + lines

  const totalContentH = catSectionH + titleBlockH + excerptSectionH + (excerptSectionH > 0 ? 20 : 0)
  const blockTop = Math.round((1080 - totalContentH) / 2) - 40  // slightly above centre

  // Individual element Y positions
  const catY        = blockTop
  const titleBaseY  = blockTop + catSectionH
  const firstLineY  = titleBaseY + titleFontSize   // text baseline of line 1
  const lastLineY   = firstLineY + (titleLines.length - 1) * (titleFontSize + titleLineGap)
  const dividerY    = lastLineY + 28
  const excerptY    = dividerY + 22 + 26           // after divider bar + gap + first line baseline

  // Category badge sizing
  const catFontSize = 21
  const catPad      = 38
  const catW        = Math.round((categoryName || '').length * catFontSize * 0.62 + catPad * 2)
  const catMidX     = 160 + Math.round(catW / 2)

  // Left accent bar (alongside title block)
  const barTop    = titleBaseY + (hasCat ? 14 : 0)
  const barHeight = titleBlockH + 6

  // ── Layer 2 — dark gradient SVG ───────────────────────────────────────────
  const gradientSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="d" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#030810" stop-opacity="0.94"/>
      <stop offset="35%"  stop-color="#030810" stop-opacity="0.90"/>
      <stop offset="52%"  stop-color="#030810" stop-opacity="0.65"/>
      <stop offset="68%"  stop-color="#030810" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#030810" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#d)"/>
</svg>`

  // ── Layer 4 — text + decoration SVG (transparent background) ─────────────
  const catSvg = hasCat ? `
  <rect x="160" y="${catY}" width="${catW}" height="46" rx="23" fill="${safeColor}" opacity="0.95"/>
  <text x="${catMidX}" y="${catY + 31}" font-family="Arial,Helvetica,sans-serif" font-size="${catFontSize}" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2">${escapeXml(categoryName.toUpperCase())}</text>` : ''

  const titleSvg = titleLines.map((line, i) =>
    `<text x="160" y="${firstLineY + i * (titleFontSize + titleLineGap)}" font-family="Arial,Helvetica,sans-serif" font-size="${titleFontSize}" font-weight="700" fill="white" letter-spacing="-0.5">${escapeXml(line)}</text>`
  ).join('\n  ')

  const excerptSvg = excerptLines.map((line, i) =>
    `<text x="160" y="${excerptY + i * 34}" font-family="Arial,Helvetica,sans-serif" font-size="26" fill="white" opacity="0.60">${escapeXml(line)}</text>`
  ).join('\n  ')

  const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="1920" height="6" fill="${safeColor}" opacity="0.88"/>
  <rect x="108" y="${barTop}" width="8" height="${barHeight}" rx="4" fill="${safeColor}" opacity="0.9"/>
  ${catSvg}
  ${titleSvg}
  ${excerptLines.length > 0 ? `<rect x="160" y="${dividerY}" width="60" height="5" rx="2.5" fill="${safeColor}"/>` : ''}
  ${excerptSvg}
  <text x="160" y="1038" font-family="Arial,Helvetica,sans-serif" font-size="23" font-weight="600" fill="${safeColor}" opacity="0.68" letter-spacing="4">DJYOUNGSTER.COM</text>
  <rect x="0" y="1074" width="1920" height="6" fill="${safeColor}" opacity="0.60"/>
</svg>`

  const panelLeft = 1920 - 90 - 740   // = 1090
  const panelTop  = 80

  return sharp(baseBuffer)
    .composite([
      { input: Buffer.from(gradientSvg, 'utf-8'), top: 0, left: 0 },
      { input: panelBuffer, top: panelTop, left: panelLeft },
      { input: Buffer.from(overlaySvg, 'utf-8'), top: 0, left: 0 },
    ])
    .webp({ quality: 90 })
    .toBuffer()
}

// ── SVG-only cover (no source image) ─────────────────────────────────────────

function buildSvgCover(title, categoryName, color) {
  const lines = wrapLines(title, 28).slice(0, 3)
  const fs = 88, gap = 20
  const blockH = lines.length * fs + (lines.length - 1) * gap
  const hasCat = Boolean(categoryName)
  const catH = hasCat ? 70 : 0
  const blockTop = Math.round((1080 - catH - blockH) / 2) - 20
  const catY = blockTop
  const titleBaseY = blockTop + catH
  const catW = Math.round((categoryName || '').length * 24 * 0.65 + 88)
  const catMidX = 160 + Math.round(catW / 2)

  const catEl = hasCat ? `
  <rect x="160" y="${catY}" width="${catW}" height="48" rx="24" fill="${color}" opacity="0.95"/>
  <text x="${catMidX}" y="${catY + 33}" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle" letter-spacing="2.5">${escapeXml(categoryName.toUpperCase())}</text>` : ''

  const titleEls = lines.map((l, i) =>
    `<text x="160" y="${titleBaseY + (hasCat ? 26 : 0) + i * (fs + gap) + fs}" font-family="Arial,Helvetica,sans-serif" font-size="${fs}" font-weight="700" fill="white" letter-spacing="-1">${escapeXml(l)}</text>`
  ).join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0f172a"/><stop offset="55%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="gtr" cx="90%" cy="10%" r="55%">
      <stop offset="0%"   stop-color="${color}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gbl" cx="5%" cy="90%" r="40%">
      <stop offset="0%"   stop-color="${color}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#gtr)"/>
  <rect width="1920" height="1080" fill="url(#gbl)"/>
  <circle cx="1820" cy="540" r="380" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.08"/>
  <circle cx="1820" cy="540" r="260" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.08"/>
  <circle cx="1820" cy="540" r="140" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.08"/>
  <rect x="0" y="0" width="1920" height="5" fill="${color}" opacity="0.8"/>
  <rect x="108" y="${titleBaseY + (hasCat ? 22 : 0)}" width="8" height="${blockH + 10}" rx="4" fill="${color}" opacity="0.9"/>
  ${catEl}
  ${titleEls}
  <text x="160" y="1038" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="600" fill="${color}" opacity="0.65" letter-spacing="4">DJYOUNGSTER.COM</text>
  <rect x="0" y="1075" width="1920" height="5" fill="${color}" opacity="0.3"/>
</svg>`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { title, categoryName, categoryColor, sourceImageUrl, excerpt } = await request.json()
    if (!title?.trim()) return NextResponse.json({ message: 'Title is required' }, { status: 400 })

    const safeColor = /^#[0-9a-fA-F]{6}$/.test(categoryColor) ? categoryColor : '#1DB954'
    let webpBuffer

    if (sourceImageUrl) {
      const imgBuffer = await readImageBuffer(sourceImageUrl)
      if (!imgBuffer) {
        return NextResponse.json({ message: 'Could not read the uploaded image. Try re-uploading it.' }, { status: 400 })
      }
      webpBuffer = await buildEditorialCover(title.trim(), categoryName, safeColor, excerpt, imgBuffer)
    } else {
      const svg = buildSvgCover(title.trim(), categoryName, safeColor)
      webpBuffer = await sharp(Buffer.from(svg, 'utf-8'), { density: 150 })
        .resize(1920, 1080, { fit: 'fill' })
        .webp({ quality: 90 })
        .toBuffer()
    }

    const timestamp = Date.now()
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 55)
    const filename = `${timestamp}-cover-${slug}.webp`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), webpBuffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('[generate-cover]', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
